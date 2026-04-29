import React from 'react';
import { ChevronDown } from 'lucide-react';

export const OpportunityGeneralTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 h-full pt-4">
       <div className="grid grid-cols-[1fr_340px] gap-x-12 shrink-0">
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center">
                <label className="w-[140px] text-gray-700 text-[10.5px]">BP Channel Code</label>
                <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-sm" />
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-gray-700 text-[10.5px]">BP Channel Name</label>
                <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-sm" />
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-gray-700 text-[10.5px]">BP Channel Contact</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none pr-[16px]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <div className="flex items-center">
                <label className="w-[160px] text-gray-700 text-[10.5px]">Business Partner Project</label>
                <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-sm" />
             </div>
             <div className="flex items-center">
                <label className="w-[160px] text-gray-700 text-[10.5px]">Information Source</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none pr-[16px]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[160px] text-gray-700 text-[10.5px]">Industry</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none pr-[16px]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="flex flex-col flex-1 gap-1">
          <label className="text-gray-700 text-[10.5px] font-bold underline">Remarks</label>
          <textarea className="flex-1 w-full bg-white border border-gray-400 p-2 outline-none resize-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] custom-scrollbar text-[11px]" />
       </div>
    </div>
  );
};
