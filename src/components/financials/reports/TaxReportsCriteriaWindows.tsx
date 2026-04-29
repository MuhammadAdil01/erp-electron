import React from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

const ListIcon = () => (
   <div className="w-[14px] h-full flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center">
       <div className="w-[4px] h-[1px] bg-gray-500" />
     </div>
   </div>
);

const UpDownControls = () => (
   <div className="flex flex-col gap-1 ml-2">
      <button className="w-[20px] h-[18px] bg-[#f0f0f0] border border-gray-400 flex items-center justify-center shadow-sm">
         <ChevronUp className="w-3 h-3 text-gray-700" />
      </button>
      <button className="w-[20px] h-[18px] bg-[#f0f0f0] border border-gray-400 flex items-center justify-center shadow-sm">
         <ChevronDownIcon className="w-3 h-3 text-gray-700" />
      </button>
   </div>
);

// =========================================================================
// TAX REPORT
// =========================================================================
export const TaxReportCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
  const outputRows = [
    { code: 'GST-EX', name: 'NZ GST - Exempt' },
    { code: 'GST-ZF', name: 'NZ GST - Zero Rated', display: true },
    { code: 'GSTO', name: 'NZ GST - Output', display: true },
    { code: 'S1', name: 'AU Sales - GST LI' },
    { code: 'S2', name: 'AU Sales - GST E' },
    { code: 'SE', name: 'AU Sales - Export' },
  ];

  const inputRows = [
    { code: 'C1', name: 'AU Capital Purchase -' },
    { code: 'C2', name: 'AU Capital Purchase -' },
    { code: 'C3', name: 'AU Capital Purchase -' },
    { code: 'C4', name: 'AU Capital Purchase -' },
    { code: 'GST-E1', name: 'NZ GST - Exempt' },
    { code: 'GST-ZF', name: 'NZ GST - Zero Rated', display: true },
    { code: 'GST1', name: 'NZ GST - Input', display: true },
    { code: 'P1', name: 'AU Purchase - GST LI' },
    { code: 'P2', name: 'AU Purchase - GST E' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Tax Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={720}
      initialHeight={520}
      minWidth={650}
      minHeight={450}
      footer={
        <div className="h-[45px] p-2 flex items-end justify-between shrink-0 mb-1">
          <div className="flex gap-2">
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
          </div>

          <div className="flex gap-2 items-center mr-2">
            <input type="checkbox" className="w-3 h-3" />
            <span className="text-gray-800">Round Amounts</span>
            <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner ml-4">Save</button>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col p-3 text-[10.5px]">
         <div className="flex items-center mb-3">
            <span className="w-[140px] text-gray-800 shrink-0">Selection Criteria Name</span>
            <div className="relative flex-1">
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
               <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
            </div>
         </div>

         <div className="flex items-center gap-2 mb-4">
            <span className="w-[40px] text-gray-800">Date</span>
            <div className="relative w-[110px]">
               <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" readOnly />
               <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                  <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
               </div>
            </div>
            <span className="text-gray-800 ml-4">From</span>
            <input type="text" defaultValue="01.07.25" className="w-[75px] h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" />
            <span className="text-gray-800 ml-1">To</span>
            <input type="text" defaultValue="30.06.26" className="w-[75px] h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" />
         </div>

         <div className="flex gap-4 items-start mb-2">
            <div className="flex-1"></div>
            <div className="flex flex-col gap-2 shrink-0 w-[180px]">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                     <input type="radio" name="tax_type" className="w-3 h-3" />
                     <span className="text-gray-800">Series</span>
                  </div>
                  <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold pb-1">...</button>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                     <input type="radio" name="tax_type" defaultChecked className="w-3 h-3" />
                     <span className="text-gray-800">Trans. Type</span>
                  </div>
                  <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold pb-1">...</button>
               </div>
            </div>
         </div>

         {/* Two Tables */}
         <div className="flex gap-4 mt-2 h-[200px]">
            {/* Output Table */}
            <div className="flex-[1] flex flex-col">
               <span className="text-gray-800 font-bold mb-1 italic">Output</span>
               <div className="flex-1 flex items-start">
                  <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative h-full font-sans">
                     <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
                        <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center">Code</div>
                        <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center whitespace-nowrap overflow-hidden">Name</div>
                        <div className="w-[45px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center">Display</div>
                        <div className="w-[45px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center">Amount</div>
                        <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]">
                           <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {outputRows.map((row, i) => (
                           <div key={i} className={`flex items-center h-[18px] border-b border-gray-200 text-[10px] ${i < 3 ? 'bg-[#f8f8f8]' : 'bg-white'}`}>
                              <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.code}</div>
                              <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.name}</div>
                              <div className="w-[45px] border-r border-gray-300 h-full flex items-center justify-center">
                                 <input type="checkbox" defaultChecked={row.display} className="w-3 h-3" />
                              </div>
                              <div className="w-[45px] h-full flex items-center justify-center">
                                 <input type="checkbox" className="w-3 h-3" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <UpDownControls />
               </div>
            </div>

            {/* Input Table */}
            <div className="flex-[1] flex flex-col">
               <span className="text-gray-800 font-bold mb-1 italic">Input</span>
               <div className="flex-1 flex items-start">
                  <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative h-full font-sans">
                     <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
                        <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center">Code</div>
                        <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center whitespace-nowrap overflow-hidden">Name</div>
                        <div className="w-[45px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center text-[9px]">Display</div>
                        <div className="w-[45px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center text-[9px]">Am...</div>
                        <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]">
                           <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {inputRows.map((row, i) => (
                           <div key={i} className={`flex items-center h-[18px] border-b border-gray-200 text-[10px] ${i >= 5 && i <= 6 ? 'bg-[#f8f8f8]' : 'bg-white'}`}>
                              <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.code}</div>
                              <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.name}</div>
                              <div className="w-[45px] border-r border-gray-300 h-full flex items-center justify-center">
                                 <input type="checkbox" defaultChecked={row.display} className="w-3 h-3" />
                              </div>
                              <div className="w-[45px] h-full flex items-center justify-center">
                                 <input type="checkbox" className="w-3 h-3" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <UpDownControls />
               </div>
            </div>
         </div>

         <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3">
               <span className="text-gray-800 font-medium">Output Mode</span>
               <div className="relative w-[180px]">
                  <input type="text" defaultValue="Tax Register Book" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" readOnly />
                  <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                     <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
               <input type="checkbox" className="w-3 h-3" />
               <span className="text-gray-800">Hide Tax Codes Without Transactions</span>
            </div>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};

// =========================================================================
// WITHHOLDING TAX REPORT
// =========================================================================
export const WithholdingTaxReportCriteriaWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const rows = [
      { code: 'WT01', name: 'Purchase -Others (Filer)-5.5%', display: true },
      { code: 'WT02', name: 'Purchase -Others (Non Filer)-', display: true },
      { code: 'WT03', name: 'Purchase -Company (Filer)-5', display: true },
      { code: 'WT04', name: 'Purchase -Company (Non Fil', display: true },
      { code: 'WT05', name: 'Payment For Services-(Filer)-4', display: true },
      { code: 'WT06', name: 'Payment For Services-(Non Fi', display: true },
      { code: 'WT07', name: 'Advertisement Services-(Filer)', display: true },
      { code: 'WT08', name: 'Advertisement Services-(Non I', display: true },
   ];
 
   return (
    <ResizableCriteriaWindow
      title="Withholding Tax Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={680}
      initialHeight={520}
      minWidth={600}
      minHeight={450}
      footer={
        <div className="h-[45px] p-2 flex items-end justify-between shrink-0 mb-1">
          <div className="flex gap-2">
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
          </div>
          <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner">Save</button>
        </div>
      }
    >
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-3 text-[10.5px]">
          <div className="flex items-center mb-3">
             <span className="w-[140px] text-gray-800 shrink-0">Selection Criteria Name</span>
             <div className="relative flex-1">
                <input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
                <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-2">
                <span className="w-[110px] text-gray-800">Date</span>
                <div className="relative w-[110px]">
                   <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                      <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
                   </div>
                </div>
                <span className="text-gray-800 ml-4">From</span>
                <input type="text" defaultValue="01.07.25" className="w-[75px] h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" />
                <span className="text-gray-800 ml-1">To</span>
                <input type="text" defaultValue="30.06.26" className="w-[75px] h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" />
             </div>

             <div className="flex items-center gap-2">
                <span className="w-[110px] text-gray-800">Declared Period</span>
                <div className="relative w-[90px]">
                   <input type="text" defaultValue="Year" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                      <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
                   </div>
                </div>
                
                <div className="flex items-center gap-6 ml-[60px]">
                   <div className="flex items-center gap-1.5">
                      <input type="checkbox" defaultChecked className="w-3 h-3" />
                      <span className="text-gray-800">Vendors</span>
                      <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold ml-1 pb-1">...</button>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <span className="w-[110px] text-gray-800">Declaration Type</span>
                <div className="relative w-[150px]">
                   <input type="text" defaultValue="Original" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" readOnly />
                   <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                      <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
                   </div>
                </div>

                <div className="flex flex-col gap-1.5 ml-[12px]">
                   <div className="flex items-center gap-1.5 ml-[48px]">
                      <input type="checkbox" defaultChecked className="w-3 h-3" />
                      <span className="text-gray-800">Customers</span>
                      <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold ml-1 pb-1">...</button>
                   </div>
                   <div className="flex items-center gap-1.5 ml-[48px]">
                      <input type="checkbox" defaultChecked className="w-3 h-3" />
                      <span className="text-gray-800">Transact. Type</span>
                      <button className="w-[30px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm flex items-center justify-center font-bold ml-1 pb-1">...</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
             <span className="text-gray-800 font-bold mb-1 italic underline underline-offset-2">Withholding Tax</span>
             <div className="flex items-start">
                <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative h-[220px] font-sans">
                   <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
                      <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center">Code</div>
                      <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center whitespace-nowrap overflow-hidden">Name</div>
                      <div className="w-[40px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center text-[9px]">Dis...</div>
                      <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]">
                         <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {rows.map((row, i) => (
                         <div key={i} className="flex items-center h-[18px] border-b border-gray-200 bg-white text-[10px]">
                            <div className="w-[40px] px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.code}</div>
                            <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center text-gray-800 truncate">{row.name}</div>
                            <div className="w-[40px] border-r border-gray-300 h-full flex items-center justify-center">
                               <input type="checkbox" defaultChecked={row.display} className="w-3 h-3" />
                            </div>
                            <div className="w-[16px] h-full flex items-center justify-center bg-gray-50 border-l border-gray-200">
                               <div className="w-2.5 h-2.5 border-t border-r border-gray-400 rotate-45 ml-[-1px]"></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
                <UpDownControls />
             </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
             <span className="text-gray-800 font-medium w-[100px]">Output Mode</span>
             <div className="relative w-[180px]">
                <input type="text" defaultValue="WTax Code Layout - Purchaz" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px] font-sans" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                   <ChevronDownIcon className="w-2.5 h-2.5 text-gray-600" />
                </div>
             </div>
          </div>
        </div>
    </ResizableCriteriaWindow>
   );
};

