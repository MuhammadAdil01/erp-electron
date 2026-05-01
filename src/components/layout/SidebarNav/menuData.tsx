import React from 'react';
import {
  Settings, TrendingUp, User, Package, Users, DollarSign,
  Cpu, Wrench, Activity, Briefcase, BarChart2, Folder,
  Home, ShoppingCart, Globe, Gauge, Files, Zap, FileText, BarChart3, Box, FileCheck
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MenuSubItem {
  name: string;
  icon?: React.ReactNode;
  subItems?: MenuSubItem[];
  isOpen?: boolean;
  isHeader?: boolean;
  isHighlighted?: boolean;
}

// ─── Shared icon helpers ──────────────────────────────────────────────────────
const docIcon = (
  <div className="w-3 h-2.5 border border-[#3b82f6] rounded-[1px] relative bg-white shrink-0 overflow-hidden shadow-sm">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#3b82f6]/40" />
  </div>
);

const folderIcon = <Folder className="w-3.5 h-3.5 text-blue-500" />;
const fileIcon   = <FileText className="w-3.5 h-3.5 text-blue-500" />;
const subFileIcon = <FileText className="w-3 h-3 text-blue-500" />;
const subFolderIcon = <Folder className="w-3 h-3 text-blue-500" />;
const checkedDocIcon = <FileCheck className="w-3 h-3 text-blue-500" />;
const questionDocIcon = (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 border border-blue-500 rounded-[1px] bg-white relative">
    <span className="text-[9px] font-bold text-blue-600 leading-none">?</span>
  </div>
);

// ─── Modules data ─────────────────────────────────────────────────────────────
export const modulesData: MenuSubItem[] = [
  {
    name: 'Administration',
    icon: <Settings className="w-3.5 h-3.5 text-orange-600" />,
    subItems: [
      { name: 'Choose Company',            icon: fileIcon },
      { name: 'Exchange Rates & Indexes',  icon: fileIcon },
      {
        name: 'System Initialization', icon: folderIcon,
        subItems: [
          { name: 'Company Details',   icon: subFileIcon },
          { name: 'General Settings',  icon: subFileIcon },
          { name: 'Posting Periods',   icon: subFileIcon },
          {
            name: 'Authorizations', icon: subFolderIcon,
            subItems: [
              { name: 'Company Admin',                    icon: subFileIcon, isHighlighted: false },
              { name: 'General Authorizations',           icon: docIcon },
              { name: 'Additional Authorization Creator', icon: docIcon },
            ],
          },
          { name: 'Document Numbering', icon: subFileIcon },
          { name: 'Document Settings',  icon: subFileIcon },
          { name: 'Print Preferences',  icon: subFileIcon },
          { name: 'Menu Structure',     icon: subFileIcon },
          { name: 'Opening Balances',   icon: subFolderIcon },
          { name: 'Implementation Center', icon: subFolderIcon },
          { name: 'Tooltip Preview',    icon: subFileIcon },
        ],
      },
      {
        name: 'Setup', icon: folderIcon,
        subItems: [
          {
            name: 'General', icon: subFolderIcon,
            subItems: [
              { name: 'Users', icon: subFileIcon }, { name: 'User Groups', icon: subFileIcon },
              { name: 'User Defaults', icon: subFileIcon }, { name: 'Sales Employees/Buyers', icon: subFileIcon },
              { name: 'Territories', icon: subFileIcon }, { name: 'Commission Groups', icon: subFileIcon },
              { name: 'Predefined Text', icon: subFileIcon }, { name: 'Reference Field Links', icon: subFileIcon },
              { name: 'Freight', icon: subFileIcon }, { name: 'Message Preferences', icon: subFileIcon },
              { name: 'Report and Layout Manager', icon: subFileIcon },
              { name: 'Default Elements for SAP Crystal Reports', icon: subFileIcon },
              { name: 'Server Print Configuration', icon: subFileIcon },
              { name: 'Dashboard Manager', icon: subFileIcon }, { name: 'Dashboard Parameters', icon: subFileIcon },
              { name: 'Electronic File Manager', icon: subFileIcon }, { name: 'Electronic Certificates', icon: subFileIcon },
              { name: 'Crystal Server Configuration', icon: subFileIcon }, { name: 'SAP Links', icon: subFileIcon },
              { name: 'Process Checklist Template', icon: subFileIcon },
              {
                name: 'Security', icon: subFolderIcon,
                subItems: [
                  { name: 'Password Administration', icon: docIcon },
                  { name: 'Change Password', icon: docIcon },
                  { name: 'Site User', icon: docIcon },
                ],
              },
            ],
          },
          {
            name: 'Financials', icon: subFolderIcon,
            subItems: [
              { name: 'Edit Chart of Accounts', icon: subFileIcon }, { name: 'G/L Account Determination', icon: subFileIcon },
              { name: 'Currencies', icon: subFileIcon }, { name: 'Indexes', icon: subFileIcon },
              { name: 'Transaction Codes', icon: subFileIcon }, { name: 'Projects', icon: subFileIcon },
              { name: 'Period Indicators', icon: subFileIcon }, { name: 'Doubtful Debts', icon: subFileIcon },
              { name: 'Cash Flow Line Items', icon: subFileIcon }, { name: 'Financial KPI Factors', icon: subFileIcon },
              { name: 'Tax', icon: subFolderIcon }, { name: 'Fixed Assets', icon: subFolderIcon },
              { name: 'Expense Types', icon: subFileIcon },
            ],
          },
          {
            name: 'Opportunities', icon: subFolderIcon,
            subItems: [
              { name: 'Opportunity Stages', icon: subFileIcon }, { name: 'Partners', icon: subFileIcon },
              { name: 'Competitors', icon: subFileIcon }, { name: 'Relationships', icon: subFileIcon },
            ],
          },
          { name: 'Sales',    icon: subFolderIcon, subItems: [{ name: 'ATP Checking Rule List', icon: subFileIcon }] },
          { name: 'Purchasing', icon: subFolderIcon, subItems: [{ name: 'Landed Costs', icon: subFileIcon }] },
          {
            name: 'Business Partners', icon: subFolderIcon,
            subItems: [
              { name: 'Countries/Regions', icon: subFileIcon }, { name: 'Address Formats', icon: subFileIcon },
              { name: 'Customer Groups', icon: subFileIcon }, { name: 'Vendor Groups', icon: subFileIcon },
              { name: 'Business Partner Properties', icon: subFileIcon }, { name: 'Business Partner Priorities', icon: subFileIcon },
              { name: 'Dunning Terms', icon: subFileIcon }, { name: 'Payment Terms', icon: subFileIcon },
              { name: 'Payment Blocks', icon: subFileIcon }, { name: 'Target Group', icon: subFileIcon },
              { name: 'E-Mail Group', icon: subFileIcon },
            ],
          },
          {
            name: 'Banking', icon: subFolderIcon,
            subItems: [
              { name: 'Banks', icon: subFileIcon }, { name: 'House Bank Accounts', icon: subFileIcon },
              { name: 'Credit Cards', icon: subFileIcon }, { name: 'Credit Card Payment', icon: subFileIcon },
              { name: 'Credit Card Payment Methods', icon: subFileIcon }, { name: 'Credit Vendors', icon: subFileIcon },
              { name: 'Bank Charges Allocation Codes', icon: subFileIcon }, { name: 'Payment Methods', icon: subFileIcon },
            ],
          },
          {
            name: 'Inventory', icon: subFolderIcon,
            subItems: [
              { name: 'Item Groups', icon: subFileIcon }, { name: 'Item Properties', icon: subFileIcon },
              { name: 'Warehouses', icon: subFileIcon }, { name: 'Units of Measure', icon: subFileIcon },
              { name: 'Unit of Measure Groups', icon: subFileIcon }, { name: 'Length and Width', icon: subFileIcon },
              { name: 'Weight', icon: subFileIcon }, { name: 'Customs Groups', icon: subFileIcon },
              { name: 'Manufacturers', icon: subFileIcon }, { name: 'Shipping Types', icon: subFileIcon },
              { name: 'Locations', icon: subFileIcon }, { name: 'Inventory Cycles', icon: subFileIcon },
              { name: 'Cycle Count Determination', icon: subFileIcon }, { name: 'Package Types', icon: subFileIcon },
            ],
          },
          { name: 'Resources', icon: subFolderIcon, subItems: [{ name: 'Resource Groups', icon: subFileIcon }, { name: 'Resource Properties', icon: subFileIcon }] },
          { name: 'Service',   icon: subFolderIcon, subItems: [{ name: 'Contract Templates', icon: subFileIcon }, { name: 'Queues', icon: subFileIcon }] },
          { name: 'Human Resources', icon: subFolderIcon, subItems: [{ name: 'Time Sheet', icon: subFolderIcon }] },
          { name: 'Project Management', icon: subFolderIcon, subItems: [{ name: 'Stages', icon: subFileIcon }] },
          { name: 'Production', icon: subFolderIcon, subItems: [{ name: 'Route Stages', icon: subFileIcon }] },
          { name: 'Electronic Documents', icon: subFolderIcon, subItems: [{ name: 'PEPPOL BIS Code Lists', icon: subFileIcon }] },
        ],
      },
      {
        name: 'Utilities', icon: folderIcon,
        subItems: [
          { name: 'Period-End Closing', icon: subFileIcon }, { name: 'Check Document Numbering', icon: subFileIcon },
          { name: 'Duplicate Layout Template', icon: subFileIcon }, { name: 'Transfer Posting Correction Wizard', icon: subFileIcon },
          { name: 'Master Data Cleanup Wizard', icon: subFileIcon }, { name: 'Manual Master Data Series Converter', icon: subFileIcon },
          { name: 'UI Configuration Template', icon: subFileIcon }, { name: 'Connected Clients', icon: subFileIcon },
          { name: 'Change Logs Cleanup', icon: subFileIcon },
        ],
      },
      {
        name: 'Approval Process', icon: folderIcon,
        subItems: [
          { name: 'Approval Stages', icon: subFileIcon }, { name: 'Approval Templates', icon: subFileIcon },
          { name: 'Approval Status Report', icon: subFileIcon }, { name: 'Approval Decision Report', icon: subFileIcon },
          { name: 'Substitute Authorizer for Approval Templates', icon: subFileIcon },
        ],
      },
      {
        name: 'License', icon: folderIcon,
        subItems: [
          { name: 'License Administration', icon: subFileIcon }, { name: 'Add-On Identifier Generator', icon: subFileIcon },
          { name: 'Support User Log', icon: subFileIcon }, { name: 'License Information', icon: subFileIcon },
        ],
      },
      { name: 'Alerts Management', icon: fileIcon },
    ],
  },
  {
    name: 'Financials',
    icon: <TrendingUp className="w-3.5 h-3.5 text-yellow-500" />,
    subItems: [
      { name: 'Chart of Accounts', icon: docIcon },
      { name: 'Edit Chart of Accounts', icon: docIcon },
      { name: 'Journal Entry', icon: docIcon },
      { name: 'Posting Templates', icon: docIcon },
      { name: 'Recurring Postings', icon: docIcon },
      { name: 'Document Printing', icon: docIcon },
      {
        name: 'Fixed Assets',
        icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
        subItems: [
          { name: 'Asset Master Data' },
          { name: 'Capitalization' },
          { name: 'Capitalization Credit Memo' },
          { name: 'Retirement' },
          { name: 'Transfer' },
          { name: 'Manual Depreciation' },
          { name: 'Depreciation Run' },
          { name: 'Asset Revaluation' },
          { name: 'Fiscal Year Change' },
          {
            name: 'Fixed Asset Reports',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'Asset Depreciation Forecast Report', icon: docIcon },
              { name: 'Asset History Sheet', icon: docIcon },
              { name: 'Asset Status Report', icon: docIcon },
              { name: 'Asset Transaction Report', icon: docIcon },
            ],
          },
        ],
      },
      {
        name: 'Internal Reconciliations',
        icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
        subItems: [
          { name: 'Reconciliation', icon: docIcon },
          { name: 'Manage Previous Reconciliations', icon: docIcon },
        ]
      },
      {
        name: 'Budget Setup',
        icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
        subItems: [
          { name: 'Budget Scenarios', icon: docIcon },
          { name: 'Budget Distribution Methods', icon: docIcon },
          { name: 'Budget', icon: docIcon },
        ]
      },
      {
        name: 'Cost Accounting',
        icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
        subItems: [
          { name: 'Dimensions', icon: docIcon },
          { name: 'Cost Centers', icon: docIcon },
          { name: 'Distribution Rules', icon: docIcon },
          { name: 'Table of Cost Centers and Distribution Rules', icon: docIcon },
          { name: 'Cost Center Hierarchy', icon: docIcon },
          { name: 'Cost Center Report', icon: docIcon },
          { name: 'Distribution Report', icon: docIcon },
          { name: 'Cost Accounting Summary Report', icon: docIcon },
          { name: 'Budget Versus Cost Accounting', icon: docIcon },
          { name: 'Accrual Type', icon: docIcon },
          { name: 'Cost Accounting Reconciliation Report', icon: docIcon },
          { name: 'Journal Entry for Cost Accounting Adjustment', icon: docIcon },
          { name: 'Cost Elements', icon: docIcon },
        ]
      },
      { name: 'PMS Surcharge Rate', icon: docIcon },
      {
        name: 'Financial Reports',
        icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
        subItems: [
          {
            name: 'Electronic Reports',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'Real Estate - Summary of Receivable (Sectors)', icon: checkedDocIcon },
              { name: 'Real Estate - Summary of Receivable (Real Estate Type)', icon: checkedDocIcon },
              { name: 'Customer Receivable & Collection - Schedule', icon: checkedDocIcon },
              { name: 'Customer Receivable & Collection - General', icon: checkedDocIcon },
              { name: 'Comprehensive Challan Report', icon: checkedDocIcon },
              { name: 'Month Wise Period Receivable Report', icon: checkedDocIcon },
              { name: 'Year Wise Period Receivable Report', icon: checkedDocIcon },
              { name: 'DHAB Pay Slip', icon: checkedDocIcon },
              { name: 'Fix Asset Report', icon: checkedDocIcon },
              { name: 'Report - Surcharge Calculation', icon: checkedDocIcon },
              { name: 'Report - Surcharge Calculation 2', icon: checkedDocIcon },
            ],
          },
          {
            name: 'Accounting',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'G/L Accounts and Business Partners', icon: subFileIcon },
              { name: 'General Ledger', icon: subFileIcon },
              { 
                name: 'Aging', 
                icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
                subItems: [
                  { name: 'Customer Receivables Aging', icon: subFileIcon },
                  { name: 'Vendor Liabilities Aging', icon: subFileIcon },
                ]
              },
              { name: 'Transaction Journal Report', icon: subFileIcon },
              { name: 'Transaction Report by Projects', icon: subFileIcon },
              { name: 'Locate Journal Transaction by Amount Range', icon: subFileIcon },
              { name: 'Locate Journal Transaction by FC Amount Range', icon: subFileIcon },
              { name: 'Document Journal', icon: subFileIcon },
              { 
                name: 'Tax', 
                icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
                subItems: [
                  { name: 'Tax Report', icon: subFileIcon },
                  { name: 'Withholding Tax Report', icon: subFileIcon },
                ]
              },
            ],
          },
          {
            name: 'Financial',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'Balance Sheet', icon: subFileIcon },
              { name: 'Trial Balance', icon: subFileIcon },
              { name: 'Profit and Loss Statement', icon: subFileIcon },
              { name: 'Cash Flow', icon: subFileIcon },
              { name: 'Statement of Cash Flows', icon: subFileIcon },
              { name: 'Cash Flow Forecast', icon: subFileIcon },
            ],
          },
          {
            name: 'Comparison',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'Balance Sheet Comparison', icon: subFileIcon },
              { name: 'Trial Balance Comparison', icon: subFileIcon },
              { name: 'Profit and Loss Statement Comparison', icon: subFileIcon },
            ],
          },
          {
            name: 'Budget Reports',
            icon: <Folder className="w-3 h-3 text-blue-500 fill-blue-500/20" />,
            subItems: [
              { name: 'Budget Report', icon: subFileIcon },
              { name: 'Balance Sheet Budget Report', icon: subFileIcon },
              { name: 'Trial Balance Budget Report', icon: subFileIcon },
              { name: 'Profit and Loss Statement Budget Report', icon: subFileIcon },
              { name: 'Budget Report Categorized', icon: checkedDocIcon },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'CRM',
    icon: <User className="w-3.5 h-3.5 text-blue-500" />,
    subItems: [
      { name: 'Business Partner Master Data' },
      { name: 'Activity' },
      { name: 'Opportunity' },
      { name: 'Sales Order' },
      { name: 'Customer 360' },
      {
        name: 'CRM Report',
        subItems: [
          { name: 'My Activities' }, { name: 'Activities Overview' },
          { name: 'Inactive Customers' }, { name: 'Campaigns List' },
          {
            name: 'Opportunities Reports',
            subItems: [
              { name: 'Opportunities Forecast Report' }, { name: 'Opportunities Forecast Over Time Report' },
              { name: 'Opportunities Statistics Report' }, { name: 'Opportunities Report' },
              { name: 'Stage Analysis' }, { name: 'Information Source Distribution Over Time Report' },
              { name: 'Won Opportunities Report' }, { name: 'Lost Opportunities Report' },
              { name: 'My Open Opportunities Report' }, { name: 'My Closed Opportunities Report' },
              { name: 'Opportunities Pipeline' },
            ],
          },
        ],
      },
    ],
  },
  { name: 'Sales - A/R',       icon: <TrendingUp className="w-3.5 h-3.5 text-blue-700" /> },
 
  { 
    name: 'Business Partners', 
    icon: <Users className="w-3.5 h-3.5 text-amber-800" />,
    subItems: [
      { name: 'Business Partner Master Data', icon: docIcon },
      { name: 'Activity', icon: docIcon },
      {
        name: 'Internal Reconciliations', icon: folderIcon,
        subItems: [
          { name: 'Reconciliation', icon: docIcon },
          { name: 'Manage Previous Reconciliations', icon: docIcon },
        ],
      },
      {
        name: 'Business Partner Reports', icon: folderIcon,
        subItems: [
          { name: 'My Activities', icon: docIcon },
          { name: 'Activities Overview', icon: docIcon },
          { name: 'Inactive Customers', icon: docIcon },
          { name: 'Dunning History Report', icon: docIcon },
          { name: 'Customer Receivables by Customer Cross-Section', icon: questionDocIcon },
          { name: 'Customers Credit Limit Deviation', icon: questionDocIcon },
          {
            name: 'Internal Reconciliation', icon: subFolderIcon,
            subItems: [
              { name: 'Internal Reconciliation by Due Date', icon: questionDocIcon },
              { name: 'Internal Reconciliation by Exact Amount', icon: questionDocIcon },
              { name: 'Internal Reconciliation by Trans. Number', icon: questionDocIcon },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Banking',
    icon: <DollarSign className="w-3.5 h-3.5 text-green-700" />,
    subItems: [
      {
        name: 'Incoming Payments',
        icon: subFolderIcon,
        subItems: [
          { name: 'Incoming Payments', icon: docIcon },
          { name: 'Check Register', icon: docIcon },
          { name: 'Credit Card Management', icon: docIcon },
          { name: 'Credit Card Summary', icon: docIcon },
        ],
      },
      {
        name: 'Outgoing Payments',
        icon: subFolderIcon,
        subItems: [
          { name: 'Outgoing Payments', icon: docIcon },
          { name: 'Checks for Payment', icon: docIcon },
          { name: 'Void Checks for Payment', icon: docIcon },
          { name: 'Checks for Payment Drafts Report', icon: docIcon },
        ],
      },
      {
        name: 'Banking Reports',
        icon: subFolderIcon,
        subItems: [
          { name: 'Payment Drafts Report', icon: docIcon },
          { name: 'Checks for Payment in Date Cross Section Report', icon: questionDocIcon },
          { name: 'BP Bank Accounts Query', icon: questionDocIcon },
          { name: 'House Bank Accounts Query', icon: questionDocIcon },
        ],
      },
      {
        name: 'External Reconciliation',
        icon: subFolderIcon,
        subItems: [
          { name: 'Locate Reconciliation in Bank Statement by Row Number', icon: docIcon },
          { name: 'Locate Reconciliation Row in Bank Statements by Exact Amount', icon: docIcon },
          { name: 'External Reconciliation by Due Date', icon: docIcon },
          { name: 'External Reconciliation by Exact Sum', icon: docIcon },
          { name: 'External Reconciliation by Sum (FC)', icon: docIcon },
          { name: 'External Reconciliation by Trans. Number', icon: docIcon },
        ],
      },
    ],
  },
  { name: 'Inventory',         icon: <Package className="w-3.5 h-3.5 text-orange-500" /> },
  { name: 'Resources',         icon: <Cpu className="w-3.5 h-3.5 text-blue-400" /> },
  { name: 'Production',        icon: <Wrench className="w-3.5 h-3.5 text-gray-600" /> },
  { name: 'MRP',               icon: <Activity className="w-3.5 h-3.5 text-red-500" /> },
  {
    name: 'HR Payroll',
    icon: (
      <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-red-600 [clip-path:polygon(0%_0%,100%_50%,0%_100%,25%_50%)]" />
      </div>
    ),
    subItems: [
      {
        name: 'Masters',
        icon: <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]/20" />,
        subItems: [
          { name: 'Employee Current Information', icon: docIcon },
          { name: 'Pay Period Master', icon: docIcon },
          { name: 'Grade Master', icon: docIcon },
          { name: 'Loan Master', icon: docIcon },
          { name: 'Leave Master', icon: docIcon },
          { name: 'Employee Category Master', icon: docIcon },
          { name: 'Shift Master', icon: docIcon },
          { name: 'TaxFormulaMaster', icon: docIcon },
          { name: 'Grade Pay Scale', icon: docIcon },
        ],
      },
      {
        name: 'Transaction',
        icon: <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]/20" />,
        subItems: [
          { name: 'Monthly Attendance Sheet', icon: docIcon },
          { name: 'Payroll Process', icon: docIcon },
          { name: 'Loan Application', icon: docIcon },
          { name: 'Leave Application', icon: docIcon },
          { name: 'Payroll Monthly Adjustments', icon: docIcon },
        ],
      },
    ],
  },
  { name: 'Service', icon: <Wrench className="w-3.5 h-3.5 text-cyan-600" /> },
  {
    name: 'Human Resources',
    icon: <Users className="w-3.5 h-3.5 text-green-600" />,
    subItems: [
      { name: 'Employee Master Data' }, { name: 'Time Sheet' }, { name: 'Family Detail' },
      { name: 'Next of Kin' }, { name: 'Final Settlement' }, { name: 'TA/DA' },
    ],
  },
  { name: 'Project Management', icon: <Briefcase className="w-3.5 h-3.5 text-orange-800" /> },
  { name: 'Reports',            icon: <BarChart2 className="w-3.5 h-3.5 text-indigo-900" /> },
];

export const cockpitData: MenuSubItem[] = [
  { name: 'My Cockpit', icon: <Box className="w-3.5 h-3.5 text-slate-600" />, isHeader: true },
  { name: 'Home',    icon: <Home className="w-3.5 h-3.5 text-slate-600" /> },
  { name: 'Sales',   icon: <Users className="w-3.5 h-3.5 text-green-600" /> },
  { name: 'Service', icon: <Wrench className="w-3.5 h-3.5 text-blue-600" /> },
  { name: 'Finance', icon: <TrendingUp className="w-3.5 h-3.5 text-yellow-600" /> },
  {
    name: 'Purchasing (Current)',
    icon: <ShoppingCart className="w-3.5 h-3.5 text-blue-700" />,
    isHighlighted: true,
    subItems: [
      { name: 'Purchase Request', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Purchase Quotation', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Purchase Order', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Goods Receipt PO', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Goods Return Request', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Goods Return', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'A/P Down Payment Request', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'A/P Down Payment Invoice', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'A/P Invoice', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'A/P Credit Memo', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'A/P Reserve Invoice', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Recurring Transactions', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Recurring Transaction Templates', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Landed Costs', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Document Printing', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      {
        name: 'Purchasing Reports', icon: <Folder className="w-3 h-3 text-blue-500" />,
        subItems: [
          { name: 'Open Items List', icon: <FileText className="w-3 h-3 text-slate-500" /> },
          { name: 'Purchase Analysis', icon: <FileText className="w-3 h-3 text-slate-500" /> },
          { name: 'Purchase Request Report', icon: <FileText className="w-3 h-3 text-slate-500" /> },
          { name: 'Purchase Quotation Comparison Report', icon: <FileText className="w-3 h-3 text-slate-500" /> },
        ],
      },
    ],
  },
  { name: 'Widget Gallery', icon: <Settings className="w-3.5 h-3.5 text-slate-600" />, isHeader: true },
  {
    name: 'General Widgets', icon: <Folder className="w-3.5 h-3.5 text-[#3498db]" />,
    subItems: [
      { name: 'Common Functions', icon: <FileText className="w-3 h-3 text-slate-500" /> },
      { name: 'Open Documents', icon: <Files className="w-3 h-3 text-green-600" /> },
      { name: 'Messages and Alerts', icon: <Zap className="w-3 h-3 text-red-600" /> },
      { name: 'Browser', icon: <Globe className="w-3 h-3 text-blue-400" /> },
      { name: 'KPI Widget', icon: <BarChart3 className="w-3 h-3 text-blue-600" /> },
      { name: 'Dashboard Widget', icon: <Gauge className="w-3 h-3 text-orange-500" /> },
    ],
  },
];
