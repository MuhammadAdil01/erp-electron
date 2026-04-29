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

interface ActivitiesOverviewCriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
  wm: any;
}

export const ActivitiesOverviewCriteria: React.FC<ActivitiesOverviewCriteriaProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  wm
}) => {
  if (windowState.isMinimized) return null;

  const ow = wm.openWindow;

  return (
    <ResizableCriteriaWindow
      title="Activity Overview - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={500}
      initialHeight={650}
      footer={
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 p-3 flex gap-2 shrink-0">
           <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:translate-y-[1px]">OK</button>
           <button onClick={onClose} className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:translate-y-[1px]">Cancel</button>
        </div>
      }
    >
      <div className="flex-1 p-4 pb-0 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar bg-[#f0f0f0]">
         {/* Row: BP Code */}
         <div className="flex items-center text-[10.5px] mb-1">
            <label className="w-[100px] text-gray-700">BP Code</label>
            <div className="flex items-center gap-4 flex-1">
               <div className="flex items-center gap-1">
                  <span className="text-gray-500 w-[40px]">From</span>
                  <div className="relative">
                     <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-[#fffbd5] px-1 outline-none font-mono" />
                     <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                        <div className="w-2.5 h-2.5 rounded-full border border-gray-500" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <span className="text-gray-500 w-[20px]">To</span>
                  <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
               </div>
            </div>
         </div>

         {/* Section: Handled By */}
         <div className="mt-2 flex flex-col gap-1">
            {[
              { label: 'Handled By:', sub: 'User', type: 'selectionUsers' },
              { label: '', sub: 'Employee', type: 'selectionEmployees' },
              { label: '', sub: 'Recipient List', type: 'selectionRecipientLists' }
            ].map((row, i) => (
               <div key={i} className="flex items-center text-[10.5px]">
                  <label className="w-[100px] text-gray-700">{row.label}</label>
                  <div className="flex-1 flex items-center gap-2">
                     <span className="w-[80px]">{row.sub}</span>
                     <div className="flex-1 relative flex items-center">
                        <input type="text" className="flex-1 h-[18px] border border-gray-400 bg-[#fffbd5] px-1 outline-none" />
                        <button 
                          onClick={() => ow(row.type as any)}
                          className="w-[30px] h-[18px] flex items-center justify-center bg-gradient-to-b from-white to-gray-300 border border-gray-400 border-l-0 text-[12px] pb-[4px] active:from-gray-300 active:to-white"
                        >...</button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Section: Groups */}
         <div className="mt-4 flex flex-col gap-1">
            {['Customer Group', 'Vendor Group', 'Contact Person'].map(label => (
               <div key={label} className="flex items-center text-[10.5px]">
                  <label className="w-[100px] text-gray-700">{label}</label>
                  <div className="flex-1 relative">
                     <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                     <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <button 
          onClick={() => ow('selectionProperties')}
          className="w-[100px] h-[20px] mt-4 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[2px] text-[10.5px] font-bold shadow-sm active:shadow-inner mb-4 hover:from-white active:translate-y-[1px]"
         >
            Properties
         </button>

         <div className="h-[1px] bg-gray-300 my-2" />

         {/* Activity Details */}
         <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            {['Activity', 'Type', 'Subject'].map(label => (
               <div key={label} className="flex items-center text-[10.5px]">
                  <label className="w-[80px] text-gray-700 shrink-0">{label}</label>
                  <div className="flex-1 relative">
                     <input type="text" defaultValue={`All ${label}s`} className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" />
                     <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                     </div>
                  </div>
               </div>
            ))}
            <div className="flex items-center text-[10.5px]">
               <label className="w-[80px] text-gray-700 shrink-0">Source Type</label>
               <div className="flex-1 relative">
                  <input type="text" defaultValue="All Types" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" />
                  <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer pointer-events-none">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                  </div>
               </div>
            </div>
            <div className="flex items-center text-[10.5px]">
               <label className="w-[80px] text-gray-700 shrink-0">Meeting Location</label>
               <div className="flex-1 relative">
                  <input type="text" defaultValue="All Locations" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none font-sans" />
                  <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer pointer-events-none">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-start text-[10.5px] mt-1">
            <label className="w-[80px] text-gray-700 shrink-0">Remarks</label>
            <input type="text" className="flex-1 h-[18px] border border-gray-400 bg-white px-1 outline-none" />
         </div>

         <div className="h-[1px] bg-gray-300 my-4" />

         {/* Dates */}
         {['Activity Start Date', 'Activity Closing Date'].map(label => (
            <div key={label} className="flex items-center text-[10.5px] mb-1">
               <label className="w-[120px] text-gray-700">{label}</label>
               <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-1">
                     <span className="text-gray-500 w-[30px]">From</span>
                     <input type="text" className="w-[80px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
                  <div className="flex items-center gap-1">
                     <span className="text-gray-500 w-[20px]">To</span>
                     <input type="text" className="w-[80px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
               </div>
            </div>
         ))}

         {/* Checkboxes */}
         <div className="mt-4 flex flex-col gap-1 text-[10.5px]">
            <div className="flex items-center gap-2">
               <input type="checkbox" className="w-3 h-3 mt-0.5" />
               <span className="text-gray-700">User-Defined Fields</span>
               <button 
                 onClick={() => ow('selectionUdf')}
                 className="ml-2 w-[35px] h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 text-[14px] leading-0 pb-1 shadow-sm active:from-gray-300 active:to-white"
               >...</button>
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" className="w-3 h-3 mt-0.5" />
               <span className="text-gray-700">Display Scheduled Service Calls</span>
            </div>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
