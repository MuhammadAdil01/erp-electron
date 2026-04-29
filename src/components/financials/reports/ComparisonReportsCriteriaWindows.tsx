import React, { useState } from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Search } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

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

const ComparisonHeader = ({ current, comparison }: { current: any, comparison: any }) => (
   <div className="flex gap-4 p-2 bg-gray-100/50 border border-gray-300 rounded-[2px] mb-2">
      <div className="flex-1 flex flex-col gap-1.5">
         <div className="flex items-center gap-2"><span className="w-[100px] text-gray-700">Company Name</span><span className="text-gray-900 font-medium">....</span></div>
         <div className="flex items-center gap-2"><span className="w-[100px] text-gray-700">Database Name</span><span className="text-gray-900 font-medium">....</span></div>
         <div className="flex items-center gap-2">
            <span className="w-[100px] text-gray-700">{current.type || 'Posting Date'}</span>
            <div className="relative w-[110px]">
               <input type="text" defaultValue={current.type || 'Posting Date'} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
               <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5" /></div>
            </div>
            {current.from && <span className="text-gray-700 ml-2">From</span>}
            {current.from && <div className="w-[85px] h-[18px] border border-gray-400 bg-[#fff9c4] px-1 text-right text-[10px] flex items-center justify-end pr-1">{current.from}</div>}
            <span className="text-gray-700 ml-2">To</span>
            <div className="relative w-[85px]">
               <input type="text" defaultValue={current.to} className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 text-right pr-4 outline-none" />
               <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
            </div>
         </div>
      </div>

      <div className="w-[1px] bg-gray-300 mx-1"></div>

      <div className="flex-1 flex flex-col gap-1.5 relative">
         <div className="flex items-center gap-2"><span className="w-[100px] text-gray-700">Company Name</span><span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden truncate">....</span></div>
         <div className="flex items-center gap-2"><span className="w-[100px] text-gray-700">Database Name</span><span className="text-gray-900 font-medium">....</span></div>
         <div className="flex items-center gap-2">
            <span className="w-[100px] text-gray-700">{comparison.type || 'Posting Date'}</span>
            <div className="relative w-[110px]">
               <input type="text" defaultValue={comparison.type || 'Posting Date'} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
               <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5" /></div>
            </div>
            {comparison.from && <span className="text-gray-700 ml-2">From</span>}
            {comparison.from && <div className="w-[85px] h-[18px] border border-gray-400 bg-white px-1 text-right text-[10px] flex items-center justify-end pr-1">{comparison.from}</div>}
            <span className="text-gray-700 ml-2">To</span>
            <div className="relative w-[85px]">
               <input type="text" defaultValue={comparison.to} className="w-full h-[18px] border border-gray-400 bg-white px-1 text-right pr-4 outline-none" />
               <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
            </div>
         </div>
         <button className="absolute right-2 top-[-30px] w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner translate-y-[35px]">Change</button>
      </div>
   </div>
);

// =========================================================================
// BALANCE SHEET COMPARISON
// =========================================================================
export const BalanceSheetComparisonWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   return (
     <ResizableCriteriaWindow
       title="Balance Sheet Comparison - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={800}
       initialHeight={450}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
      <div className="flex-1 p-3 text-[10.5px] flex flex-col">
         <ComparisonHeader 
            current={{ to: '30.06.26' }} 
            comparison={{ to: '30.06.26' }} 
         />

         <div className="flex gap-4 mt-2">
            <SectionBox title="Display in Report:" className="flex-1 flex gap-4 h-[180px]">
               <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Accounts with Balance of Zero</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Differences in %</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800 font-medium">Amgunt Differences</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Names</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">External Code</span></div>
               </div>
               
               <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                     <span className="text-gray-800">Template</span>
                     <div className="relative flex-1">
                        <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                        <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1.5 ml-2">
                     <div className="flex items-center gap-1.5"><input type="radio" name="bs_c" defaultChecked className="w-3 h-3" /><span className="text-gray-800 underline">Local Currency</span></div>
                     <div className="flex items-center gap-1.5"><input type="radio" name="bs_c" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                     <div className="flex items-center gap-1.5"><input type="radio" name="bs_c" className="w-3 h-3" /><span className="text-gray-800">Foreign Currency</span></div>
                  </div>
               </div>
            </SectionBox>

            <div className="w-[180px] flex flex-col pt-2 gap-1.5 px-2">
               <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Journal Vouchers</span></div>
               <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Closing Balances</span></div>
               <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Ignore Adjustments</span></div>

               <div className="mt-auto flex flex-col gap-1 items-center pb-2 pr-4">
                  <div className="self-start mb-2 ml-1"><input type="checkbox" className="w-3 h-3" /></div>
                  <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner underline underline-offset-1">Revaluation</button>
               </div>
            </div>
         </div>
      </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// TRIAL BALANCE COMPARISON
// =========================================================================
export const TrialBalanceComparisonWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   const accounts = [
      { id: '1', name: 'Assets' }, { id: '307', name: 'Liabilities' }, { id: '485', name: 'Capital and Reserves' },
      { id: '499', name: 'Revenue' }, { id: '711', name: 'Cost of sales' }, { id: '712', name: 'Operating costs' },
      { id: '903', name: 'Non-operating income and expenditure' }, { id: '912', name: 'Taxation and Extraordinary Items' },
   ];
 
   return (
     <ResizableCriteriaWindow
       title="Trial Balance Comparison - Selection Criteria"
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
          <div className="flex gap-4 p-1">
               <div className="flex-1 flex flex-col pt-1">
                  <div className="flex items-center gap-1.5 mb-2"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800">BP</span></div>
                  <div className="flex items-center gap-2 mb-2 ml-2">
                     <span className="text-gray-700">From</span>
                     <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white" /></div>
                     <span className="text-gray-700">To</span>
                     <div className="flex-1"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white" /></div>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                     <div className="flex items-center gap-2"><span className="w-[90px] text-gray-700">Customer Group</span><div className="relative flex-1"><input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly /><div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div></div></div>
                     <div className="flex items-center gap-2"><span className="w-[90px] text-gray-700">Vendor Group</span><div className="relative flex-1"><input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly /><div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div></div></div>
                     <div className="flex items-center mt-1">
                        <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10px] font-medium shadow-sm">Properties</button>
                        <div className="flex-1 ml-[5px]"><input type="text" defaultValue="Ignore" className="w-full h-[18px] border border-gray-400 bg-[#e0e0e0] text-gray-600 px-1 outline-none text-[9.5px]" readOnly /></div>
                     </div>
                  </div>
               </div>
               <div className="flex-[1.2] flex flex-col pt-1">
                  <div className="flex items-center justify-between mb-1">
                     <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800">G/L Accounts</span></div>
                     <div className="flex items-center gap-1.5">
                        <button className="px-5 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm">Find</button>
                        <div className="relative w-12"><input type="text" defaultValue="1" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none text-right pr-4" readOnly /><div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div></div>
                     </div>
                  </div>
                  <div className="h-[120px] border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full">
                     <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
                        <div className="w-[30px] px-1 border-r border-gray-300 h-full flex items-center">#</div>
                        <div className="w-[20px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center">x</div>
                        <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center whitespace-nowrap overflow-hidden">Account</div>
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

          <div className="flex gap-4 p-2 bg-gray-100/50 border border-gray-300 rounded-[2px] min-h-[140px]">
             <div className="flex-[1] flex flex-col gap-2 pt-1 border-r border-gray-300 pr-4 italic">
                <div className="flex items-center gap-2"><span className="w-[120px] text-gray-700 not-italic">Company Name</span><span className="text-gray-900 font-bold not-italic">....</span></div>
                <div className="flex items-center gap-2"><span className="w-[120px] text-gray-700 not-italic">Comparison Operator</span><span className="text-gray-900 font-bold not-italic">....</span></div>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-[45px] text-gray-700 not-italic">Period</div>
                   <div className="w-[50px] text-gray-900 font-bold not-italic">Current</div>
                   <div className="relative w-[110px] ml-1">
                      <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                      <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5" /></div>
                   </div>
                   <span className="text-gray-700 not-italic ml-2">From</span>
                   <input type="text" defaultValue="01.07.25" className="w-[85px] h-[18px] border border-gray-400 bg-white text-right px-1 outline-none" />
                   <span className="text-gray-700 not-italic ml-2">To</span>
                   <input type="text" defaultValue="30.06.26" className="w-[85px] h-[18px] border border-gray-400 bg-white text-right px-1 outline-none pr-4 font-mono text-[10px]" />
                   <ListIcon />
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-[100px] text-gray-700 not-italic">Comparison Operator</div>
                   <div className="relative w-[110px]">
                      <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                      <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5" /></div>
                   </div>
                   <span className="text-gray-700 not-italic ml-4">From</span>
                   <input type="text" defaultValue="01.07.25" className="w-[85px] h-[18px] border border-gray-400 bg-white text-right px-1 outline-none" />
                   <span className="text-gray-700 not-italic ml-2">To</span>
                   <input type="text" defaultValue="30.06.26" className="w-[85px] h-[18px] border border-gray-400 bg-white text-right px-1 outline-none pr-4 font-mono text-[10px]" />
                   <ListIcon />
                </div>
             </div>
             <div className="flex-[0.8] flex flex-col gap-2 pt-1 relative italic">
                <div className="flex items-center gap-2"><span className="w-[120px] text-gray-700 not-italic">Database Name</span><span className="text-gray-900 font-bold not-italic">....</span></div>
                <div className="flex items-center gap-2"><span className="w-[120px] text-gray-700 not-italic">Database Name</span><span className="text-gray-900 font-bold not-italic">....</span></div>
                <button className="absolute right-2 top-2 w-[100px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner not-italic underline underline-offset-1">Change</button>
             </div>
          </div>

          <div className="flex gap-4">
               <SectionBox title="Display in Report:" className="flex-[1.8] grid grid-cols-2 gap-4 h-[180px]">
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Hide Zero Balanced Acct</span></div>
                     <div className="flex items-center gap-1.5 ml-4"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Hide Acct with No Postings</span></div>
                     <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800 underline underline-offset-1 decoration-gray-400">Differences in %</span></div>
                     <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800 font-bold">Amount Differences</span></div>
                     <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Names</span></div>
                     <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">External Code</span></div>
                     <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Opening Balance for Period</span></div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <span className="text-gray-800">Template</span>
                        <div className="relative flex-1">
                           <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                           <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5 ml-2 mt-2">
                        <div className="flex items-center gap-1.5"><input type="radio" name="trc_c" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Local Currency</span></div>
                        <div className="flex items-center gap-1.5"><input type="radio" name="trc_c" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                        <div className="flex items-center gap-1.5"><input type="radio" name="trc_c" className="w-3 h-3" /><span className="text-gray-800">Foreign Currency</span></div>
                     </div>
                  </div>
               </SectionBox>

               <div className="flex-1 flex flex-col pt-2 gap-1.5 px-2">
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Journal Vouchers</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Ignore Adjustments</span></div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Closing Balance</span></div>

                  <div className="mt-auto flex flex-col gap-1 items-center pb-2 pr-4">
                     <div className="self-start mb-2 ml-1"><input type="checkbox" className="w-3 h-3" /></div>
                     <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner underline underline-offset-1">Revaluation</button>
                     <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner">Expanded</button>
                  </div>
               </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// PROFIT AND LOSS STATEMENT COMPARISON
// =========================================================================
export const ProfitLossComparisonWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const [activeTab, setActiveTab] = useState<'general' | 'accounting'>('general');
 
   return (
     <ResizableCriteriaWindow
       title="Profit and Loss Statement Comparison - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={800}
       initialHeight={500}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-3 text-[10.5px] flex flex-col gap-1">
          <ComparisonHeader 
             current={{ from: '01.07.25', to: '30.06.26' }} 
             comparison={{ from: '01.07.25', to: '30.06.26' }} 
          />
 
          <div className="flex gap-4 mt-2">
             <SectionBox title="Display in Report:" className="flex-1 flex gap-4 h-[180px]">
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Accounts with Balance of Zero</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800 underline underline-offset-1 decoration-gray-400">Differences in %</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3 h-3" /><span className="text-gray-800 font-bold">Amgunt Differences</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Foreign Names</span></div>
                   <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">External Code</span></div>
                </div>
                
                <div className="flex-1 flex flex-col gap-3">
                   <div className="flex items-center gap-2">
                      <span className="text-gray-800">Template</span>
                      <div className="relative flex-1">
                         <input type="text" defaultValue="Chart of Accounts" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                         <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5 ml-2 mt-2">
                      <div className="flex items-center gap-1.5"><input type="radio" name="plce_c" defaultChecked className="w-3 h-3" /><span className="text-gray-800 underline">Local Currency</span></div>
                      <div className="flex items-center gap-1.5"><input type="radio" name="plce_c" className="w-3 h-3" /><span className="text-gray-800">System Currency</span></div>
                      <div className="flex items-center gap-1.5"><input type="radio" name="plce_c" className="w-3 h-3" /><span className="text-gray-800">Foreign Currency</span></div>
                   </div>
                </div>
             </SectionBox>
 
             <div className="w-[180px] flex flex-col pt-2 gap-1.5 px-2">
                <div className="flex items-center gap-1.5"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Add Journal Vouchers</span></div>
                <div className="flex items-center gap-1.5 mt-2"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800">Ignore Adjustments</span></div>
 
                <div className="mt-auto flex flex-col gap-1 items-center pb-2 pr-4">
                   <div className="self-start mb-2 ml-1"><input type="checkbox" className="w-3 h-3" /></div>
                   <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner underline underline-offset-1">Revaluation</button>
                   <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner italic">Expanded</button>
                </div>
             </div>
          </div>
       </div>
 
     </ResizableCriteriaWindow>
   );
 };
