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

const ListIcon = () => (
   <div className="w-[14px] h-full flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center">
       <div className="w-[4px] h-[1px] bg-gray-500" />
     </div>
   </div>
);

export const GeneralLedgerCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
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
      title="General Ledger - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={680}
      initialHeight={600}
      minWidth={600}
      minHeight={500}
      footer={
        <div className="h-[45px] p-2 flex items-end justify-between shrink-0 mb-1">
          <div className="flex gap-2">
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
          </div>

          <div className="flex gap-2 items-center">
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner">Save</button>
            <button className="w-[80px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner">Select All</button>
            <input type="checkbox" className="w-3 h-3" />
            <button className="w-[80px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner">Revaluation</button>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col p-2 gap-2 text-[10.5px]">
         {/* Top Section */}
         <div className="flex items-center">
            <span className="w-[140px] text-gray-800 shrink-0">Selection Criteria Name</span>
            <div className="relative flex-1">
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
               <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
            </div>
         </div>

         {/* Mid Section layout (Left/Right) */}
         <div className="flex gap-4 mt-1">
            {/* Left Panel */}
            <div className="flex-1 flex flex-col pt-1">
               <div className="flex items-center gap-1.5 mb-2">
                  <input type="checkbox" defaultChecked className="w-3 h-3" />
                  <span className="text-gray-800 underline decoration-gray-400 underline-offset-2">B</span><span className="text-gray-800">usiness Partner</span>
               </div>

               <div className="flex items-center gap-2 mb-2">
                  <span className="w-[30px] text-gray-800">Code</span>
                  <span className="text-gray-800">From</span>
                  <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" /></div>
                  <span className="text-gray-800">To</span>
                  <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" /></div>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                     <span className="w-[90px] text-gray-800">Customer Group</span>
                     <div className="relative flex-1">
                        <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                        <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                           <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center">
                     <span className="w-[90px] text-gray-800">Vendor Group</span>
                     <div className="relative flex-1">
                        <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                        <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                           <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center mt-1">
                     <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm hover:from-[#ffebaa] active:shadow-inner">
                        Properties
                     </button>
                     <div className="flex-1 ml-[5px]">
                        <input type="text" defaultValue="Ignore" className="w-full h-[18px] border border-gray-400 bg-[#e0e0e0] text-gray-600 px-1 outline-none" readOnly />
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                     <input type="checkbox" className="w-3 h-3" />
                     <span className="text-gray-800 w-[70px]">Control Accts</span>
                     <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner flex items-center justify-center">
                        <span className="leading-none pb-1 font-bold">...</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Right Panel */}
            <div className="flex-[1.2] flex flex-col pt-1">
               <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                     <input type="checkbox" defaultChecked className="w-3 h-3" />
                     <span className="text-gray-800 underline decoration-gray-400 underline-offset-2">A</span><span className="text-gray-800">ccounts</span>
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
               <div className="h-[120px] border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full font-sans">
                  {/* Header */}
                  <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0">
                     <div className="w-[30px] px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">#</div>
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
                              <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">{acc.id}</div>
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
            </div>
         </div>

         {/* Separator */}
         <div className="h-[1px] bg-gray-400 mt-2"></div>

         {/* Dates Section */}
         <div className="flex items-start mt-2">
            <span className="w-[60px] text-gray-800">Selection</span>
            <div className="flex flex-col gap-1 flex-1">
               {[
                  { id: 'posting', label: 'Posting Date', checked: true, from: '01.09.25', to: '25.09.25' },
                  { id: 'due', label: 'Due Date', checked: false, from: '01.07.24', to: '30.06.25' },
                  { id: 'document', label: 'Document Date', checked: false, from: '01.07.24', to: '30.06.25' }
               ].map((row, i) => (
                  <div key={row.id} className="flex items-center gap-2">
                     <div className="flex items-center gap-1.5 w-[90px]">
                        <input type="checkbox" defaultChecked={row.checked} className="w-3 h-3" />
                        <span className="text-gray-800 underline decoration-gray-400 underline-offset-2">{row.label[0]}</span><span className="text-gray-800">{row.label.slice(1)}</span>
                     </div>
                     <span className="text-gray-800 min-w-[25px]">From</span>
                     <div className="relative w-[75px]">
                        <input type="text" defaultValue={row.from} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                        <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
                     </div>
                     <span className="text-gray-800 min-w-[15px] ml-1">To</span>
                     <div className="relative w-[75px]">
                        <input type="text" defaultValue={row.to} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                        <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
                     </div>
                     {i === 2 && (
                        <button className="ml-2 w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner">
                           Expanded
                        </button>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Separator */}
         <div className="h-[1px] bg-gray-400 mt-2"></div>

         {/* Bottom Checkboxes Section */}
         <div className="flex gap-4 mt-2">
            
            {/* Left Column Checkboxes */}
            <div className="flex-[1] flex flex-col gap-1">
               {['Print Each Account on Sep. Page', 'Print Directly to Printer', 'Order Acct by Chart of Accounts', 'Ignore Adjustments', 'Foreign Names', 'Summarize Control Accounts', 'Hide Zero Value LC Rows', 'Add Journal Vouchers'].map((label, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                     <input type="checkbox" className="w-3 h-3 mt-[1px]" />
                     <span className="text-gray-800 leading-snug">{label}</span>
                  </div>
               ))}
            </div>

            {/* Right Column Checkboxes */}
            <div className="flex-[1.2] flex flex-col gap-1">
               <div className="flex items-start gap-1.5">
                  <input type="checkbox" className="w-3 h-3 mt-[1px]" />
                  <span className="text-gray-800 leading-snug">Display Postings Summary</span>
               </div>
               
               <div className="flex flex-col mt-0.5 relative">
                  <div className="flex items-start gap-1.5">
                     <input type="checkbox" defaultChecked className="w-3 h-3 mt-[1px]" />
                     <span className="text-gray-800 leading-snug">Opening Balance for Period</span>
                  </div>
                  <div className="flex flex-col gap-0.5 ml-5 mt-0.5">
                     <div className="flex items-center gap-1">
                        <input type="radio" name="ob" defaultChecked className="w-3 h-3" />
                        <span className="text-gray-800 leading-none">OB from Start of Company Activity</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <input type="radio" name="ob" className="w-3 h-3" />
                        <span className="text-gray-800 leading-none">OB from Start of Fiscal Year</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col mt-1 mb-2">
                  <div className="flex items-center gap-3">
                     <span className="text-gray-800">Display</span>
                     <div className="relative w-[180px]">
                        <input type="text" defaultValue="All Postings" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                        <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                           <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-start gap-1.5 pt-2">
                  <input type="checkbox" className="w-3 h-3 mt-[1px]" />
                  <span className="text-gray-800 leading-snug">Consider Reconciliation Date</span>
               </div>

               <div className="flex flex-col gap-1 mt-4">
                  <div className="flex items-start gap-1.5">
                     <input type="checkbox" className="w-3 h-3 mt-[1px]" />
                     <span className="text-gray-800 leading-snug">Hide Zero Balanced Acct</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                     <input type="checkbox" defaultChecked className="w-3 h-3 mt-[1px]" />
                     <span className="text-gray-800 leading-snug">Hide Acct with no Postings</span>
                  </div>
               </div>

            </div>
         </div>
         
         {/* Separator */}
         <div className="h-[1px] bg-gray-400 mt-2"></div>
         
         {/* Sort and Summarize */}
         <div className="flex items-start gap-1.5 mt-2">
            <input type="checkbox" className="w-3 h-3 mt-[1px]" />
            <span className="text-gray-800 leading-snug">Sort and Summarize</span>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};

