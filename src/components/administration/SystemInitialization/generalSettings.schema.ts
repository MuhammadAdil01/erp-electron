/**
 * The General Settings window, described rather than drawn.
 *
 * The window carries roughly two hundred controls across fifteen tabs. Written
 * as markup that was ~1300 lines of hand-placed inputs, none of them bound to
 * anything — which is why nothing on this screen was ever saved. Describing the
 * controls instead means each one has a key, a type and a default in exactly
 * one place, so binding, loading, validating and saving are written once and no
 * control can be added without also being persisted.
 *
 * `group` maps a tab onto a backend settings group. The backend stores settings
 * as (group, key) → JSON and merges on write, so a tab saving its own keys
 * cannot clobber another tab's.
 */

export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'radio' | 'color' | 'password';

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  /** Value used when the company has never saved this key. */
  default: string | number | boolean;
  options?: { value: string; label: string }[];
  /** Only shown when this other key in the same group is truthy. */
  dependsOn?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  hint?: string;
  /** Renders full-width instead of in the two-column grid. */
  wide?: boolean;
}

export interface SectionSpec {
  title: string;
  fields: FieldSpec[];
}

export interface TabSpec {
  key: string;
  label: string;
  /** Backend settings group this tab reads and writes. */
  group: string;
  sections: SectionSpec[];
}

const yesNo = (key: string, label: string, def = false, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key, label, type: 'checkbox', default: def, ...extra,
});

const text = (key: string, label: string, def = '', extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key, label, type: 'text', default: def, ...extra,
});

const num = (key: string, label: string, def = 0, extra: Partial<FieldSpec> = {}): FieldSpec => ({
  key, label, type: 'number', default: def, ...extra,
});

const sel = (
  key: string, label: string, def: string, options: { value: string; label: string }[],
  extra: Partial<FieldSpec> = {},
): FieldSpec => ({ key, label, type: 'select', default: def, options, ...extra });

export const GENERAL_SETTINGS_TABS: TabSpec[] = [
  // ── BP ─────────────────────────────────────────────────────────────────────
  {
    key: 'BP',
    label: 'BP',
    group: 'bp',
    sections: [
      {
        title: 'Customer Activity Restrictions',
        fields: [
          yesNo('creditLimitCheck', 'Credit Limit', true),
          yesNo('commitmentLimitCheck', 'Commitment Limit'),
          yesNo('considerDeliveriesBalance', 'Consider Deliveries Balance'),
          yesNo('restrictArInvoice', 'A/R Invoice'),
          yesNo('restrictDelivery', 'Delivery'),
          yesNo('restrictSalesOrder', 'Sales Order'),
          yesNo('restrictPickList', 'Pick List'),
        ],
      },
      {
        title: 'Set Commission By',
        fields: [
          yesNo('commissionBySalesEmployees', 'Sales Employees'),
          yesNo('commissionByItems', 'Items'),
          yesNo('commissionByCustomers', 'Customers'),
        ],
      },
      {
        title: 'Approval Process',
        fields: [
          yesNo('enableApprovalProcess', 'Enable Approval Process', true),
          yesNo('enableApprovalInDi', 'Enable Approval Process in DI', true, { dependsOn: 'enableApprovalProcess' }),
          yesNo('enableUpdatingGeneratedDocument', 'Enable Updating the Document Generated', true, { dependsOn: 'enableApprovalProcess' }),
          yesNo('enableOriginatorUpdateDraft', 'Enable Originator to Update the Draft', false, { dependsOn: 'enableApprovalProcess' }),
          yesNo('enableAuthorizerUpdateDocument', 'Enable Authorizer to Update Document', false, { dependsOn: 'enableApprovalProcess' }),
        ],
      },
      {
        title: 'Payment Defaults',
        fields: [
          text('defaultPaymentMethodCustomer', 'Default Payment Method for Customer'),
          text('defaultPaymentMethodVendor', 'Default Payment Method for Vendor'),
          sel('submitCreditVouchers', 'Submit Credit Vouchers', 'automatically', [
            { value: 'automatically', label: 'Automatically' },
            { value: 'manually', label: 'Manually' },
          ]),
          text('defaultDunningTermCustomer', 'Default Dunning Term for Customer'),
          text('defaultPaymentTermCustomer', 'Default Payment Term for Customer', 'Cash Basis'),
          text('defaultPaymentTermVendor', 'Default Payment Term for Vendor', 'Cash Basis'),
          yesNo('applyBpFieldChangesToNew', 'Apply Changes in BP Fields to New'),
        ],
      },
      {
        title: 'Display & Data Ownership',
        fields: [
          yesNo('useShippedGoodsAccount', 'Use Shipped Goods Account for Customer'),
          yesNo('displayInactiveBpInReports', 'Display Inactive Business Partners in Reports', true),
          yesNo('displayInactiveBpInDocuments', 'Display Inactive Business Partners in Marketing Documents', true),
          yesNo('displayInactiveContactsInBpMaster', 'Display Inactive Contact Persons in Business Partner Master Data', true),
          yesNo('allowUpdatingAddressId', 'Allow Updating Address ID', true),
          yesNo('enableDataOwnership', 'Enable Data Ownership'),
          sel('manageDataOwnershipBy', 'Manage Data Ownership By', 'document', [
            { value: 'document', label: 'Document Only' },
            { value: 'bp', label: 'Business Partner Only' },
            { value: 'both', label: 'Document and Business Partner' },
          ], { dependsOn: 'enableDataOwnership' }),
          yesNo('setDefaultPriceListInGeneralSettings', 'Set Default Price List in General Settings Instead of BP'),
        ],
      },
    ],
  },

  // ── Budget ─────────────────────────────────────────────────────────────────
  {
    key: 'Budget',
    label: 'Budget',
    group: 'budget',
    sections: [
      {
        title: 'Budget Initialization',
        fields: [
          yesNo('budgetInitialization', 'Budget Initialization'),
          sel('blockDeviationFromBudget', 'For a Document that Deviates from the Budget', 'warning', [
            { value: 'block', label: 'Block Deviation from Budget' },
            { value: 'warning', label: 'Warning' },
            { value: 'off', label: 'Without Warning' },
          ], { dependsOn: 'budgetInitialization' }),
          sel('calculateBudgetOn', 'Calculate Budget On', 'annual', [
            { value: 'annual', label: 'For Annual Budget' },
            { value: 'monthly', label: 'For Monthly Budget' },
          ], { dependsOn: 'budgetInitialization' }),
          num('budgetPercentageDeviation', 'Permitted Deviation (%)', 0, { min: 0, max: 100 }),
        ],
      },
      {
        title: 'Budget Applies To',
        fields: [
          yesNo('budgetOnPurchaseRequest', 'Purchase Request'),
          yesNo('budgetOnPurchaseOrders', 'Purchase Orders'),
          yesNo('budgetOnGoodsReceiptPo', 'Goods Receipt POs'),
          yesNo('budgetOnAccounting', 'Accounting'),
        ],
      },
    ],
  },

  // ── Services ───────────────────────────────────────────────────────────────
  {
    key: 'Services',
    label: 'Services',
    group: 'services',
    sections: [
      {
        title: 'At the Beginning of Each Session',
        fields: [
          yesNo('performDataCheck', 'Perform Data Check'),
          yesNo('openExchangeRatesTable', 'Open Exchange Rates Table', true),
          yesNo('displayRecurringPostings', 'Display Recurring Postings on Execution', true),
          yesNo('displayRecurringTransactions', 'Display Recurring Transactions on Execution'),
          yesNo('alertActivitiesToday', 'Send Alert for Activities Scheduled for Today', true),
          yesNo('displayInboxOnNewMessage', 'Display Inbox When New Message Arrives'),
          yesNo('displayLatest100Messages', 'Display Latest 100 Messages/Alerts', true),
          yesNo('openCreditVoucherRefUpdate', 'Open Window for Credit Voucher Ref. Update'),
          yesNo('openPostdatedChecksWindow', 'Open Postdated Checks Window'),
          yesNo('openPostdatedCreditVouchers', 'Open Postdated Credit Vouchers Window'),
          yesNo('displayWorklistOnNewTask', 'Display Worklist When New Task Arrives'),
          num('updateMessagesMinutes', 'Update Messages (Min.)', 5, { min: 1, max: 1440 }),
          num('screenLockingMinutes', 'Screen Locking Time (Min.)', 0, {
            min: 0, max: 1440, hint: '0 disables automatic locking.',
          }),
        ],
      },
      {
        title: 'Mail & Internet',
        fields: [
          yesNo('useProxyServer', 'Use Proxy Server for Web Connection'),
          sel('defaultEmailMethod', 'Default E-Mail Method', 'mailer', [
            { value: 'mailer', label: 'System Mailer' },
            { value: 'outlook', label: 'Outlook E-Mail' },
          ]),
          text('smtpServer', 'SMTP Server'),
          num('smtpPort', 'SMTP Port', 587, { min: 1, max: 65535 }),
          yesNo('smtpAuthentication', 'Authentication', true),
          text('smtpUserName', 'User Name'),
          yesNo('smtpUseTls', 'Use TLS Encryption', true),
          text('smtpEncoding', 'Encoding', 'UTF-8'),
          yesNo('htmlDirectionRtl', 'HTML Direction Right to Left'),
          yesNo('includeSubjectInBody', 'Include Subject in Message Body'),
          text('telephoneAreaCode', 'Area Code'),
          text('externalLinePrefix', 'For External Line'),
          text('mapService', 'Map Service'),
        ],
      },
      {
        title: 'History / Log',
        fields: [
          yesNo('enableTransactionNotification', 'Enable Transaction Notification'),
          yesNo('enableLiveCollaboration', 'Enable Live Collaboration'),
          yesNo('enableMailerService', 'Enable Mailer Service'),
          yesNo('enableAlertService', 'Enable Alert Service', true),
          num('integrationTimeoutSeconds', 'Integration Framework Connection Timeout (Seconds)', 30, { min: 1, max: 600 }),
          yesNo('enableExecutionAuditLog', 'Enable Execution Audit Log for User-Defined Queries'),
          yesNo('singleUserConnection', 'Single User Connection'),
        ],
      },
      {
        title: 'Keyboard',
        fields: [
          yesNo('numpadEnterAsTab', 'Use Numeric Keypad ENTER Key as TAB Key'),
          yesNo('numpadPeriodAsSeparator', 'Use Numeric Keypad Period Key as Separator'),
          yesNo('documentOperationsMouseOnly', 'Enable Document Operations by Mouse Only'),
        ],
      },
    ],
  },

  // ── Display ────────────────────────────────────────────────────────────────
  {
    key: 'Display',
    label: 'Display',
    group: 'display',
    sections: [
      {
        title: 'Regional',
        fields: [
          text('language', 'Language', 'English'),
          sel('skinStyle', 'Skin Style', 'classic', [
            { value: 'classic', label: 'Classic' },
            { value: 'blue', label: 'Blue' },
            { value: 'silver', label: 'Silver' },
          ]),
          text('defaultLengthUom', 'Default Length UoM'),
          text('defaultWeightUom', 'Default Weight UoM'),
          sel('timeFormat', 'Time Format', '24H', [
            { value: '24H', label: '24 Hour' },
            { value: '12H', label: '12 Hour (AM/PM)' },
          ]),
          sel('dateFormat', 'Date Format', 'dd.MM.yy', [
            { value: 'dd.MM.yy', label: 'DD.MM.YY' },
            { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
            { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
            { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
          ]),
          text('dateSeparator', 'Date Separator', '.'),
          yesNo('manageCompanyTime', 'Manage Company Time'),
          num('rowsInListOfWindows', "No. of Rows in 'List of Windows'", 20, { min: 1, max: 200 }),
          num('rowsInChooseFromList', 'No. of Rows in Choose From List', 20, { min: 1, max: 200 }),
          yesNo('enableSuggest', 'Enable Suggest'),
          yesNo('enableCaseSensitiveSearch', 'Enable Case Sensitive Search'),
        ],
      },
      {
        title: 'Decimal Places (0..6)',
        fields: [
          num('decimalsAmounts', 'Amounts', 2, { min: 0, max: 6 }),
          num('decimalsPrices', 'Prices', 2, { min: 0, max: 6 }),
          num('decimalsRates', 'Rates', 6, { min: 0, max: 6 }),
          num('decimalsQuantities', 'Quantities', 3, { min: 0, max: 6 }),
          num('decimalsPercent', 'Percent', 2, { min: 0, max: 6 }),
          num('decimalsUnits', 'Units', 3, { min: 0, max: 6 }),
          num('decimalsInQuery', 'Decimals in Query', 2, { min: 0, max: 6 }),
        ],
      },
      {
        title: 'Separators & Currency',
        fields: [
          text('decimalSeparator', 'Decimal Separator', '.'),
          text('thousandsSeparator', 'Thousands Sep.', ','),
          yesNo('displayCurrencySymbol', 'Display Currency Symbol', true),
          yesNo('displayCurrencyOnRight', 'Display Currency on the Right'),
          sel('exchangeRatePosting', 'Exchange Rate Posting', 'direct', [
            { value: 'direct', label: 'Direct' },
            { value: 'indirect', label: 'Indirect' },
          ]),
          yesNo('showDiscountColumn', 'Show Discount Column', true),
          yesNo('hidePriceZero', 'Hide Zero Prices'),
        ],
      },
    ],
  },

  // ── Font & Background ──────────────────────────────────────────────────────
  {
    key: 'Font & Bkgd',
    label: 'Font & Bkgd',
    group: 'font_background',
    sections: [
      {
        title: 'Font',
        fields: [
          text('fontName', 'Font', 'Segoe UI'),
          num('fontSize', 'Font Size', 11, { min: 8, max: 24 }),
          yesNo('autoResizeUserForms', 'Auto Resize User Forms'),
        ],
      },
      {
        title: 'Background',
        fields: [
          { key: 'backgroundColor', label: 'Background Color', type: 'color', default: '#ececec' },
          text('backgroundImageUrl', 'Background Image URL', '', { wide: true }),
          sel('imageDisplay', 'Image Display', 'none', [
            { value: 'none', label: 'None' },
            { value: 'center', label: 'Center' },
            { value: 'stretch', label: 'Stretch' },
            { value: 'tile', label: 'Tile' },
          ]),
        ],
      },
    ],
  },

  // ── Path ───────────────────────────────────────────────────────────────────
  {
    key: 'Path',
    label: 'Path',
    group: 'path',
    sections: [
      {
        title: 'Folders',
        fields: [
          sel('exportTarget', 'Export Word and Excel File To', 'local', [
            { value: 'local', label: 'Local Folder' },
            { value: 'onedrive', label: 'OneDrive' },
          ]),
          text('wordDocsFolder', 'Word Templates Folder', '', { wide: true }),
          text('excelDocsFolder', 'Excel Folder', '', { wide: true }),
          text('picturesFolder', 'Pictures Folder', '', { wide: true }),
          text('attachmentsFolder', 'Attachments Folder', '', { wide: true }),
          text('extensionsFolder', 'Extensions Folder', '', { wide: true }),
          text('xmlFileFolder', 'XML File Folder', '', { wide: true }),
          text('currentScanner', 'Current Scanner'),
          yesNo('blockExecutableAttachments', 'Block Executable Attachments', true, {
            hint: 'Rejects .exe/.bat/.scr uploads. Leaving this off lets a user attach a runnable file that another user may open.',
          }),
        ],
      },
    ],
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  {
    key: 'Inventory',
    label: 'Inventory',
    group: 'inventory',
    sections: [
      {
        title: 'Items',
        fields: [
          text('defaultWarehouse', 'Default Warehouse'),
          sel('setGlAccountsBy', 'Set G/L Accounts By', 'warehouse', [
            { value: 'warehouse', label: 'Warehouse' },
            { value: 'itemGroup', label: 'Item Group' },
            { value: 'itemLevel', label: 'Item Level' },
          ]),
          sel('manageItemsBy', 'Manage Items By', 'warehouse', [
            { value: 'warehouse', label: 'Warehouse' },
            { value: 'company', label: 'Company' },
          ]),
          yesNo('allowNegativeStock', 'Allow Negative Stock', false, {
            hint: 'Allowing negative stock lets a release post against inventory that is not there; the shortfall surfaces later as an unexplained valuation gap.',
          }),
          yesNo('autoAddAllWarehouses', 'Auto. Add All Warehouses to New and Existing Items', true),
          yesNo('autoAddAllUomGroups', 'Auto. Add All UoM Group Definitions to Items'),
          yesNo('autoAddAllPackageDefs', 'Auto. Add All Package Definitions to Items'),
          yesNo('duplicateBarCodes', 'Duplicate Bar Codes While Duplicating Items'),
          yesNo('openItemMasterInsteadOfBom', 'Open Item Master Data Instead of Bill of Materials'),
          yesNo('displayInactiveItemsInReports', 'Display Inactive Items In Reports', true),
          yesNo('displayInactiveItemsInDocuments', 'Display Inactive Items In Marketing Documents'),
        ],
      },
      {
        title: 'Serial and Batches',
        fields: [
          sel('serialManagementMethod', 'Management Method', 'onRelease', [
            { value: 'onRelease', label: 'On Every Transaction' },
            { value: 'onEveryTransaction', label: 'On Release Only' },
          ]),
          sel('uniqueSerialNumbersBy', 'Unique Serial Numbers By', 'serialNumber', [
            { value: 'serialNumber', label: 'Serial Number' },
            { value: 'mfrSerialNumber', label: 'Mfr. Serial Number' },
            { value: 'lotNumber', label: 'Lot Number' },
          ]),
          sel('displayBatchQuantitiesBy', 'Display Batch Quantities By', 'all', [
            { value: 'all', label: 'All Warehouses' },
            { value: 'selected', label: 'Selected Warehouse' },
          ]),
          sel('documentRowUom', 'Document Row UoM', 'inventory', [
            { value: 'inventory', label: 'Inventory UoM' },
            { value: 'sales', label: 'Sales UoM' },
          ]),
          yesNo('autoCreateEquipmentCard', 'Auto. Create Equipment Card'),
          text('basicBatchStatus', 'Basic Setting for Batch Status', 'Released'),
          yesNo('blockMultipleReceiptsSameBatch', 'Block Multiple Receipts for Same Batch'),
        ],
      },
      {
        title: 'Planning & Reports',
        fields: [
          sel('consumptionMethod', 'Consumption Method', 'backward', [
            { value: 'backward', label: 'Backward' },
            { value: 'forward', label: 'Forward' },
          ]),
          num('consumeDaysBackward', 'Days Backward', 0, { min: 0, max: 999 }),
          num('consumeDaysForward', 'Days Forward', 0, { min: 0, max: 999 }),
          sel('valuationReportStyle', 'Valuation Report', 'enhanced', [
            { value: 'classic', label: 'Classic, Excluding Item Master Valuation' },
            { value: 'enhanced', label: 'Enhanced, Including All Valuation Methods' },
          ]),
          yesNo('omitDisassemblyTransactions', 'Omit Disassembly Transactions to Improve Performance'),
        ],
      },
    ],
  },

  // ── Resources ──────────────────────────────────────────────────────────────
  {
    key: 'Resources',
    label: 'Resources',
    group: 'resources',
    sections: [
      {
        title: 'Resource Defaults',
        fields: [
          text('defaultResourceWarehouse', 'Default Warehouse'),
          yesNo('autoAddWarehousesToResources', 'Auto Add All Warehouses to New Resources', true),
          num('capacityHorizonMonths', 'Capacity Horizon (Months)', 12, { min: 0, max: 120 }),
          num('capacityHorizonDays', 'Capacity Horizon (Extra Days)', 0, { min: 0, max: 365 }),
        ],
      },
    ],
  },

  // ── Cash Flow ──────────────────────────────────────────────────────────────
  {
    key: 'Cash Flow',
    label: 'Cash Flow',
    group: 'cash_flow',
    sections: [
      {
        title: 'Cash Flow',
        fields: [
          yesNo('enableCashFlow', 'Enable Cash Flow'),
          sel('cashFlowRelevancy', 'Cash Flow Line Item Assignment', 'optional', [
            { value: 'mandatory', label: 'Mandatory' },
            { value: 'optional', label: 'Optional' },
          ], { dependsOn: 'enableCashFlow' }),
          text('defaultCashFlowIncoming', 'Default Line Item — Incoming Payment'),
          text('defaultCashFlowOutgoing', 'Default Line Item — Outgoing Payment'),
          sel('cashFlowMissingItemBehaviour', 'When a Line Item Is Missing', 'warning', [
            { value: 'ignore', label: 'Ignore Without Warning' },
            { value: 'warning', label: 'Warning Only' },
            { value: 'block', label: 'Block the Posting' },
          ]),
        ],
      },
    ],
  },

  // ── Cockpit ────────────────────────────────────────────────────────────────
  {
    key: 'Cockpit',
    label: 'Cockpit',
    group: 'cockpit',
    sections: [
      {
        title: 'Cockpit',
        fields: [
          sel('cockpitStyle', 'Cockpit Style', 'fiori', [
            { value: 'fiori', label: 'Fiori-Style Cockpit' },
            { value: 'classic', label: 'Classic Cockpit' },
            { value: 'none', label: 'None' },
          ]),
          num('kpiRefreshSeconds', 'Refresh KPIs and Dashboards (Seconds)', 300, { min: 30, max: 86400 }),
          yesNo('enablePervasiveDashboards', 'Enable Pervasive Dashboards'),
        ],
      },
    ],
  },

  // ── Cost Accounting ────────────────────────────────────────────────────────
  {
    key: 'Cost Accounting',
    label: 'Cost Accounting',
    group: 'cost_accounting',
    sections: [
      {
        title: 'Dimensions',
        fields: [
          yesNo('useMultidimensions', 'Use Multidimensions'),
          sel('displayDistributionRules', 'Display Distribution Rules', 'unified', [
            { value: 'unified', label: 'In a Unified Column' },
            { value: 'separate', label: 'In Separate Columns' },
          ], { dependsOn: 'useMultidimensions' }),
          sel('missingRuleBehaviour', 'Line Without a Distribution Rule or Project', 'warning', [
            { value: 'ignore', label: 'Post Without Warning' },
            { value: 'warning', label: 'Warn and Allow' },
            { value: 'block', label: 'Block the Posting' },
          ], {
            wide: true,
            hint: 'Applies when the G/L account is set up for cost accounting.',
          }),
        ],
      },
      {
        title: 'Cost Accounting Adjustment',
        fields: [
          text('adjustmentDefaultSeries', 'Default Series'),
          text('adjustmentDefaultAccount', 'Default G/L Account'),
        ],
      },
    ],
  },

  // ── Pricing ────────────────────────────────────────────────────────────────
  {
    key: 'Pricing',
    label: 'Pricing',
    group: 'pricing',
    sections: [
      {
        title: 'Pricing',
        fields: [
          text('baseCurrencyForPriceLists', 'Base Currency for Price Lists', 'USD'),
          yesNo('updatePricesGlobally', 'Update Prices Globally'),
          yesNo('displayZeroPriceInactiveList', 'Display Zero Price if Source Is an Inactive Price List'),
          yesNo('allowManualPriceOverride', 'Allow Manual Price Override', true),
          num('maxDiscountPercent', 'Maximum Discount (%)', 100, { min: 0, max: 100 }),
        ],
      },
    ],
  },

  // ── Hide Functions ─────────────────────────────────────────────────────────
  {
    key: 'Hide Functions',
    label: 'Hide Functions',
    group: 'hide_functions',
    sections: [
      {
        title: 'Hide From Menus',
        fields: [
          yesNo('hideProduction', 'Production'),
          yesNo('hideMrp', 'MRP'),
          yesNo('hideService', 'Service'),
          yesNo('hideResources', 'Resources'),
          yesNo('hideProjectManagement', 'Project Management'),
          yesNo('hideFixedAssets', 'Fixed Assets'),
          yesNo('hideIntercompany', 'Intercompany'),
        ],
      },
    ],
  },

  // ── QR Codes ───────────────────────────────────────────────────────────────
  {
    key: 'QR Codes',
    label: 'QR Codes',
    group: 'qr_codes',
    sections: [
      {
        title: 'QR Codes',
        fields: [
          yesNo('enableQrCodes', 'Enable QR Codes on Documents'),
          sel('qrCodeContent', 'QR Code Content', 'documentNumber', [
            { value: 'documentNumber', label: 'Document Number' },
            { value: 'documentUrl', label: 'Document URL' },
            { value: 'custom', label: 'Custom Expression' },
          ], { dependsOn: 'enableQrCodes' }),
          text('qrCodeCustomExpression', 'Custom Expression', '', {
            wide: true, dependsOn: 'enableQrCodes',
          }),
          num('qrCodeSizePx', 'QR Code Size (px)', 120, { min: 40, max: 600 }),
        ],
      },
    ],
  },

  // ── Security ───────────────────────────────────────────────────────────────
  {
    key: 'Security',
    label: 'Security',
    group: 'security',
    sections: [
      {
        title: 'Password Administration',
        fields: [
          num('passwordMinLength', 'Minimum Password Length', 8, { min: 6, max: 64 }),
          yesNo('passwordRequireUppercase', 'Require an Uppercase Letter', true),
          yesNo('passwordRequireNumber', 'Require a Digit', true),
          yesNo('passwordRequireSymbol', 'Require a Symbol'),
          num('passwordExpiryDays', 'Password Expires After (Days)', 0, {
            min: 0, max: 3650, hint: '0 means passwords never expire.',
          }),
          num('passwordHistoryCount', 'Passwords Remembered', 3, { min: 0, max: 24 }),
          num('maxFailedAttempts', 'Lock Account After Failed Attempts', 5, { min: 0, max: 50 }),
          num('lockoutMinutes', 'Lockout Duration (Minutes)', 15, { min: 1, max: 1440 }),
        ],
      },
      {
        title: 'Session',
        fields: [
          num('sessionIdleMinutes', 'Sign Out After Idle (Minutes)', 0, {
            min: 0, max: 1440, hint: '0 disables idle sign-out.',
          }),
          yesNo('requireMfaForAdmins', 'Require MFA for Administrators'),
          yesNo('auditSensitiveReads', 'Audit Reads of Sensitive Data'),
        ],
      },
    ],
  },
];

/** Every default for a tab's group, used to seed the form before load. */
export function defaultsFor(tab: TabSpec): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const section of tab.sections) {
    for (const field of section.fields) out[field.key] = field.default;
  }
  return out;
}
