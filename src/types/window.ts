// ─── Central Type Definitions ────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export type WindowType =
  | 'employee' | 'timesheet' | 'family' | 'kin' | 'settlement' | 'tada'
  | 'bpMaster' | 'activity' | 'opportunity' | 'salesOrder' | 'customer360'
  | 'activitiesOverview' | 'campaignsList' | 'inactiveCustomers' | 'oppStatistics' | 'wonOppReport'
  | 'purchaseRequest' | 'purchaseQuotation' | 'purchaseOrder'
  | 'goodsReceiptPO' | 'goodsReturnRequest' | 'goodsReturn'
  | 'apDownPaymentRequest' | 'apDownPaymentInvoice' | 'apInvoice' | 'apCreditMemo' | 'apReserveInvoice'
  | 'recurringTransactions' | 'recurringTransactionTemplates' | 'landedCosts'
  | 'shippingSetup' | 'documentPrinting' | 'openItemsList'
  | 'purchaseAnalysis' | 'purchaseRequestReport' | 'purchaseQuotationComparison'
  | 'employeeCurrentInfo' | 'payPeriod' | 'gradeMaster' | 'loanMaster' | 'leaveMaster'
  | 'employeeCategoryMaster' | 'shiftMaster' | 'taxFormula' | 'gradePayScale'
  | 'monthlyAttendance' | 'payrollProcess' | 'loanApplication' | 'leaveApplication' | 'payrollAdjustments'
  | 'chooseCompany' | 'exchangeRates' | 'companyDetails' | 'generalSettings'
  | 'postingPeriods' | 'documentNumbering' | 'documentSettings'
  | 'chartOfAccounts' | 'journalEntry' | 'postingTemplates' | 'recurringPostings'
  | 'documentPrintingSelection' | 'assetMasterData' | 'capitalization'
  | 'capitalizationCreditMemo' | 'retirement' | 'transfer'
  | 'manualDepreciation' | 'depreciationRun' | 'assetRevaluation' | 'fiscalYearChange'
  | 'assetDepreciationForecast' | 'assetHistorySheet' | 'assetStatusReport' | 'assetTransactionReport'
  | 'reconciliation' | 'managePreviousReconciliations'
  | 'budgetScenarios' | 'budgetDistributionMethods' | 'budget' | 'pmsSurchargeRate'
  | 'electronicReport_RESector' | 'electronicReport_RERealEstateType'
  | 'electronicReport_CRC_Schedule' | 'electronicReport_CRC_General'
  | 'electronicReport_Challan' | 'electronicReport_MonthWise' | 'electronicReport_YearWise'
  | 'electronicReport_DHAB' | 'electronicReport_FixAsset'
  | 'electronicReport_Surcharge' | 'electronicReport_Surcharge2'
  | 'glAccountsAndBP' | 'generalLedger'
  | 'customerReceivablesAging' | 'vendorLiabilitiesAging' | 'agingProperties' | 'blanketAgreementsList'
  | 'transactionJournalReport' | 'transactionReportByProjects'
  | 'documentJournal' | 'taxReport' | 'withholdingTaxReport'
  | 'balanceSheet' | 'trialBalance' | 'profitAndLossStatement' | 'cashFlow' | 'statementOfCashFlows' | 'cashFlowForecast'
  | 'balanceSheetComparison' | 'trialBalanceComparison' | 'profitLossComparison'
  | 'budgetReport' | 'balanceSheetBudget' | 'trialBalanceBudget' | 'profitLossBudget' | 'budgetReportCategorized'
  | 'editChartOfAccounts' | 'dataNotProvided'
  | 'incomingPayments' | 'checkRegister' | 'creditCardManagement' | 'creditCardSummary'
  | 'outgoingPayments' | 'checksForPayment' | 'voidChecksForPayment' | 'checksForPaymentDraftsReport'
  | 'paymentDraftsReport' | 'checksForPaymentDateCrossSection' | 'bpBankAccountsQuery' | 'houseBankAccountsQuery'
  | 'externalReconciliation'
  | 'dimensions' | 'costCenters' | 'costCenterTable' | 'distributionRules'
  | 'costCenterHierarchy' | 'costCenterReport' | 'distributionReport'
  | 'costAccountingSummary' | 'budgetVersusCostAccounting' | 'accrualTypes'
  | 'costAccountingReconciliation' | 'costAccountingAdjustment' | 'costElements'
  | 'printPreferences' | 'tooltipPreview' | 'usersSetup' | 'userGroups' | 'userDefaults' | 'salesEmployeesSetup' | 'territoriesSetup' | 'commissionGroupsSetup' | 'predefinedTextSetup' | 'referenceFieldLinksSetup' | 'freightSetup' | 'messagePreferencesSetup' | 'reportLayoutManager' | 'crystalReportElementsSetup' | 'serverPrintConfig' | 'dashboardManager' | 'dashboardParametersSetup' | 'passwordAdministration' | 'changePassword' | 'siteUser' | 'electronicFileManagerSetup' | 'electronicCertificatesSetup' | 'crystalServerConfig' | 'processChecklistTemplate' | 'sapLinks' | 'dunningHistoryReport' | 'customersCreditLimitDeviation' | 'reconByDueDate' | 'reconByExactAmount' | 'reconByTransNumber' | 'reconLocateByRowNumber' | 'reconByExactSum' | 'reconBySumFC' | 'selectionUsers' | 'selectionEmployees' | 'selectionRecipientLists' | 'selectionProperties' | 'selectionUdf' | 'selectionBusinessPartners';
