import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface OppStatisticsCriteriaProps {
  title: string;
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const OppStatisticsCriteria: React.FC<OppStatisticsCriteriaProps> = ({
  title,
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  if (windowState.isMinimized) return null;

  const leftColumn = [
    'Business Partner', 'Territories', 'Main Sales Emp.', 'Last Sales Emp.', 
    'Stages', 'Dates', 'Industry', 'BP Channel Code', 'Level of Interest'
  ];

  const rightColumn = [
    'Documents', 'Amount', 'Percentage Rate', 'Sources', 
    'Partners', 'Competitors', 'Status', 'Project', 'User-Defined Fields'
  ];

  return (
    <ResizableCriteriaWindow
      title={`${title} - Selection Criteria`}
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={650}
      initialHeight={500}
      footer={
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 p-3 flex gap-2 shrink-0">
           <button className="px-10 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">OK</button>
           <button onClick={onClose} className="px-10 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">Cancel</button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col bg-[#f0f0f0]">
        {/* SAP Style Gold Border Bar */}
        <div className="h-[4px] bg-[#ffa500] w-full shrink-0" />

        <div className="flex-1 p-6 overflow-y-auto bg-[#fdfdfd] border border-gray-300 m-4 rounded-sm shadow-inner custom-scrollbar">
           <div className="grid grid-cols-2 gap-x-12 gap-y-1.5">
              {/* Left Column Checkboxes */}
              <div className="flex flex-col gap-1.5">
                 {leftColumn.map(item => (
                   <div key={item} className="flex items-center gap-3 group">
                      <input type="checkbox" className="w-3.5 h-3.5 border-gray-400 rounded-none mt-0.5" />
                      <span className="text-[10.5px] text-gray-700 font-medium leading-none flex-1 truncate">{item}</span>
                      <button className="w-6 h-[18px] bg-[#e0e0e0] border border-gray-400 rounded-[1px] text-[12px] flex items-center justify-center leading-none text-gray-600 hover:bg-white active:bg-gray-300 shadow-sm">...</button>
                   </div>
                 ))}
              </div>

              {/* Right Column Checkboxes */}
              <div className="flex flex-col gap-1.5">
                 {rightColumn.map(item => (
                   <div key={item} className="flex items-center gap-3 group">
                      <input type="checkbox" className="w-3.5 h-3.5 border-gray-400 rounded-none mt-0.5" />
                      <span className="text-[10.5px] text-gray-700 font-medium leading-none flex-1 truncate">{item}</span>
                      <button className="w-6 h-[18px] bg-[#e0e0e0] border border-gray-400 rounded-[1px] text-[12px] flex items-center justify-center leading-none text-gray-600 hover:bg-white active:bg-gray-300 shadow-sm">...</button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Group By Footer */}
        <div className="px-5 pb-4 flex flex-col gap-1 shrink-0">
           <div className="flex items-center gap-4">
              <span className="text-[11px] text-gray-700 w-[80px]">Group By:</span>
              <div className="relative w-[180px]">
                 <select className="w-full h-[20px] text-[10.5px] bg-[#fff9c4] border border-gray-400 px-1 outline-none appearance-none">
                    <option>BP Code</option>
                    <option>Main Sales Emp.</option>
                    <option>BP Group</option>
                    <option>Territory</option>
                    <option>Item No.</option>
                    <option>Item Group</option>
                 </select>
                 <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gray-200 border-l border-gray-400 pointer-events-none flex items-center justify-center">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[11px] text-gray-700 w-[80px]">Group By (2):</span>
              <div className="relative w-[180px]">
                 <select className="w-full h-[20px] text-[10.5px] bg-white border border-gray-400 px-1 outline-none appearance-none">
                    <option></option>
                    <option>BP Code</option>
                    <option>Main Sales Emp.</option>
                 </select>
                 <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gray-200 border-l border-gray-400 pointer-events-none flex items-center justify-center">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
