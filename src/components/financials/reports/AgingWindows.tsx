import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; wm?: any; }

const YellowArrow = () => (
   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
     <path d="M4 12H16M16 12L10 6M16 12L10 18" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
   </svg>
 );

// --- Shared Base --- 
const AgingCriteriaBase: React.FC<Props & { title: string; type: 'customer' | 'vendor' }> = ({ windowState, onClose, onUpdateState, onFocus, title, type, wm }) => {
  if (windowState.isMinimized) return null;

  const openProperties = () => wm?.openWindow('agingProperties');
  const openBlanket = () => wm?.openWindow('blanketAgreementsList');

  const groupLabel1 = type === 'customer' ? 'Customer' : 'Vendor';
  const groupLabel2 = type === 'customer' ? 'Sales Employee' : 'Buyer';
  const groupDropdown = type === 'customer' ? 'Customer Group' : 'Vendor Group';
  const considerLabel = type === 'customer' ? 'Consider Connected Vendors' : 'Consider Connected Customers';
  const zeroBalanceLabel = type === 'customer' ? 'Display Customers with Zero Balance' : 'Display Vendors with Zero Balance';

  return (
    <ResizableCriteriaWindow
      title={title}
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={440}
      initialHeight={500}
      footer={
        <div className="h-[40px] p-2 flex items-end gap-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300">
           <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
           <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-3 text-[10.5px] bg-[#f0f0f0]">
         
         {/* Top Section */}
         <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-12">
               <span className="w-[120px] text-gray-800">Group By</span>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                     <input type="radio" name={`${type}-group`} defaultChecked className="w-3 h-3" />
                     <span className="text-gray-800">{groupLabel1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <input type="radio" name={`${type}-group`} className="w-3 h-3" />
                     <span className="text-gray-800">{groupLabel2}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <span className="w-[120px] text-gray-800">Sum By</span>
               <div className="flex items-center gap-1.5">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-gray-800">Blanket Agreement No.</span>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <span className="w-[120px] text-gray-800">Blanket Agreement No.</span>
               <span className="text-gray-800">From</span>
               <div className="relative w-[70px]">
                  <input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer" onClick={openBlanket}>
                     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center"></div>
                  </div>
               </div>
               <span className="text-gray-800 text-right w-[15px]">To</span>
               <div className="w-[70px]">
                  <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
               </div>
            </div>

            <div className="flex items-center gap-2">
               <span className="w-[120px] text-gray-800">Code</span>
               <span className="text-gray-800">From</span>
               <div className="w-[70px]">
                  <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
               </div>
               <span className="text-gray-800 text-right w-[15px]">To</span>
               <div className="w-[70px]">
                  <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
               </div>
            </div>
         </div>

         <div className="h-[1px] bg-gray-400 my-3"></div>

         {/* Customer Group & Properties */}
         <div className="flex flex-col gap-1.5">
            <div className="flex items-center">
               <span className="w-[128px] text-gray-800 shrink-0">{groupDropdown}</span>
               <div className="relative flex-1">
                  <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                  <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                     <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                  </div>
               </div>
            </div>

            <div className="flex items-center mt-[1px]">
               <button onClick={openProperties} className="w-[120px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm hover:from-[#ffebaa] active:shadow-inner mr-[8px]">
                  Properties
               </button>
               <input type="text" defaultValue="Ignore" className="flex-1 h-[18px] border border-gray-400 bg-[#e0e0e0] text-gray-600 px-1 outline-none" readOnly />
            </div>

            <div className="flex items-center justify-between mt-1">
               <div className="flex items-center gap-1.5">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-gray-800 w-[70px]">Control Assets</span>
                  <button className="w-[26px] h-[18px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner flex items-center justify-center relative">
                     <span className="absolute bottom-1 leading-none font-bold">...</span>
                  </button>
               </div>
               <button className="w-[110px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner font-medium">
                  Select All
               </button>
            </div>
         </div>

         <div className="h-[1px] bg-gray-400 my-3"></div>

         {/* Aging Date & Intervals */}
         <div className="flex flex-col gap-1.5 relative">
            <div className="flex items-end justify-between absolute right-0 top-[-10px] w-[60px]">
               <span className="text-gray-800 text-[9px] w-full text-center pr-4">09.04.26</span>
            </div>
            <div className="flex items-center mt-2 gap-2">
               <span className="w-[70px] text-gray-800">Aging Date</span>
               <div className="flex-1"></div>
               <input type="text" className="w-[70px] h-[18px] border border-transparent bg-transparent px-1 outline-none text-right font-medium" />
            </div>
            <div className="flex items-center gap-[4px]">
               <span className="w-[45px] text-gray-800">Interval</span>
               <div className="relative w-[70px]">
                  <input type="text" defaultValue="Days" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none cursor-default" readOnly />
                  <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                     <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                  </div>
               </div>
               <div className="w-[50px]"><input type="text" defaultValue="30" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" /></div>
               <div className="w-[50px]"><input type="text" defaultValue="60" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" /></div>
               <div className="w-[50px]"><input type="text" defaultValue="90" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" /></div>
               <div className="w-[50px]"><input type="text" defaultValue="120" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-center outline-none" /></div>
            </div>
         </div>

         {/* Dates Grid */}
         <div className="flex flex-col gap-1.5 mt-5">
            {[
               { label: 'Posting Date', from: '', to: '09.04.26' },
               { label: 'Due Date', from: '', to: '' },
               { label: 'Document Date', from: '', to: '' },
            ].map(row => (
               <div key={row.label} className="flex items-center gap-2">
                  <span className="w-[120px] text-gray-800">{row.label}</span>
                  <span className="text-gray-800">From</span>
                  <div className="w-[70px]">
                     <input type="text" defaultValue={row.from} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
                  <span className="text-gray-800 text-right w-[15px]">To</span>
                  <div className="w-[70px]">
                     <input type="text" defaultValue={row.to} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
               </div>
            ))}
         </div>

         <div className="h-[1px] bg-gray-400 my-3"></div>

         {/* Checkboxes */}
         <div className="flex flex-col gap-[3px]">
            {[
               'Translate Leading Currency at Aging Date',
               zeroBalanceLabel,
               'Display Reconciled Transactions',
               'Ignore Future Remit',
               'Display in Pages',
               considerLabel
            ].map((label, i) => (
               <div key={i} className="flex items-start gap-1.5">
                  <input type="checkbox" className="w-3 h-3 mt-[1px]" />
                  <span className="text-gray-800 leading-none mt-0.5">{label}</span>
               </div>
            ))}
         </div>      </div>
    </ResizableCriteriaWindow>
  );
};

export const CustomerReceivablesAgingCriteria: React.FC<Props> = (props) => (
   <AgingCriteriaBase title="Customer Receivables Aging - Selection Criteria" type="customer" {...props} />
);

export const VendorLiabilitiesAgingCriteria: React.FC<Props> = (props) => (
   <AgingCriteriaBase title="Vendor Liabilities Aging - Selection Criteria" type="vendor" {...props} />
);


export const AgingPropertiesWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   if (windowState.isMinimized) return null;
 
   return (
    <ResizableCriteriaWindow
      title="Properties"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={350}
      initialHeight={420}
      footer={
        <div className="h-[40px] p-2 flex items-end gap-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300">
           <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
           <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="flex-1 p-2 pt-3 flex flex-col gap-2 overflow-hidden bg-[#fafafa] m-2 border border-gray-300 shrink-0 min-h-[300px]">
         <div className="flex items-center gap-1.5 text-[10.5px]">
            <input type="checkbox" defaultChecked className="w-3 h-3" />
            <span className="text-gray-800 font-medium">Ignore Properties</span>
         </div>
         <div className="flex items-center gap-8 ml-[20px] text-[10.5px] mt-1 mb-2">
            <span className="text-gray-800">Link</span>
            <div className="flex items-center gap-1">
               <input type="radio" name="link" className="w-3 h-3" />
               <span className="text-gray-800">Or</span>
            </div>
            <div className="flex items-center gap-1">
               <input type="radio" name="link" defaultChecked className="w-3 h-3" />
               <span className="text-gray-800">And</span>
            </div>
         </div>

         <div className="flex items-center gap-1.5 text-[10.5px] ml-[20px] mb-1 text-gray-400">
            <input type="checkbox" className="w-3 h-3" disabled />
            <span>Exactly Match</span>
         </div>

         <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full text-[10.5px]">
            <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0">
               <div className="w-[30px] px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">#</div>
               <div className="flex-1 px-1 border-r border-gray-300 text-gray-700 h-full flex items-center bg-[#f0f0f0]">Property</div>
               <div className="w-[30px] h-full flex items-center justify-center bg-[#f0f0f0]">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
               {Array.from({length: 12}).map((_, i) => (
                  <div key={i} className="flex items-center h-[18px] border-b border-gray-200">
                     <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center justify-end bg-[#f8f8f8]">{i+1}</div>
                     <div className="flex-1 px-1 h-full flex items-center bg-white border-r border-gray-200 text-gray-800">
                        Business Partners Property {i+1}
                     </div>
                     <div className="w-[30px] h-full flex items-center justify-center bg-white">
                        <input type="checkbox" className="w-[10px] h-[10px] m-0 p-0" style={{WebkitAppearance: 'none', appearance: 'none', border: '1px solid #aaa', backgroundColor: '#fff'}} />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex justify-center gap-1 mt-2 mb-1">
            <button className="px-3 h-[20px] border border-gray-300 rounded-[2px] text-[10px] text-gray-400 bg-[#f0f0f0]" disabled>Clear Selection</button>
            <button className="px-3 h-[20px] border border-gray-300 rounded-[2px] text-[10px] text-gray-400 bg-[#f0f0f0]" disabled>Invert Selection</button>
            <button className="px-3 h-[20px] border border-gray-300 rounded-[2px] text-[10px] text-gray-400 bg-[#f0f0f0]" disabled>Select All</button>
         </div>
       </div>
 
    </ResizableCriteriaWindow>
  );
};

 
export const ListBlanketAgreementsWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   if (windowState.isMinimized) return null;
 
   return (
    <ResizableCriteriaWindow
      title="List of Blanket Agreements"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={350}
      footer={
        <div className="h-[40px] p-2 flex items-end gap-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300">
           <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#f5f5f5] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm text-gray-500" disabled>Choose</button>
           <button className="w-[60px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
        </div>
      }
    >
      <div className="flex-1 p-2 flex flex-col gap-2 overflow-hidden text-[10.5px] bg-[#f0f0f0] shrink-0 min-h-[300px] min-w-[500px]">
         <div className="flex items-center gap-6 mt-1 mb-2">
            <span className="text-gray-800">Find</span>
            <input type="text" className="w-[150px] h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
         </div>

         <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full">
            <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
               <div className="w-[20px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">#</div>
               <div className="w-[80px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">A...</div>
               <div className="w-[120px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Agreement Desc...</div>
               <div className="w-[120px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Customer/Vendo...</div>
               <div className="w-[90px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Agreement...</div>
               <div className="w-[90px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Agree...</div>
               <div className="w-[60px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Star...</div>
               <div className="w-[60px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">End...</div>
               <div className="w-[60px] px-1 border-r border-gray-300 h-full flex items-center bg-[#f0f0f0]">Sign...</div>
               <div className="flex-1 px-1 h-full flex items-center bg-[#f0f0f0]">Pri...</div>
               <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0] border-l border-gray-300">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-45 text-blue-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </div>
            </div>
            <div className="flex-1 bg-[#e0e0e0] flex items-center justify-center border-b border-gray-300 pointer-events-none opacity-50 relative custom-scrollbar overflow-hidden">
               {/* Grid simulation rows */}
               <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none select-none flex flex-col">
                  {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="h-[20px] border-b border-gray-300 flex">
                        <div className="w-[20px] border-r border-gray-300" />
                        <div className="w-[80px] border-r border-gray-300" />
                        <div className="w-[120px] border-r border-gray-300" />
                        <div className="w-[120px] border-r border-gray-300" />
                        <div className="w-[90px] border-r border-gray-300" />
                        <div className="w-[90px] border-r border-gray-300" />
                        <div className="w-[60px] border-r border-gray-300" />
                        <div className="w-[60px] border-r border-gray-300" />
                        <div className="w-[60px] border-r border-gray-300" />
                        <div className="flex-1" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
       </div>
 
    </ResizableCriteriaWindow>
  );
};
