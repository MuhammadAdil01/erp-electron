import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ActivityLinkedDocumentTab: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-x-20 px-2 shrink-0 h-full overflow-y-auto custom-scrollbar pt-4">
       <div className="flex flex-col gap-2.5">
          <label className="flex items-center gap-2 cursor-pointer group mt-2">
             <input type="checkbox" className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-sm accent-blue-600 cursor-pointer" />
             <span className="text-gray-700 text-[10.5px] group-hover:text-black">Link Draft</span>
          </label>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Document Type</label>
             <div className="flex-1 relative">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-sm" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Document Number</label>
             <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer group mt-2">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-sm accent-blue-600 cursor-pointer" />
             <span className="text-gray-700 text-[10.5px] group-hover:text-black font-bold">Show Documents Related to the BP</span>
          </label>

          <div className="flex items-center mt-12 opacity-60 pointer-events-none">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Previous Activity</label>
             <input type="text" disabled className="w-[100px] bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
       </div>

       <div className="flex flex-col gap-1.5 pt-[38px] pr-4">
          <div className="flex items-center opacity-60">
             <label className="w-[160px] text-gray-700 text-[10.5px] text-right pr-4">Source Object Type</label>
             <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
          <div className="flex items-center opacity-60">
             <label className="w-[160px] text-gray-700 text-[10.5px] text-right pr-4">Source Object No.</label>
             <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
          </div>
       </div>
    </div>
  );
};
