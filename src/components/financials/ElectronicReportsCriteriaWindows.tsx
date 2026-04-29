import React from 'react';
import { ResizableCriteriaWindow } from '../ui/ResizableCriteriaWindow';
import { Calendar, ChevronDown, List } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

const ElectronicReportShell: React.FC<Props & { title: string; children: React.ReactNode }> = ({ windowState, onClose, onUpdateState, onFocus, title, children }) => {
  return (
    <ResizableCriteriaWindow
      title={title}
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={450}
      initialHeight={250}
      footer={
        <div className="h-[40px] bg-[#f0f0f0] border-t border-gray-300 p-2.5 flex gap-2 shrink-0">
           <button className="px-6 h-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner" onClick={onClose}>OK</button>
           <button className="px-6 h-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="flex-1 p-3 pb-4 flex flex-col gap-1 overflow-visible">
        {children}
      </div>
    </ResizableCriteriaWindow>
  );
};

// --- Form Elements ---
const YellowCombo = () => (
  <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-[#fff9c4] px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
      <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
    </div>
  </div>
);

const WhiteCombo = () => (
  <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-white px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
      <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
    </div>
  </div>
);

const YellowDate = () => (
   <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-[#fff9c4] px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center cursor-pointer">
      <Calendar className="w-2.5 h-2.5 text-[#ffcc66]" />
    </div>
  </div>
);

const WhiteDate = () => (
   <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-white px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center cursor-pointer">
      <Calendar className="w-2.5 h-2.5 text-[#ffcc66]" />
    </div>
  </div>
);

const YellowList = () => (
   <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-[#fff9c4] px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
      <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center"></div>
    </div>
  </div>
);

const WhiteList = () => (
   <div className="relative w-32 h-[18px]">
    <input type="text" className="w-full h-full border border-gray-400 bg-white px-1 outline-none text-[10.5px]" />
    <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
      <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center"></div>
    </div>
  </div>
);

const WhiteInput = () => <input type="text" className="w-32 h-[18px] border border-gray-400 bg-white px-1 outline-none text-[10.5px]" />;
const YellowInput = () => <input type="text" className="w-32 h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none text-[10.5px]" />;

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center text-[10.5px] mt-0.5">
    <div className="w-[140px] text-gray-700">{label}</div>
    {children}
  </div>
);

// --- Window Definitions ---

export const ElectronicReportRESectorWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Real Estate - Summary of Receivable (Sectors)- Selection Criteria" {...props}>
    <FieldRow label="Enter Sector:"><YellowCombo /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportRERealEstateTypeWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Real Estate - Summary of Receivable (Real Estate Type)- Selection Criteria" {...props}>
    <FieldRow label="Enter Sector:"><YellowCombo /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportCRCScheduleWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Customer Receivable & Collection - Schedule- Selection Criteria" {...props}>
    <FieldRow label="Enter Ballot:"><YellowCombo /></FieldRow>
    <FieldRow label="Enter Ballot Reference:"><YellowCombo /></FieldRow>
    <FieldRow label="Enter Real-Estate Type:"><WhiteCombo /></FieldRow>
    <FieldRow label="Enter Sector:"><WhiteInput /></FieldRow>
    <FieldRow label="Date"><WhiteDate /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportCRCGeneralWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Customer Receivable & Collection - General- Selection Criteria" {...props}>
    <FieldRow label="Enter Ballot:"><YellowCombo /></FieldRow>
    <FieldRow label="Enter Ballot Reference:"><YellowCombo /></FieldRow>
    <FieldRow label="Enter Real-Estate Type:"><WhiteCombo /></FieldRow>
    <FieldRow label="Enter Sector:"><WhiteCombo /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportChallanWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Comprehensive Challan Report- Selection Criteria" {...props}>
    <FieldRow label="Enter FromDate:"><YellowDate /></FieldRow>
    <FieldRow label="Enter ToDate:"><WhiteDate /></FieldRow>
    <FieldRow label="Enter CardCode:"><WhiteList /></FieldRow>
    <FieldRow label="Enter Receipt Means:"><WhiteCombo /></FieldRow>
    <div className="flex items-center text-[10.5px] mt-0.5">
      <div className="w-[140px] text-gray-700">Enter Cash Acc:</div>
      <div className="flex items-center gap-1">
        <div className="w-[20px] h-[18px] border border-gray-400 bg-white" />
        <div className="w-[20px] h-[18px] border border-gray-400 bg-[#fff9c4]" />
      </div>
    </div>
    <div className="flex items-center text-[10.5px] mt-0.5">
      <div className="w-[140px] text-gray-700">Enter GL@SELECT DISTINCT T."AcctCode...</div>
      <div className="flex items-center gap-1">
        <div className="w-[20px] h-[18px] border border-gray-400 bg-white" />
        <div className="w-[20px] h-[18px] border border-gray-400 bg-[#fff9c4]" />
      </div>
    </div>
  </ElectronicReportShell>
);

export const ElectronicReportMonthWiseWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Month Wise Period Receivable Report- Selection Criteria" {...props}>
    <FieldRow label="Select Year"><YellowInput /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportYearWiseWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Year Wise Period Receivable Report- Selection Criteria" {...props}>
    <FieldRow label="Select Year"><YellowInput /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportDHABWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title=" Pay Slip- Selection Criteria" {...props}>
    <FieldRow label="Select Period"><YellowCombo /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportFixAssetWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Fix Asset Report- Selection Criteria" {...props}>
    <div className="flex flex-col gap-1 mt-1 pl-[140px]">
       <YellowList />
       <WhiteInput />
    </div>
  </ElectronicReportShell>
);

export const ElectronicReportSurchargeWindow: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Report - Surcharge Calculation- Selection Criteria" {...props}>
    <FieldRow label="Customer"><YellowList /></FieldRow>
    <FieldRow label="Date"><WhiteDate /></FieldRow>
    <FieldRow label="DueDate From"><WhiteDate /></FieldRow>
    <FieldRow label="DueDate To"><WhiteDate /></FieldRow>
  </ElectronicReportShell>
);

export const ElectronicReportSurcharge2Window: React.FC<Props> = (props) => (
  <ElectronicReportShell title="Report - Surcharge Calculation 2- Selection Criteria" {...props}>
    <FieldRow label="Custoer"><YellowList /></FieldRow>
    <FieldRow label="Date"><WhiteDate /></FieldRow>
    <FieldRow label="DueDate From"><WhiteDate /></FieldRow>
    <FieldRow label="DueDate To"><WhiteDate /></FieldRow>
  </ElectronicReportShell>
);
