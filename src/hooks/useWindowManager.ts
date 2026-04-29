import { useState } from 'react';
import { WindowState, WindowType } from '../types/window';

// ─── Default window factory ───────────────────────────────────────────────────
const win = (x: number, y: number, w: number, h: number, z: number): WindowState => ({
  x, y, width: w, height: h, isMinimized: false, isMaximized: false, zIndex: z,
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWindowManager() {
  const [zIndex, setZIndex] = useState(10);
  const [activeReportTitle, setActiveReportTitle] = useState('');

  // ── Visibility flags ──────────────────────────────────────────────────────
  const [showEmployeeMaster,              setShowEmployeeMaster]              = useState(false);
  const [showTimeSheet,                   setShowTimeSheet]                   = useState(false);
  const [showFamilyDetail,                setShowFamilyDetail]                = useState(false);
  const [showNextOfKin,                   setShowNextOfKin]                   = useState(false);
  const [showFinalSettlement,             setShowFinalSettlement]             = useState(false);
  const [showTADA,                        setShowTADA]                        = useState(false);
  const [showBusinessPartnerMaster,       setShowBusinessPartnerMaster]       = useState(false);
  const [showActivity,                    setShowActivity]                    = useState(false);
  const [showOpportunity,                 setShowOpportunity]                 = useState(false);
  const [showSalesOrder,                  setShowSalesOrder]                  = useState(false);
  const [showCustomer360,                 setShowCustomer360]                 = useState(false);
  const [showActivitiesOverview,          setShowActivitiesOverview]          = useState(false);
  const [showCampaignsList,               setShowCampaignsList]               = useState(false);
  const [showInactiveCustomers,           setShowInactiveCustomers]           = useState(false);
  const [showOppStatistics,               setShowOppStatistics]               = useState(false);
  const [showWonOppReport,                setShowWonOppReport]                = useState(false);
  const [showPurchaseRequest,             setShowPurchaseRequest]             = useState(false);
  const [showPurchaseQuotation,           setShowPurchaseQuotation]           = useState(false);
  const [showPurchaseOrder,               setShowPurchaseOrder]               = useState(false);
  const [showGoodsReceiptPO,              setShowGoodsReceiptPO]              = useState(false);
  const [showGoodsReturnRequest,          setShowGoodsReturnRequest]          = useState(false);
  const [showGoodsReturn,                 setShowGoodsReturn]                 = useState(false);
  const [showAPDownPaymentRequest,        setShowAPDownPaymentRequest]        = useState(false);
  const [showAPDownPaymentInvoice,        setShowAPDownPaymentInvoice]        = useState(false);
  const [showAPInvoice,                   setShowAPInvoice]                   = useState(false);
  const [showAPCreditMemo,                setShowAPCreditMemo]                = useState(false);
  const [showAPReserveInvoice,            setShowAPReserveInvoice]            = useState(false);
  const [showRecurringTransactions,       setShowRecurringTransactions]       = useState(false);
  const [showRecurringTransactionTemplates, setShowRecurringTransactionTemplates] = useState(false);
  const [showLandedCosts,                 setShowLandedCosts]                 = useState(false);
  const [showShippingSetup,               setShowShippingSetup]               = useState(false);
  const [showDocumentPrinting,            setShowDocumentPrinting]            = useState(false);
  const [showOpenItemsList,               setShowOpenItemsList]               = useState(false);
  const [showPurchaseAnalysis,            setShowPurchaseAnalysis]            = useState(false);
  const [showPurchaseRequestReport,       setShowPurchaseRequestReport]       = useState(false);
  const [showPurchaseQuotationComparison, setShowPurchaseQuotationComparison] = useState(false);
  const [showEmployeeCurrentInfo,         setShowEmployeeCurrentInfo]         = useState(false);
  const [showPayPeriod,                   setShowPayPeriod]                   = useState(false);
  const [showGradeMaster,                 setShowGradeMaster]                 = useState(false);
  const [showLoanMaster,                  setShowLoanMaster]                  = useState(false);
  const [showLeaveMaster,                 setShowLeaveMaster]                 = useState(false);
  const [showEmployeeCategoryMaster,      setShowEmployeeCategoryMaster]      = useState(false);
  const [showShiftMaster,                 setShowShiftMaster]                 = useState(false);
  const [showTaxFormula,                  setShowTaxFormula]                  = useState(false);
  const [showGradePayScale,               setShowGradePayScale]               = useState(false);
  const [showMonthlyAttendance,           setShowMonthlyAttendance]           = useState(false);
  const [showPayrollProcess,              setShowPayrollProcess]              = useState(false);
  const [showLoanApplication,             setShowLoanApplication]             = useState(false);
  const [showLeaveApplication,            setShowLeaveApplication]            = useState(false);
  const [showPayrollAdjustments,          setShowPayrollAdjustments]          = useState(false);
  const [showChooseCompany,               setShowChooseCompany]               = useState(false);
  const [showExchangeRates,               setShowExchangeRates]               = useState(false);
  const [showCompanyDetails,              setShowCompanyDetails]              = useState(false);
  const [showGeneralSettings,             setShowGeneralSettings]             = useState(false);
  const [showPostingPeriods,              setShowPostingPeriods]              = useState(false);
  const [showDocumentNumbering,           setShowDocumentNumbering]           = useState(false);
  const [showDocumentSettings,            setShowDocumentSettings]            = useState(false);
  const [showChartOfAccounts,             setShowChartOfAccounts]             = useState(false);
  const [showEditChartOfAccounts,         setShowEditChartOfAccounts]         = useState(false);
  const [showDataNotProvided,             setShowDataNotProvided]             = useState(false);
  const [showJournalEntry,                setShowJournalEntry]                = useState(false);
  const [showPostingTemplates,            setShowPostingTemplates]            = useState(false);
  const [showRecurringPostings,           setShowRecurringPostings]           = useState(false);
  const [showDocumentPrintingSelection,   setShowDocumentPrintingSelection]   = useState(false);
  const [showAssetMasterData,             setShowAssetMasterData]             = useState(false);
  const [showCapitalization,              setShowCapitalization]              = useState(false);
  const [showCapitalizationCreditMemo,    setShowCapitalizationCreditMemo]    = useState(false);
  const [showRetirement,                  setShowRetirement]                  = useState(false);
  const [showTransfer,                    setShowTransfer]                    = useState(false);
  const [showManualDepreciation,          setShowManualDepreciation]          = useState(false);
  const [showDepreciationRun,             setShowDepreciationRun]             = useState(false);
  const [showAssetRevaluation,            setShowAssetRevaluation]            = useState(false);
  const [showFiscalYearChange,            setShowFiscalYearChange]            = useState(false);
  const [showAssetDepreciationForecast,   setShowAssetDepreciationForecast]   = useState(false);
  const [showAssetHistorySheet,           setShowAssetHistorySheet]           = useState(false);
  const [showAssetStatusReport,           setShowAssetStatusReport]           = useState(false);
  const [showAssetTransactionReport,      setShowAssetTransactionReport]      = useState(false);
  const [showReconciliation,              setShowReconciliation]              = useState(false);
  const [showManagePreviousReconciliations, setShowManagePreviousReconciliations] = useState(false);
  const [showBudgetScenarios,               setShowBudgetScenarios]               = useState(false);
  const [showBudgetDistributionMethods,     setShowBudgetDistributionMethods]     = useState(false);
  const [showBudget,                        setShowBudget]                        = useState(false);
  const [showPMSSurchargeRate,              setShowPMSSurchargeRate]              = useState(false);
  const [showElectronicReportRESector, setShowElectronicReportRESector] = useState(false);
  const [showElectronicReportRERealEstateType, setShowElectronicReportRERealEstateType] = useState(false);
  const [showElectronicReportCRCSchedule, setShowElectronicReportCRCSchedule] = useState(false);
  const [showElectronicReportCRCGeneral, setShowElectronicReportCRCGeneral] = useState(false);
  const [showElectronicReportChallan, setShowElectronicReportChallan] = useState(false);
  const [showElectronicReportMonthWise, setShowElectronicReportMonthWise] = useState(false);
  const [showElectronicReportYearWise, setShowElectronicReportYearWise] = useState(false);
  const [showElectronicReportDHAB, setShowElectronicReportDHAB] = useState(false);
  const [showElectronicReportFixAsset, setShowElectronicReportFixAsset] = useState(false);
  const [showElectronicReportSurcharge, setShowElectronicReportSurcharge] = useState(false);
  const [showElectronicReportSurcharge2, setShowElectronicReportSurcharge2] = useState(false);
  const [showGLAccountsAndBP, setShowGLAccountsAndBP] = useState(false);
  const [showGeneralLedger, setShowGeneralLedger] = useState(false);
  const [showCustomerReceivablesAging, setShowCustomerReceivablesAging] = useState(false);
  const [showVendorLiabilitiesAging, setShowVendorLiabilitiesAging] = useState(false);
  const [showAgingProperties, setShowAgingProperties] = useState(false);
  const [showBlanketAgreementsList, setShowBlanketAgreementsList] = useState(false);
  const [showTransactionJournalReport, setShowTransactionJournalReport] = useState(false);
  const [showTransactionReportByProjects, setShowTransactionReportByProjects] = useState(false);
  const [showDocumentJournal, setShowDocumentJournal] = useState(false);
  const [showTaxReport, setShowTaxReport] = useState(false);
  const [showWithholdingTaxReport, setShowWithholdingTaxReport] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [showTrialBalance, setShowTrialBalance] = useState(false);
  const [showProfitAndLossStatement, setShowProfitAndLossStatement] = useState(false);
  const [showCashFlow, setShowCashFlow] = useState(false);
  const [showStatementOfCashFlows, setShowStatementOfCashFlows] = useState(false);
  const [showCashFlowForecast, setShowCashFlowForecast] = useState(false);
  const [showBalanceSheetComparison, setShowBalanceSheetComparison] = useState(false);
  const [showTrialBalanceComparison, setShowTrialBalanceComparison] = useState(false);
  const [showProfitLossComparison, setShowProfitLossComparison] = useState(false);
  const [showBudgetReport, setShowBudgetReport] = useState(false);
  const [showBalanceSheetBudget, setShowBalanceSheetBudget] = useState(false);
  const [showTrialBalanceBudget, setShowTrialBalanceBudget] = useState(false);
  const [showProfitLossBudget, setShowProfitLossBudget] = useState(false);
  const [showBudgetReportCategorized, setShowBudgetReportCategorized] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showCostCenters, setShowCostCenters] = useState(false);
  const [showCostCenterTable, setShowCostCenterTable] = useState(false);
  const [showDistributionRules, setShowDistributionRules] = useState(false);
  const [showCostCenterHierarchy, setShowCostCenterHierarchy] = useState(false);
  const [showCostCenterReport, setShowCostCenterReport] = useState(false);
  const [showDistributionReport, setShowDistributionReport] = useState(false);
  const [showCostAccountingSummary, setShowCostAccountingSummary] = useState(false);
  const [showBudgetVersusCostAccounting, setShowBudgetVersusCostAccounting] = useState(false);
  const [showAccrualTypes, setShowAccrualTypes] = useState(false);
  const [showCostAccountingReconciliation, setShowCostAccountingReconciliation] = useState(false);
  const [showCostAccountingAdjustment, setShowCostAccountingAdjustment] = useState(false);
  const [showCostElements, setShowCostElements] = useState(false);
  const [showPrintPreferences, setShowPrintPreferences] = useState(false);
  const [showTooltipPreview, setShowTooltipPreview] = useState(false);
  const [showUsersSetup, setShowUsersSetup] = useState(false);
  const [showUserGroups, setShowUserGroups] = useState(false);
  const [showUserDefaults, setShowUserDefaults] = useState(false);
  const [showSalesEmployeesSetup, setShowSalesEmployeesSetup] = useState(false);
  const [showTerritoriesSetup, setShowTerritoriesSetup] = useState(false);
  const [showCommissionGroupsSetup, setShowCommissionGroupsSetup] = useState(false);
  const [showPredefinedTextSetup, setShowPredefinedTextSetup] = useState(false);
  const [showReferenceFieldLinksSetup, setShowReferenceFieldLinksSetup] = useState(false);
  const [showFreightSetup, setShowFreightSetup] = useState(false);
  const [showMessagePreferencesSetup, setShowMessagePreferencesSetup] = useState(false);
  const [showReportLayoutManager, setShowReportLayoutManager] = useState(false);
  const [showCrystalReportElementsSetup, setShowCrystalReportElementsSetup] = useState(false);
  const [showServerPrintConfig, setShowServerPrintConfig] = useState(false);
  const [showDashboardManager, setShowDashboardManager] = useState(false);
  const [showDashboardParametersSetup, setShowDashboardParametersSetup] = useState(false);
  const [showPasswordAdministration,    setShowPasswordAdministration]    = useState(false);
  const [showChangePassword,           setShowChangePassword]           = useState(false);
  const [showSiteUser,                 setShowSiteUser]                 = useState(false);
  const [showElectronicFileManagerSetup, setShowElectronicFileManagerSetup] = useState(false);
  const [showElectronicCertificatesSetup, setShowElectronicCertificatesSetup] = useState(false);
  const [showCrystalServerConfig,     setShowCrystalServerConfig]     = useState(false);
  const [showProcessChecklistTemplate, setShowProcessChecklistTemplate] = useState(false);
  const [showSapLinks,                setShowSapLinks]                = useState(false);
  const [showDunningHistoryReport,     setShowDunningHistoryReport]     = useState(false);
  const [showCreditLimitDeviation,     setShowCreditLimitDeviation]     = useState(false);
  const [showReconByDueDate,           setShowReconByDueDate]           = useState(false);
  const [showReconByExactAmount,       setShowReconByExactAmount]       = useState(false);
  const [showReconByTransNumber,       setShowReconByTransNumber]       = useState(false);
  const [showReconLocateByRowNumber, setShowReconLocateByRowNumber] = useState(false);
  const [showReconByExactSum,           setShowReconByExactSum]           = useState(false);
  const [showReconBySumFC,             setShowReconBySumFC]             = useState(false);
  const [showSelectionUsers,          setShowSelectionUsers]          = useState(false);
  const [showSelectionEmployees,      setShowSelectionEmployees]      = useState(false);
  const [showSelectionRecipientLists, setShowSelectionRecipientLists] = useState(false);
  const [showSelectionProperties,      setShowSelectionProperties]      = useState(false);
  const [showSelectionUdf,             setShowSelectionUdf]             = useState(false);
  const [showSelectionBusinessPartners, setShowSelectionBusinessPartners] = useState(false);

  // ── Banking visibility ────────────────────────────────────────────────────
  const [showIncomingPayments, setShowIncomingPayments] = useState(false);
  const [showCheckRegister, setShowCheckRegister] = useState(false);
  const [showCreditCardManagement, setShowCreditCardManagement] = useState(false);
  const [showCreditCardSummary, setShowCreditCardSummary] = useState(false);
  const [showOutgoingPayments, setShowOutgoingPayments] = useState(false);
  const [showChecksForPayment, setShowChecksForPayment] = useState(false);
  const [showVoidChecksForPayment, setShowVoidChecksForPayment] = useState(false);
  const [showChecksForPaymentDraftsReport, setShowChecksForPaymentDraftsReport] = useState(false);
  const [showPaymentDraftsReport, setShowPaymentDraftsReport] = useState(false);
  const [showChecksForPaymentDateCrossSection, setShowChecksForPaymentDateCrossSection] = useState(false);
  const [showBPBankAccountsQuery, setShowBPBankAccountsQuery] = useState(false);
  const [showHouseBankAccountsQuery, setShowHouseBankAccountsQuery] = useState(false);
  const [showExternalReconciliation, setShowExternalReconciliation] = useState(false);




  // ── Window positions / sizes ──────────────────────────────────────────────
  const [employeeWindow,                    setEmployeeWindow]                    = useState(win(100, 50,  900, 550, 10));
  const [timeSheetWindow,                   setTimeSheetWindow]                   = useState(win(150, 80, 1000, 650, 11));
  const [familyDetailWindow,                setFamilyDetailWindow]                = useState(win(200,120,  800, 500, 12));
  const [nextOfKinWindow,                   setNextOfKinWindow]                   = useState(win(250,150,  800, 500, 13));
  const [finalSettlementWindow,             setFinalSettlementWindow]             = useState(win(300,180,  800, 550, 14));
  const [tadaWindow,                        setTadaWindow]                        = useState(win(350,210,  900, 600, 15));
  const [bpMasterWindow,                    setBpMasterWindow]                    = useState(win( 50, 40, 1100, 700, 16));
  const [activityWindow,                    setActivityWindow]                    = useState(win( 80, 60, 1050, 680, 17));
  const [opportunityWindow,                 setOpportunityWindow]                 = useState(win( 40, 30, 1150, 720, 18));
  const [salesOrderWindow,                  setSalesOrderWindow]                  = useState(win(120, 90, 1100, 750, 19));
  const [customer360Window,                 setCustomer360Window]                 = useState(win( 60, 50, 1200, 800, 20));
  const [activitiesWindow,                  setActivitiesWindow]                  = useState(win(150,120,  500, 650, 21));
  const [campaignsWindow,                   setCampaignsWindow]                   = useState(win(200,140,  500, 750, 22));
  const [inactiveCustWindow,                setInactiveCustWindow]                = useState(win(250,160,  500, 300, 23));
  const [oppStatsWindow,                    setOppStatsWindow]                    = useState(win(300,180,  650, 500, 24));
  const [wonOppWindow,                      setWonOppWindow]                      = useState(win(350,200,  450, 400, 25));
  const [purchaseRequestWindow,             setPurchaseRequestWindow]             = useState(win(100, 80, 1100, 750, 26));
  const [purchaseQuotationWindow,           setPurchaseQuotationWindow]           = useState(win(130,100, 1150, 800, 27));
  const [purchaseOrderWindow,               setPurchaseOrderWindow]               = useState(win(160,120, 1200, 850, 28));
  const [goodsReceiptPOWindow,              setGoodsReceiptPOWindow]              = useState(win(190,140, 1200, 850, 29));
  const [goodsReturnRequestWindow,          setGoodsReturnRequestWindow]          = useState(win(220,160, 1200, 850, 30));
  const [goodsReturnWindow,                 setGoodsReturnWindow]                 = useState(win(250,180, 1200, 850, 31));
  const [apDownPaymentRequestWindow,        setAPDownPaymentRequestWindow]        = useState(win(280,200, 1200, 850, 32));
  const [apDownPaymentInvoiceWindow,        setAPDownPaymentInvoiceWindow]        = useState(win(310,220, 1200, 850, 33));
  const [apInvoiceWindow,                   setAPInvoiceWindow]                   = useState(win(340,240, 1200, 850, 34));
  const [apCreditMemoWindow,                setAPCreditMemoWindow]                = useState(win(370,260, 1200, 850, 35));
  const [apReserveInvoiceWindow,            setAPReserveInvoiceWindow]            = useState(win(400,280, 1200, 850, 36));
  const [recurringTransactionsWindow,       setRecurringTransactionsWindow]       = useState(win(430,300, 1100, 600, 37));
  const [recurringTransactionTemplatesWindow,setRecurringTransactionTemplatesWindow]=useState(win(460,320,  450, 380, 38));
  const [landedCostsWindow,                 setLandedCostsWindow]                 = useState(win(490,340, 1200, 850, 39));
  const [shippingSetupWindow,               setShippingSetupWindow]               = useState(win(520,360,  450, 350, 40));
  const [documentPrintingWindow,            setDocumentPrintingWindow]            = useState(win(550,380,  480, 520, 41));
  const [openItemsListWindow,               setOpenItemsListWindow]               = useState(win(100,100, 1200, 800, 42));
  const [purchaseAnalysisWindow,            setPurchaseAnalysisWindow]            = useState(win(580,400,  580, 520, 43));
  const [purchaseRequestReportWindow,       setPurchaseRequestReportWindow]       = useState(win(610,420,  550, 580, 44));
  const [purchaseQuotationComparisonWindow, setPurchaseQuotationComparisonWindow] = useState(win(640,440,  550, 520, 45));
  const [employeeCurrentInfoWindowPos,      setEmployeeCurrentInfoWindowPos]      = useState(win(100, 70,  850, 600, 46));
  const [payPeriodWindowPos,                setPayPeriodWindowPos]                = useState(win(150,100,  500, 550, 47));
  const [gradeMasterWindowPos,              setGradeMasterWindowPos]              = useState(win(200,130,  450, 400, 48));
  const [loanMasterWindowPos,               setLoanMasterWindowPos]               = useState(win(250,160,  450, 400, 49));
  const [leaveMasterWindowPos,              setLeaveMasterWindowPos]              = useState(win(300,190,  800, 550, 50));
  const [employeeCategoryMasterWindowPos,   setEmployeeCategoryMasterWindowPos]   = useState(win(350,220,  400, 350, 51));
  const [shiftMasterWindowPos,              setShiftMasterWindowPos]              = useState(win(400,250,  450, 400, 52));
  const [taxFormulaWindowPos,               setTaxFormulaWindowPos]               = useState(win(450,280,  700, 500, 53));
  const [gradePayScaleWindowPos,            setGradePayScaleWindowPos]            = useState(win(500,310,  900, 600, 54));
  const [monthlyAttendanceWindowPos,        setMonthlyAttendanceWindowPos]        = useState(win(100,100, 1000, 700, 55));
  const [payrollProcessWindowPos,           setPayrollProcessWindowPos]           = useState(win(150,150, 1000, 700, 56));
  const [loanApplicationWindowPos,          setLoanApplicationWindowPos]          = useState(win(200,180,  950, 650, 57));
  const [leaveApplicationWindowPos,         setLeaveApplicationWindowPos]         = useState(win(250,210,  950, 650, 58));
  const [payrollAdjustmentsWindowPos,       setPayrollAdjustmentsWindowPos]       = useState(win(300,240, 1100, 700, 59));
  const [chartOfAccountsWindowPos,          setChartOfAccountsWindowPos]          = useState(win( 50, 50,  900, 550, 60));
  const [editChartOfAccountsPos,            setEditChartOfAccountsPos]            = useState(win( 60, 60,  350, 350, 60));
  const [dataNotProvidedPos,                setDataNotProvidedPos]                = useState(win( 80, 80,  300, 150, 60));
  const [journalEntryWindow,                setJournalEntryWindow]                = useState(win( 80, 80, 1000, 600, 61));
  const [postingTemplatesWindow,            setPostingTemplatesWindow]            = useState(win(100,100,  900, 550, 62));
  const [recurringPostingsWindow,           setRecurringPostingsWindow]           = useState(win(120,120, 1000, 650, 63));
  const [documentPrintingSelectionWindow,   setDocumentPrintingSelectionWindow]   = useState(win(140,140,  600, 500, 64));
  const [assetMasterDataWindow,             setAssetMasterDataWindow]             = useState(win( 50, 50,  900, 650, 65));
  const [capitalizationWindow,              setCapitalizationWindow]              = useState(win(100,100,  900, 650, 66));
  const [capitalizationCreditMemoWindow,    setCapitalizationCreditMemoWindow]    = useState(win(110,110,  900, 650, 67));
  const [retirementWindow,                  setRetirementWindow]                  = useState(win(120,120, 1000, 680, 68));
  const [transferWindow,                    setTransferWindow]                    = useState(win(130,130, 1050, 680, 69));
  const [manualDepreciationWindow,          setManualDepreciationWindow]          = useState(win(140,140,  950, 680, 70));
  const [depreciationRunWindow,             setDepreciationRunWindow]             = useState(win(150,150,  750, 550, 71));
  const [assetRevaluationWindow,            setAssetRevaluationWindow]            = useState(win(160,160, 1000, 650, 72));
  const [fiscalYearChangeWindow,            setFiscalYearChangeWindow]            = useState(win(400,300,  440, 220, 73));
  const [assetDepreciationForecastWindow,   setAssetDepreciationForecastWindow]   = useState(win(400,300,  600, 200, 74));
  const [assetHistorySheetWindow,           setAssetHistorySheetWindow]           = useState(win(410,310,  650, 200, 75));
  const [assetStatusReportWindow,           setAssetStatusReportWindow]           = useState(win(420,320,  600, 200, 76));
  const [assetTransactionReportWindow,      setAssetTransactionReportWindow]      = useState(win(430,330,  600, 200, 77));
  const [reconciliationWindow,              setReconciliationWindow]              = useState(win(100, 100,  800, 580, 78));
  const [managePreviousReconciliationsWindow, setManagePreviousReconciliationsWindow] = useState(win(100, 100,  550, 250, 79));
  const [budgetScenariosWindow,             setBudgetScenariosWindow]             = useState(win(460,360,  700, 300, 80));
  const [budgetDistributionMethodsWindow,   setBudgetDistributionMethodsWindow]   = useState(win(470,370,  350, 450, 81));
  const [budgetWindow,                      setBudgetWindow]                      = useState(win(480,380,  700, 400, 82));
  const [pmsSurchargeRateWindow,            setPMSSurchargeRateWindow]            = useState(win(490,390,  600, 300, 83));
  const [electronicReportRESectorWindow, setElectronicReportRESectorWindow] = useState(win(400,100,  500, 200, 90));
  const [electronicReportRERealEstateTypeWindow, setElectronicReportRERealEstateTypeWindow] = useState(win(410,110,  500, 200, 91));
  const [electronicReportCRCScheduleWindow, setElectronicReportCRCScheduleWindow] = useState(win(420,120,  500, 300, 92));
  const [electronicReportCRCGeneralWindow, setElectronicReportCRCGeneralWindow] = useState(win(430,130,  500, 300, 93));
  const [electronicReportChallanWindow, setElectronicReportChallanWindow] = useState(win(440,140,  500, 300, 94));
  const [electronicReportMonthWiseWindow, setElectronicReportMonthWiseWindow] = useState(win(450,150,  500, 200, 95));
  const [electronicReportYearWiseWindow, setElectronicReportYearWiseWindow] = useState(win(460,160,  500, 200, 96));
  const [electronicReportDHABWindow, setElectronicReportDHABWindow] = useState(win(470,170,  500, 200, 97));
  const [electronicReportFixAssetWindow, setElectronicReportFixAssetWindow] = useState(win(480,180,  500, 200, 98));
  const [electronicReportSurchargeWindow, setElectronicReportSurchargeWindow] = useState(win(490,190,  500, 200, 99));
  const [electronicReportSurcharge2Window, setElectronicReportSurcharge2Window] = useState(win(500,200,  500, 250, 100));
  const [gLAccountsAndBPWindow, setGLAccountsAndBPWindow] = useState(win(510,210,  650, 260, 101));
  const [generalLedgerWindow, setGeneralLedgerWindow] = useState(win(520,220,  680, 600, 102));
  const [customerReceivablesAgingWindow, setCustomerReceivablesAgingWindow] = useState(win(450,150,  420, 520, 103));
  const [vendorLiabilitiesAgingWindow, setVendorLiabilitiesAgingWindow] = useState(win(470,170,  420, 520, 104));
  const [agingPropertiesWindow, setAgingPropertiesWindow] = useState(win(500,200,  350, 400, 105));
  const [blanketAgreementsListWindow, setBlanketAgreementsListWindow] = useState(win(530,230,  550, 300, 106));
  const [transactionJournalReportWindow, setTransactionJournalReportWindow] = useState(win(400,150,  400, 230, 107));
  const [transactionReportByProjectsWindow, setTransactionReportByProjectsWindow] = useState(win(420,170,  380, 260, 108));
  const [documentJournalWindow, setDocumentJournalWindow] = useState(win(440,190,  700, 600, 109));
  const [taxReportWindow, setTaxReportWindow] = useState(win(465,210,  700, 520, 110));
  const [withholdingTaxReportWindow, setWithholdingTaxReportWindow] = useState(win(485,230,  700, 520, 111));
  const [balanceSheetWindow, setBalanceSheetWindow] = useState(win(505,250,  700, 350, 112));
  const [trialBalanceWindow, setTrialBalanceWindow] = useState(win(525,270,  700, 600, 113));
  const [profitAndLossStatementWindow, setProfitAndLossStatementWindow] = useState(win(545,290,  700, 350, 114));
  const [cashFlowWindow, setCashFlowWindow] = useState(win(565,310,  850, 600, 115));
  const [statementOfCashFlowsWindow, setStatementOfCashFlowsWindow] = useState(win(585,330,  700, 300, 116));
  const [cashFlowForecastWindow, setCashFlowForecastWindow] = useState(win(605,350,  700, 350, 117));
  const [balanceSheetComparisonWindow, setBalanceSheetComparisonWindow] = useState(win(625,370,  800, 500, 118));
  const [trialBalanceComparisonWindow, setTrialBalanceComparisonWindow] = useState(win(645,390,  800, 650, 119));
  const [profitLossComparisonWindow, setProfitLossComparisonWindow] = useState(win(665,410,  800, 500, 120));
  const [budgetReportWindow, setBudgetReportWindow] = useState(win(685,430,  800, 500, 121));
  const [balanceSheetBudgetWindow, setBalanceSheetBudgetWindow] = useState(win(705,450,  750, 450, 122));
  const [trialBalanceBudgetWindow, setTrialBalanceBudgetWindow] = useState(win(725,470,  800, 650, 123));
  const [profitLossBudgetWindow, setProfitLossBudgetWindow] = useState(win(745,490,  750, 450, 124));
  const [budgetReportCategorizedWindow, setBudgetReportCategorizedWindow] = useState(win(765,510,  500, 250, 125));
  const [dimensionsWindow, setDimensionsWindow] = useState(win(100, 100, 450, 250, 126));
  const [costCentersWindow, setCostCentersWindow] = useState(win(120, 120, 600, 400, 127));
  const [costCenterTableWindow, setCostCenterTableWindow] = useState(win(140, 140, 800, 500, 128));
  const [distributionRulesWindow, setDistributionRulesWindow] = useState(win(160, 160, 700, 450, 129));
  const [costCenterHierarchyWindow, setCostCenterHierarchyWindow] = useState(win(180, 180, 800, 600, 130));
  const [costCenterReportWindow, setCostCenterReportWindow] = useState(win(200, 200, 600, 450, 131));
  const [distributionReportWindow, setDistributionReportWindow] = useState(win(220, 220, 600, 500, 132));
  const [costAccountingSummaryWindow, setCostAccountingSummaryWindow] = useState(win(240, 240, 600, 480, 133));
  const [budgetVersusCostAccountingWindow, setBudgetVersusCostAccountingWindow] = useState(win(260, 260, 650, 500, 134));
  const [accrualTypesWindow, setAccrualTypesWindow] = useState(win(280, 280, 600, 400, 135));
  const [costAccountingReconciliationWindow, setCostAccountingReconciliationWindow] = useState(win(300, 300, 600, 550, 136));
  const [costAccountingAdjustmentWindow, setCostAccountingAdjustmentWindow] = useState(win(320, 320, 600, 400, 137));
  const [costElementsWindow, setCostElementsWindow] = useState(win(100, 100, 600, 400, 138));
  const [chooseCompanyWindowPos,            setChooseCompanyWindowPos]            = useState(win(100, 100,  850, 600, 67));
  const [exchangeRatesWindowPos,            setExchangeRatesWindowPos]            = useState(win(110, 110,  900, 650, 68));
  const [companyDetailsWindowPos,           setCompanyDetailsWindowPos]           = useState(win(120, 120,  700, 800, 69));
  const [generalSettingsWindowPos,          setGeneralSettingsWindowPos]          = useState(win(130, 130,  950, 650, 70));
  const [postingPeriodsWindowPos,           setPostingPeriodsWindowPos]           = useState(win(140, 140, 1000, 650, 71));
  const [documentNumberingWindowPos,        setDocumentNumberingWindowPos]        = useState(win(150, 150, 1000, 700, 72));
  const [documentSettingsWindowPos,         setDocumentSettingsWindowPos]         = useState(win(160, 160, 1000, 700, 73));
  const [printPreferencesWindowPos,         setPrintPreferencesWindowPos]         = useState(win(170, 170,  620, 580, 74));
  const [tooltipPreviewWindowPos,          setTooltipPreviewWindowPos]           = useState(win(180, 180, 1000, 600, 75));
  const [usersSetupWindowPos,             setUsersSetupWindowPos]              = useState(win(190, 190,  550, 650, 76));
  const [userGroupsWindowPos,            setUserGroupsWindowPos]             = useState(win(200, 200, 650, 650, 77));
  const [userDefaultsWindowPos,          setUserDefaultsWindowPos]           = useState(win(210, 210, 600, 650, 78));
  const [salesEmployeesSetupWindowPos,   setSalesEmployeesSetupWindowPos]    = useState(win(220, 220, 800, 500, 79));
  const [territoriesSetupPos,            setTerritoriesSetupPos]             = useState(win(230, 230, 700, 550, 80));
  const [commissionGroupsSetupPos,       setCommissionGroupsSetupPos]        = useState(win(240, 240, 600, 450, 81));
  const [predefinedTextSetupPos,         setPredefinedTextSetupPos]          = useState(win(250, 250, 550, 400, 82));
  const [referenceFieldLinksSetupPos,    setReferenceFieldLinksSetupPos]     = useState(win(260, 260, 700, 500, 83));
  const [freightSetupPos,                setFreightSetupPos]                 = useState(win(270, 270, 1000, 600, 84));
  const [messagePreferencesSetupPos,     setMessagePreferencesSetupPos]      = useState(win(280, 280, 600, 500, 85));
  const [reportLayoutManagerPos,         setReportLayoutManagerPos]          = useState(win(100, 100, 750, 550, 86));
  const [crystalReportElementsSetupPos,  setCrystalReportElementsSetupPos]   = useState(win(110, 110, 550, 600, 87));
  const [serverPrintConfigPos,           setServerPrintConfigPos]            = useState(win(120, 120, 700, 500, 88));
  const [dashboardManagerPos,            setDashboardManagerPos]             = useState(win(130, 130, 850, 600, 89));
  const [dashboardParametersSetupPos,    setDashboardParametersSetupPos]     = useState(win(140, 140, 500, 450, 90));
  const [passwordAdminWindowPos,         setPasswordAdminWindowPos]          = useState(win(150, 150, 450, 400, 91));
  const [changePasswordWindowPos,        setChangePasswordWindowPos]         = useState(win(160, 160, 400, 300, 92));
  const [siteUserWindowPos,              setSiteUserWindowPos]               = useState(win(170, 170, 500, 450, 93));
  const [electronicFileManagerPos,       setElectronicFileManagerPos]        = useState(win(180, 180, 850, 450, 94));
  const [electronicCertificatesPos,       setElectronicCertificatesPos]       = useState(win(190, 190, 800, 500, 95));
  const [crystalServerConfigPos,        setCrystalServerConfigPos]         = useState(win(100, 100, 750, 450, 96));
  const [processChecklistTemplatePos,   setProcessChecklistTemplatePos]    = useState(win(110, 110, 550, 350, 97));
  const [sapLinksPos,                   setSapLinksPos]                    = useState(win(120, 120, 900, 400, 98));
  const [dunningHistoryReportPos,        setDunningHistoryReportPos]        = useState(win(100, 100, 550, 420, 150));
  const [creditLimitDeviationPos,        setCreditLimitDeviationPos]        = useState(win(100, 100, 850, 480, 160));
  const [reconByDueDatePos,              setReconByDueDatePos]              = useState(win(100, 100, 500, 180, 161));
  const [reconByExactAmountPos,          setReconByExactAmountPos]          = useState(win(100, 100, 500, 180, 162));
  const [reconByTransNumberPos,          setReconByTransNumberPos]          = useState(win(100, 100, 500, 180, 163));
  const [reconLocateByRowNumberPos,      setReconLocateByRowNumberPos]      = useState(win(100, 100, 500, 180, 164));
  const [reconByExactSumPos,            setReconByExactSumPos]            = useState(win(100, 100, 500, 180, 165));
  const [reconBySumFCPos,              setReconBySumFCPos]              = useState(win(100, 100, 500, 180, 166));
  const [selectionUsersPos,              setSelectionUsersPos]              = useState(win(150, 150, 550, 350, 164));
  const [selectionEmployeesPos,          setSelectionEmployeesPos]          = useState(win(160, 160, 550, 350, 165));
  const [selectionRecipientListsPos,     setSelectionRecipientListsPos]     = useState(win(170, 170, 550, 350, 166));
  const [selectionPropertiesPos,          setSelectionPropertiesPos]          = useState(win(180, 180, 500, 600, 167));
  const [selectionUdfPos,                 setSelectionUdfPos]                 = useState(win(190, 190, 600, 350, 168));
  const [selectionBusinessPartnersPos,    setSelectionBusinessPartnersPos]    = useState(win(150, 150, 650, 450, 169));

  // ── Banking window states ──────────────────────────────────────────────────
  const [incomingPaymentsPos, setIncomingPaymentsPos] = useState(win(100, 100, 900, 650, 170));
  const [checkRegisterPos, setCheckRegisterPos] = useState(win(120, 120, 900, 650, 171));
  const [creditCardManagementPos, setCreditCardManagementPos] = useState(win(140, 140, 900, 650, 172));
  const [creditCardSummaryPos, setCreditCardSummaryPos] = useState(win(160, 160, 900, 650, 173));
  const [outgoingPaymentsPos, setOutgoingPaymentsPos] = useState(win(180, 180, 900, 650, 174));
  const [checksForPaymentPos, setChecksForPaymentPos] = useState(win(200, 200, 900, 650, 175));
  const [voidChecksForPaymentPos, setVoidChecksForPaymentPos] = useState(win(220, 220, 900, 650, 176));
  const [checksForPaymentDraftsReportPos, setChecksForPaymentDraftsReportPos] = useState(win(240, 240, 900, 650, 177));
  const [paymentDraftsReportPos, setPaymentDraftsReportPos] = useState(win(260, 260, 900, 650, 178));
  const [checksForPaymentDateCrossSectionPos, setChecksForPaymentDateCrossSectionPos] = useState(win(280, 280, 900, 650, 179));
  const [bpBankAccountsQueryPos, setBPBankAccountsQueryPos] = useState(win(300, 300, 900, 650, 180));
  const [houseBankAccountsQueryPos, setHouseBankAccountsQueryPos] = useState(win(320, 320, 900, 650, 181));
  const [externalReconciliationPos, setExternalReconciliationPos] = useState(win(340, 340, 900, 650, 182));




  // ── openWindow ────────────────────────────────────────────────────────────
  const openWindow = (type: WindowType, title?: string) => {
    const nextZ = zIndex + 1;
    setZIndex(nextZ);
    if (title) setActiveReportTitle(title);

    const bringFront = <T extends WindowState>(setter: React.Dispatch<React.SetStateAction<T>>) =>
      setter(prev => ({ ...prev, isMinimized: false, zIndex: nextZ }));

    switch (type) {
      case 'employee':                   setShowEmployeeMaster(true);              bringFront(setEmployeeWindow); break;
      case 'timesheet':                  setShowTimeSheet(true);                   bringFront(setTimeSheetWindow); break;
      case 'family':                     setShowFamilyDetail(true);                bringFront(setFamilyDetailWindow); break;
      case 'kin':                        setShowNextOfKin(true);                   bringFront(setNextOfKinWindow); break;
      case 'settlement':                 setShowFinalSettlement(true);             bringFront(setFinalSettlementWindow); break;
      case 'tada':                       setShowTADA(true);                        bringFront(setTadaWindow); break;
      case 'bpMaster':                   setShowBusinessPartnerMaster(true);       bringFront(setBpMasterWindow); break;
      case 'activity':                   setShowActivity(true);                    bringFront(setActivityWindow); break;
      case 'opportunity':                setShowOpportunity(true);                 bringFront(setOpportunityWindow); break;
      case 'salesOrder':                 setShowSalesOrder(true);                  bringFront(setSalesOrderWindow); break;
      case 'customer360':                setShowCustomer360(true);                 bringFront(setCustomer360Window); break;
      case 'activitiesOverview':         setShowActivitiesOverview(true);          bringFront(setActivitiesWindow); break;
      case 'campaignsList':              setShowCampaignsList(true);               bringFront(setCampaignsWindow); break;
      case 'inactiveCustomers':          setShowInactiveCustomers(true);           bringFront(setInactiveCustWindow); break;
      case 'oppStatistics':              setShowOppStatistics(true);               bringFront(setOppStatsWindow); break;
      case 'wonOppReport':               setShowWonOppReport(true);                bringFront(setWonOppWindow); break;
      case 'purchaseRequest':            setShowPurchaseRequest(true);             bringFront(setPurchaseRequestWindow); break;
      case 'purchaseQuotation':          setShowPurchaseQuotation(true);           bringFront(setPurchaseQuotationWindow); break;
      case 'purchaseOrder':              setShowPurchaseOrder(true);               bringFront(setPurchaseOrderWindow); break;
      case 'goodsReceiptPO':             setShowGoodsReceiptPO(true);              bringFront(setGoodsReceiptPOWindow); break;
      case 'goodsReturnRequest':         setShowGoodsReturnRequest(true);          bringFront(setGoodsReturnRequestWindow); break;
      case 'goodsReturn':                setShowGoodsReturn(true);                 bringFront(setGoodsReturnWindow); break;
      case 'apDownPaymentRequest':       setShowAPDownPaymentRequest(true);        bringFront(setAPDownPaymentRequestWindow); break;
      case 'apDownPaymentInvoice':       setShowAPDownPaymentInvoice(true);        bringFront(setAPDownPaymentInvoiceWindow); break;
      case 'apInvoice':                  setShowAPInvoice(true);                   bringFront(setAPInvoiceWindow); break;
      case 'apCreditMemo':               setShowAPCreditMemo(true);                bringFront(setAPCreditMemoWindow); break;
      case 'apReserveInvoice':           setShowAPReserveInvoice(true);            bringFront(setAPReserveInvoiceWindow); break;
      case 'recurringTransactions':      setShowRecurringTransactions(true);       bringFront(setRecurringTransactionsWindow); break;
      case 'recurringTransactionTemplates': setShowRecurringTransactionTemplates(true); bringFront(setRecurringTransactionTemplatesWindow); break;
      case 'landedCosts':                setShowLandedCosts(true);                 bringFront(setLandedCostsWindow); break;
      case 'shippingSetup':              setShowShippingSetup(true);               bringFront(setShippingSetupWindow); break;
      case 'documentPrinting':           setShowDocumentPrinting(true);            bringFront(setDocumentPrintingWindow); break;
      case 'openItemsList':              setShowOpenItemsList(true);               bringFront(setOpenItemsListWindow); break;
      case 'purchaseAnalysis':           setShowPurchaseAnalysis(true);            bringFront(setPurchaseAnalysisWindow); break;
      case 'purchaseRequestReport':      setShowPurchaseRequestReport(true);       bringFront(setPurchaseRequestReportWindow); break;
      case 'purchaseQuotationComparison':setShowPurchaseQuotationComparison(true); bringFront(setPurchaseQuotationComparisonWindow); break;
      case 'employeeCurrentInfo':        setShowEmployeeCurrentInfo(true);         bringFront(setEmployeeCurrentInfoWindowPos); break;
      case 'payPeriod':                  setShowPayPeriod(true);                   bringFront(setPayPeriodWindowPos); break;
      case 'gradeMaster':                setShowGradeMaster(true);                 bringFront(setGradeMasterWindowPos); break;
      case 'loanMaster':                 setShowLoanMaster(true);                  bringFront(setLoanMasterWindowPos); break;
      case 'leaveMaster':                setShowLeaveMaster(true);                 bringFront(setLeaveMasterWindowPos); break;
      case 'employeeCategoryMaster':     setShowEmployeeCategoryMaster(true);      bringFront(setEmployeeCategoryMasterWindowPos); break;
      case 'shiftMaster':                setShowShiftMaster(true);                 bringFront(setShiftMasterWindowPos); break;
      case 'taxFormula':                 setShowTaxFormula(true);                  bringFront(setTaxFormulaWindowPos); break;
      case 'gradePayScale':              setShowGradePayScale(true);               bringFront(setGradePayScaleWindowPos); break;
      case 'monthlyAttendance':          setShowMonthlyAttendance(true);           bringFront(setMonthlyAttendanceWindowPos); break;
      case 'payrollProcess':             setShowPayrollProcess(true);              bringFront(setPayrollProcessWindowPos); break;
      case 'loanApplication':            setShowLoanApplication(true);             bringFront(setLoanApplicationWindowPos); break;
      case 'leaveApplication':           setShowLeaveApplication(true);            bringFront(setLeaveApplicationWindowPos); break;
      case 'payrollAdjustments':         setShowPayrollAdjustments(true);          bringFront(setPayrollAdjustmentsWindowPos); break;
      case 'chooseCompany':              setShowChooseCompany(true);               bringFront(setChooseCompanyWindowPos); break;
      case 'exchangeRates':              setShowExchangeRates(true);               bringFront(setExchangeRatesWindowPos); break;
      case 'companyDetails':             setShowCompanyDetails(true);              bringFront(setCompanyDetailsWindowPos); break;
      case 'generalSettings':            setShowGeneralSettings(true);             bringFront(setGeneralSettingsWindowPos); break;
      case 'postingPeriods':             setShowPostingPeriods(true);              bringFront(setPostingPeriodsWindowPos); break;
      case 'documentNumbering':          setShowDocumentNumbering(true);           bringFront(setDocumentNumberingWindowPos); break;
      case 'documentSettings':           setShowDocumentSettings(true);            bringFront(setDocumentSettingsWindowPos); break;
      case 'chartOfAccounts':            setShowChartOfAccounts(true);             bringFront(setChartOfAccountsWindowPos); break;
      case 'editChartOfAccounts':        setShowEditChartOfAccounts(true);         bringFront(setEditChartOfAccountsPos); break;
      case 'dataNotProvided':            setShowDataNotProvided(true);             bringFront(setDataNotProvidedPos); break;
      case 'journalEntry':               setShowJournalEntry(true);                bringFront(setJournalEntryWindow); break;
      case 'postingTemplates':           setShowPostingTemplates(true);            bringFront(setPostingTemplatesWindow); break;
      case 'recurringPostings':          setShowRecurringPostings(true);           bringFront(setRecurringPostingsWindow); break;
      case 'documentPrintingSelection':  setShowDocumentPrintingSelection(true);   bringFront(setDocumentPrintingSelectionWindow); break;
      case 'assetMasterData':            setShowAssetMasterData(true);             bringFront(setAssetMasterDataWindow); break;
      case 'capitalization':             setShowCapitalization(true);              bringFront(setCapitalizationWindow); break;
      case 'capitalizationCreditMemo':   setShowCapitalizationCreditMemo(true);   bringFront(setCapitalizationCreditMemoWindow); break;
      case 'retirement':                 setShowRetirement(true);                 bringFront(setRetirementWindow); break;
      case 'transfer':                   setShowTransfer(true);                   bringFront(setTransferWindow); break;
      case 'manualDepreciation':         setShowManualDepreciation(true);         bringFront(setManualDepreciationWindow); break;
      case 'depreciationRun':            setShowDepreciationRun(true);            bringFront(setDepreciationRunWindow); break;
      case 'assetRevaluation':           setShowAssetRevaluation(true);           bringFront(setAssetRevaluationWindow); break;
      case 'fiscalYearChange':           setShowFiscalYearChange(true);           bringFront(setFiscalYearChangeWindow); break;
      case 'assetDepreciationForecast':  setShowAssetDepreciationForecast(true);  bringFront(setAssetDepreciationForecastWindow); break;
      case 'assetHistorySheet':          setShowAssetHistorySheet(true);          bringFront(setAssetHistorySheetWindow); break;
      case 'assetStatusReport':          setShowAssetStatusReport(true);          bringFront(setAssetStatusReportWindow); break;
      case 'assetTransactionReport':     setShowAssetTransactionReport(true);     bringFront(setAssetTransactionReportWindow); break;
      case 'reconciliation':             setShowReconciliation(true);             bringFront(setReconciliationWindow); break;
      case 'managePreviousReconciliations': setShowManagePreviousReconciliations(true); bringFront(setManagePreviousReconciliationsWindow); break;
      case 'budgetScenarios':            setShowBudgetScenarios(true);            bringFront(setBudgetScenariosWindow); break;
      case 'budgetDistributionMethods':  setShowBudgetDistributionMethods(true);  bringFront(setBudgetDistributionMethodsWindow); break;
      case 'budget':                     setShowBudget(true);                     bringFront(setBudgetWindow); break;
      case 'pmsSurchargeRate':           setShowPMSSurchargeRate(true);           bringFront(setPMSSurchargeRateWindow); break;
      case 'electronicReport_RESector': setShowElectronicReportRESector(true); bringFront(setElectronicReportRESectorWindow); break;
      case 'electronicReport_RERealEstateType': setShowElectronicReportRERealEstateType(true); bringFront(setElectronicReportRERealEstateTypeWindow); break;
      case 'electronicReport_CRC_Schedule': setShowElectronicReportCRCSchedule(true); bringFront(setElectronicReportCRCScheduleWindow); break;
      case 'electronicReport_CRC_General': setShowElectronicReportCRCGeneral(true); bringFront(setElectronicReportCRCGeneralWindow); break;
      case 'electronicReport_Challan': setShowElectronicReportChallan(true); bringFront(setElectronicReportChallanWindow); break;
      case 'electronicReport_MonthWise': setShowElectronicReportMonthWise(true); bringFront(setElectronicReportMonthWiseWindow); break;
      case 'electronicReport_YearWise': setShowElectronicReportYearWise(true); bringFront(setElectronicReportYearWiseWindow); break;
      case 'electronicReport_DHAB': setShowElectronicReportDHAB(true); bringFront(setElectronicReportDHABWindow); break;
      case 'electronicReport_FixAsset': setShowElectronicReportFixAsset(true); bringFront(setElectronicReportFixAssetWindow); break;
      case 'electronicReport_Surcharge': setShowElectronicReportSurcharge(true); bringFront(setElectronicReportSurchargeWindow); break;
      case 'electronicReport_Surcharge2': setShowElectronicReportSurcharge2(true); bringFront(setElectronicReportSurcharge2Window); break;
      case 'glAccountsAndBP': setShowGLAccountsAndBP(true); bringFront(setGLAccountsAndBPWindow); break;
      case 'generalLedger': setShowGeneralLedger(true); bringFront(setGeneralLedgerWindow); break;
      case 'customerReceivablesAging': setShowCustomerReceivablesAging(true); bringFront(setCustomerReceivablesAgingWindow); break;
      case 'vendorLiabilitiesAging': setShowVendorLiabilitiesAging(true); bringFront(setVendorLiabilitiesAgingWindow); break;
      case 'agingProperties': setShowAgingProperties(true); bringFront(setAgingPropertiesWindow); break;
      case 'blanketAgreementsList': setShowBlanketAgreementsList(true); bringFront(setBlanketAgreementsListWindow); break;
      case 'transactionJournalReport': setShowTransactionJournalReport(true); bringFront(setTransactionJournalReportWindow); break;
      case 'transactionReportByProjects': setShowTransactionReportByProjects(true); bringFront(setTransactionReportByProjectsWindow); break;
      case 'documentJournal': setShowDocumentJournal(true); bringFront(setDocumentJournalWindow); break;
      case 'taxReport': setShowTaxReport(true); bringFront(setTaxReportWindow); break;
      case 'withholdingTaxReport': setShowWithholdingTaxReport(true); bringFront(setWithholdingTaxReportWindow); break;
      case 'balanceSheet': setShowBalanceSheet(true); bringFront(setBalanceSheetWindow); break;
      case 'trialBalance': setShowTrialBalance(true); bringFront(setTrialBalanceWindow); break;
      case 'profitAndLossStatement': setShowProfitAndLossStatement(true); bringFront(setProfitAndLossStatementWindow); break;
      case 'cashFlow': setShowCashFlow(true); bringFront(setCashFlowWindow); break;
      case 'statementOfCashFlows': setShowStatementOfCashFlows(true); bringFront(setStatementOfCashFlowsWindow); break;
      case 'cashFlowForecast': setShowCashFlowForecast(true); bringFront(setCashFlowForecastWindow); break;
      case 'balanceSheetComparison': setShowBalanceSheetComparison(true); bringFront(setBalanceSheetComparisonWindow); break;
      case 'trialBalanceComparison': setShowTrialBalanceComparison(true); bringFront(setTrialBalanceComparisonWindow); break;
      case 'profitLossComparison': setShowProfitLossComparison(true); bringFront(setProfitLossComparisonWindow); break;
      case 'budgetReport': setShowBudgetReport(true); bringFront(setBudgetReportWindow); break;
      case 'balanceSheetBudget': setShowBalanceSheetBudget(true); bringFront(setBalanceSheetBudgetWindow); break;
      case 'trialBalanceBudget': setShowTrialBalanceBudget(true); bringFront(setTrialBalanceBudgetWindow); break;
      case 'profitLossBudget': setShowProfitLossBudget(true); bringFront(setProfitLossBudgetWindow); break;
      case 'budgetReportCategorized': setShowBudgetReportCategorized(true); bringFront(setBudgetReportCategorizedWindow); break;
      case 'dimensions': setShowDimensions(true); bringFront(setDimensionsWindow); break;
      case 'costCenters': setShowCostCenters(true); bringFront(setCostCentersWindow); break;
      case 'costCenterTable': setShowCostCenterTable(true); bringFront(setCostCenterTableWindow); break;
      case 'distributionRules': setShowDistributionRules(true); bringFront(setDistributionRulesWindow); break;
      case 'costCenterHierarchy': setShowCostCenterHierarchy(true); bringFront(setCostCenterHierarchyWindow); break;
      case 'costCenterReport': setShowCostCenterReport(true); bringFront(setCostCenterReportWindow); break;
      case 'distributionReport': setShowDistributionReport(true); bringFront(setDistributionReportWindow); break;
      case 'costAccountingSummary': setShowCostAccountingSummary(true); bringFront(setCostAccountingSummaryWindow); break;
      case 'budgetVersusCostAccounting': setShowBudgetVersusCostAccounting(true); bringFront(setBudgetVersusCostAccountingWindow); break;
      case 'accrualTypes': setShowAccrualTypes(true); bringFront(setAccrualTypesWindow); break;
      case 'costAccountingReconciliation': setShowCostAccountingReconciliation(true); bringFront(setCostAccountingReconciliationWindow); break;
      case 'costAccountingAdjustment': setShowCostAccountingAdjustment(true); bringFront(setCostAccountingAdjustmentWindow); break;
      case 'costElements':               setShowCostElements(true);                bringFront(setCostElementsWindow); break;
      case 'printPreferences':           setShowPrintPreferences(true);            bringFront(setPrintPreferencesWindowPos); break;
      case 'tooltipPreview':             setShowTooltipPreview(true);               bringFront(setTooltipPreviewWindowPos); break;
      case 'usersSetup':                 setShowUsersSetup(true);                   bringFront(setUsersSetupWindowPos); break;
      case 'userGroups':                 setShowUserGroups(true);                   bringFront(setUserGroupsWindowPos); break;
      case 'userDefaults':               setShowUserDefaults(true);                 bringFront(setUserDefaultsWindowPos); break;
      case 'salesEmployeesSetup':        setShowSalesEmployeesSetup(true);          bringFront(setSalesEmployeesSetupWindowPos); break;
      case 'territoriesSetup':           setShowTerritoriesSetup(true);             bringFront(setTerritoriesSetupPos); break;
      case 'commissionGroupsSetup':      setShowCommissionGroupsSetup(true);        bringFront(setCommissionGroupsSetupPos); break;
      case 'predefinedTextSetup':        setShowPredefinedTextSetup(true);          bringFront(setPredefinedTextSetupPos); break;
      case 'referenceFieldLinksSetup':   setShowReferenceFieldLinksSetup(true);     bringFront(setReferenceFieldLinksSetupPos); break;
      case 'freightSetup':               setShowFreightSetup(true);                 bringFront(setFreightSetupPos); break;
      case 'messagePreferencesSetup':    setShowMessagePreferencesSetup(true);      bringFront(setMessagePreferencesSetupPos); break;
      case 'reportLayoutManager':        setShowReportLayoutManager(true);          bringFront(setReportLayoutManagerPos); break;
      case 'crystalReportElementsSetup': setShowCrystalReportElementsSetup(true);   bringFront(setCrystalReportElementsSetupPos); break;
      case 'serverPrintConfig':          setShowServerPrintConfig(true);            bringFront(setServerPrintConfigPos); break;
      case 'dashboardManager':           setShowDashboardManager(true);             bringFront(setDashboardManagerPos); break;
      case 'dashboardParametersSetup':   setShowDashboardParametersSetup(true);     bringFront(setDashboardParametersSetupPos); break;
      case 'passwordAdministration':    setShowPasswordAdministration(true);       bringFront(setPasswordAdminWindowPos); break;
      case 'changePassword':           setShowChangePassword(true);              bringFront(setChangePasswordWindowPos); break;
      case 'siteUser':                 setShowSiteUser(true);                    bringFront(setSiteUserWindowPos); break;
      case 'electronicFileManagerSetup': setShowElectronicFileManagerSetup(true); bringFront(setElectronicFileManagerPos); break;
      case 'electronicCertificatesSetup': setShowElectronicCertificatesSetup(true); bringFront(setElectronicCertificatesPos); break;
      case 'crystalServerConfig':        setShowCrystalServerConfig(true);        bringFront(setCrystalServerConfigPos); break;
      case 'processChecklistTemplate':    setShowProcessChecklistTemplate(true);   bringFront(setProcessChecklistTemplatePos); break;
      case 'sapLinks':                   setShowSapLinks(true);                   bringFront(setSapLinksPos); break;
      case 'dunningHistoryReport':       setShowDunningHistoryReport(true);       bringFront(setDunningHistoryReportPos); break;
      case 'customersCreditLimitDeviation': setShowCreditLimitDeviation(true);    bringFront(setCreditLimitDeviationPos); break;
      case 'reconByDueDate':             setShowReconByDueDate(true);             bringFront(setReconByDueDatePos); break;
      case 'reconByExactAmount':         setShowReconByExactAmount(true);         bringFront(setReconByExactAmountPos); break;
      case 'reconByTransNumber':         setShowReconByTransNumber(true);         bringFront(setReconByTransNumberPos); break;
      case 'reconLocateByRowNumber':     setShowReconLocateByRowNumber(true);     bringFront(setReconLocateByRowNumberPos); break;
      case 'reconByExactSum':            setShowReconByExactSum(true);            bringFront(setReconByExactSumPos); break;
      case 'reconBySumFC':              setShowReconBySumFC(true);              bringFront(setReconBySumFCPos); break;
      case 'selectionUsers':             setShowSelectionUsers(true);             bringFront(setSelectionUsersPos); break;
      case 'selectionEmployees':         setShowSelectionEmployees(true);         bringFront(setSelectionEmployeesPos); break;
      case 'selectionRecipientLists':    setShowSelectionRecipientLists(true);    bringFront(setSelectionRecipientListsPos); break;
      case 'selectionProperties':         setShowSelectionProperties(true);         bringFront(setSelectionPropertiesPos); break;
      case 'selectionUdf':                setShowSelectionUdf(true);                bringFront(setSelectionUdfPos); break;
      case 'selectionBusinessPartners':   setShowSelectionBusinessPartners(true);   bringFront(setSelectionBusinessPartnersPos); break;

      // ── Banking ──
      case 'incomingPayments': setShowIncomingPayments(true); bringFront(setIncomingPaymentsPos); break;
      case 'checkRegister': setShowCheckRegister(true); bringFront(setCheckRegisterPos); break;
      case 'creditCardManagement': setShowCreditCardManagement(true); bringFront(setCreditCardManagementPos); break;
      case 'creditCardSummary': setShowCreditCardSummary(true); bringFront(setCreditCardSummaryPos); break;
      case 'outgoingPayments': setShowOutgoingPayments(true); bringFront(setOutgoingPaymentsPos); break;
      case 'checksForPayment': setShowChecksForPayment(true); bringFront(setChecksForPaymentPos); break;
      case 'voidChecksForPayment': setShowVoidChecksForPayment(true); bringFront(setVoidChecksForPaymentPos); break;
      case 'checksForPaymentDraftsReport': setShowChecksForPaymentDraftsReport(true); bringFront(setChecksForPaymentDraftsReportPos); break;
      case 'paymentDraftsReport': setShowPaymentDraftsReport(true); bringFront(setPaymentDraftsReportPos); break;
      case 'checksForPaymentDateCrossSection': setShowChecksForPaymentDateCrossSection(true); bringFront(setChecksForPaymentDateCrossSectionPos); break;
      case 'bpBankAccountsQuery': setShowBPBankAccountsQuery(true); bringFront(setBPBankAccountsQueryPos); break;
      case 'houseBankAccountsQuery': setShowHouseBankAccountsQuery(true); bringFront(setHouseBankAccountsQueryPos); break;
      case 'externalReconciliation': setShowExternalReconciliation(true); bringFront(setExternalReconciliationPos); break;
    }


  };

  return {
    openWindow,
    activeReportTitle,
    // visibility
    showEmployeeMaster, setShowEmployeeMaster,
    showTimeSheet, setShowTimeSheet,
    showFamilyDetail, setShowFamilyDetail,
    showNextOfKin, setShowNextOfKin,
    showFinalSettlement, setShowFinalSettlement,
    showTADA, setShowTADA,
    showBusinessPartnerMaster, setShowBusinessPartnerMaster,
    showActivity, setShowActivity,
    showOpportunity, setShowOpportunity,
    showSalesOrder, setShowSalesOrder,
    showCustomer360, setShowCustomer360,
    showActivitiesOverview, setShowActivitiesOverview,
    showCampaignsList, setShowCampaignsList,
    showInactiveCustomers, setShowInactiveCustomers,
    showOppStatistics, setShowOppStatistics,
    showWonOppReport, setShowWonOppReport,
    showPurchaseRequest, setShowPurchaseRequest,
    showPurchaseQuotation, setShowPurchaseQuotation,
    showPurchaseOrder, setShowPurchaseOrder,
    showGoodsReceiptPO, setShowGoodsReceiptPO,
    showGoodsReturnRequest, setShowGoodsReturnRequest,
    showGoodsReturn, setShowGoodsReturn,
    showAPDownPaymentRequest, setShowAPDownPaymentRequest,
    showAPDownPaymentInvoice, setShowAPDownPaymentInvoice,
    showAPInvoice, setShowAPInvoice,
    showAPCreditMemo, setShowAPCreditMemo,
    showAPReserveInvoice, setShowAPReserveInvoice,
    showRecurringTransactions, setShowRecurringTransactions,
    showRecurringTransactionTemplates, setShowRecurringTransactionTemplates,
    showLandedCosts, setShowLandedCosts,
    showShippingSetup, setShowShippingSetup,
    showDocumentPrinting, setShowDocumentPrinting,
    showOpenItemsList, setShowOpenItemsList,
    showPurchaseAnalysis, setShowPurchaseAnalysis,
    showPurchaseRequestReport, setShowPurchaseRequestReport,
    showPurchaseQuotationComparison, setShowPurchaseQuotationComparison,
    showEmployeeCurrentInfo, setShowEmployeeCurrentInfo,
    showPayPeriod, setShowPayPeriod,
    showGradeMaster, setShowGradeMaster,
    showLoanMaster, setShowLoanMaster,
    showLeaveMaster, setShowLeaveMaster,
    showEmployeeCategoryMaster, setShowEmployeeCategoryMaster,
    showShiftMaster, setShowShiftMaster,
    showTaxFormula, setShowTaxFormula,
    showGradePayScale, setShowGradePayScale,
    showMonthlyAttendance, setShowMonthlyAttendance,
    showPayrollProcess, setShowPayrollProcess,
    showLoanApplication, setShowLoanApplication,
    showLeaveApplication, setShowLeaveApplication,
    showPayrollAdjustments, setShowPayrollAdjustments,
    showChooseCompany, setShowChooseCompany,
    showExchangeRates, setShowExchangeRates,
    showCompanyDetails, setShowCompanyDetails,
    showGeneralSettings, setShowGeneralSettings,
    showPostingPeriods, setShowPostingPeriods,
    showDocumentNumbering, setShowDocumentNumbering,
    showDocumentSettings, setShowDocumentSettings,
    showChartOfAccounts, setShowChartOfAccounts,
    showEditChartOfAccounts, setShowEditChartOfAccounts,
    showDataNotProvided, setShowDataNotProvided,
    showJournalEntry, setShowJournalEntry,
    showPostingTemplates, setShowPostingTemplates,
    showRecurringPostings, setShowRecurringPostings,
    showDocumentPrintingSelection, setShowDocumentPrintingSelection,
    showAssetMasterData, setShowAssetMasterData,
    showCapitalization, setShowCapitalization,
    showCapitalizationCreditMemo, setShowCapitalizationCreditMemo,
    showRetirement, setShowRetirement,
    showTransfer, setShowTransfer,
    showManualDepreciation, setShowManualDepreciation,
    showDepreciationRun, setShowDepreciationRun,
    showAssetRevaluation, setShowAssetRevaluation,
    showFiscalYearChange, setShowFiscalYearChange,
    showAssetDepreciationForecast, setShowAssetDepreciationForecast,
    showAssetHistorySheet, setShowAssetHistorySheet,
    showAssetStatusReport, setShowAssetStatusReport,
    showAssetTransactionReport, setShowAssetTransactionReport,
    showReconciliation, setShowReconciliation,
    showManagePreviousReconciliations, setShowManagePreviousReconciliations,
    showBudgetScenarios, setShowBudgetScenarios,
    showBudgetDistributionMethods, setShowBudgetDistributionMethods,
    showBudget, setShowBudget,
    showPMSSurchargeRate, setShowPMSSurchargeRate,
    showElectronicReportRESector, setShowElectronicReportRESector,
    showElectronicReportRERealEstateType, setShowElectronicReportRERealEstateType,
    showElectronicReportCRCSchedule, setShowElectronicReportCRCSchedule,
    showElectronicReportCRCGeneral, setShowElectronicReportCRCGeneral,
    showElectronicReportChallan, setShowElectronicReportChallan,
    showElectronicReportMonthWise, setShowElectronicReportMonthWise,
    showElectronicReportYearWise, setShowElectronicReportYearWise,
    showElectronicReportDHAB, setShowElectronicReportDHAB,
    showElectronicReportFixAsset, setShowElectronicReportFixAsset,
    showElectronicReportSurcharge, setShowElectronicReportSurcharge,
    showElectronicReportSurcharge2, setShowElectronicReportSurcharge2,
    showGLAccountsAndBP, setShowGLAccountsAndBP,
    showGeneralLedger, setShowGeneralLedger,
    showCustomerReceivablesAging, setShowCustomerReceivablesAging,
    showVendorLiabilitiesAging, setShowVendorLiabilitiesAging,
    showAgingProperties, setShowAgingProperties,
    showBlanketAgreementsList, setShowBlanketAgreementsList,
    showTransactionJournalReport, setShowTransactionJournalReport,
    showTransactionReportByProjects, setShowTransactionReportByProjects,
    showDocumentJournal, setShowDocumentJournal,
    showTaxReport, setShowTaxReport,
    showWithholdingTaxReport, setShowWithholdingTaxReport,
    showBalanceSheet, setShowBalanceSheet,
    showTrialBalance, setShowTrialBalance,
    showProfitAndLossStatement, setShowProfitAndLossStatement,
    showCashFlow, setShowCashFlow,
    showStatementOfCashFlows, setShowStatementOfCashFlows,
    showCashFlowForecast, setShowCashFlowForecast,
    showBalanceSheetComparison, setShowBalanceSheetComparison,
    showTrialBalanceComparison, setShowTrialBalanceComparison,
    showProfitLossComparison, setShowProfitLossComparison,
    showBudgetReport, setShowBudgetReport,
    showBalanceSheetBudget, setShowBalanceSheetBudget,
    showTrialBalanceBudget, setShowTrialBalanceBudget,
    showProfitLossBudget, setShowProfitLossBudget,
    showBudgetReportCategorized, setShowBudgetReportCategorized,
    showDimensions, setShowDimensions,
    showCostCenters, setShowCostCenters,
    showCostCenterTable, setShowCostCenterTable,
    showDistributionRules, setShowDistributionRules,
    showCostCenterHierarchy, setShowCostCenterHierarchy,
    showCostCenterReport, setShowCostCenterReport,
    showDistributionReport, setShowDistributionReport,
    showCostAccountingSummary, setShowCostAccountingSummary,
    showBudgetVersusCostAccounting, setShowBudgetVersusCostAccounting,
    showAccrualTypes, setShowAccrualTypes,
    showCostAccountingReconciliation, setShowCostAccountingReconciliation,
    showCostAccountingAdjustment, setShowCostAccountingAdjustment,
    showCostElements, setShowCostElements,
    showPrintPreferences, setShowPrintPreferences,
    showTooltipPreview, setShowTooltipPreview,
    showUsersSetup, setShowUsersSetup,
    showUserGroups, setShowUserGroups,
    showUserDefaults, setShowUserDefaults,
    showSalesEmployeesSetup, setShowSalesEmployeesSetup,
    showTerritoriesSetup, setShowTerritoriesSetup,
    showCommissionGroupsSetup, setShowCommissionGroupsSetup,
    showPredefinedTextSetup, setShowPredefinedTextSetup,
    showReferenceFieldLinksSetup, setShowReferenceFieldLinksSetup,
    showFreightSetup, setShowFreightSetup,
    showMessagePreferencesSetup, setShowMessagePreferencesSetup,
    showReportLayoutManager, setShowReportLayoutManager,
    showCrystalReportElementsSetup, setShowCrystalReportElementsSetup,
    showServerPrintConfig, setShowServerPrintConfig,
    showDashboardManager, setShowDashboardManager,
    showDashboardParametersSetup, setShowDashboardParametersSetup,
    showPasswordAdministration, setShowPasswordAdministration,
    showChangePassword, setShowChangePassword,
    showSiteUser, setShowSiteUser,
    showElectronicFileManagerSetup, setShowElectronicFileManagerSetup,
    showElectronicCertificatesSetup, setShowElectronicCertificatesSetup,
    showCrystalServerConfig, setShowCrystalServerConfig,
    showProcessChecklistTemplate, setShowProcessChecklistTemplate,
    showSapLinks, setShowSapLinks,
    showDunningHistoryReport, setShowDunningHistoryReport,
    showCreditLimitDeviation, setShowCreditLimitDeviation,
    showReconByDueDate, setShowReconByDueDate,
    showReconByExactAmount, setShowReconByExactAmount,
    showReconByTransNumber, setShowReconByTransNumber,
    showReconLocateByRowNumber, setShowReconLocateByRowNumber,
    showReconByExactSum, setShowReconByExactSum,
    showReconBySumFC, setShowReconBySumFC,
    showSelectionUsers, setShowSelectionUsers,
    showSelectionEmployees, setShowSelectionEmployees,
    showSelectionRecipientLists, setShowSelectionRecipientLists,
    showSelectionProperties, setShowSelectionProperties,
    showSelectionUdf, setShowSelectionUdf,
    showSelectionBusinessPartners, setShowSelectionBusinessPartners,
    // Banking visibility
    showIncomingPayments, setShowIncomingPayments,
    showCheckRegister, setShowCheckRegister,
    showCreditCardManagement, setShowCreditCardManagement,
    showCreditCardSummary, setShowCreditCardSummary,
    showOutgoingPayments, setShowOutgoingPayments,
    showChecksForPayment, setShowChecksForPayment,
    showVoidChecksForPayment, setShowVoidChecksForPayment,
    showChecksForPaymentDraftsReport, setShowChecksForPaymentDraftsReport,
    showPaymentDraftsReport, setShowPaymentDraftsReport,
    showChecksForPaymentDateCrossSection, setShowChecksForPaymentDateCrossSection,
    showBPBankAccountsQuery, setShowBPBankAccountsQuery,
    showHouseBankAccountsQuery, setShowHouseBankAccountsQuery,
    showExternalReconciliation, setShowExternalReconciliation,
    // window positions



    employeeWindow, setEmployeeWindow,
    timeSheetWindow, setTimeSheetWindow,
    familyDetailWindow, setFamilyDetailWindow,
    nextOfKinWindow, setNextOfKinWindow,
    finalSettlementWindow, setFinalSettlementWindow,
    tadaWindow, setTadaWindow,
    bpMasterWindow, setBpMasterWindow,
    activityWindow, setActivityWindow,
    opportunityWindow, setOpportunityWindow,
    salesOrderWindow, setSalesOrderWindow,
    customer360Window, setCustomer360Window,
    activitiesWindow, setActivitiesWindow,
    campaignsWindow, setCampaignsWindow,
    inactiveCustWindow, setInactiveCustWindow,
    oppStatsWindow, setOppStatsWindow,
    wonOppWindow, setWonOppWindow,
    purchaseRequestWindow, setPurchaseRequestWindow,
    purchaseQuotationWindow, setPurchaseQuotationWindow,
    purchaseOrderWindow, setPurchaseOrderWindow,
    goodsReceiptPOWindow, setGoodsReceiptPOWindow,
    goodsReturnRequestWindow, setGoodsReturnRequestWindow,
    goodsReturnWindow, setGoodsReturnWindow,
    apDownPaymentRequestWindow, setAPDownPaymentRequestWindow,
    apDownPaymentInvoiceWindow, setAPDownPaymentInvoiceWindow,
    apInvoiceWindow, setAPInvoiceWindow,
    apCreditMemoWindow, setAPCreditMemoWindow,
    apReserveInvoiceWindow, setAPReserveInvoiceWindow,
    recurringTransactionsWindow, setRecurringTransactionsWindow,
    recurringTransactionTemplatesWindow, setRecurringTransactionTemplatesWindow,
    landedCostsWindow, setLandedCostsWindow,
    shippingSetupWindow, setShippingSetupWindow,
    documentPrintingWindow, setDocumentPrintingWindow,
    openItemsListWindow, setOpenItemsListWindow,
    purchaseAnalysisWindow, setPurchaseAnalysisWindow,
    purchaseRequestReportWindow, setPurchaseRequestReportWindow,
    purchaseQuotationComparisonWindow, setPurchaseQuotationComparisonWindow,
    employeeCurrentInfoWindowPos, setEmployeeCurrentInfoWindowPos,
    payPeriodWindowPos, setPayPeriodWindowPos,
    gradeMasterWindowPos, setGradeMasterWindowPos,
    loanMasterWindowPos, setLoanMasterWindowPos,
    leaveMasterWindowPos, setLeaveMasterWindowPos,
    employeeCategoryMasterWindowPos, setEmployeeCategoryMasterWindowPos,
    shiftMasterWindowPos, setShiftMasterWindowPos,
    taxFormulaWindowPos, setTaxFormulaWindowPos,
    gradePayScaleWindowPos, setGradePayScaleWindowPos,
    monthlyAttendanceWindowPos, setMonthlyAttendanceWindowPos,
    payrollProcessWindowPos, setPayrollProcessWindowPos,
    loanApplicationWindowPos, setLoanApplicationWindowPos,
    leaveApplicationWindowPos, setLeaveApplicationWindowPos,
    payrollAdjustmentsWindowPos, setPayrollAdjustmentsWindowPos,
    chartOfAccountsWindowPos, setChartOfAccountsWindowPos,
    editChartOfAccountsPos, setEditChartOfAccountsPos,
    dataNotProvidedPos, setDataNotProvidedPos,
    journalEntryWindow, setJournalEntryWindow,
    postingTemplatesWindow, setPostingTemplatesWindow,
    recurringPostingsWindow, setRecurringPostingsWindow,
    documentPrintingSelectionWindow, setDocumentPrintingSelectionWindow,
    assetMasterDataWindow, setAssetMasterDataWindow,
    capitalizationWindow, setCapitalizationWindow,
    capitalizationCreditMemoWindow, setCapitalizationCreditMemoWindow,
    retirementWindow, setRetirementWindow,
    transferWindow, setTransferWindow,
    manualDepreciationWindow, setManualDepreciationWindow,
    depreciationRunWindow, setDepreciationRunWindow,
    assetRevaluationWindow, setAssetRevaluationWindow,
    fiscalYearChangeWindow, setFiscalYearChangeWindow,
    assetDepreciationForecastWindow, setAssetDepreciationForecastWindow,
    assetHistorySheetWindow, setAssetHistorySheetWindow,
    assetStatusReportWindow, setAssetStatusReportWindow,
    assetTransactionReportWindow, setAssetTransactionReportWindow,
    reconciliationWindow, setReconciliationWindow,
    managePreviousReconciliationsWindow, setManagePreviousReconciliationsWindow,
    budgetScenariosWindow, setBudgetScenariosWindow,
    budgetDistributionMethodsWindow, setBudgetDistributionMethodsWindow,
    budgetWindow, setBudgetWindow,
    pmsSurchargeRateWindow, setPMSSurchargeRateWindow,
    electronicReportRESectorWindow, setElectronicReportRESectorWindow,
    electronicReportRERealEstateTypeWindow, setElectronicReportRERealEstateTypeWindow,
    electronicReportCRCScheduleWindow, setElectronicReportCRCScheduleWindow,
    electronicReportCRCGeneralWindow, setElectronicReportCRCGeneralWindow,
    electronicReportChallanWindow, setElectronicReportChallanWindow,
    electronicReportMonthWiseWindow, setElectronicReportMonthWiseWindow,
    electronicReportYearWiseWindow, setElectronicReportYearWiseWindow,
    electronicReportDHABWindow, setElectronicReportDHABWindow,
    electronicReportFixAssetWindow, setElectronicReportFixAssetWindow,
    electronicReportSurchargeWindow, setElectronicReportSurchargeWindow,
    electronicReportSurcharge2Window, setElectronicReportSurcharge2Window,
    gLAccountsAndBPWindow, setGLAccountsAndBPWindow,
    generalLedgerWindow, setGeneralLedgerWindow,
    customerReceivablesAgingWindow, setCustomerReceivablesAgingWindow,
    vendorLiabilitiesAgingWindow, setVendorLiabilitiesAgingWindow,
    agingPropertiesWindow, setAgingPropertiesWindow,
    blanketAgreementsListWindow, setBlanketAgreementsListWindow,
    transactionJournalReportWindow, setTransactionJournalReportWindow,
    transactionReportByProjectsWindow, setTransactionReportByProjectsWindow,
    documentJournalWindow, setDocumentJournalWindow,
    taxReportWindow, setTaxReportWindow,
    withholdingTaxReportWindow, setWithholdingTaxReportWindow,
    balanceSheetWindow, setBalanceSheetWindow,
    trialBalanceWindow, setTrialBalanceWindow,
    profitAndLossStatementWindow, setProfitAndLossStatementWindow,
    cashFlowWindow, setCashFlowWindow,
    statementOfCashFlowsWindow, setStatementOfCashFlowsWindow,
    cashFlowForecastWindow, setCashFlowForecastWindow,
    balanceSheetComparisonWindow, setBalanceSheetComparisonWindow,
    trialBalanceComparisonWindow, setTrialBalanceComparisonWindow,
    profitLossComparisonWindow, setProfitLossComparisonWindow,
    budgetReportWindow, setBudgetReportWindow,
    balanceSheetBudgetWindow, setBalanceSheetBudgetWindow,
    trialBalanceBudgetWindow, setTrialBalanceBudgetWindow,
    profitLossBudgetWindow, setProfitLossBudgetWindow,
    budgetReportCategorizedWindow, setBudgetReportCategorizedWindow,
    dimensionsWindow, setDimensionsWindow,
    costCentersWindow, setCostCentersWindow,
    costCenterTableWindow, setCostCenterTableWindow,
    distributionRulesWindow, setDistributionRulesWindow,
    costCenterHierarchyWindow, setCostCenterHierarchyWindow,
    costCenterReportWindow, setCostCenterReportWindow,
    distributionReportWindow, setDistributionReportWindow,
    costAccountingSummaryWindow, setCostAccountingSummaryWindow,
    budgetVersusCostAccountingWindow, setBudgetVersusCostAccountingWindow,
    accrualTypesWindow, setAccrualTypesWindow,
    costAccountingReconciliationWindow, setCostAccountingReconciliationWindow,
    costAccountingAdjustmentWindow, setCostAccountingAdjustmentWindow,
    costElementsWindow, setCostElementsWindow,
    chooseCompanyWindowPos, setChooseCompanyWindowPos,
    exchangeRatesWindowPos, setExchangeRatesWindowPos,
    companyDetailsWindowPos, setCompanyDetailsWindowPos,
    generalSettingsWindowPos, setGeneralSettingsWindowPos,
    postingPeriodsWindowPos, setPostingPeriodsWindowPos,
    documentNumberingWindowPos, setDocumentNumberingWindowPos,
    documentSettingsWindowPos, setDocumentSettingsWindowPos,
    printPreferencesWindowPos, setPrintPreferencesWindowPos,
    tooltipPreviewWindowPos, setTooltipPreviewWindowPos,
    usersSetupWindowPos, setUsersSetupWindowPos,
    userGroupsWindowPos, setUserGroupsWindowPos,
    userDefaultsWindowPos, setUserDefaultsWindowPos,
    salesEmployeesSetupWindowPos, setSalesEmployeesSetupWindowPos,
    territoriesSetupPos, setTerritoriesSetupPos,
    commissionGroupsSetupPos, setCommissionGroupsSetupPos,
    predefinedTextSetupPos, setPredefinedTextSetupPos,
    referenceFieldLinksSetupPos, setReferenceFieldLinksSetupPos,
    freightSetupPos, setFreightSetupPos,
    messagePreferencesSetupPos, setMessagePreferencesSetupPos,
    reportLayoutManagerPos, setReportLayoutManagerPos,
    crystalReportElementsSetupPos, setCrystalReportElementsSetupPos,
    serverPrintConfigPos, setServerPrintConfigPos,
    dashboardManagerPos, setDashboardManagerPos,
    dashboardParametersSetupPos, setDashboardParametersSetupPos,
    passwordAdminWindowPos, setPasswordAdminWindowPos,
    changePasswordWindowPos, setChangePasswordWindowPos,
    siteUserWindowPos, setSiteUserWindowPos,
    electronicFileManagerPos, setElectronicFileManagerPos,
    electronicCertificatesPos, setElectronicCertificatesPos,
    crystalServerConfigPos, setCrystalServerConfigPos,
    processChecklistTemplatePos, setProcessChecklistTemplatePos,
    sapLinksPos, setSapLinksPos,
    dunningHistoryReportPos, setDunningHistoryReportPos,
    creditLimitDeviationPos, setCreditLimitDeviationPos,
    reconByDueDatePos, setReconByDueDatePos,
    reconByExactAmountPos, setReconByExactAmountPos,
    reconByTransNumberPos, setReconByTransNumberPos,
    reconLocateByRowNumberPos, setReconLocateByRowNumberPos,
    reconByExactSumPos, setReconByExactSumPos,
    reconBySumFCPos, setReconBySumFCPos,
    selectionUsersPos, setSelectionUsersPos,
    selectionEmployeesPos, setSelectionEmployeesPos,
    selectionRecipientListsPos, setSelectionRecipientListsPos,
    selectionPropertiesPos, setSelectionPropertiesPos,
    selectionUdfPos, setSelectionUdfPos,
    selectionBusinessPartnersPos, setSelectionBusinessPartnersPos,
    // Banking positions
    incomingPaymentsPos, setIncomingPaymentsPos,
    checkRegisterPos, setCheckRegisterPos,
    creditCardManagementPos, setCreditCardManagementPos,
    creditCardSummaryPos, setCreditCardSummaryPos,
    outgoingPaymentsPos, setOutgoingPaymentsPos,
    checksForPaymentPos, setChecksForPaymentPos,
    voidChecksForPaymentPos, setVoidChecksForPaymentPos,
    checksForPaymentDraftsReportPos, setChecksForPaymentDraftsReportPos,
    paymentDraftsReportPos, setPaymentDraftsReportPos,
    checksForPaymentDateCrossSectionPos, setChecksForPaymentDateCrossSectionPos,
    bpBankAccountsQueryPos, setBPBankAccountsQueryPos,
    houseBankAccountsQueryPos, setHouseBankAccountsQueryPos,
    externalReconciliationPos, setExternalReconciliationPos,
  };



}

export type WindowManagerReturn = ReturnType<typeof useWindowManager>;
