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
import { SalesOrderWindow } from '../../sales-ar/SalesOrder/SalesOrderWindow';
import { DeliveryWindow } from '../../sales-ar/Delivery/DeliveryWindow';
import { ReturnWindow } from '../../sales-ar/Return/ReturnWindow';
import { ARDownPaymentRequestWindow } from '../../sales-ar/ARDownPaymentRequest/ARDownPaymentRequestWindow';
import { ARDownPaymentInvoiceWindow } from '../../sales-ar/ARDownPaymentInvoice/ARDownPaymentInvoiceWindow';
import { ARInvoiceWindow } from '../../sales-ar/ARInvoice/ARInvoiceWindow';
import { ARInvoicePaymentWindow } from '../../sales-ar/ARInvoicePayment/ARInvoicePaymentWindow';
import { ARCreditMemoWindow } from '../../sales-ar/ARCreditMemo/ARCreditMemoWindow';
import { ARReserveInvoiceWindow } from '../../sales-ar/ARReserveInvoice/ARReserveInvoiceWindow';
import { DocumentDraftsReport } from '../../sales-ar/Reports/DocumentDraftsReport';
import { SalesAnalysisReport } from '../../sales-ar/Reports/SalesAnalysisReport';
import { BackorderReport } from '../../sales-ar/Reports/BackorderReport';
import { BlanketAgreementFulfillmentReport } from '../../sales-ar/Reports/BlanketAgreementFulfillmentReport';
import { Customer360Window } from '../../crm/Customer360/Customer360Window';
import { ActivitiesOverviewCriteria } from '../../crm/Reports/ActivitiesOverviewCriteria';
import { CampaignsListCriteria } from '../../crm/Reports/CampaignsListCriteria';
import { InactiveCustomersCriteria } from '../../crm/Reports/InactiveCustomersCriteria';
import { OppStatisticsCriteria } from '../../crm/Reports/OppStatisticsCriteria';
import { WonOpportunitiesCriteria } from '../../crm/Reports/WonOpportunitiesCriteria';
import { IncomingPaymentsWindow } from '../../banking/IncomingPayments/IncomingPaymentsWindow';
import { CheckRegisterCriteria } from '../../banking/criteria/CheckRegisterCriteria';
import { CreditCardManagementCriteria } from '../../banking/criteria/CreditCardManagementCriteria';
import { CreditCardSummaryCriteria } from '../../banking/criteria/CreditCardSummaryCriteria';
import { OutgoingPaymentsWindow } from '../../banking/OutgoingPayments/OutgoingPaymentsWindow';
import { ChecksForPaymentCriteria } from '../../banking/criteria/ChecksForPaymentCriteria';
import { VoidChecksForPaymentCriteria } from '../../banking/criteria/VoidChecksForPaymentCriteria';
import { ChecksForPaymentDraftsReportCriteria } from '../../banking/criteria/ChecksForPaymentDraftsReportCriteria';
import { ChecksForPaymentWindow } from '../../banking/IncomingPayments/ChecksForPaymentWindow';
import { ChecksForPaymentDraftsReportWindow } from '../../banking/IncomingPayments/ChecksForPaymentDraftsReportWindow';
import { PaymentDraftsReportWindow } from '../../banking/OutgoingPayments/PaymentDraftsReportWindow';
import { HouseBankAccountsQueryWindow } from '../../banking/BankAccounts/HouseBankAccountsQueryWindow';

// Purchasing
import { PurchaseRequestWindow } from '../../purchasing/Orders/PurchaseRequestWindow';
import { PurchaseQuotationWindow } from '../../purchasing/Orders/PurchaseQuotationWindow';
import { PurchaseOrderWindow } from '../../purchasing/Orders/PurchaseOrderWindow';
import { GoodsReceiptPOWindow } from '../../purchasing/GoodsMovement/GoodsReceiptPOWindow';
import { GoodsReturnRequestWindow } from '../../purchasing/GoodsMovement/GoodsReturnRequestWindow';
import { GoodsReturnWindow } from '../../purchasing/GoodsMovement/GoodsReturnWindow';
import { APDownPaymentRequestWindow } from '../../purchasing/APDocuments/APDownPaymentRequestWindow';
import { APDownPaymentInvoiceWindow } from '../../purchasing/APDocuments/APDownPaymentInvoiceWindow';
import { APInvoiceWindow } from '../../purchasing/APDocuments/APInvoiceWindow';
import { APCreditMemoWindow } from '../../purchasing/APDocuments/APCreditMemoWindow';
import { APReserveInvoiceWindow } from '../../purchasing/APDocuments/APReserveInvoiceWindow';
import { ConfirmationRecurringTransactionsWindow } from '../../purchasing/Templates/ConfirmationRecurringTransactionsWindow';
import { RecurringTransactionTemplatesWindow } from '../../purchasing/Templates/RecurringTransactionTemplatesWindow';
import { LandedCostsWindow } from '../../purchasing/GoodsMovement/LandedCostsWindow';
import { ShippingTypesSetupWindow } from '../../purchasing/Templates/ShippingTypesSetupWindow';
import { DocumentPrintingWindow } from '../../purchasing/Templates/DocumentPrintingWindow';
import { OpenItemsListWindow } from '../../purchasing/Reports/OpenItemsListWindow';
import { PurchaseAnalysisWindow } from '../../purchasing/Reports/PurchaseAnalysisWindow';
import { PurchaseRequestReportWindow } from '../../purchasing/Reports/PurchaseRequestReportWindow';
import { PurchaseQuotationComparisonReportWindow } from '../../purchasing/Reports/PurchaseQuotationComparisonReportWindow';
// Administration — SystemInitialization
import { ChooseCompanyWindow } from '../../administration/SystemInitialization/ChooseCompanyWindow';
import { ExchangeRatesIndexesWindow } from '../../administration/SystemInitialization/ExchangeRatesIndexesWindow';
import { CompanyDetailsWindow } from '../../administration/SystemInitialization/CompanyDetailsWindow';
import { GeneralSettingsWindow } from '../../administration/SystemInitialization/GeneralSettingsWindow';
import { PostingPeriodsWindow } from '../../administration/SystemInitialization/PostingPeriodsWindow';
import { DocumentNumberingWindow } from '../../administration/SystemInitialization/DocumentNumberingWindow';
import { DocumentSettingsWindow } from '../../administration/SystemInitialization/DocumentSettingsWindow';
// Administration — InterfaceSetup
import { PrintPreferencesWindow } from '../../administration/InterfaceSetup/PrintPreferencesWindow';
import { TooltipPreviewWindow } from '../../administration/InterfaceSetup/TooltipPreviewWindow';
// Administration — UserManagement
import { UsersSetupWindow } from '../../administration/UserManagement/UsersSetupWindow';
import { UserGroupsWindow } from '../../administration/UserManagement/UserGroupsWindow';
import { UserDefaultsWindow } from '../../administration/UserManagement/UserDefaultsWindow';
import { SalesEmployeesSetupWindow } from '../../administration/UserManagement/SalesEmployeesSetupWindow';
import { TerritoriesSetupWindow } from '../../administration/UserManagement/TerritoriesSetupWindow';
import { CommissionGroupsWindow } from '../../administration/UserManagement/CommissionGroupsWindow';
// Administration — InterfaceSetup (continued)
import { PredefinedTextWindow } from '../../administration/InterfaceSetup/PredefinedTextWindow';
import { ReferenceFieldLinksWindow } from '../../administration/InterfaceSetup/ReferenceFieldLinksWindow';
import { FreightSetupWindow } from '../../administration/InterfaceSetup/FreightSetupWindow';
import { MessagePreferencesWindow } from '../../administration/InterfaceSetup/MessagePreferencesWindow';
import { ReportLayoutManagerWindow } from '../../administration/InterfaceSetup/ReportLayoutManagerWindow';
import { CrystalReportElementsWindow } from '../../administration/InterfaceSetup/CrystalReportElementsWindow';
import { ServerPrintConfigWindow } from '../../administration/InterfaceSetup/ServerPrintConfigWindow';
import { DashboardManagerWindow } from '../../administration/InterfaceSetup/DashboardManagerWindow';
import { DashboardParametersWindow } from '../../administration/InterfaceSetup/DashboardParametersWindow';
// Administration — Security
import { PasswordAdministrationWindow } from '../../administration/Security/PasswordAdministrationWindow';
import { ChangePasswordWindow } from '../../administration/Security/ChangePasswordWindow';
import { SiteUserWindow } from '../../administration/Security/SiteUserWindow';
// Administration — ElectronicDocs
import { ElectronicFileManagerSetupWindow } from '../../administration/ElectronicDocs/ElectronicFileManagerSetupWindow';
import { ElectronicCertificatesWindow } from '../../administration/ElectronicDocs/ElectronicCertificatesWindow';
import { CrystalServerConfigWindow } from '../../administration/InterfaceSetup/CrystalServerConfigWindow';
import { ProcessChecklistTemplateWindow } from '../../administration/ElectronicDocs/ProcessChecklistTemplateWindow';
import { SAPLinksWindow } from '../../administration/InterfaceSetup/SAPLinksWindow';
// Financials — GeneralLedger
import { ChartOfAccountsWindow } from '../../financials/GeneralLedger/ChartOfAccountsWindow';
import { EditChartOfAccountsWindow } from '../../financials/GeneralLedger/EditChartOfAccountsWindow';
import { DataNotProvidedWindow } from '../../financials/GeneralLedger/DataNotProvidedWindow';
import { JournalEntryWindow } from '../../financials/GeneralLedger/JournalEntryWindow';
import { PostingTemplatesWindow } from '../../financials/GeneralLedger/PostingTemplatesWindow';
import { RecurringPostingsWindow } from '../../financials/GeneralLedger/RecurringPostingsWindow';
// Financials — Documents
import { DocumentPrintingSelectionWindow } from '../../financials/Documents/DocumentPrintingSelectionWindow';
// Financials — FixedAssets
import { AssetMasterDataWindow } from '../../financials/FixedAssets/AssetMasterDataWindow';
import { CapitalizationWindow } from '../../financials/FixedAssets/CapitalizationWindow';
import { CapitalizationCreditMemoWindow } from '../../financials/FixedAssets/CapitalizationCreditMemoWindow';
import { RetirementWindow } from '../../financials/FixedAssets/RetirementWindow';
import { TransferWindow } from '../../financials/FixedAssets/TransferWindow';
import { ManualDepreciationWindow } from '../../financials/FixedAssets/ManualDepreciationWindow';
import { DepreciationRunWindow } from '../../financials/FixedAssets/DepreciationRunWindow';
import { AssetRevaluationWindow } from '../../financials/FixedAssets/AssetRevaluationWindow';
import { FiscalYearChangeWindow } from '../../financials/FixedAssets/FiscalYearChangeWindow';
import { AssetDepreciationForecastWindow } from '../../financials/FixedAssets/AssetDepreciationForecastWindow';
import { AssetHistorySheetWindow } from '../../financials/FixedAssets/AssetHistorySheetWindow';
import { AssetStatusReportWindow } from '../../financials/FixedAssets/AssetStatusReportWindow';
import { AssetTransactionReportWindow } from '../../financials/FixedAssets/AssetTransactionReportWindow';
// Financials — Reconciliation
import { ManagePreviousReconciliationsWindow } from '../../financials/Reconciliation/ManagePreviousReconciliationsWindow';
import { ReconciliationWindow } from '../../financials/Reconciliation/ReconciliationWindow';
// Financials — Budget
import { BudgetScenariosWindow } from '../../financials/Budget/BudgetScenariosWindow';
import { BudgetDistributionMethodsWindow } from '../../financials/Budget/BudgetDistributionMethodsWindow';
import { BudgetScenarioDefinitionWindow } from '../../financials/Budget/BudgetScenarioDefinitionWindow';
import { PMSSurchargeRateWindow } from '../../financials/Budget/PMSSurchargeRateWindow';
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
} from '../../financials/Documents/ElectronicReportsCriteriaWindows';
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
  SelectionBusinessPartnersWindow,
  SelectionAccountsWindow,
  SelectionItemsWindow,
  SelectionUsersListWindow
} from '../../common/SelectionWindows';
// Administration — Utilities
import { PeriodEndClosingWindow } from '../../administration/Utilities/PeriodEndClosingWindow';
import { CheckDocumentNumberingWindow } from '../../administration/Utilities/CheckDocumentNumberingWindow';
import { DuplicateLayoutTemplateWindow } from '../../administration/Utilities/DuplicateLayoutTemplateWindow';
import { MasterDataCleanupWizard } from '../../administration/Utilities/MasterDataCleanupWizard';
import { ManualMasterDataSeriesConverter } from '../../administration/Utilities/ManualMasterDataSeriesConverter';
// Administration — InterfaceSetup
import { UiConfigurationTemplateWindow } from '../../administration/InterfaceSetup/UiConfigurationTemplateWindow';
// Administration — Utilities (continued)
import { ConnectedClientsWindow } from '../../administration/Utilities/ConnectedClientsWindow';
import { ChangeLogsCleanupWindow } from '../../administration/Utilities/ChangeLogsCleanupWindow';
// Administration — Approvals
import { ApprovalStagesWindow } from '../../administration/Approvals/ApprovalStagesWindow';
import { ApprovalTemplatesWindow } from '../../administration/Approvals/ApprovalTemplatesWindow';
import { ApprovalStatusReportWindow } from '../../administration/Approvals/ApprovalStatusReportWindow';
import { ApprovalDecisionReportWindow } from '../../administration/Approvals/ApprovalDecisionReportWindow';
import { SubstituteAuthorizerWindow } from '../../administration/Approvals/SubstituteAuthorizerWindow';
// Administration — License
import { LicenseAdministrationWindow } from '../../administration/License/LicenseAdministrationWindow';
import { AddOnIdentifierGeneratorWindow } from '../../administration/License/AddOnIdentifierGeneratorWindow';
import { SupportUserLogWindow } from '../../administration/License/SupportUserLogWindow';
import { LicenseInformationWindow } from '../../administration/License/LicenseInformationWindow';
import { AlertsManagementWindow } from '../../administration/Utilities/AlertsManagementWindow';

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
      {wm.showDelivery              && <DeliveryWindow                  windowState={wm.deliveryPos}     onClose={() => wm.setShowDelivery(false)}              onUpdateState={upd(wm.setDeliveryPos)}     onFocus={() => ow('delivery')} />}
      {wm.showSalesReturn           && <ReturnWindow                    windowState={wm.salesReturnWindow} onClose={() => wm.setShowSalesReturn(false)}          onUpdateState={upd(wm.setSalesReturnWindow)} onFocus={() => ow('salesReturn')} />}
      {wm.showARDownPaymentRequest  && <ARDownPaymentRequestWindow     windowState={wm.arDownPaymentRequestWindow} onClose={() => wm.setShowARDownPaymentRequest(false)} onUpdateState={upd(wm.setARDownPaymentRequestWindow)} onFocus={() => ow('arDownPaymentRequest')} />}
      {wm.showARDownPaymentInvoice  && <ARDownPaymentInvoiceWindow     windowState={wm.arDownPaymentInvoiceWindow} onClose={() => wm.setShowARDownPaymentInvoice(false)} onUpdateState={upd(wm.setARDownPaymentInvoiceWindow)} onFocus={() => ow('arDownPaymentInvoice')} />}
      {wm.showARInvoice             && <ARInvoiceWindow                windowState={wm.arInvoiceWindow} onClose={() => wm.setShowARInvoice(false)}               onUpdateState={upd(wm.setARInvoiceWindow)}    onFocus={() => ow('arInvoice')} />}
      {wm.showARInvoicePayment      && <ARInvoicePaymentWindow         windowState={wm.arInvoicePaymentWindow} onClose={() => wm.setShowARInvoicePayment(false)} onUpdateState={upd(wm.setARInvoicePaymentWindow)} onFocus={() => ow('arInvoicePayment')} />}
      {wm.showARCreditMemo         && <ARCreditMemoWindow           windowState={wm.arCreditMemoWindow}    onClose={() => wm.setShowARCreditMemo(false)}          onUpdateState={upd(wm.setARCreditMemoWindow)}    onFocus={() => ow('arCreditMemo')} />}
      {wm.showARReserveInvoice      && <ARReserveInvoiceWindow        windowState={wm.arReserveInvoiceWindow} onClose={() => wm.setShowARReserveInvoice(false)} onUpdateState={upd(wm.setARReserveInvoiceWindow)} onFocus={() => ow('arReserveInvoice')} />}
      {wm.showDocumentDraftsReport && <DocumentDraftsReport           windowState={wm.documentDraftsReportWindow} onClose={() => wm.setShowDocumentDraftsReport(false)} onUpdateState={upd(wm.setDocumentDraftsReportWindow)} onFocus={() => ow('documentDraftsReport')} />}
      {wm.showSalesAnalysisReport  && <SalesAnalysisReport           windowState={wm.salesAnalysisReportWindow}  onClose={() => wm.setShowSalesAnalysisReport(false)}  onUpdateState={upd(wm.setSalesAnalysisReportWindow)}  onFocus={() => ow('salesAnalysisReport')} />}
      {wm.showBackorderReport      && <BackorderReport               windowState={wm.backorderReportWindow}      onClose={() => wm.setShowBackorderReport(false)}      onUpdateState={upd(wm.setBackorderReportWindow)}      onFocus={() => ow('backorderReport')} />}
      {wm.showBlanketAgreementFulfillmentReport && <BlanketAgreementFulfillmentReport windowState={wm.blanketAgreementFulfillmentReportWindow} onClose={() => wm.setShowBlanketAgreementFulfillmentReport(false)} onUpdateState={upd(wm.setBlanketAgreementFulfillmentReportWindow)} onFocus={() => ow('blanketAgreementFulfillmentReport')} />}
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
      {wm.showPeriodEndClosing && <PeriodEndClosingWindow windowState={wm.periodEndClosingPos} onClose={() => wm.setShowPeriodEndClosing(false)} onUpdateState={upd(wm.setPeriodEndClosingPos)} onFocus={() => ow('periodEndClosing')} onOpenSelectionAccounts={() => ow('selectionAccounts')} />}
      {wm.showCheckDocumentNumbering && <CheckDocumentNumberingWindow windowState={wm.checkDocumentNumberingPos} onClose={() => wm.setShowCheckDocumentNumbering(false)} onUpdateState={upd(wm.setCheckDocumentNumberingPos)} onFocus={() => ow('checkDocumentNumbering')} />}
      {wm.showDuplicateLayoutTemplate && <DuplicateLayoutTemplateWindow windowState={wm.duplicateLayoutTemplatePos} onClose={() => wm.setShowDuplicateLayoutTemplate(false)} onUpdateState={upd(wm.setDuplicateLayoutTemplatePos)} onFocus={() => ow('duplicateLayoutTemplate')} />}
      {wm.showMasterDataCleanupWizard && <MasterDataCleanupWizard windowState={wm.masterDataCleanupWizardPos} onClose={() => wm.setShowMasterDataCleanupWizard(false)} onUpdateState={upd(wm.setMasterDataCleanupWizardPos)} onFocus={() => ow('masterDataCleanupWizard')} />}
      {wm.showManualMasterDataSeriesConverter && <ManualMasterDataSeriesConverter windowState={wm.manualMasterDataSeriesConverterPos} onClose={() => wm.setShowManualMasterDataSeriesConverter(false)} onUpdateState={upd(wm.setManualMasterDataSeriesConverterPos)} onFocus={() => ow('manualMasterDataSeriesConverter')} onOpenSelectionItems={() => ow('selectionItems')} />}
      {wm.showUiConfigurationTemplate && <UiConfigurationTemplateWindow windowState={wm.uiConfigurationTemplatePos} onClose={() => wm.setShowUiConfigurationTemplate(false)} onUpdateState={upd(wm.setUiConfigurationTemplatePos)} onFocus={() => ow('uiConfigurationTemplate')} />}
      {wm.showConnectedClients && <ConnectedClientsWindow windowState={wm.connectedClientsPos} onClose={() => wm.setShowConnectedClients(false)} onUpdateState={upd(wm.setConnectedClientsPos)} onFocus={() => ow('connectedClients')} />}
      {wm.showChangeLogsCleanup && <ChangeLogsCleanupWindow windowState={wm.changeLogsCleanupPos} onClose={() => wm.setShowChangeLogsCleanup(false)} onUpdateState={upd(wm.setChangeLogsCleanupPos)} onFocus={() => ow('changeLogsCleanup')} />}
      {wm.showApprovalStages && <ApprovalStagesWindow windowState={wm.approvalStagesPos} onClose={() => wm.setShowApprovalStages(false)} onUpdateState={upd(wm.setApprovalStagesPos)} onFocus={() => ow('approvalStages')} />}
      {wm.showApprovalTemplates && <ApprovalTemplatesWindow windowState={wm.approvalTemplatesPos} onClose={() => wm.setShowApprovalTemplates(false)} onUpdateState={upd(wm.setApprovalTemplatesPos)} onFocus={() => ow('approvalTemplates')} />}
      {wm.showApprovalStatusReport && <ApprovalStatusReportWindow windowState={wm.approvalStatusReportPos} onClose={() => wm.setShowApprovalStatusReport(false)} onUpdateState={upd(wm.setApprovalStatusReportPos)} onFocus={() => ow('approvalStatusReport')} onOpenSelectionUsers={() => ow('selectionUsersList')} />}
      {wm.showApprovalDecisionReport && <ApprovalDecisionReportWindow windowState={wm.approvalDecisionReportPos} onClose={() => wm.setShowApprovalDecisionReport(false)} onUpdateState={upd(wm.setApprovalDecisionReportPos)} onFocus={() => ow('approvalDecisionReport')} onOpenSelectionUsers={() => ow('selectionUsersList')} />}
      {wm.showSubstituteAuthorizer && <SubstituteAuthorizerWindow windowState={wm.substituteAuthorizerPos} onClose={() => wm.setShowSubstituteAuthorizer(false)} onUpdateState={upd(wm.setSubstituteAuthorizerPos)} onFocus={() => ow('substituteAuthorizer')} />}
      {wm.showLicenseAdministration && <LicenseAdministrationWindow windowState={wm.licenseAdministrationPos} onClose={() => wm.setShowLicenseAdministration(false)} onUpdateState={upd(wm.setLicenseAdministrationPos)} onFocus={() => ow('licenseAdministration')} />}
      {wm.showAddOnIdentifierGenerator && <AddOnIdentifierGeneratorWindow windowState={wm.addOnIdentifierGeneratorPos} onClose={() => wm.setShowAddOnIdentifierGenerator(false)} onUpdateState={upd(wm.setAddOnIdentifierGeneratorPos)} onFocus={() => ow('addOnIdentifierGenerator')} />}
      {wm.showSupportUserLog && <SupportUserLogWindow windowState={wm.supportUserLogPos} onClose={() => wm.setShowSupportUserLog(false)} onUpdateState={upd(wm.setSupportUserLogPos)} onFocus={() => ow('supportUserLog')} />}
      {wm.showLicenseInformation && <LicenseInformationWindow windowState={wm.licenseInformationPos} onClose={() => wm.setShowLicenseInformation(false)} onUpdateState={upd(wm.setLicenseInformationPos)} onFocus={() => ow('licenseInformation')} />}
      {wm.showAlertsManagement && <AlertsManagementWindow windowState={wm.alertsManagementPos} onClose={() => wm.setShowAlertsManagement(false)} onUpdateState={upd(wm.setAlertsManagementPos)} onFocus={() => ow('alertsManagement')} />}
      {wm.showSelectionAccounts && <SelectionAccountsWindow windowState={wm.selectionAccountsPos} onClose={() => wm.setShowSelectionAccounts(false)} onUpdateState={upd(wm.setSelectionAccountsPos)} onFocus={() => ow('selectionAccounts')} />}
      {wm.showSelectionItems && <SelectionItemsWindow windowState={wm.selectionItemsPos} onClose={() => wm.setShowSelectionItems(false)} onUpdateState={upd(wm.setSelectionItemsPos)} onFocus={() => ow('selectionItems')} />}
      {wm.showSelectionUsersList && <SelectionUsersListWindow windowState={wm.selectionUsersListPos} onClose={() => wm.setShowSelectionUsersList(false)} onUpdateState={upd(wm.setSelectionUsersListPos)} onFocus={() => ow('selectionUsersList')} />}
    </>
  );
};
