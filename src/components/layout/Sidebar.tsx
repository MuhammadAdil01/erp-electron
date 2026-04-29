import React, { useState } from 'react';
import { Folder, BarChart2 } from 'lucide-react';
import { modulesData, cockpitData, MenuSubItem } from './SidebarNav/menuData';
import { WindowType } from '../../types/window';

// ─── Props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  onOpen: (type: WindowType, title?: string) => void;
}

// ─── Small leaf icon ──────────────────────────────────────────────────────────
const LeafIcon: React.FC<{ isFolder: boolean }> = ({ isFolder }) => (
  <div className={`w-[14px] h-[14px] flex items-center justify-center rounded-[1px] shrink-0 shadow-sm border border-black/10
    ${isFolder ? 'bg-[#f39c12]' : 'bg-[#7f8c8d]'}`}>
    {isFolder
      ? <Folder className="w-[10px] h-[10px] text-white" />
      : <BarChart2 className="w-[10px] h-[10px] text-white" />}
  </div>
);

// ─── Single expandable tree item ──────────────────────────────────────────────
const TreeItem: React.FC<{
  item: MenuSubItem;
  depth?: number;
  onOpen: (type: WindowType, title?: string) => void;
}> = ({ item, depth = 0, onOpen }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.subItems && item.subItems.length > 0;
  const isFolder = hasChildren || false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) { setExpanded(v => !v); return; }

    // ── Window dispatch ────────────────────────────────────────────────────
    const n = item.name;
    const map: Record<string, WindowType> = {
      'Employee Master Data': 'employee', 'Time Sheet': 'timesheet',
      'Family Detail': 'family', 'Next of Kin': 'kin',
      'Final Settlement': 'settlement', 'TA/DA': 'tada',
      'Business Partner Master Data': 'bpMaster', 'Activity': 'activity',
      'Opportunity': 'opportunity', 'Sales Order': 'salesOrder',
      'Customer 360': 'customer360',
      'Activities Overview': 'activitiesOverview', 'Inactive Customers': 'inactiveCustomers',
      'Campaigns List': 'campaignsList',
      'Chart of Accounts': 'chartOfAccounts', 'Edit Chart of Accounts': 'editChartOfAccounts',
      'Journal Entry': 'journalEntry',
      'Posting Templates': 'postingTemplates', 'Recurring Postings': 'recurringPostings',
      'Document Printing': 'documentPrintingSelection',
      'Asset Master Data': 'assetMasterData', 'Capitalization': 'capitalization',
      'Capitalization Credit Memo': 'capitalizationCreditMemo',
      'Retirement': 'retirement',
      'Transfer': 'transfer',
      'Manual Depreciation': 'manualDepreciation',
      'Depreciation Run': 'depreciationRun',
      'Asset Revaluation': 'assetRevaluation',
      'Fiscal Year Change': 'fiscalYearChange',
      'Asset Depreciation Forecast Report': 'assetDepreciationForecast',
      'Asset History Sheet': 'assetHistorySheet',
      'Asset Status Report': 'assetStatusReport',
      'Asset Transaction Report': 'assetTransactionReport',
      'Reconciliation': 'reconciliation',
      'Manage Previous Reconciliations': 'managePreviousReconciliations',
      'Budget Scenarios': 'budgetScenarios',
      'Budget Distribution Methods': 'budgetDistributionMethods',
      'Budget': 'budget',
      'PMS Surcharge Rate': 'pmsSurchargeRate',
      'Real Estate - Summary of Receivable (Sectors)': 'electronicReport_RESector',
      'Real Estate - Summary of Receivable (Real Estate Type)': 'electronicReport_RERealEstateType',
      'Customer Receivable & Collection - Schedule': 'electronicReport_CRC_Schedule',
      'Customer Receivable & Collection - General': 'electronicReport_CRC_General',
      'Comprehensive Challan Report': 'electronicReport_Challan',
      'Month Wise Period Receivable Report': 'electronicReport_MonthWise',
      'Year Wise Period Receivable Report': 'electronicReport_YearWise',
      'DHAB Pay Slip': 'electronicReport_DHAB',
      'Fix Asset Report': 'electronicReport_FixAsset',
      'Report - Surcharge Calculation': 'electronicReport_Surcharge',
      'Report - Surcharge Calculation 2': 'electronicReport_Surcharge2',
      'G/L Accounts and Business Partners': 'glAccountsAndBP',
      'General Ledger': 'generalLedger',
      'Customer Receivables Aging': 'customerReceivablesAging',
      'Vendor Liabilities Aging': 'vendorLiabilitiesAging',
      'Transaction Journal Report': 'transactionJournalReport',
      'Transaction Report by Projects': 'transactionReportByProjects',
      'Document Journal': 'documentJournal',
      'Tax Report': 'taxReport',
      'Withholding Tax Report': 'withholdingTaxReport',
      'Balance Sheet': 'balanceSheet',
      'Trial Balance': 'trialBalance',
      'Profit and Loss Statement': 'profitAndLossStatement',
      'Cash Flow': 'cashFlow',
      'Statement of Cash Flows': 'statementOfCashFlows',
      'Cash Flow Forecast': 'cashFlowForecast',
      'Balance Sheet Comparison': 'balanceSheetComparison',
      'Trial Balance Comparison': 'trialBalanceComparison',
      'Profit and Loss Statement Comparison': 'profitLossComparison',
      'Budget Report': 'budgetReport',
      'Balance Sheet Budget Report': 'balanceSheetBudget',
      'Trial Balance Budget Report': 'trialBalanceBudget',
      'Profit and Loss Statement Budget Report': 'profitLossBudget',
      'Budget Report Categorized': 'budgetReportCategorized',
      'Choose Company': 'chooseCompany', 'Exchange Rates & Indexes': 'exchangeRates',
      'Company Details': 'companyDetails', 'General Settings': 'generalSettings',
      'Posting Periods': 'postingPeriods', 'Document Numbering': 'documentNumbering',
      'Document Settings': 'documentSettings',
      'Employee Current Information': 'employeeCurrentInfo', 'Pay Period Master': 'payPeriod',
      'Grade Master': 'gradeMaster', 'Loan Master': 'loanMaster', 'Leave Master': 'leaveMaster',
      'Employee Category Master': 'employeeCategoryMaster', 'Shift Master': 'shiftMaster',
      'TaxFormulaMaster': 'taxFormula', 'Grade Pay Scale': 'gradePayScale',
      'Monthly Attendance Sheet': 'monthlyAttendance', 'Payroll Process': 'payrollProcess',
      'Loan Application': 'loanApplication', 'Leave Application': 'leaveApplication',
      'Payroll Monthly Adjustments': 'payrollAdjustments',
      'Purchase Request': 'purchaseRequest', 'Purchase Quotation': 'purchaseQuotation',
      'Purchase Order': 'purchaseOrder', 'Goods Receipt PO': 'goodsReceiptPO',
      'Goods Return Request': 'goodsReturnRequest', 'Goods Return': 'goodsReturn',
      'A/P Down Payment Request': 'apDownPaymentRequest', 'A/P Down Payment Invoice': 'apDownPaymentInvoice',
      'A/P Invoice': 'apInvoice', 'A/P Credit Memo': 'apCreditMemo', 'A/P Reserve Invoice': 'apReserveInvoice',
      'Recurring Transactions': 'recurringTransactions',
      'Recurring Transaction Templates': 'recurringTransactionTemplates',
      'Landed Costs': 'landedCosts', 'Open Items List': 'openItemsList',
      'Purchase Analysis': 'purchaseAnalysis', 'Purchase Request Report': 'purchaseRequestReport',
      'Purchase Quotation Comparison Report': 'purchaseQuotationComparison',
      'Dimensions': 'dimensions',
      'Cost Centers': 'costCenters',
      'Table of Cost Centers and Distribution Rules': 'costCenterTable',
      'Distribution Rules': 'distributionRules',
      'Cost Center Hierarchy': 'costCenterHierarchy',
      'Cost Center Report': 'costCenterReport',
      'Distribution Report': 'distributionReport',
      'Cost Accounting Summary Report': 'costAccountingSummary',
      'Budget Versus Cost Accounting': 'budgetVersusCostAccounting',
      'Accrual Type': 'accrualTypes',
      'Cost Accounting Reconciliation Report': 'costAccountingReconciliation',
      'Journal Entry for Cost Accounting Adjustment': 'costAccountingAdjustment',
      'Cost Elements': 'costElements',
      'Print Preferences': 'printPreferences',
      'Tooltip Preview': 'tooltipPreview',
      'Users': 'usersSetup',
      'User Groups': 'userGroups',
      'User Defaults': 'userDefaults',
      'Sales Employees/Buyers': 'salesEmployeesSetup',
      'Territories': 'territoriesSetup',
      'Commission Groups': 'commissionGroupsSetup',
      'Predefined Text': 'predefinedTextSetup',
      'Reference Field Links': 'referenceFieldLinksSetup',
      'Freight': 'freightSetup',
      'Message Preferences': 'messagePreferencesSetup',
      'Report and Layout Manager': 'reportLayoutManager',
      'Default Elements for SAP Crystal Reports': 'crystalReportElementsSetup',
      'Server Print Configuration': 'serverPrintConfig',
      'Dashboard Manager': 'dashboardManager',
      'Dashboard Parameters': 'dashboardParametersSetup',
      'Password Administration': 'passwordAdministration',
      'Change Password': 'changePassword',
      'Site User': 'siteUser',
      'Electronic File Manager': 'electronicFileManagerSetup',
      'Electronic Certificates': 'electronicCertificatesSetup',
      'Crystal Server Configuration': 'crystalServerConfig',
      'Process Checklist Template': 'processChecklistTemplate',
      'SAP Links': 'sapLinks',
      'My Activities': 'activitiesOverview',
      'Dunning History Report': 'dunningHistoryReport',
      'Customer Receivables by Customer Cross-Section': 'dataNotProvided',
      'Customers Credit Limit Deviation': 'customersCreditLimitDeviation',
      'Internal Reconciliation by Due Date': 'reconByDueDate',
      'Internal Reconciliation by Exact Amount': 'reconByExactAmount',
      'Internal Reconciliation by Trans. Number': 'reconByTransNumber',
      'Incoming Payments': 'incomingPayments',
      'Check Register': 'checkRegister',
      'Credit Card Management': 'creditCardManagement',
      'Credit Card Summary': 'creditCardSummary',
      'Outgoing Payments': 'outgoingPayments',
      'Checks for Payment': 'checksForPayment',
      'Void Checks for Payment': 'voidChecksForPayment',
      'Checks for Payment Drafts Report': 'checksForPaymentDraftsReport',
      'Payment Drafts Report': 'paymentDraftsReport',
      'Checks for Payment in Date Cross Section Report': 'checksForPaymentDateCrossSection',
      'BP Bank Accounts Query': 'bpBankAccountsQuery',
      'House Bank Accounts Query': 'houseBankAccountsQuery',
      'External Reconciliation': 'externalReconciliation',
      'Locate Reconciliation in Bank Statement by Row Number': 'reconLocateByRowNumber',
      'Locate Reconciliation Row in Bank Statements by Exact Amount': 'reconByExactAmount',
      'External Reconciliation by Due Date': 'reconByDueDate',
      'External Reconciliation by Exact Sum': 'reconByExactSum',
      'External Reconciliation by Sum (FC)': 'reconBySumFC',
      'External Reconciliation by Trans. Number': 'reconByTransNumber',
    };

    const oppReports = [
      'Opportunities Forecast Report', 'Opportunities Forecast Over Time Report',
      'Opportunities Statistics Report', 'Opportunities Report', 'Stage Analysis',
      'Information Source Distribution Over Time Report', 'My Open Opportunities Report',
      'My Closed Opportunities Report', 'Opportunities Pipeline',
    ];
    const wonReports = ['Won Opportunities Report', 'Lost Opportunities Report'];

    if (map[n]) { onOpen(map[n]); return; }
    if (wonReports.includes(n)) { onOpen('wonOppReport', n); return; }
    if (oppReports.includes(n)) { onOpen('oppStatistics', n); return; }
  };

  const pl = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-5' : 'pl-4';

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 group cursor-pointer hover:bg-[#ffed99]/30 py-0.5 ${pl} pr-1 rounded-sm`}
      >
        <div className="w-[14px] h-[14px] flex items-center justify-center shrink-0">
          {item.icon
            ? <div className="w-[14px] h-[14px] flex items-center justify-center">{item.icon}</div>
            : <LeafIcon isFolder={isFolder} />}
        </div>
        <span className={`text-[#333333] text-[10.5px] leading-tight group-hover:underline
          ${isFolder || expanded ? 'font-bold' : 'font-medium'}`}>
          {item.name}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="pl-4 flex flex-col py-0.5 border-l border-dotted border-gray-400 ml-[9px] mt-0.5">
          {item.subItems!.map((child, i) => (
            <TreeItem key={i} item={child} depth={depth + 1} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Cockpit leaf ─────────────────────────────────────────────────────────────
const CockpitItem: React.FC<{
  item: MenuSubItem;
  onOpen: (type: WindowType, title?: string) => void;
  depth?: number;
}> = ({ item, onOpen, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth === 0 && item.name === 'Purchasing (Current)');
  const hasChildren = item.subItems && item.subItems.length > 0;

  const handleLeafClick = (name: string) => {
    const map: Record<string, WindowType> = {
      'Purchase Request': 'purchaseRequest', 'Purchase Quotation': 'purchaseQuotation',
      'Purchase Order': 'purchaseOrder', 'Goods Receipt PO': 'goodsReceiptPO',
      'Goods Return Request': 'goodsReturnRequest', 'Goods Return': 'goodsReturn',
      'A/P Down Payment Request': 'apDownPaymentRequest', 'A/P Down Payment Invoice': 'apDownPaymentInvoice',
      'A/P Invoice': 'apInvoice', 'A/P Credit Memo': 'apCreditMemo', 'A/P Reserve Invoice': 'apReserveInvoice',
      'Recurring Transactions': 'recurringTransactions',
      'Recurring Transaction Templates': 'recurringTransactionTemplates',
      'Landed Costs': 'landedCosts', 'Document Printing': 'documentPrinting',
      'Open Items List': 'openItemsList', 'Purchase Analysis': 'purchaseAnalysis',
      'Purchase Request Report': 'purchaseRequestReport',
      'Purchase Quotation Comparison Report': 'purchaseQuotationComparison',
      'Common Functions': 'activitiesOverview',
    };
    if (map[name]) onOpen(map[name]);
  };

  const pl = depth === 0 ? 'pl-3' : depth === 1 ? 'pl-7' : 'pl-10';

  return (
    <div className="flex flex-col">
      <div
        onClick={() => {
          if (hasChildren) setExpanded(v => !v);
          else handleLeafClick(item.name);
        }}
        className={`flex items-center gap-2 h-[28px] cursor-pointer border-b border-[#d4d4d4] transition-colors
          ${item.isHighlighted ? 'bg-[#ffb700] hover:bg-[#ffa000]' : 'bg-[#e1e1e1] hover:bg-[#d8d8d8]'}
          ${item.isHeader && !item.isHighlighted ? 'bg-[#d8d8d8]' : ''}`}
      >
        <div className={`flex items-center justify-center ${pl}`}>
          {item.icon}
        </div>
        <span className={`text-[11px] text-[#333] leading-none whitespace-nowrap
          ${item.isHeader || item.isHighlighted ? 'font-bold' : 'font-medium'}`}>
          {item.name}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col">
          {item.subItems!.map((sub, si) => (
            <CockpitItem key={si} item={sub} onOpen={onOpen} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Sidebar Component ───────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ onOpen }) => {
  const [activeTab, setActiveTab] = useState('Modules');

  return (
    <div className="flex border-r border-[#d4d0c8] relative z-[1000]">
      {/* Vertical Tabs Ribbon */}
      <div className="w-[28px] bg-[#d1d1d1] flex flex-col border-r border-[#d4d0c8] z-50 shrink-0">
        {['My Cockpit', 'Modules', 'Drag & Relate'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full py-6 flex items-center justify-center cursor-pointer border-b border-[#d4d0c8] relative transition-colors
              ${activeTab === tab ? 'bg-[#ffed99]' : 'bg-[#e0e0e0] hover:bg-[#d8d8d8]'}`}
          >
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold text-gray-700 whitespace-nowrap">{tab}</span>
            {activeTab === tab && <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-400" />}
          </div>
        ))}
        <div className="flex-1 bg-[#d1d1d1]" />
      </div>

      {/* Module Tree Pane */}
      <div className="w-[240px] bg-[#f0f0f0] flex flex-col border-r border-[#d4d0c8] select-none shadow-inner overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'Modules' ? (
            <div className="flex flex-col p-1">
              {modulesData.map((module, i) => (
                <TreeItem key={i} item={module} depth={0} onOpen={onOpen} />
              ))}
            </div>
          ) : activeTab === 'My Cockpit' ? (
            <div className="flex flex-col bg-[#e1e1e1] h-full overflow-y-auto">
              {cockpitData.map((item, i) => (
                <CockpitItem key={i} item={item} onOpen={onOpen} />
              ))}
              {/* Fill remaining space with grey rows to match image look */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-[28px] bg-[#e1e1e1] border-b border-[#d4d4d4]" />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-[11px] italic">
              {activeTab} Content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
