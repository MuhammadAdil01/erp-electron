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

interface CampaignsListCriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CampaignsListCriteria: React.FC<CampaignsListCriteriaProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  if (windowState.isMinimized) return null;

  return (
    <ResizableCriteriaWindow
      title="Campaigns List - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={500}
      initialHeight={750}
      footer={
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-200 p-3 flex gap-2 shrink-0 shadow-inner">
           <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">OK</button>
           <button onClick={onClose} className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">Cancel</button>
        </div>
      }
    >
      <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#f0f0f0]">
         
         {/* Section: Items */}
         <div className="flex flex-col gap-2 relative">
            <div className="absolute top-[-10px] left-2 bg-[#f0f0f0] px-1 text-[10px] font-bold text-blue-900 z-10 underline">Items</div>
            <div className="border border-gray-300 p-4 pt-5 rounded-sm flex flex-col gap-1.5">
               <div className="flex items-center text-[10.5px]">
                  <label className="w-[80px] text-gray-700">Code</label>
                  <div className="flex items-center gap-2 flex-1">
                     <span className="text-gray-500">From</span>
                     <div className="relative flex-1">
                        <input type="text" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400">
                           <div className="w-2.5 h-2.5 rounded-full border border-gray-500" />
                        </div>
                     </div>
                     <span className="text-gray-500">To</span>
                     <input type="text" className="flex-1 h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
               </div>
               <div className="flex items-center text-[10.5px]">
                  <label className="w-[80px] text-gray-700">Item Group</label>
                  <div className="flex-1 relative">
                     <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                     <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center text-[10.5px] mt-1">
                  <button className="w-[80px] h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 rounded-[2px] text-[10px] font-bold shadow-sm mr-2 active:shadow-inner">Properties</button>
                  <input type="text" defaultValue="Ignore" className="flex-1 h-[18px] border border-gray-400 bg-gray-100 px-1 outline-none italic text-gray-500" />
               </div>
            </div>
         </div>

         {/* Section: Business Partner */}
         <div className="flex flex-col gap-2 relative">
            <div className="absolute top-[-10px] left-2 bg-[#f0f0f0] px-1 text-[10px] font-bold text-blue-900 z-10 underline">Business Partner</div>
            <div className="border border-gray-300 p-4 pt-5 rounded-sm flex flex-col gap-2">
               <div className="flex items-center text-[10.5px] gap-6">
                  <label className="w-[100px] text-gray-700">Target Group Type</label>
                  <div className="flex items-center gap-4">
                     <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="tgType" defaultChecked className="w-3 h-3" />
                        <span>Customer</span>
                     </label>
                     <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="tgType" className="w-3 h-3" />
                        <span>Vendor</span>
                     </label>
                  </div>
               </div>
               <div className="flex items-center text-[10.5px]">
                  <label className="w-[100px] text-gray-700">Code</label>
                  <div className="flex items-center gap-2 flex-1">
                     <span className="text-gray-500">From</span>
                     <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                     <span className="text-gray-500 ml-auto">To</span>
                     <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                  </div>
               </div>
               <div className="flex items-center text-[10.5px]">
                  <label className="w-[100px] text-gray-700">Business Partner Group</label>
                  <div className="flex-1 relative">
                     <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                     <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center text-[10.5px] mt-1">
                  <button className="w-[80px] h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 rounded-[2px] text-[10px] font-bold shadow-sm mr-2 active:shadow-inner">Properties</button>
                  <input type="text" defaultValue="Ignore" className="flex-1 h-[18px] border border-gray-400 bg-gray-100 px-1 outline-none italic text-gray-500" />
               </div>
            </div>
         </div>

         {/* General Report Fields */}
         <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
               <div className="flex items-center text-[10.5px]">
                  <label className="w-[80px] text-gray-700">Campaign No.</label>
                  <div className="flex-1 flex gap-1">
                    <div className="flex items-center gap-1 flex-1">
                       <span className="text-gray-500 w-[25px]">From</span>
                       <input type="text" className="flex-1 h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                    </div>
                  </div>
               </div>
               <div className="flex items-center text-[10.5px]">
                   <div className="flex items-center gap-1 flex-1">
                      <span className="text-gray-500 w-[20px]">To</span>
                      <input type="text" className="flex-1 h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                   </div>
               </div>

               {['Campaign Type', 'Status'].map(label => (
                  <div key={label} className="flex items-center text-[10.5px]">
                     <label className="w-[80px] text-gray-700">{label}</label>
                     <div className="flex-1 relative">
                        <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                           <ChevronDown className="w-3 h-3 text-gray-600" />
                        </div>
                     </div>
                  </div>
               ))}
               {['Owner', 'Target Group'].map(label => (
                  <div key={label} className="flex items-center text-[10.5px]">
                     <label className="w-[80px] text-gray-700 pl-4">{label}</label>
                     <div className="flex-1 relative">
                        <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                           <ChevronDown className="w-3 h-3 text-gray-600" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="flex flex-col gap-1 mt-2 text-[10.5px]">
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-gray-700">Response Type</span>
                  <button className="ml-auto w-[30px] h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 text-[10px] leading-0">...</button>
               </div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className="text-gray-700">Documents</span>
                  <button className="ml-auto w-[30px] h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 text-[10px] leading-0">...</button>
               </div>
            </div>

            <div className="mt-4 flex flex-col gap-1">
               {['Start Date', 'End Date'].map(label => (
                  <div key={label} className="flex items-center text-[10.5px]">
                     <label className="w-[80px] text-gray-700">{label}</label>
                     <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-500 w-[30px]">From</span>
                        <input type="text" className="w-[100px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                        <span className="text-gray-500 w-[20px] ml-4">To</span>
                        <input type="text" className="w-[100px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
