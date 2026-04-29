import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ActivityOtherDetailsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-[340px_1fr] gap-x-20 p-2 shrink-0">
       <div className="flex flex-col gap-1.5">
          <span className="text-gray-800 font-bold underline text-[11px] mb-2 cursor-pointer hover:text-blue-700">Resource</span>
          <div className="flex items-center">
             <label className="w-[120px] text-gray-700 text-[10.5px]">Resource No.</label>
             <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
          </div>
          <div className="flex items-center">
             <label className="w-[120px] text-gray-700 text-[10.5px]">Activity Type</label>
             <div className="flex-1 relative">
                <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white transition-colors">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center opacity-60">
             <label className="w-[120px] text-gray-700 text-[10.5px]">Cost Item</label>
             <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
       </div>

       <div className="flex flex-col gap-1.5 pt-[22px] pr-4">
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Financial Project</label>
             <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
          </div>
          <div className="flex items-center opacity-60">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Project No.</label>
             <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
          <div className="flex items-center opacity-60">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Subproject No.</label>
             <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Stage</label>
             <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
          </div>
       </div>
    </div>
  );
};
