import React from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

const YellowArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
    <path d="M4 12H16M16 12L10 6M16 12L10 18" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GLAccountsBPCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
  const accounts = [
    { id: '1', name: 'Assets' },
    { id: '307', name: 'Liabilities' },
    { id: '485', name: 'Capital and Reserves' },
    { id: '499', name: 'Revenue' },
    { id: '711', name: 'Cost of sales' },
    { id: '712', name: 'Operating costs' },
    { id: '903', name: 'Non-operating income and expenditure' },
    { id: '912', name: 'Taxation and Extraordinary Items' },
  ];

  return (
    <ResizableCriteriaWindow
      title="G/L Accounts and Business Partners - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={650}
      initialHeight={260}
      minWidth={600}
      minHeight={250}
      footer={
        <div className="h-[40px] p-2.5 flex items-end gap-2 shrink-0">
          <button className="px-6 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
          <button className="px-6 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="flex-1 flex p-2 gap-4 outline-none overflow-hidden text-[10.5px]">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 py-1 pb-2">
            <div className="flex items-center gap-1.5">
              <input type="checkbox" defaultChecked className="w-3 h-3" />
              <span className="text-gray-800 underline decoration-gray-400 underline-offset-2">B</span><span className="text-gray-800">P</span>
            </div>
            <div className="flex items-center gap-1.5 ml-4">
              <input type="checkbox" className="w-3 h-3" />
              <span className="text-gray-800">Display Leads</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 mt-2">
            <span className="w-[45px] text-gray-800">Code</span>
            <span className="text-gray-800">From</span>
            <input type="text" className="w-[70px] h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
            <span className="text-gray-800 ml-1">To</span>
            <input type="text" className="w-[70px] h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center">
               <span className="w-[100px] text-gray-800">Customer Group</span>
               <div className="relative flex-1">
                 <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                 <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                   <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                 </div>
               </div>
            </div>

            <div className="flex items-center">
               <span className="w-[100px] text-gray-800">Vendor Group</span>
               <div className="relative flex-1">
                 <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none cursor-default" readOnly />
                 <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                   <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                 </div>
               </div>
            </div>

            <div className="flex items-center mt-3">
               <button className="w-[100px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm hover:from-[#ffebaa] active:shadow-inner">
                 Properties
               </button>
               <div className="flex-1 ml-[5px]">
                 <input type="text" defaultValue="Ignore" className="w-full h-[18px] border border-gray-400 bg-[#e0e0e0] text-gray-600 px-1 outline-none" readOnly />
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-[1.2] flex flex-col pt-1">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="w-3 h-3" />
                <span className="text-gray-800">G/L <span className="underline decoration-gray-400 underline-offset-2">A</span>ccounts</span>
             </div>
             <div className="flex items-center gap-1.5">
                <button className="px-5 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm hover:from-[#ffebaa] active:shadow-inner">
                   Find
                </button>
                <div className="relative w-12">
                   <input type="text" defaultValue="1" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer">
                      <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>

          {/* Table */}
          <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full font-sans">
             {/* Header */}
             <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0">
                <div className="w-[40px] px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">#</div>
                <div className="w-[20px] px-0.5 border-r border-gray-300 text-gray-700 h-full flex items-center justify-center bg-[#f0f0f0]">x</div>
                <div className="flex-1 px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">Account</div>
                <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]">
                   <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
             </div>
             {/* Body */}
             <div className="flex-1 overflow-y-auto custom-scrollbar flex">
                <div className="flex-1 flex flex-col">
                   {accounts.map((acc, i) => (
                      <div key={acc.id} className="flex items-center h-[18px] border-b border-gray-200 hover:bg-[#fff9c4] cursor-default text-[10px]">
                         <div className="w-[40px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">{acc.id}</div>
                         <div className="w-[20px] border-r border-gray-200 h-full flex items-center justify-center relative bg-[#f8f8f8]">
                           <input type="checkbox" className="w-[10px] h-[10px] m-0 p-0" style={{WebkitAppearance: 'none', appearance: 'none', border: '1px solid #aaa', backgroundColor: '#fff'}} />
                         </div>
                         <div className="flex-1 px-1 h-full flex items-center gap-1 bg-white">
                           <YellowArrow />
                           <span className="text-gray-800 leading-none">{acc.name}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="flex justify-end mt-2 pr-[20px]">
             <button className="px-6 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm hover:from-[#ffebaa] active:shadow-inner">
                Select All
             </button>
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
