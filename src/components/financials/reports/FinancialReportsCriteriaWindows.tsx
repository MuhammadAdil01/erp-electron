import React, { useState } from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Folder, Search } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; wm?: any; }

const ListIcon = () => (
   <div className="w-[14px] h-full flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center">
       <div className="w-[4px] h-[1px] bg-gray-500" />
     </div>
   </div>
);

const YellowArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
    <path d="M4 12H16M16 12L10 6M16 12L10 18" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SectionBox = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
   <div className={`relative border border-gray-400 p-3 pt-4 mt-2 ${className}`}>
      <span className="absolute top-[-9px] left-3 bg-[#f0f0f0] px-1 text-[10.5px] font-bold underline italic text-gray-800">{title}</span>
      {children}
   </div>
);

// =========================================================================
// BALANCE SHEET
// =========================================================================
export const BalanceSheetCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   return (
     <ResizableCriteriaWindow
       title="Balance Sheet - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={700}
       initialHeight={350}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-3 text-[10.5px] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
         <div className="flex items-center gap-2 mb-2">
            <span className="w-[40px] text-gray-800">Date</span>
            <div className="relative w-[110px]">
               <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" readOnly />
               <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer">
                  <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
               </div>
            </div>
            <span className="text-gray-800 ml-12">To</span>
            <div className="relative w-[85px]">
               <input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
               <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
            </div>
         </div>

         <div className="flex gap-4">
            <SectionBox title="Display in Report:" className="flex-1 flex flex-col gap-2 h-[180px]">
               <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                     <input type="checkbox" className="w-3 h-3" />
                     <span className="text-gray-800">Accounts with Balance of Zero</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <input type="checkbox" className="w-3 h-3" />
                     <span className="text-gray-800">Foreign Name</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <input type="checkbox" className="w-3 h-3" />
                     <span className="text-gray-800">External Code</span>
                  </div>
               </div>
               
               <div className="mt-2 flex flex-col gap-1">
                  {['Annual Report', 'Quarterly Report', 'Monthly Report', 'Periodic Report'].map((label, i) => (
                     <div key={label} className="flex items-center gap-1.5 ml-2">
                        <input type="radio" name="report_type" defaultChecked={i === 0} className="w-3 h-3" />
                        <span className="text-gray-800">{label}</span>
                     </div>
                  ))}
               </div>
            </SectionBox>

            <div className="flex-1 flex flex-col pt-2 gap-2">
               <div className="flex items-center gap-2">
                  <span className="w-[80px] text-gray-800">Template</span>
                  <div className="relative flex-1">
                     <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                     <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                        <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                     </div>
                  </div>
               </div>

               <div className="mt-2">
                  <span className="text-gray-800 font-bold underline italic text-[9.5px]">Display in First Column</span>
                  <div className="flex flex-col gap-1 mt-1 ml-2">
                     <div className="flex items-center gap-1.5">
                        <input type="radio" name="col1" defaultChecked className="w-3 h-3" />
                        <span className="text-gray-800">Local Currency</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <input type="radio" name="col1" className="w-3 h-3" />
                        <span className="text-gray-800">System Currency</span>
                     </div>
                  </div>
               </div>

               <div className="mt-2">
                  <span className="text-gray-800 font-bold underline italic text-[9.5px]">Display in Second Column</span>
                  <div className="flex flex-col gap-1 mt-1 ml-2">
                     <div className="flex items-center gap-1.5">
                        <input type="radio" name="col2" className="w-3 h-3" />
                        <span className="text-gray-800">System Currency</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <input type="radio" name="col2" className="w-3 h-3" />
                        <span className="text-gray-800">Foreign Currency</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <input type="radio" name="col2" defaultChecked className="w-3 h-3" />
                        <span className="text-gray-800">Relative Percentage</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="w-[180px] flex flex-col pt-2 gap-1 px-2">
               <div className="flex items-center gap-1.5">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-[10px] text-gray-800">Add Journal Vouchers</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-[10px] text-gray-800">Add Closing Balances</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-[10px] text-gray-800">Ignore Adjustments</span>
               </div>

               <div className="mt-auto flex flex-col gap-1 pb-2 items-center">
                  <button className="w-[100px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner underline underline-offset-2">Revaluation</button>
                  <button className="w-[100px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner">Expanded</button>
               </div>
            </div>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};

// =========================================================================
// TRIAL BALANCE
// =========================================================================
export const TrialBalanceCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   const accounts = [
      { id: '1', name: 'Assets' }, { id: '307', name: 'Liabilities' }, { id: '485', name: 'Capital and Reserves' },
      { id: '499', name: 'Revenue' }, { id: '711', name: 'Cost of sales' }, { id: '712', name: 'Operating costs' },
      { id: '903', name: 'Non-operating income and expenditure' }, { id: '912', name: 'Taxation and Extraordinary Items' },
   ];
 
   return (
     <ResizableCriteriaWindow
       title="Trial Balance - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={850}
       initialHeight={680}
       footer={
         <div className="h-[45px] p-2 flex items-center justify-between mb-1 shrink-0 bg-[#f0f0f0]">
            <div className="flex gap-2">
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
            </div>
            <div className="flex gap-1 pr-1">
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner underline underline-offset-1">Expanded</button>
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner">Select All</button>
            </div>
         </div>
       }
     >
       <div className="flex-1 p-2 text-[10.5px] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {/* BP / Accounts Panels */}
          <div className="flex gap-4">
               {/* Left Panel */}
               <div className="flex-1 flex flex-col pt-1">
                  <div className="flex items-center gap-1.5 mb-2">
                     <input type="checkbox" defaultChecked className="w-3 h-3" />
                     <span className="text-gray-800">BP</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 ml-2">
                     <span className="text-gray-800">From</span>
                     <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                     <span className="text-gray-800">To</span>
                     <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2">
                     <div className="flex items-center">
                        <span className="w-[90px] text-gray-800">Customer Group</span>
                        <div className="relative flex-1">
                           <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                           <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                        </div>
                     </div>
                     <div className="flex items-center">
                        <span className="w-[90px] text-gray-800">Vendor Group</span>
                        <div className="relative flex-1">
                           <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                           <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                        </div>
                     </div>
                     <div className="flex items-center mt-1">
                        <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm">Properties</button>
                        <div className="flex-1 ml-[5px]"><input type="text" defaultValue="Ignore" className="w-full h-[18px] border border-gray-400 bg-[#e0e0e0] text-gray-600 px-1 outline-none" readOnly /></div>
                     </div>
                  </div>
               </div>

               {/* Right Panel */}
               <div className="flex-[1.2] flex flex-col pt-1">
                  <div className="flex items-center justify-between mb-1">
                     <div className="flex items-center gap-1.5">
                        <input type="checkbox" defaultChecked className="w-3 h-3" />
                        <span className="text-gray-800">G/L Accounts</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <button className="px-5 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm">Find</button>
                        <div className="relative w-12">
                           <input type="text" defaultValue="1" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none text-right pr-4" readOnly />
                           <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                        </div>
                     </div>
                  </div>
                  <div className="h-[120px] border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full">
                     <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0">
                        <div className="w-[30px] px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">#</div>
                        <div className="w-[20px] px-0.5 border-r border-gray-300 text-gray-700 h-full flex items-center justify-center bg-[#f0f0f0]">x</div>
                        <div className="flex-1 px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">Account</div>
                        <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]"><Search className="w-3 h-3 text-blue-400 rotate-90" /></div>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {accounts.map((acc, i) => (
                           <div key={acc.id} className="flex items-center h-[18px] border-b border-gray-200">
                              <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">{acc.id}</div>
                              <div className="w-[20px] border-r border-gray-200 h-full flex items-center justify-center bg-[#f8f8f8]"><input type="checkbox" className="w-[10px] h-[10px]" /></div>
                              <div className="flex-1 px-1 h-full flex items-center gap-1 bg-white truncate"><YellowArrow />{acc.name}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
          </div>

          <div className="h-[1px] bg-gray-400 my-1 shadow-[0_1px_1px_white]"></div>

          <div className="flex-1 flex flex-col gap-2">
             <div className="flex items-center gap-2">
                <span className="w-[40px] text-gray-800">Date</span>
                <div className="relative w-[110px]">
                   <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                </div>
                <span className="text-gray-800 ml-4">From</span>
                <div className="relative w-[85px]">
                   <input type="text" defaultValue="01.07.24" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                   <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
                </div>
                <span className="text-gray-800 ml-2">To</span>
                <div className="relative w-[85px]">
                   <input type="text" defaultValue="30.06.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                   <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
                </div>
             </div>

             <div className="flex gap-4">
                <SectionBox title="Display in Report:" className="flex-[1.5] grid grid-cols-2 gap-x-4 h-[180px]">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Hide Zero Balanced Acct</span></div>
                      <div className="flex items-center gap-1.5 ml-4"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Hide Acct with No Postings</span></div>
                      <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Names</span></div>
                      <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">External Code</span></div>
                      <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Opening Balance for Period</span></div>
                      
                      <div className="mt-3 flex flex-col gap-1 border-t border-gray-300 pt-1">
                        <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Currency</span></div>
                        <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                        <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800 text-[10px]">Local and System Currency</span></div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <span className="text-gray-800">Template</span>
                          <div className="relative flex-1">
                             <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                             <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                          </div>
                      </div>
                      <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Show Info per Ctrl Acct</span></div>
                      
                      <div className="mt-2 flex flex-col gap-1.5">
                         {['Annual Report', 'Quarterly Report', 'Monthly Report', 'Periodic Report'].map((l, i) => (
                            <div key={l} className="flex items-center gap-1.5"><input type="radio" name="tr_type" defaultChecked={i === 0} className="w-3 h-3" /><span className="text-gray-800">{l}</span></div>
                         ))}
                      </div>
                   </div>
                </SectionBox>

                <div className="flex-1 flex flex-col pt-2 gap-1.5 px-2 pr-4">
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Journal Vouchers</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Ignore Adjustments</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Closing Balances</span></div>
                   
                   <div className="mt-auto flex flex-col gap-1 items-center pb-2">
                      <div className="flex items-center gap-1.5 self-start mb-1"><input type="checkbox" className="w-3 h-3" /></div>
                      <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner underline underline-offset-1">Revaluation</button>
                      <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner">Expanded</button>
                   </div>
                </div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// PROFIT AND LOSS STATEMENT
// =========================================================================
export const ProfitLossStatementCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   return (
     <ResizableCriteriaWindow
       title="Profit and Loss Statement - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={700}
       initialHeight={350}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-3 text-[10.5px] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 mb-2">
             <span className="w-[40px] text-gray-800">Date</span>
             <div className="relative w-[110px]">
                <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none font-medium" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
             </div>
             <span className="text-gray-800 ml-4">From</span>
             <div className="relative w-[85px]">
                <input type="text" defaultValue="01.07.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
             </div>
             <span className="text-gray-800 ml-2">To</span>
             <div className="relative w-[85px]">
                <input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" />
                <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
             </div>
          </div>
 
          <div className="flex gap-4">
             <SectionBox title="Display in Report:" className="flex-1 flex flex-col gap-2 h-[180px]">
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Accounts with Balance of Zero</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Name</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">External Code</span></div>
                </div>
                <div className="mt-2 flex flex-col gap-1 ml-2">
                   {['Annual Report', 'Quarterly Report', 'Monthly Report', 'Periodic Report'].map((l, i) => (
                      <div key={l} className="flex items-center gap-1.5"><input type="radio" name="pl_type" defaultChecked={i === 0} className="w-3 h-3" /><span className="text-gray-800">{l}</span></div>
                   ))}
                </div>
             </SectionBox>
 
             <div className="flex-1 flex flex-col pt-2 gap-2">
                <div className="flex items-center gap-2">
                   <span className="w-[80px] text-gray-800">Template</span>
                   <div className="relative flex-1">
                      <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                      <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                   </div>
                </div>
                <span className="text-gray-800 font-bold underline italic text-[9.5px]">Display in First Column</span>
                <div className="flex flex-col gap-1 ml-2">
                   <div className="flex items-center gap-1.5"><input type="radio" name="pl_c1" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Local Currency</span></div>
                   <div className="flex items-center gap-1.5"><input type="radio" name="pl_c1" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                </div>
                <span className="text-gray-800 font-bold underline italic text-[9.5px]">Display in Second Column</span>
                <div className="flex flex-col gap-1 ml-2">
                   <div className="flex items-center gap-1.5"><input type="radio" name="pl_c2" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                   <div className="flex items-center gap-1.5"><input type="radio" name="pl_c2" className="w-3 h-3" /><span className="text-gray-800">Foreign Currency</span></div>
                   <div className="flex items-center gap-1.5"><input type="radio" name="pl_c2" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Balance for Comparison</span></div>
                   <div className="ml-5 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><input type="radio" name="pl_c2_sub" className="w-[10px] h-[10px]" /><span className="text-gray-800">Life-to-Date</span></div>
                      <div className="flex items-center gap-1.5"><input type="radio" name="pl_c2_sub" defaultChecked className="w-[10px] h-[10px]" /><span className="text-gray-800 underline">Year-to-Date</span></div>
                   </div>
                </div>
             </div>
 
             <div className="w-[180px] flex flex-col pt-2 gap-1 px-2 pr-4">
                <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Journal Vouchers</span></div>
                <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Ignore Adjustments</span></div>
                <div className="mt-auto flex flex-col gap-1 items-center pb-2">
                   <div className="flex items-center gap-1.5 self-start mb-1"><input type="checkbox" className="w-3 h-3" /></div>
                   <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm underline underline-offset-1">Revaluation</button>
                   <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm">Expanded</button>
                </div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// STATEMENT OF CASH FLOWS
// =========================================================================
export const StatementOfCashFlowsCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Statement of Cash Flows - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={700}
       initialHeight={300}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-4 text-[10.5px] flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
             <span className="text-gray-800 font-bold underline italic">Actual Period</span>
             <div className="flex items-center gap-2">
                <div className="relative w-[130px]">
                   <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                </div>
                <span className="text-gray-800 px-1">From</span>
                <div className="relative w-[100px]"><input type="text" defaultValue="01.07.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                <span className="text-gray-800 px-1">To</span>
                <div className="relative w-[100px]"><input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
                <span className="text-gray-800 ml-4">Template</span>
                <div className="relative w-[130px] ml-4">
                   <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-medium" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                </div>
             </div>
          </div>

          <div className="h-[1px] bg-gray-400"></div>

          <div className="flex flex-col gap-2">
             <span className="text-gray-800 font-bold underline italic">Previous Period</span>
             <div className="flex items-center gap-2">
                <input type="checkbox" className="w-3 h-3 mr-1" />
                <div className="relative w-[130px]">
                   <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                </div>
                <span className="text-gray-800 px-1">From</span>
                <div className="relative w-[100px]"><input type="text" defaultValue="01.07.24" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                <span className="text-gray-800 px-1">To</span>
                <div className="relative w-[100px]"><input type="text" defaultValue="30.06.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// CASH FLOW
// =========================================================================
export const CashFlowCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const cashRows = [
      { id: '1', account: 'A211010001 - Askari Bank LTD 7119' },
      { id: '2', account: 'A211010002 - Habib Bank A/c #7900818901' },
      { id: '3', account: 'A211010003 - United Bank Ltd A/c # 0222772372' },
      { id: '4', account: 'A211010004 - Allied Bank Ltd A/c # 3492880011' },
      { id: '5', account: 'A211010005 - Muslim Commercial Bank A/c # 5761003137' },
      { id: '6', account: 'A211010006 - Dubai Islamic Bank A/c # 0257305001' },
      { id: '7', account: 'A211010007 - Bank Alfalah Ltd A/c # 1004673156' },
      { id: '8', account: 'A211010008 - Bank of Punjab A/c # 0084080006' },
      { id: '9', account: 'A211010009 - Askari Bank Ltd-8712' },
   ];
 
   return (
     <ResizableCriteriaWindow
       title="Cash Flow - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={850}
       initialHeight={600}
       footer={
         <div className="h-[40px] p-2 flex items-center justify-between mb-1 shrink-0 bg-[#f0f0f0]">
            <div className="flex gap-2">
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
            </div>
            <button className="w-[140px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner">Delete Selected Rows</button>
         </div>
       }
     >
       <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar text-[10.5px]">
          <div className="flex gap-4 p-1">
             <div className="w-[300px] flex flex-col gap-1.5 pt-1">
                <div className="flex items-center gap-2">
                   <span className="w-[80px] text-gray-800 font-medium">Date</span>
                   <span className="text-gray-800">From</span>
                   <div className="relative w-[75px]"><input type="text" defaultValue="01.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                   <span className="text-gray-800">To</span>
                   <div className="relative w-[75px]"><input type="text" defaultValue="30.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-[80px] text-gray-800">Time Interval</span>
                   <div className="relative flex-1">
                      <input type="text" defaultValue="Weekly" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                      <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                   </div>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                   {[
                      { l: 'Add Recurring Postings', c: true },
                      { l: 'Add Journal Vouchers', c: true },
                      { l: 'Consider Delays in Payments', c: false },
                      { l: 'Display Fully Reconciled Postings', c: false },
                      { l: 'Add Blanket Agreements', c: false },
                      { l: 'Add Marketing Documents', c: true, btn: true },
                      { l: 'Add Document Drafts', c: false, btn: true },
                      { l: 'Add Recurring Transactions', c: false, btn: true },
                   ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                         <input type="checkbox" defaultChecked={item.c} className="w-3.5 h-3.5" />
                         <span className="text-gray-800 flex-1">{item.l}</span>
                         {item.btn && <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold">...</button>}
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex-1 flex flex-col gap-2">
                <div className="flex border-b border-gray-400 mb-1">
                   {['Cash', 'Credit Card', 'Checks', 'Business Partner'].map((t, i) => (
                      <div key={t} className={`px-4 h-[22px] flex items-center justify-center border-t border-l border-r border-gray-400 shadow-sm cursor-default font-medium translate-y-[1px] relative z-10 ${i === 0 ? 'bg-white border-b-white' : 'bg-gray-200 border-b-gray-400'}`}>
                         {t}
                      </div>
                   ))}
                </div>

                <div className="flex-1 flex flex-col gap-2 border border-gray-400 p-2 bg-white/50">
                    <div className="h-[150px] border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full">
                       <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
                          <div className="w-[30px] px-1 border-r border-gray-300 h-full flex items-center">#</div>
                          <div className="w-[20px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center">x</div>
                          <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center">Account</div>
                          <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]"><Search className="w-3 h-3 text-blue-400 rotate-90" /></div>
                       </div>
                       <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {cashRows.map((row) => (
                             <div key={row.id} className="flex items-center h-[18px] border-b border-gray-200">
                                <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">{row.id}</div>
                                <div className="w-[20px] border-r border-gray-200 h-full flex items-center justify-center bg-[#f8f8f8]"><input type="checkbox" className="w-[10px] h-[10px]" /></div>
                                <div className="flex-1 px-1 h-full flex items-center gap-1 bg-white truncate"><YellowArrow />{row.account}</div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1 ml-2">
                       <div className="flex items-center gap-2">
                          <input type="radio" name="ob" defaultChecked className="w-3.5 h-3.5" />
                          <span className="text-gray-800 w-[110px]">Opening Balance</span>
                          <input type="text" className="w-[120px] h-[18px] border border-gray-400 bg-white" />
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="radio" name="ob" className="w-3.5 h-3.5" />
                          <span className="text-gray-800">Calculate Opening Balance</span>
                       </div>
                    </div>

                    <SectionBox title="" className="mt-1 shadow-none">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <span className="w-[110px] text-gray-800">Project</span>
                             <span className="text-gray-800">From</span>
                             <div className="relative w-[120px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
                             <span className="text-gray-800 ml-4">To</span>
                             <div className="relative w-[110px] ml-4"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="w-[110px] text-gray-800">Blanket Agreement</span>
                             <span className="text-gray-800">From</span>
                             <div className="relative w-[120px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                             <span className="text-gray-800 ml-4">To</span>
                             <div className="relative w-[110px] ml-4"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" /></div>
                          </div>
                       </div>
                    </SectionBox>
                </div>
             </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-[150px]">
             <span className="text-gray-800 font-bold underline italic mb-1">Include Projected Postings</span>
             <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full h-full">
                <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700 font-medium">
                   <div className="w-[30px] px-1 border-r border-gray-300">#</div>
                   {['Date', 'Description', 'Project', 'Incoming Total', 'Outgoing Amo...', 'Security Level', 'Recurrence Pe...', 'Recurrence ...', 'Valid Until'].map((h, i) => (
                      <div key={i} className="flex-1 px-1 border-r border-gray-300 truncate h-full flex items-center">{h}</div>
                   ))}
                   <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]"><Search className="w-3 h-3 text-blue-400 rotate-90" /></div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <div className="flex items-center h-[18px] border-b border-gray-200">
                      <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">1</div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white"></div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white"></div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white"></div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white"></div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white"></div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full flex items-center gap-1 bg-white truncate">
                        <input type="text" defaultValue="Cash Account" className="w-full h-full outline-none text-[9.5px]" />
                        <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                      </div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full flex items-center gap-1 bg-white truncate">
                        <input type="text" defaultValue="One Time" className="w-full h-full outline-none text-[9.5px]" />
                        <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                      </div>
                      <div className="flex-1 px-1 border-r border-gray-200 h-full bg-white text-right">-1</div>
                      <div className="flex-1 px-1 h-full bg-white"></div>
                   </div>
                   {[2,3,4,5,6,7,8].map(n => (
                      <div key={n} className="flex h-[18px] border-b border-gray-200">
                         <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 bg-[#f8f8f8]">{n}</div>
                         {[...Array(9)].map((_, i) => <div key={i} className="flex-1 border-r border-gray-200 bg-white"></div>)}
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// CASH FLOW FORECAST (Simple Criteria)
// =========================================================================
export const CashFlowForecastCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Cash Flow Forecast - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={600}
       initialHeight={350}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-3 text-[10.5px] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2">
             <span className="w-[120px] text-gray-800">Forecast Date To</span>
             <div className="relative w-[100px]"><input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
          </div>
          
          <SectionBox title="Include Detailed Info:" className="h-[150px] flex flex-col gap-2">
             <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Bank Accounts</span></div>
             <div className="flex items-center gap-2 ml-4"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Credit Cards</span></div>
             <div className="flex items-center gap-2 ml-4"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Checks</span></div>
             <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Business Partners</span></div>
             <div className="flex items-center gap-2 ml-4"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Projected Marketing Documents</span></div>
          </SectionBox>
       </div>
     </ResizableCriteriaWindow>
   );
 };
