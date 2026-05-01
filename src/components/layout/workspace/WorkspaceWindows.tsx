import React from 'react';
import { WindowManagerReturn } from '../../../hooks/useWindowManager';

// HR
import { EmployeeMasterDataWindow } from '../../human-resources/EmployeeMasterData/EmployeeMasterDataWindow';
import { TimeSheetWindow } from '../../human-resources/TimeSheet/TimeSheetWindow';
import { FamilyDetailWindow } from '../../human-resources/FamilyDetail/FamilyDetailWindow';
import { NextOfKinWindow } from '../../human-resources/NextOfKin/NextOfKinWindow';
import { FinalSettlementWindow } from '../../human-resources/FinalSettlement/FinalSettlementWindow';
import { TADAWindow } from '../../human-resources/TADA/TADAWindow';

// HR Payroll
import { EmployeeCurrentInformationWindow } from '../../hr-payroll/Masters/EmployeeCurrentInformationWindow';
import { PayPeriodMasterWindow } from '../../hr-payroll/Masters/PayPeriodMasterWindow';
import { GradeMasterWindow } from '../../hr-payroll/Masters/GradeMasterWindow';
import { LoanMasterWindow } from '../../hr-payroll/Masters/LoanMasterWindow';
import { LeaveMasterWindow } from '../../hr-payroll/Masters/LeaveMasterWindow';
import { EmployeeCategoryMasterWindow } from '../../hr-payroll/Masters/EmployeeCategoryMasterWindow';
import { ShiftMasterWindow } from '../../hr-payroll/Masters/ShiftMasterWindow';
import { TaxFormulaCalculationWindow } from '../../hr-payroll/Masters/TaxFormulaCalculationWindow';
import { GradePayScaleWindow } from '../../hr-payroll/Masters/GradePayScaleWindow';
import { MonthlyAttendanceSheetWindow } from '../../hr-payroll/Transactions/MonthlyAttendanceSheetWindow';
import { PayrollProcessWindow } from '../../hr-payroll/Transactions/PayrollProcessWindow';
import { LoanApplicationWindow } from '../../hr-payroll/Transactions/LoanApplicationWindow';
import { LeaveApplicationWindow } from '../../hr-payroll/Transactions/LeaveApplicationWindow';
import { PayrollMonthlyAdjustmentsWindow } from '../../hr-payroll/Transactions/PayrollMonthlyAdjustmentsWindow';

// CRM
import { BusinessPartnerMasterDataWindow } from '../../crm/BusinessPartnerMasterData/BusinessPartnerMasterDataWindow';
import { ActivityWindow } from '../../crm/Activity/ActivityWindow';
import { OpportunityWindow } from '../../crm/Opportunity/OpportunityWindow';
import { SalesOrderWindow } from '../../crm/SalesOrder/SalesOrderWindow';
import { Customer360Window } from '../../crm/Customer360/Customer360Window';
import { ActivitiesOverviewCriteria } from '../../crm/Reports/ActivitiesOverviewCriteria';
import { CampaignsListCriteria } from '../../crm/Reports/CampaignsListCriteria';
import { InactiveCustomersCriteria } from '../../crm/Reports/InactiveCustomersCriteria';
import { OppStatisticsCriteria } from '../../crm/Reports/OppStatisticsCriteria';
import { WonOpportunitiesCriteria } from '../../crm/Reports/WonOpportunitiesCriteria';
import { IncomingPaymentsWindow } from '../../banking/IncomingPaymentsWindow';
import { CheckRegisterCriteria } from '../../banking/criteria/CheckRegisterCriteria';
import { CreditCardManagementCriteria } from '../../banking/criteria/CreditCardManagementCriteria';
import { CreditCardSummaryCriteria } from '../../banking/criteria/CreditCardSummaryCriteria';
import { OutgoingPaymentsWindow } from '../../banking/OutgoingPaymentsWindow';
import { ChecksForPaymentCriteria } from '../../banking/criteria/ChecksForPaymentCriteria';
import { VoidChecksForPaymentCriteria } from '../../banking/criteria/VoidChecksForPaymentCriteria';
import { ChecksForPaymentDraftsReportCriteria } from '../../banking/criteria/ChecksForPaymentDraftsReportCriteria';
import { ChecksForPaymentWindow } from '../../banking/ChecksForPaymentWindow';
import { ChecksForPaymentDraftsReportWindow } from '../../banking/ChecksForPaymentDraftsReportWindow';
import { PaymentDraftsReportWindow } from '../../banking/PaymentDraftsReportWindow';
import { HouseBankAccountsQueryWindow } from '../../banking/HouseBankAccountsQueryWindow';

// Purchasing
import { PurchaseRequestWindow } from '../../purchasing/PurchaseRequestWindow';
import { PurchaseQuotationWindow } from '../../purchasing/PurchaseQuotationWindow';
import { PurchaseOrderWindow } from '../../purchasing/PurchaseOrderWindow';
import { GoodsReceiptPOWindow } from '../../purchasing/GoodsReceiptPOWindow';
import { GoodsReturnRequestWindow } from '../../purchasing/GoodsReturnRequestWindow';
import { GoodsReturnWindow } from '../../purchasing/GoodsReturnWindow';
import { APDownPaymentRequestWindow } from '../../purchasing/APDownPaymentRequestWindow';
import { APDownPaymentInvoiceWindow } from '../../purchasing/APDownPaymentInvoiceWindow';
import { APInvoiceWindow } from '../../purchasing/APInvoiceWindow';
import { APCreditMemoWindow } from '../../purchasing/APCreditMemoWindow';
import { APReserveInvoiceWindow } from '../../purchasing/APReserveInvoiceWindow';
import { ConfirmationRecurringTransactionsWindow } from '../../purchasing/ConfirmationRecurringTransactionsWindow';
import { RecurringTransactionTemplatesWindow } from '../../purchasing/RecurringTransactionTemplatesWindow';
import { LandedCostsWindow } from '../../purchasing/LandedCostsWindow';
import { ShippingTypesSetupWindow } from '../../purchasing/ShippingTypesSetupWindow';
import { DocumentPrintingWindow } from '../../purchasing/DocumentPrintingWindow';
import { OpenItemsListWindow } from '../../purchasing/OpenItemsListWindow';
import { PurchaseAnalysisWindow } from '../../purchasing/PurchaseAnalysisWindow';
import { PurchaseRequestReportWindow } from '../../purchasing/PurchaseRequestReportWindow';
import { PurchaseQuotationComparisonReportWindow } from '../../purchasing/PurchaseQuotationComparisonReportWindow';
import { ChooseCompanyWindow } from '../../administration/ChooseCompanyWindow';
import { ExchangeRatesIndexesWindow } from '../../administration/ExchangeRatesIndexesWindow';
import { CompanyDetailsWindow } from '../../administration/CompanyDetailsWindow';
import { GeneralSettingsWindow } from '../../administration/GeneralSettingsWindow';
import { PostingPeriodsWindow } from '../../administration/PostingPeriodsWindow';
import { DocumentNumberingWindow } from '../../administration/DocumentNumberingWindow';
import { DocumentSettingsWindow } from '../../administration/DocumentSettingsWindow';
import { PrintPreferencesWindow } from '../../administration/PrintPreferencesWindow';
import { TooltipPreviewWindow } from '../../administration/TooltipPreviewWindow';
import { CompanyAdminWindow } from '../../administration/CompanyAdminWindow';
import { UsersSetupWindow } from '../../administration/UsersSetupWindow';
import { UserGroupsWindow } from '../../administration/UserGroupsWindow';
import { UserDefaultsWindow } from '../../administration/UserDefaultsWindow';
import { SalesEmployeesSetupWindow } from '../../administration/SalesEmployeesSetupWindow';
import { TerritoriesSetupWindow } from '../../administration/TerritoriesSetupWindow';
import { CommissionGroupsWindow } from '../../administration/CommissionGroupsWindow';
import { PredefinedTextWindow } from '../../administration/PredefinedTextWindow';
import { ReferenceFieldLinksWindow } from '../../administration/ReferenceFieldLinksWindow';
import { FreightSetupWindow } from '../../administration/FreightSetupWindow';
import { MessagePreferencesWindow } from '../../administration/MessagePreferencesWindow';
import { ReportLayoutManagerWindow } from '../../administration/ReportLayoutManagerWindow';
import { CrystalReportElementsWindow } from '../../administration/CrystalReportElementsWindow';
import { ServerPrintConfigWindow } from '../../administration/ServerPrintConfigWindow';
import { DashboardManagerWindow } from '../../administration/DashboardManagerWindow';
import { DashboardParametersWindow } from '../../administration/DashboardParametersWindow';
import { PasswordAdministrationWindow } from '../../administration/PasswordAdministrationWindow';
import { ChangePasswordWindow } from '../../administration/ChangePasswordWindow';
import { SiteUserWindow } from '../../administration/SiteUserWindow';
import { ElectronicFileManagerSetupWindow } from '../../administration/ElectronicFileManagerSetupWindow';
import { ElectronicCertificatesWindow } from '../../administration/ElectronicCertificatesWindow';
import { CrystalServerConfigWindow } from '../../administration/CrystalServerConfigWindow';
import { ProcessChecklistTemplateWindow } from '../../administration/ProcessChecklistTemplateWindow';
import { SAPLinksWindow } from '../../administration/SAPLinksWindow';
import { ChartOfAccountsWindow } from '../../financials/ChartOfAccountsWindow';
import { EditChartOfAccountsWindow } from '../../financials/EditChartOfAccountsWindow';
import { DataNotProvidedWindow } from '../../financials/DataNotProvidedWindow';
import { JournalEntryWindow } from '../../financials/JournalEntryWindow';
import { PostingTemplatesWindow } from '../../financials/PostingTemplatesWindow';
import { RecurringPostingsWindow } from '../../financials/RecurringPostingsWindow';
import { DocumentPrintingSelectionWindow } from '../../financials/DocumentPrintingSelectionWindow';
import { AssetMasterDataWindow } from '../../financials/AssetMasterDataWindow';
import { CapitalizationWindow } from '../../financials/CapitalizationWindow';
import { CapitalizationCreditMemoWindow } from '../../financials/CapitalizationCreditMemoWindow';
import { RetirementWindow } from '../../financials/RetirementWindow';
import { TransferWindow } from '../../financials/TransferWindow';
import { ManualDepreciationWindow } from '../../financials/ManualDepreciationWindow';
import { DepreciationRunWindow } from '../../financials/DepreciationRunWindow';
import { AssetRevaluationWindow } from '../../financials/AssetRevaluationWindow';
import { FiscalYearChangeWindow } from '../../financials/FiscalYearChangeWindow';
import { AssetDepreciationForecastWindow } from '../../financials/AssetDepreciationForecastWindow';
import { AssetHistorySheetWindow } from '../../financials/AssetHistorySheetWindow';
import { AssetStatusReportWindow } from '../../financials/AssetStatusReportWindow';
import { AssetTransactionReportWindow } from '../../financials/AssetTransactionReportWindow';
import { ManagePreviousReconciliationsWindow } from '../../financials/ManagePreviousReconciliationsWindow';
import { ReconciliationWindow } from '../../financials/ReconciliationWindow';
import { BudgetScenariosWindow } from '../../financials/BudgetScenariosWindow';
import { BudgetDistributionMethodsWindow } from '../../financials/BudgetDistributionMethodsWindow';
import { BudgetScenarioDefinitionWindow } from '../../financials/BudgetScenarioDefinitionWindow';
import { PMSSurchargeRateWindow } from '../../financials/PMSSurchargeRateWindow';
import {
  ElectronicReportRESectorWindow,
  ElectronicReportRERealEstateTypeWindow,
  ElectronicReportCRCScheduleWindow,
  ElectronicReportCRCGeneralWindow,
  ElectronicReportChallanWindow,
  ElectronicReportMonthWiseWindow,
  ElectronicReportYearWiseWindow,
  ElectronicReportDHABWindow,
  ElectronicReportFixAssetWindow,
  ElectronicReportSurchargeWindow,
  ElectronicReportSurcharge2Window
} from '../../financials/ElectronicReportsCriteriaWindows';
import { GLAccountsBPCriteriaWindow } from '../../financials/reports/GLAccountsBPCriteriaWindow';
import { GeneralLedgerCriteriaWindow } from '../../financials/reports/GeneralLedgerCriteriaWindow';
import { 
  CustomerReceivablesAgingCriteria, 
  VendorLiabilitiesAgingCriteria, 
  AgingPropertiesWindow, 
  ListBlanketAgreementsWindow 
} from '../../financials/reports/AgingWindows';
import { 
  TransactionJournalReportWindow, 
  TransactionReportByProjectsWindow 
} from '../../financials/reports/AccountingReportsCriteriaWindows';
import { DocumentJournalCriteriaWindow } from '../../financials/reports/DocumentJournalCriteriaWindow';
import { 
  TaxReportCriteriaWindow, 
  WithholdingTaxReportCriteriaWindow 
} from '../../financials/reports/TaxReportsCriteriaWindows';
import {
  BalanceSheetCriteriaWindow,
  TrialBalanceCriteriaWindow,
  ProfitLossStatementCriteriaWindow,
  CashFlowCriteriaWindow,
  StatementOfCashFlowsCriteriaWindow,
  CashFlowForecastCriteriaWindow
} from '../../financials/reports/FinancialReportsCriteriaWindows';
import {
  BalanceSheetComparisonWindow,
  TrialBalanceComparisonWindow,
  ProfitLossComparisonWindow
} from '../../financials/reports/ComparisonReportsCriteriaWindows';
import {
  BudgetReportWindow,
  BalanceSheetBudgetWindow,
  TrialBalanceBudgetWindow,
  ProfitLossBudgetWindow,
  BudgetReportCategorizedWindow
} from '../../financials/reports/BudgetReportsCriteriaWindows';
import { DunningHistoryReportCriteriaWindow } from '../../financials/reports/DunningHistoryReportCriteriaWindow';
import { CustomersCreditLimitDeviationWindow } from '../../financials/reports/CustomersCreditLimitDeviationWindow';
import { 
  ReconLocateByRowNumberCriteria,
  ReconLocateByExactAmountCriteria,
  ReconByDueDateCriteria,
  ReconByExactSumCriteria,
  ReconBySumFCCriteria,
  ReconByTransNumberCriteria 
} from '../../banking/reconciliation/ReconciliationCriteriaWindows';

// Cost Accounting
import { DimensionsWindow } from '../../financials/cost-accounting/DimensionsWindow';
import { CostCentersSetupWindow } from '../../financials/cost-accounting/CostCentersSetupWindow';
import { CostCenterTableWindow } from '../../financials/cost-accounting/CostCenterTableWindow';
import { DistributionRulesWindow } from '../../financials/cost-accounting/DistributionRulesWindow';
import { CostCenterHierarchyWindow } from '../../financials/cost-accounting/CostCenterHierarchyWindow';
import { CostCenterReportCriteriaWindow } from '../../financials/cost-accounting/CostCenterReportCriteriaWindow';
import { DistributionReportCriteriaWindow } from '../../financials/cost-accounting/DistributionReportCriteriaWindow';
import { CostAccountingSummaryWindow } from '../../financials/cost-accounting/CostAccountingSummaryWindow';
import { BudgetVersusCostAccountingWindow } from '../../financials/cost-accounting/BudgetVersusCostAccountingWindow';
import { AccrualTypesWindow } from '../../financials/cost-accounting/AccrualTypesWindow';
import { CostAccountingReconciliationWindow } from '../../financials/cost-accounting/CostAccountingReconciliationWindow';
import { CostAccountingAdjustmentCriteriaWindow } from '../../financials/cost-accounting/CostAccountingAdjustmentCriteriaWindow';
import { CostElementsWindow } from '../../financials/cost-accounting/CostElementsWindow';

// Selection Modals
import { 
  SelectionUsersWindow, 
  SelectionEmployeesWindow, 
  SelectionRecipientListsWindow, 
  SelectionPropertiesWindow, 
  SelectionUdfWindow,
  SelectionBusinessPartnersWindow
} from '../../common/SelectionWindows';

// ─── Props ───────────────────────────────────────────────────────────────────
type Props = { wm: WindowManagerReturn };

// ─── Helper: state updater ────────────────────────────────────────────────────
const upd = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
  (patch: Partial<T>) => setter(prev => ({ ...prev, ...patch }));

// ─── Component ───────────────────────────────────────────────────────────────
export const WorkspaceWindows: React.FC<Props> = ({ wm }) => {
  const { openWindow: ow } = wm;

  return (
    <>
      {/* ── Human Resources ── */}
      <EmployeeMasterDataWindow show={wm.showEmployeeMaster} onClose={() => wm.setShowEmployeeMaster(false)} windowState={wm.employeeWindow} setWindowState={wm.setEmployeeWindow} />
      <TimeSheetWindow          show={wm.showTimeSheet}       onClose={() => wm.setShowTimeSheet(false)}       windowState={wm.timeSheetWindow}   setWindowState={wm.setTimeSheetWindow} />
      <FamilyDetailWindow       show={wm.showFamilyDetail}    onClose={() => wm.setShowFamilyDetail(false)}    windowState={wm.familyDetailWindow} setWindowState={wm.setFamilyDetailWindow} />
      <NextOfKinWindow          show={wm.showNextOfKin}       onClose={() => wm.setShowNextOfKin(false)}       windowState={wm.nextOfKinWindow}    setWindowState={wm.setNextOfKinWindow} />
      <FinalSettlementWindow    show={wm.showFinalSettlement} onClose={() => wm.setShowFinalSettlement(false)} windowState={wm.finalSettlementWindow} setWindowState={wm.setFinalSettlementWindow} />
      <TADAWindow               show={wm.showTADA}            onClose={() => wm.setShowTADA(false)}            windowState={wm.tadaWindow}         setWindowState={wm.setTadaWindow} />

      {/* ── HR Payroll Masters ── */}
      {wm.showEmployeeCurrentInfo && <EmployeeCurrentInformationWindow show={wm.showEmployeeCurrentInfo} onClose={() => wm.setShowEmployeeCurrentInfo(false)} windowState={wm.employeeCurrentInfoWindowPos} setWindowState={wm.setEmployeeCurrentInfoWindowPos} />}
      {wm.showPayPeriod           && <PayPeriodMasterWindow            show={wm.showPayPeriod}           onClose={() => wm.setShowPayPeriod(false)}           windowState={wm.payPeriodWindowPos}           setWindowState={wm.setPayPeriodWindowPos} />}
      {wm.showGradeMaster         && <GradeMasterWindow                show={wm.showGradeMaster}         onClose={() => wm.setShowGradeMaster(false)}         windowState={wm.gradeMasterWindowPos}         setWindowState={wm.setGradeMasterWindowPos} />}
      {wm.showLoanMaster          && <LoanMasterWindow                 show={wm.showLoanMaster}          onClose={() => wm.setShowLoanMaster(false)}          windowState={wm.loanMasterWindowPos}          setWindowState={wm.setLoanMasterWindowPos} />}
      {wm.showLeaveMaster         && <LeaveMasterWindow                show={wm.showLeaveMaster}         onClose={() => wm.setShowLeaveMaster(false)}         windowState={wm.leaveMasterWindowPos}         setWindowState={wm.setLeaveMasterWindowPos} />}
      {wm.showEmployeeCategoryMaster && <EmployeeCategoryMasterWindow  show={wm.showEmployeeCategoryMaster} onClose={() => wm.setShowEmployeeCategoryMaster(false)} windowState={wm.employeeCategoryMasterWindowPos} setWindowState={wm.setEmployeeCategoryMasterWindowPos} />}
      {wm.showShiftMaster         && <ShiftMasterWindow                show={wm.showShiftMaster}         onClose={() => wm.setShowShiftMaster(false)}         windowState={wm.shiftMasterWindowPos}         setWindowState={wm.setShiftMasterWindowPos} />}
      {wm.showTaxFormula          && <TaxFormulaCalculationWindow      show={wm.showTaxFormula}          onClose={() => wm.setShowTaxFormula(false)}          windowState={wm.taxFormulaWindowPos}          setWindowState={wm.setTaxFormulaWindowPos} />}
      {wm.showGradePayScale       && <GradePayScaleWindow              show={wm.showGradePayScale}       onClose={() => wm.setShowGradePayScale(false)}       windowState={wm.gradePayScaleWindowPos}       setWindowState={wm.setGradePayScaleWindowPos} />}

      {/* ── HR Payroll Transactions ── */}
      {wm.showMonthlyAttendance   && <MonthlyAttendanceSheetWindow     show={wm.showMonthlyAttendance}   onClose={() => wm.setShowMonthlyAttendance(false)}   windowState={wm.monthlyAttendanceWindowPos}   setWindowState={wm.setMonthlyAttendanceWindowPos} />}
      {wm.showPayrollProcess      && <PayrollProcessWindow             show={wm.showPayrollProcess}      onClose={() => wm.setShowPayrollProcess(false)}      windowState={wm.payrollProcessWindowPos}      setWindowState={wm.setPayrollProcessWindowPos} />}
      {wm.showLoanApplication     && <LoanApplicationWindow            show={wm.showLoanApplication}     onClose={() => wm.setShowLoanApplication(false)}     windowState={wm.loanApplicationWindowPos}     setWindowState={wm.setLoanApplicationWindowPos} />}
      {wm.showLeaveApplication    && <LeaveApplicationWindow           show={wm.showLeaveApplication}    onClose={() => wm.setShowLeaveApplication(false)}    windowState={wm.leaveApplicationWindowPos}    setWindowState={wm.setLeaveApplicationWindowPos} />}
      {wm.showPayrollAdjustments  && <PayrollMonthlyAdjustmentsWindow  show={wm.showPayrollAdjustments}  onClose={() => wm.setShowPayrollAdjustments(false)}  windowState={wm.payrollAdjustmentsWindowPos}  setWindowState={wm.setPayrollAdjustmentsWindowPos} />}

      {/* ── CRM ── */}
      {wm.showBusinessPartnerMaster && <BusinessPartnerMasterDataWindow windowState={wm.bpMasterWindow}     onClose={() => wm.setShowBusinessPartnerMaster(false)} onUpdateState={upd(wm.setBpMasterWindow)}     onFocus={() => ow('bpMaster')} />}
      {wm.showActivity              && <ActivityWindow                  windowState={wm.activityWindow}     onClose={() => wm.setShowActivity(false)}              onUpdateState={upd(wm.setActivityWindow)}     onFocus={() => ow('activity')} />}
      {wm.showOpportunity           && <OpportunityWindow               windowState={wm.opportunityWindow}  onClose={() => wm.setShowOpportunity(false)}           onUpdateState={upd(wm.setOpportunityWindow)}  onFocus={() => ow('opportunity')} />}
      {wm.showSalesOrder            && <SalesOrderWindow                windowState={wm.salesOrderWindow}   onClose={() => wm.setShowSalesOrder(false)}            onUpdateState={upd(wm.setSalesOrderWindow)}   onFocus={() => ow('salesOrder')} />}
      {wm.showCustomer360           && <Customer360Window               windowState={wm.customer360Window}  onClose={() => wm.setShowCustomer360(false)}           onUpdateState={upd(wm.setCustomer360Window)}  onFocus={() => ow('customer360')} />}
      {wm.showActivitiesOverview    && <ActivitiesOverviewCriteria      windowState={wm.activitiesWindow}   onClose={() => wm.setShowActivitiesOverview(false)}    onUpdateState={upd(wm.setActivitiesWindow)}   onFocus={() => ow('activitiesOverview')} wm={wm} />}
      {wm.showCampaignsList         && <CampaignsListCriteria           windowState={wm.campaignsWindow}    onClose={() => wm.setShowCampaignsList(false)}         onUpdateState={upd(wm.setCampaignsWindow)}    onFocus={() => ow('campaignsList')} />}
      {wm.showInactiveCustomers     && <InactiveCustomersCriteria       windowState={wm.inactiveCustWindow} onClose={() => wm.setShowInactiveCustomers(false)}     onUpdateState={upd(wm.setInactiveCustWindow)} onFocus={() => ow('inactiveCustomers')} wm={wm} />}
      {wm.showOppStatistics         && <OppStatisticsCriteria           title={wm.activeReportTitle} windowState={wm.oppStatsWindow} onClose={() => wm.setShowOppStatistics(false)} onUpdateState={upd(wm.setOppStatsWindow) as any} onFocus={() => ow('oppStatistics')} />}
      {wm.showWonOppReport          && <WonOpportunitiesCriteria        title={wm.activeReportTitle} windowState={wm.wonOppWindow}   onClose={() => wm.setShowWonOppReport(false)}  onUpdateState={upd(wm.setWonOppWindow) as any}   onFocus={() => ow('wonOppReport')} />}

      {/* ── Purchasing ── */}
      {wm.showPurchaseRequest             && <PurchaseRequestWindow                  windowState={wm.purchaseRequestWindow}             onClose={() => wm.setShowPurchaseRequest(false)}             onUpdateState={upd(wm.setPurchaseRequestWindow)}             onFocus={() => ow('purchaseRequest')} />}
      {wm.showPurchaseQuotation           && <PurchaseQuotationWindow                windowState={wm.purchaseQuotationWindow}           onClose={() => wm.setShowPurchaseQuotation(false)}           onUpdateState={upd(wm.setPurchaseQuotationWindow)}           onFocus={() => ow('purchaseQuotation')} />}
      {wm.showPurchaseOrder               && <PurchaseOrderWindow                    windowState={wm.purchaseOrderWindow}               onClose={() => wm.setShowPurchaseOrder(false)}               onUpdateState={upd(wm.setPurchaseOrderWindow)}               onFocus={() => ow('purchaseOrder')} />}
      {wm.showGoodsReceiptPO              && <GoodsReceiptPOWindow                   windowState={wm.goodsReceiptPOWindow}              onClose={() => wm.setShowGoodsReceiptPO(false)}              onUpdateState={upd(wm.setGoodsReceiptPOWindow)}              onFocus={() => ow('goodsReceiptPO')} />}
      {wm.showGoodsReturnRequest          && <GoodsReturnRequestWindow               windowState={wm.goodsReturnRequestWindow}          onClose={() => wm.setShowGoodsReturnRequest(false)}          onUpdateState={upd(wm.setGoodsReturnRequestWindow)}          onFocus={() => ow('goodsReturnRequest')} />}
      {wm.showGoodsReturn                 && <GoodsReturnWindow                      windowState={wm.goodsReturnWindow}                 onClose={() => wm.setShowGoodsReturn(false)}                 onUpdateState={upd(wm.setGoodsReturnWindow)}                 onFocus={() => ow('goodsReturn')} />}
      {wm.showAPDownPaymentRequest        && <APDownPaymentRequestWindow             windowState={wm.apDownPaymentRequestWindow}        onClose={() => wm.setShowAPDownPaymentRequest(false)}        onUpdateState={upd(wm.setAPDownPaymentRequestWindow)}        onFocus={() => ow('apDownPaymentRequest')} />}
      {wm.showAPDownPaymentInvoice        && <APDownPaymentInvoiceWindow             windowState={wm.apDownPaymentInvoiceWindow}        onClose={() => wm.setShowAPDownPaymentInvoice(false)}        onUpdateState={upd(wm.setAPDownPaymentInvoiceWindow)}        onFocus={() => ow('apDownPaymentInvoice')} />}
      {wm.showAPInvoice                   && <APInvoiceWindow                        windowState={wm.apInvoiceWindow}                   onClose={() => wm.setShowAPInvoice(false)}                   onUpdateState={upd(wm.setAPInvoiceWindow)}                   onFocus={() => ow('apInvoice')} />}
      {wm.showAPCreditMemo                && <APCreditMemoWindow                     windowState={wm.apCreditMemoWindow}                onClose={() => wm.setShowAPCreditMemo(false)}                onUpdateState={upd(wm.setAPCreditMemoWindow)}                onFocus={() => ow('apCreditMemo')} />}
      {wm.showAPReserveInvoice            && <APReserveInvoiceWindow                 windowState={wm.apReserveInvoiceWindow}            onClose={() => wm.setShowAPReserveInvoice(false)}            onUpdateState={upd(wm.setAPReserveInvoiceWindow)}            onFocus={() => ow('apReserveInvoice')} />}
      {wm.showRecurringTransactions       && <ConfirmationRecurringTransactionsWindow windowState={wm.recurringTransactionsWindow}       onClose={() => wm.setShowRecurringTransactions(false)}       onUpdateState={upd(wm.setRecurringTransactionsWindow)}       onFocus={() => ow('recurringTransactions')} />}
      {wm.showRecurringTransactionTemplates && <RecurringTransactionTemplatesWindow   windowState={wm.recurringTransactionTemplatesWindow} onClose={() => wm.setShowRecurringTransactionTemplates(false)} onUpdateState={upd(wm.setRecurringTransactionTemplatesWindow)} onFocus={() => ow('recurringTransactionTemplates')} />}
      {wm.showLandedCosts                 && <LandedCostsWindow                      windowState={wm.landedCostsWindow}                 onClose={() => wm.setShowLandedCosts(false)}                 onUpdateState={upd(wm.setLandedCostsWindow)}                 onFocus={() => ow('landedCosts')} onOpenShippingSetup={() => ow('shippingSetup')} />}
      {wm.showShippingSetup               && <ShippingTypesSetupWindow               windowState={wm.shippingSetupWindow}               onClose={() => wm.setShowShippingSetup(false)}               onUpdateState={upd(wm.setShippingSetupWindow)}               onFocus={() => ow('shippingSetup')} />}
      {wm.showDocumentPrinting            && <DocumentPrintingWindow                 windowState={wm.documentPrintingWindow}            onClose={() => wm.setShowDocumentPrinting(false)}            onUpdateState={upd(wm.setDocumentPrintingWindow)}            onFocus={() => ow('documentPrinting')} />}
      {wm.showOpenItemsList               && <OpenItemsListWindow                    windowState={wm.openItemsListWindow}               onClose={() => wm.setShowOpenItemsList(false)}               onUpdateState={upd(wm.setOpenItemsListWindow)}               onFocus={() => ow('openItemsList')} />}
      {wm.showPurchaseAnalysis            && <PurchaseAnalysisWindow                 windowState={wm.purchaseAnalysisWindow}            onClose={() => wm.setShowPurchaseAnalysis(false)}            onUpdateState={upd(wm.setPurchaseAnalysisWindow)}            onFocus={() => ow('purchaseAnalysis')} />}
      {wm.showPurchaseRequestReport       && <PurchaseRequestReportWindow            windowState={wm.purchaseRequestReportWindow}       onClose={() => wm.setShowPurchaseRequestReport(false)}       onUpdateState={upd(wm.setPurchaseRequestReportWindow)}       onFocus={() => ow('purchaseRequestReport')} />}
      {wm.showPurchaseQuotationComparison && <PurchaseQuotationComparisonReportWindow windowState={wm.purchaseQuotationComparisonWindow} onClose={() => wm.setShowPurchaseQuotationComparison(false)} onUpdateState={upd(wm.setPurchaseQuotationComparisonWindow)} onFocus={() => ow('purchaseQuotationComparison')} />}

      {/* ── Administration ── */}
      {wm.showChooseCompany      && <ChooseCompanyWindow         show={wm.showChooseCompany}      onClose={() => wm.setShowChooseCompany(false)}      windowState={wm.chooseCompanyWindowPos}      setWindowState={wm.setChooseCompanyWindowPos} />}
      {wm.showExchangeRates      && <ExchangeRatesIndexesWindow  show={wm.showExchangeRates}      onClose={() => wm.setShowExchangeRates(false)}      windowState={wm.exchangeRatesWindowPos}      setWindowState={wm.setExchangeRatesWindowPos} />}
      {wm.showCompanyDetails     && <CompanyDetailsWindow        show={wm.showCompanyDetails}     onClose={() => wm.setShowCompanyDetails(false)}     windowState={wm.companyDetailsWindowPos}     setWindowState={wm.setCompanyDetailsWindowPos} />}
      {wm.showGeneralSettings    && <GeneralSettingsWindow       show={wm.showGeneralSettings}    onClose={() => wm.setShowGeneralSettings(false)}    windowState={wm.generalSettingsWindowPos}    setWindowState={wm.setGeneralSettingsWindowPos} />}
      {wm.showPostingPeriods     && <PostingPeriodsWindow        show={wm.showPostingPeriods}     onClose={() => wm.setShowPostingPeriods(false)}     windowState={wm.postingPeriodsWindowPos}     setWindowState={wm.setPostingPeriodsWindowPos} />}
      {wm.showDocumentNumbering  && <DocumentNumberingWindow     show={wm.showDocumentNumbering}  onClose={() => wm.setShowDocumentNumbering(false)}  windowState={wm.documentNumberingWindowPos}  setWindowState={wm.setDocumentNumberingWindowPos} />}
      {wm.showDocumentSettings   && <DocumentSettingsWindow      show={wm.showDocumentSettings}   onClose={() => wm.setShowDocumentSettings(false)}   windowState={wm.documentSettingsWindowPos}   setWindowState={wm.setDocumentSettingsWindowPos} />}
      {wm.showPrintPreferences    && <PrintPreferencesWindow     show={wm.showPrintPreferences}    onClose={() => wm.setShowPrintPreferences(false)}    windowState={wm.printPreferencesWindowPos}    setWindowState={wm.setPrintPreferencesWindowPos} />}
      {wm.showTooltipPreview      && <TooltipPreviewWindow      show={wm.showTooltipPreview}      onClose={() => wm.setShowTooltipPreview(false)}      windowState={wm.tooltipPreviewWindowPos}      setWindowState={wm.setTooltipPreviewWindowPos} />}
      {wm.showCompanyAdmin        && <CompanyAdminWindow       show={wm.showCompanyAdmin}        onClose={() => wm.setShowCompanyAdmin(false)}        windowState={wm.companyAdminWindowPos}        setWindowState={wm.setCompanyAdminWindowPos} />}
      {wm.showUsersSetup          && <UsersSetupWindow          show={wm.showUsersSetup}          onClose={() => wm.setShowUsersSetup(false)}          windowState={wm.usersSetupWindowPos}          setWindowState={wm.setUsersSetupWindowPos} />}
      {wm.showUserGroups         && <UserGroupsWindow          show={wm.showUserGroups}          onClose={() => wm.setShowUserGroups(false)}          windowState={wm.userGroupsWindowPos}          setWindowState={wm.setUserGroupsWindowPos} />}
      {wm.showUserDefaults       && <UserDefaultsWindow        show={wm.showUserDefaults}        onClose={() => wm.setShowUserDefaults(false)}        windowState={wm.userDefaultsWindowPos}        setWindowState={wm.setUserDefaultsWindowPos} />}
      {wm.showSalesEmployeesSetup && <SalesEmployeesSetupWindow show={wm.showSalesEmployeesSetup} onClose={() => wm.setShowSalesEmployeesSetup(false)} windowState={wm.salesEmployeesSetupWindowPos} setWindowState={wm.setSalesEmployeesSetupWindowPos} />}
      {wm.showTerritoriesSetup    && <TerritoriesSetupWindow    show={wm.showTerritoriesSetup}    onClose={() => wm.setShowTerritoriesSetup(false)}    windowState={wm.territoriesSetupPos}          setWindowState={wm.setTerritoriesSetupPos} />}
      {wm.showCommissionGroupsSetup && <CommissionGroupsWindow   show={wm.showCommissionGroupsSetup} onClose={() => wm.setShowCommissionGroupsSetup(false)} windowState={wm.commissionGroupsSetupPos}  setWindowState={wm.setCommissionGroupsSetupPos} />}
      {wm.showPredefinedTextSetup && <PredefinedTextWindow      show={wm.showPredefinedTextSetup} onClose={() => wm.setShowPredefinedTextSetup(false)} windowState={wm.predefinedTextSetupPos}    setWindowState={wm.setPredefinedTextSetupPos} />}
      {wm.showReferenceFieldLinksSetup && <ReferenceFieldLinksWindow show={wm.showReferenceFieldLinksSetup} onClose={() => wm.setShowReferenceFieldLinksSetup(false)} windowState={wm.referenceFieldLinksSetupPos} setWindowState={wm.setReferenceFieldLinksSetupPos} />}
      {wm.showFreightSetup && <FreightSetupWindow              show={wm.showFreightSetup} onClose={() => wm.setShowFreightSetup(false)} windowState={wm.freightSetupPos}    setWindowState={wm.setFreightSetupPos} />}
      {wm.showMessagePreferencesSetup && <MessagePreferencesWindow show={wm.showMessagePreferencesSetup} onClose={() => wm.setShowMessagePreferencesSetup(false)} windowState={wm.messagePreferencesSetupPos} setWindowState={wm.setMessagePreferencesSetupPos} />}
      {wm.showReportLayoutManager && <ReportLayoutManagerWindow show={wm.showReportLayoutManager} onClose={() => wm.setShowReportLayoutManager(false)} windowState={wm.reportLayoutManagerPos} setWindowState={wm.setReportLayoutManagerPos} />}
      {wm.showCrystalReportElementsSetup && <CrystalReportElementsWindow show={wm.showCrystalReportElementsSetup} onClose={() => wm.setShowCrystalReportElementsSetup(false)} windowState={wm.crystalReportElementsSetupPos} setWindowState={wm.setCrystalReportElementsSetupPos} />}
      {wm.showServerPrintConfig && <ServerPrintConfigWindow    show={wm.showServerPrintConfig} onClose={() => wm.setShowServerPrintConfig(false)} windowState={wm.serverPrintConfigPos} setWindowState={wm.setServerPrintConfigPos} />}
      {wm.showDashboardManager && <DashboardManagerWindow      show={wm.showDashboardManager} onClose={() => wm.setShowDashboardManager(false)} windowState={wm.dashboardManagerPos} setWindowState={wm.setDashboardManagerPos} />}
      {wm.showDashboardParametersSetup && <DashboardParametersWindow show={wm.showDashboardParametersSetup} onClose={() => wm.setShowDashboardParametersSetup(false)} windowState={wm.dashboardParametersSetupPos} setWindowState={wm.setDashboardParametersSetupPos} />}
      {wm.showPasswordAdministration && <PasswordAdministrationWindow show={wm.showPasswordAdministration} onClose={() => wm.setShowPasswordAdministration(false)} windowState={wm.passwordAdminWindowPos} setWindowState={wm.setPasswordAdminWindowPos} />}
      {wm.showChangePassword && <ChangePasswordWindow show={wm.showChangePassword} onClose={() => wm.setShowChangePassword(false)} windowState={wm.changePasswordWindowPos} setWindowState={wm.setChangePasswordWindowPos} />}
      {wm.showSiteUser && <SiteUserWindow show={wm.showSiteUser} onClose={() => wm.setShowSiteUser(false)} windowState={wm.siteUserWindowPos} setWindowState={wm.setSiteUserWindowPos} />}
      {wm.showElectronicFileManagerSetup && <ElectronicFileManagerSetupWindow show={wm.showElectronicFileManagerSetup} onClose={() => wm.setShowElectronicFileManagerSetup(false)} windowState={wm.electronicFileManagerPos} setWindowState={wm.setElectronicFileManagerPos} />}
      {wm.showElectronicCertificatesSetup && <ElectronicCertificatesWindow show={wm.showElectronicCertificatesSetup} onClose={() => wm.setShowElectronicCertificatesSetup(false)} windowState={wm.electronicCertificatesPos} setWindowState={wm.setElectronicCertificatesPos} />}
      {wm.showCrystalServerConfig && <CrystalServerConfigWindow show={wm.showCrystalServerConfig} onClose={() => wm.setShowCrystalServerConfig(false)} windowState={wm.crystalServerConfigPos} setWindowState={wm.setCrystalServerConfigPos} />}
      {wm.showProcessChecklistTemplate && <ProcessChecklistTemplateWindow show={wm.showProcessChecklistTemplate} onClose={() => wm.setShowProcessChecklistTemplate(false)} windowState={wm.processChecklistTemplatePos} setWindowState={wm.setProcessChecklistTemplatePos} />}
      {wm.showSapLinks && <SAPLinksWindow show={wm.showSapLinks} onClose={() => wm.setShowSapLinks(false)} windowState={wm.sapLinksPos} setWindowState={wm.setSapLinksPos} />}


      {/* ── Financials ── */}
      {wm.showChartOfAccounts          && <ChartOfAccountsWindow          windowState={wm.chartOfAccountsWindowPos}        onClose={() => wm.setShowChartOfAccounts(false)}         onUpdateState={upd(wm.setChartOfAccountsWindowPos)}        onFocus={() => ow('chartOfAccounts')} />}
      {wm.showEditChartOfAccounts      && <EditChartOfAccountsWindow      windowState={wm.editChartOfAccountsPos}          onClose={() => wm.setShowEditChartOfAccounts(false)}     onUpdateState={upd(wm.setEditChartOfAccountsPos)}          onFocus={() => ow('editChartOfAccounts')} wm={wm} />}
      {wm.showDataNotProvided          && <DataNotProvidedWindow          title={wm.activeReportTitle} windowState={wm.dataNotProvidedPos}              onClose={() => wm.setShowDataNotProvided(false)}         onUpdateState={upd(wm.setDataNotProvidedPos)}              onFocus={() => ow('dataNotProvided')} />}
      {wm.showJournalEntry             && <JournalEntryWindow             windowState={wm.journalEntryWindow}              onClose={() => wm.setShowJournalEntry(false)}             onUpdateState={upd(wm.setJournalEntryWindow)}              onFocus={() => ow('journalEntry')} />}
      {wm.showPostingTemplates         && <PostingTemplatesWindow         windowState={wm.postingTemplatesWindow}          onClose={() => wm.setShowPostingTemplates(false)}         onUpdateState={upd(wm.setPostingTemplatesWindow)}          onFocus={() => ow('postingTemplates')} />}
      {wm.showRecurringPostings        && <RecurringPostingsWindow        windowState={wm.recurringPostingsWindow}         onClose={() => wm.setShowRecurringPostings(false)}        onUpdateState={upd(wm.setRecurringPostingsWindow)}         onFocus={() => ow('recurringPostings')} />}
      {wm.showDocumentPrintingSelection && <DocumentPrintingSelectionWindow windowState={wm.documentPrintingSelectionWindow} onClose={() => wm.setShowDocumentPrintingSelection(false)} onUpdateState={upd(wm.setDocumentPrintingSelectionWindow)} onFocus={() => ow('documentPrintingSelection')} />}
      {wm.showAssetMasterData          && <AssetMasterDataWindow          windowState={wm.assetMasterDataWindow}           onClose={() => wm.setShowAssetMasterData(false)}          onUpdateState={upd(wm.setAssetMasterDataWindow)}           onFocus={() => ow('assetMasterData')} />}
      {wm.showCapitalization           && <CapitalizationWindow           windowState={wm.capitalizationWindow}            onClose={() => wm.setShowCapitalization(false)}           onUpdateState={upd(wm.setCapitalizationWindow)}            onFocus={() => ow('capitalization')} />}
      {wm.showCapitalizationCreditMemo && <CapitalizationCreditMemoWindow windowState={wm.capitalizationCreditMemoWindow} onClose={() => wm.setShowCapitalizationCreditMemo(false)} onUpdateState={upd(wm.setCapitalizationCreditMemoWindow)} onFocus={() => ow('capitalizationCreditMemo')} />}
      {wm.showRetirement               && <RetirementWindow               windowState={wm.retirementWindow}                onClose={() => wm.setShowRetirement(false)}               onUpdateState={upd(wm.setRetirementWindow)}                onFocus={() => ow('retirement')} />}
      {wm.showTransfer                 && <TransferWindow                 windowState={wm.transferWindow}                  onClose={() => wm.setShowTransfer(false)}                 onUpdateState={upd(wm.setTransferWindow)}                  onFocus={() => ow('transfer')} />}
      {wm.showManualDepreciation       && <ManualDepreciationWindow       windowState={wm.manualDepreciationWindow}         onClose={() => wm.setShowManualDepreciation(false)}       onUpdateState={upd(wm.setManualDepreciationWindow)}        onFocus={() => ow('manualDepreciation')} />}
      {wm.showDepreciationRun          && <DepreciationRunWindow          windowState={wm.depreciationRunWindow}            onClose={() => wm.setShowDepreciationRun(false)}          onUpdateState={upd(wm.setDepreciationRunWindow)}           onFocus={() => ow('depreciationRun')} />}
      {wm.showAssetRevaluation         && <AssetRevaluationWindow         windowState={wm.assetRevaluationWindow}           onClose={() => wm.setShowAssetRevaluation(false)}         onUpdateState={upd(wm.setAssetRevaluationWindow)}          onFocus={() => ow('assetRevaluation')} />}
      {wm.showFiscalYearChange         && <FiscalYearChangeWindow         windowState={wm.fiscalYearChangeWindow}           onClose={() => wm.setShowFiscalYearChange(false)}         onUpdateState={upd(wm.setFiscalYearChangeWindow)}          onFocus={() => ow('fiscalYearChange')} />}
      {wm.showAssetDepreciationForecast && <AssetDepreciationForecastWindow windowState={wm.assetDepreciationForecastWindow} onClose={() => wm.setShowAssetDepreciationForecast(false)} onUpdateState={upd(wm.setAssetDepreciationForecastWindow)} onFocus={() => ow('assetDepreciationForecast')} />}
      {wm.showAssetHistorySheet        && <AssetHistorySheetWindow        windowState={wm.assetHistorySheetWindow}          onClose={() => wm.setShowAssetHistorySheet(false)}        onUpdateState={upd(wm.setAssetHistorySheetWindow)}         onFocus={() => ow('assetHistorySheet')} />}
      {wm.showAssetStatusReport        && <AssetStatusReportWindow        windowState={wm.assetStatusReportWindow}          onClose={() => wm.setShowAssetStatusReport(false)}        onUpdateState={upd(wm.setAssetStatusReportWindow)}         onFocus={() => ow('assetStatusReport')} />}
      {wm.showAssetTransactionReport   && <AssetTransactionReportWindow   windowState={wm.assetTransactionReportWindow}     onClose={() => wm.setShowAssetTransactionReport(false)}   onUpdateState={upd(wm.setAssetTransactionReportWindow)}    onFocus={() => ow('assetTransactionReport')} />}
      {wm.showReconciliation           && <ReconciliationWindow           windowState={wm.reconciliationWindow}             onClose={() => wm.setShowReconciliation(false)}           onUpdateState={upd(wm.setReconciliationWindow)}            onFocus={() => ow('reconciliation')} />}
      {wm.showManagePreviousReconciliations && <ManagePreviousReconciliationsWindow windowState={wm.managePreviousReconciliationsWindow} onClose={() => wm.setShowManagePreviousReconciliations(false)} onUpdateState={upd(wm.setManagePreviousReconciliationsWindow)} onFocus={() => ow('managePreviousReconciliations')} />}
      {wm.showBudgetScenarios          && <BudgetScenariosWindow          windowState={wm.budgetScenariosWindow}            onClose={() => wm.setShowBudgetScenarios(false)}          onUpdateState={upd(wm.setBudgetScenariosWindow)}           onFocus={() => ow('budgetScenarios')} />}
      {wm.showBudgetDistributionMethods && <BudgetDistributionMethodsWindow windowState={wm.budgetDistributionMethodsWindow} onClose={() => wm.setShowBudgetDistributionMethods(false)} onUpdateState={upd(wm.setBudgetDistributionMethodsWindow)} onFocus={() => ow('budgetDistributionMethods')} />}
      {wm.showBudget                   && <BudgetScenarioDefinitionWindow windowState={wm.budgetWindow}                     onClose={() => wm.setShowBudget(false)}                   onUpdateState={upd(wm.setBudgetWindow)}                    onFocus={() => ow('budget')} />}
      {wm.showPMSSurchargeRate         && <PMSSurchargeRateWindow         windowState={wm.pmsSurchargeRateWindow}           onClose={() => wm.setShowPMSSurchargeRate(false)}         onUpdateState={upd(wm.setPMSSurchargeRateWindow)}          onFocus={() => ow('pmsSurchargeRate')} />}
      
      {/* ── Electronic Reports ── */}
      {wm.showElectronicReportRESector && <ElectronicReportRESectorWindow windowState={wm.electronicReportRESectorWindow} onClose={() => wm.setShowElectronicReportRESector(false)} onUpdateState={upd(wm.setElectronicReportRESectorWindow)} onFocus={() => ow('electronicReport_RESector')} />}
      {wm.showElectronicReportRERealEstateType && <ElectronicReportRERealEstateTypeWindow windowState={wm.electronicReportRERealEstateTypeWindow} onClose={() => wm.setShowElectronicReportRERealEstateType(false)} onUpdateState={upd(wm.setElectronicReportRERealEstateTypeWindow)} onFocus={() => ow('electronicReport_RERealEstateType')} />}
      {wm.showElectronicReportCRCSchedule && <ElectronicReportCRCScheduleWindow windowState={wm.electronicReportCRCScheduleWindow} onClose={() => wm.setShowElectronicReportCRCSchedule(false)} onUpdateState={upd(wm.setElectronicReportCRCScheduleWindow)} onFocus={() => ow('electronicReport_CRC_Schedule')} />}
      {wm.showElectronicReportCRCGeneral && <ElectronicReportCRCGeneralWindow windowState={wm.electronicReportCRCGeneralWindow} onClose={() => wm.setShowElectronicReportCRCGeneral(false)} onUpdateState={upd(wm.setElectronicReportCRCGeneralWindow)} onFocus={() => ow('electronicReport_CRC_General')} />}
      {wm.showElectronicReportChallan && <ElectronicReportChallanWindow windowState={wm.electronicReportChallanWindow} onClose={() => wm.setShowElectronicReportChallan(false)} onUpdateState={upd(wm.setElectronicReportChallanWindow)} onFocus={() => ow('electronicReport_Challan')} />}
      {wm.showElectronicReportMonthWise && <ElectronicReportMonthWiseWindow windowState={wm.electronicReportMonthWiseWindow} onClose={() => wm.setShowElectronicReportMonthWise(false)} onUpdateState={upd(wm.setElectronicReportMonthWiseWindow)} onFocus={() => ow('electronicReport_MonthWise')} />}
      {wm.showElectronicReportYearWise && <ElectronicReportYearWiseWindow windowState={wm.electronicReportYearWiseWindow} onClose={() => wm.setShowElectronicReportYearWise(false)} onUpdateState={upd(wm.setElectronicReportYearWiseWindow)} onFocus={() => ow('electronicReport_YearWise')} />}
      {wm.showElectronicReportDHAB && <ElectronicReportDHABWindow windowState={wm.electronicReportDHABWindow} onClose={() => wm.setShowElectronicReportDHAB(false)} onUpdateState={upd(wm.setElectronicReportDHABWindow)} onFocus={() => ow('electronicReport_DHAB')} />}
      {wm.showElectronicReportFixAsset && <ElectronicReportFixAssetWindow windowState={wm.electronicReportFixAssetWindow} onClose={() => wm.setShowElectronicReportFixAsset(false)} onUpdateState={upd(wm.setElectronicReportFixAssetWindow)} onFocus={() => ow('electronicReport_FixAsset')} />}
      {wm.showElectronicReportSurcharge && <ElectronicReportSurchargeWindow windowState={wm.electronicReportSurchargeWindow} onClose={() => wm.setShowElectronicReportSurcharge(false)} onUpdateState={upd(wm.setElectronicReportSurchargeWindow)} onFocus={() => ow('electronicReport_Surcharge')} />}
      {wm.showElectronicReportSurcharge2 && <ElectronicReportSurcharge2Window windowState={wm.electronicReportSurcharge2Window} onClose={() => wm.setShowElectronicReportSurcharge2(false)} onUpdateState={upd(wm.setElectronicReportSurcharge2Window)} onFocus={() => ow('electronicReport_Surcharge2')} />}
      
      {/* ── Financial Reports - Accounting ── */}
      {wm.showGLAccountsAndBP && <GLAccountsBPCriteriaWindow windowState={wm.gLAccountsAndBPWindow} onClose={() => wm.setShowGLAccountsAndBP(false)} onUpdateState={upd(wm.setGLAccountsAndBPWindow)} onFocus={() => ow('glAccountsAndBP')} />}
      {wm.showGeneralLedger && <GeneralLedgerCriteriaWindow windowState={wm.generalLedgerWindow} onClose={() => wm.setShowGeneralLedger(false)} onUpdateState={upd(wm.setGeneralLedgerWindow)} onFocus={() => ow('generalLedger')} />}
      {wm.showCustomerReceivablesAging && <CustomerReceivablesAgingCriteria windowState={wm.customerReceivablesAgingWindow} onClose={() => wm.setShowCustomerReceivablesAging(false)} onUpdateState={upd(wm.setCustomerReceivablesAgingWindow)} onFocus={() => ow('customerReceivablesAging')} wm={wm} />}
      {wm.showVendorLiabilitiesAging && <VendorLiabilitiesAgingCriteria windowState={wm.vendorLiabilitiesAgingWindow} onClose={() => wm.setShowVendorLiabilitiesAging(false)} onUpdateState={upd(wm.setVendorLiabilitiesAgingWindow)} onFocus={() => ow('vendorLiabilitiesAging')} wm={wm} />}
      {wm.showAgingProperties && <AgingPropertiesWindow windowState={wm.agingPropertiesWindow} onClose={() => wm.setShowAgingProperties(false)} onUpdateState={upd(wm.setAgingPropertiesWindow)} onFocus={() => ow('agingProperties')} />}
      {wm.showBlanketAgreementsList && <ListBlanketAgreementsWindow windowState={wm.blanketAgreementsListWindow} onClose={() => wm.setShowBlanketAgreementsList(false)} onUpdateState={upd(wm.setBlanketAgreementsListWindow)} onFocus={() => ow('blanketAgreementsList')} />}
      {wm.showTransactionJournalReport && <TransactionJournalReportWindow windowState={wm.transactionJournalReportWindow} onClose={() => wm.setShowTransactionJournalReport(false)} onUpdateState={upd(wm.setTransactionJournalReportWindow)} onFocus={() => ow('transactionJournalReport')} />}
      {wm.showTransactionReportByProjects && <TransactionReportByProjectsWindow windowState={wm.transactionReportByProjectsWindow} onClose={() => wm.setShowTransactionReportByProjects(false)} onUpdateState={upd(wm.setTransactionReportByProjectsWindow)} onFocus={() => ow('transactionReportByProjects')} />}
      {wm.showDocumentJournal && <DocumentJournalCriteriaWindow windowState={wm.documentJournalWindow} onClose={() => wm.setShowDocumentJournal(false)} onUpdateState={upd(wm.setDocumentJournalWindow)} onFocus={() => ow('documentJournal')} />}
      {wm.showTaxReport && <TaxReportCriteriaWindow windowState={wm.taxReportWindow} onClose={() => wm.setShowTaxReport(false)} onUpdateState={upd(wm.setTaxReportWindow)} onFocus={() => ow('taxReport')} />}
      {wm.showWithholdingTaxReport && <WithholdingTaxReportCriteriaWindow windowState={wm.withholdingTaxReportWindow} onClose={() => wm.setShowWithholdingTaxReport(false)} onUpdateState={upd(wm.setWithholdingTaxReportWindow)} onFocus={() => ow('withholdingTaxReport')} />}
      {wm.showBalanceSheet && <BalanceSheetCriteriaWindow windowState={wm.balanceSheetWindow} onClose={() => wm.setShowBalanceSheet(false)} onUpdateState={upd(wm.setBalanceSheetWindow)} onFocus={() => ow('balanceSheet')} />}
      {wm.showTrialBalance && <TrialBalanceCriteriaWindow windowState={wm.trialBalanceWindow} onClose={() => wm.setShowTrialBalance(false)} onUpdateState={upd(wm.setTrialBalanceWindow)} onFocus={() => ow('trialBalance')} />}
      {wm.showProfitAndLossStatement && <ProfitLossStatementCriteriaWindow windowState={wm.profitAndLossStatementWindow} onClose={() => wm.setShowProfitAndLossStatement(false)} onUpdateState={upd(wm.setProfitAndLossStatementWindow)} onFocus={() => ow('profitAndLossStatement')} />}
      {wm.showCashFlow && <CashFlowCriteriaWindow windowState={wm.cashFlowWindow} onClose={() => wm.setShowCashFlow(false)} onUpdateState={upd(wm.setCashFlowWindow)} onFocus={() => ow('cashFlow')} />}
      {wm.showStatementOfCashFlows && <StatementOfCashFlowsCriteriaWindow windowState={wm.statementOfCashFlowsWindow} onClose={() => wm.setShowStatementOfCashFlows(false)} onUpdateState={upd(wm.setStatementOfCashFlowsWindow)} onFocus={() => ow('statementOfCashFlows')} />}
      {wm.showCashFlowForecast && <CashFlowForecastCriteriaWindow windowState={wm.cashFlowForecastWindow} onClose={() => wm.setShowCashFlowForecast(false)} onUpdateState={upd(wm.setCashFlowForecastWindow)} onFocus={() => ow('cashFlowForecast')} />}
      {wm.showBalanceSheetComparison && <BalanceSheetComparisonWindow windowState={wm.balanceSheetComparisonWindow} onClose={() => wm.setShowBalanceSheetComparison(false)} onUpdateState={upd(wm.setBalanceSheetComparisonWindow)} onFocus={() => ow('balanceSheetComparison')} />}
      {wm.showTrialBalanceComparison && <TrialBalanceComparisonWindow windowState={wm.trialBalanceComparisonWindow} onClose={() => wm.setShowTrialBalanceComparison(false)} onUpdateState={upd(wm.setTrialBalanceComparisonWindow)} onFocus={() => ow('trialBalanceComparison')} />}
      {wm.showProfitLossComparison && <ProfitLossComparisonWindow windowState={wm.profitLossComparisonWindow} onClose={() => wm.setShowProfitLossComparison(false)} onUpdateState={upd(wm.setProfitLossComparisonWindow)} onFocus={() => ow('profitLossComparison')} />}
      {wm.showBudgetReport && <BudgetReportWindow windowState={wm.budgetReportWindow} onClose={() => wm.setShowBudgetReport(false)} onUpdateState={upd(wm.setBudgetReportWindow)} onFocus={() => ow('budgetReport')} />}
      {wm.showBalanceSheetBudget && <BalanceSheetBudgetWindow windowState={wm.balanceSheetBudgetWindow} onClose={() => wm.setShowBalanceSheetBudget(false)} onUpdateState={upd(wm.setBalanceSheetBudgetWindow)} onFocus={() => ow('balanceSheetBudget')} />}
      {wm.showTrialBalanceBudget && <TrialBalanceBudgetWindow windowState={wm.trialBalanceBudgetWindow} onClose={() => wm.setShowTrialBalanceBudget(false)} onUpdateState={upd(wm.setTrialBalanceBudgetWindow)} onFocus={() => ow('trialBalanceBudget')} />}
      {wm.showProfitLossBudget && <ProfitLossBudgetWindow windowState={wm.profitLossBudgetWindow} onClose={() => wm.setShowProfitLossBudget(false)} onUpdateState={upd(wm.setProfitLossBudgetWindow)} onFocus={() => ow('profitLossBudget')} />}
      {wm.showBudgetReportCategorized && <BudgetReportCategorizedWindow windowState={wm.budgetReportCategorizedWindow} onClose={() => wm.setShowBudgetReportCategorized(false)} onUpdateState={upd(wm.setBudgetReportCategorizedWindow)} onFocus={() => ow('budgetReportCategorized')} />}

      {/* ── Cost Accounting ── */}
      {wm.showDimensions && <DimensionsWindow windowState={wm.dimensionsWindow} onClose={() => wm.setShowDimensions(false)} onUpdateState={upd(wm.setDimensionsWindow)} onFocus={() => ow('dimensions')} />}
      {wm.showCostCenters && <CostCentersSetupWindow windowState={wm.costCentersWindow} onClose={() => wm.setShowCostCenters(false)} onUpdateState={upd(wm.setCostCentersWindow)} onFocus={() => ow('costCenters')} onOpenTable={() => ow('costCenterTable')} />}
      {wm.showCostCenterTable && <CostCenterTableWindow windowState={wm.costCenterTableWindow} onClose={() => wm.setShowCostCenterTable(false)} onUpdateState={upd(wm.setCostCenterTableWindow)} onFocus={() => ow('costCenterTable')} onNewCostCenter={() => ow('costCenters')} onNewDistrRule={() => ow('distributionRules')} />}
      {wm.showDistributionRules && <DistributionRulesWindow windowState={wm.distributionRulesWindow} onClose={() => wm.setShowDistributionRules(false)} onUpdateState={upd(wm.setDistributionRulesWindow)} onFocus={() => ow('distributionRules')} />}
      {wm.showCostCenterHierarchy && <CostCenterHierarchyWindow windowState={wm.costCenterHierarchyWindow} onClose={() => wm.setShowCostCenterHierarchy(false)} onUpdateState={upd(wm.setCostCenterHierarchyWindow)} onFocus={() => ow('costCenterHierarchy')} />}
      {wm.showCostCenterReport && <CostCenterReportCriteriaWindow windowState={wm.costCenterReportWindow} onClose={() => wm.setShowCostCenterReport(false)} onUpdateState={upd(wm.setCostCenterReportWindow)} onFocus={() => ow('costCenterReport')} />}
      {wm.showDistributionReport && <DistributionReportCriteriaWindow windowState={wm.distributionReportWindow} onClose={() => wm.setShowDistributionReport(false)} onUpdateState={upd(wm.setDistributionReportWindow)} onFocus={() => ow('distributionReport')} />}
      {wm.showCostAccountingSummary && <CostAccountingSummaryWindow windowState={wm.costAccountingSummaryWindow} onClose={() => wm.setShowCostAccountingSummary(false)} onUpdateState={upd(wm.setCostAccountingSummaryWindow)} onFocus={() => ow('costAccountingSummary')} />}
      {wm.showBudgetVersusCostAccounting && <BudgetVersusCostAccountingWindow windowState={wm.budgetVersusCostAccountingWindow} onClose={() => wm.setShowBudgetVersusCostAccounting(false)} onUpdateState={upd(wm.setBudgetVersusCostAccountingWindow)} onFocus={() => ow('budgetVersusCostAccounting')} />}
      {wm.showAccrualTypes && <AccrualTypesWindow windowState={wm.accrualTypesWindow} onClose={() => wm.setShowAccrualTypes(false)} onUpdateState={upd(wm.setAccrualTypesWindow)} onFocus={() => ow('accrualTypes')} />}
      {wm.showCostAccountingReconciliation && <CostAccountingReconciliationWindow windowState={wm.costAccountingReconciliationWindow} onClose={() => wm.setShowCostAccountingReconciliation(false)} onUpdateState={upd(wm.setCostAccountingReconciliationWindow)} onFocus={() => ow('costAccountingReconciliation')} />}
      {wm.showCostAccountingAdjustment && <CostAccountingAdjustmentCriteriaWindow windowState={wm.costAccountingAdjustmentWindow} onClose={() => wm.setShowCostAccountingAdjustment(false)} onUpdateState={upd(wm.setCostAccountingAdjustmentWindow)} onFocus={() => ow('costAccountingAdjustment')} />}
      {wm.showCostElements && <CostElementsWindow windowState={wm.costElementsWindow} onClose={() => wm.setShowCostElements(false)} onUpdateState={upd(wm.setCostElementsWindow)} onFocus={() => ow('costElements')} />}
      {wm.showDunningHistoryReport && <DunningHistoryReportCriteriaWindow windowState={wm.dunningHistoryReportPos} onClose={() => wm.setShowDunningHistoryReport(false)} onUpdateState={upd(wm.setDunningHistoryReportPos)} onFocus={() => ow('dunningHistoryReport')} />}
      {wm.showCreditLimitDeviation && <CustomersCreditLimitDeviationWindow windowState={wm.creditLimitDeviationPos} onClose={() => wm.setShowCreditLimitDeviation(false)} onUpdateState={upd(wm.setCreditLimitDeviationPos)} onFocus={() => ow('customersCreditLimitDeviation')} />}
      {wm.showReconByDueDate && <ReconByDueDateCriteria windowState={wm.reconByDueDatePos} onClose={() => wm.setShowReconByDueDate(false)} onUpdateState={upd(wm.setReconByDueDatePos)} onFocus={() => ow('reconByDueDate')} />}
      {wm.showReconByExactAmount && <ReconLocateByExactAmountCriteria windowState={wm.reconByExactAmountPos} onClose={() => wm.setShowReconByExactAmount(false)} onUpdateState={upd(wm.setReconByExactAmountPos)} onFocus={() => ow('reconByExactAmount')} />}
      {wm.showReconByTransNumber && <ReconByTransNumberCriteria windowState={wm.reconByTransNumberPos} onClose={() => wm.setShowReconByTransNumber(false)} onUpdateState={upd(wm.setReconByTransNumberPos)} onFocus={() => ow('reconByTransNumber')} />}
      {wm.showReconLocateByRowNumber && <ReconLocateByRowNumberCriteria windowState={wm.reconLocateByRowNumberPos} onClose={() => wm.setShowReconLocateByRowNumber(false)} onUpdateState={upd(wm.setReconLocateByRowNumberPos)} onFocus={() => ow('reconLocateByRowNumber')} />}
      {wm.showReconByExactSum && <ReconByExactSumCriteria windowState={wm.reconByExactSumPos} onClose={() => wm.setShowReconByExactSum(false)} onUpdateState={upd(wm.setReconByExactSumPos)} onFocus={() => ow('reconByExactSum')} />}
      {wm.showReconBySumFC && <ReconBySumFCCriteria windowState={wm.reconBySumFCPos} onClose={() => wm.setShowReconBySumFC(false)} onUpdateState={upd(wm.setReconBySumFCPos)} onFocus={() => ow('reconBySumFC')} />}


      {/* ── Banking ── */}
      {wm.showIncomingPayments && <IncomingPaymentsWindow windowState={wm.incomingPaymentsPos} onClose={() => wm.setShowIncomingPayments(false)} onUpdateState={upd(wm.setIncomingPaymentsPos)} onFocus={() => ow('incomingPayments')} />}
      {wm.showCheckRegister && <CheckRegisterCriteria windowState={wm.checkRegisterPos} onClose={() => wm.setShowCheckRegister(false)} onUpdateState={upd(wm.setCheckRegisterPos)} onFocus={() => ow('checkRegister')} />}
      {wm.showCreditCardManagement && <CreditCardManagementCriteria windowState={wm.creditCardManagementPos} onClose={() => wm.setShowCreditCardManagement(false)} onUpdateState={upd(wm.setCreditCardManagementPos)} onFocus={() => ow('creditCardManagement')} />}
      {wm.showCreditCardSummary && <CreditCardSummaryCriteria windowState={wm.creditCardSummaryPos} onClose={() => wm.setShowCreditCardSummary(false)} onUpdateState={upd(wm.setCreditCardSummaryPos)} onFocus={() => ow('creditCardSummary')} />}
      {wm.showOutgoingPayments && <OutgoingPaymentsWindow windowState={wm.outgoingPaymentsPos} onClose={() => wm.setShowOutgoingPayments(false)} onUpdateState={upd(wm.setOutgoingPaymentsPos)} onFocus={() => ow('outgoingPayments')} />}
      {wm.showChecksForPayment && <ChecksForPaymentWindow windowState={wm.checksForPaymentPos} onClose={() => wm.setShowChecksForPayment(false)} onUpdateState={upd(wm.setChecksForPaymentPos)} onFocus={() => ow('checksForPayment')} />}
      {wm.showVoidChecksForPayment && <VoidChecksForPaymentCriteria windowState={wm.voidChecksForPaymentPos} onClose={() => wm.setShowVoidChecksForPayment(false)} onUpdateState={upd(wm.setVoidChecksForPaymentPos)} onFocus={() => ow('voidChecksForPayment')} />}
      {wm.showChecksForPaymentDraftsReport && <ChecksForPaymentDraftsReportWindow windowState={wm.checksForPaymentDraftsReportPos} onClose={() => wm.setShowChecksForPaymentDraftsReport(false)} onUpdateState={upd(wm.setChecksForPaymentDraftsReportPos)} onFocus={() => ow('checksForPaymentDraftsReport')} />}
      {wm.showPaymentDraftsReport && <PaymentDraftsReportWindow windowState={wm.paymentDraftsReportPos} onClose={() => wm.setShowPaymentDraftsReport(false)} onUpdateState={upd(wm.setPaymentDraftsReportPos)} onFocus={() => ow('paymentDraftsReport')} />}
      {wm.showChecksForPaymentDateCrossSection && <DataNotProvidedWindow title="Checks for Payment in Date Cross Section Report" windowState={wm.checksForPaymentDateCrossSectionPos} onClose={() => wm.setShowChecksForPaymentDateCrossSection(false)} onUpdateState={upd(wm.setChecksForPaymentDateCrossSectionPos)} onFocus={() => ow('checksForPaymentDateCrossSection')} />}
      {wm.showBPBankAccountsQuery && <DataNotProvidedWindow title="BP Bank Accounts Query" windowState={wm.bpBankAccountsQueryPos} onClose={() => wm.setShowBPBankAccountsQuery(false)} onUpdateState={upd(wm.setBPBankAccountsQueryPos)} onFocus={() => ow('bpBankAccountsQuery')} />}
      {wm.showHouseBankAccountsQuery && <HouseBankAccountsQueryWindow windowState={wm.houseBankAccountsQueryPos} onClose={() => wm.setShowHouseBankAccountsQuery(false)} onUpdateState={upd(wm.setHouseBankAccountsQueryPos)} onFocus={() => ow('houseBankAccountsQuery')} />}
      {wm.showExternalReconciliation && <DataNotProvidedWindow title="External Reconciliation" windowState={wm.externalReconciliationPos} onClose={() => wm.setShowExternalReconciliation(false)} onUpdateState={upd(wm.setExternalReconciliationPos)} onFocus={() => ow('externalReconciliation')} />}

      {/* Selection Modals */}
      {wm.showSelectionUsers && <SelectionUsersWindow windowState={wm.selectionUsersPos} onClose={() => wm.setShowSelectionUsers(false)} onUpdateState={upd(wm.setSelectionUsersPos)} onFocus={() => ow('selectionUsers')} />}
      {wm.showSelectionEmployees && <SelectionEmployeesWindow windowState={wm.selectionEmployeesPos} onClose={() => wm.setShowSelectionEmployees(false)} onUpdateState={upd(wm.setSelectionEmployeesPos)} onFocus={() => ow('selectionEmployees')} />}
      {wm.showSelectionRecipientLists && <SelectionRecipientListsWindow windowState={wm.selectionRecipientListsPos} onClose={() => wm.setShowSelectionRecipientLists(false)} onUpdateState={upd(wm.setSelectionRecipientListsPos)} onFocus={() => ow('selectionRecipientLists')} />}
      {wm.showSelectionProperties && <SelectionPropertiesWindow windowState={wm.selectionPropertiesPos} onClose={() => wm.setShowSelectionProperties(false)} onUpdateState={upd(wm.setSelectionPropertiesPos)} onFocus={() => ow('selectionProperties')} />}
      {wm.showSelectionUdf && <SelectionUdfWindow windowState={wm.selectionUdfPos} onClose={() => wm.setShowSelectionUdf(false)} onUpdateState={upd(wm.setSelectionUdfPos)} onFocus={() => ow('selectionUdf')} />}
      {wm.showSelectionBusinessPartners && <SelectionBusinessPartnersWindow windowState={wm.selectionBusinessPartnersPos} onClose={() => wm.setShowSelectionBusinessPartners(false)} onUpdateState={upd(wm.setSelectionBusinessPartnersPos)} onFocus={() => ow('selectionBusinessPartners')} />}
    </>
  );
};
