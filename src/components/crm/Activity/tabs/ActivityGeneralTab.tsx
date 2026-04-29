import React from 'react';
import { ChevronDown } from 'lucide-react';

export const ActivityGeneralTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full">
       <div className="grid grid-cols-[1fr_240px] gap-x-12 shrink-0">
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center">
                <label className="w-[100px] text-gray-700 text-[10.5px]">Remarks</label>
                <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
             </div>
             <div className="flex items-center">
                <label className="w-[100px] text-gray-700 text-[10.5px]">Start Time</label>
                <div className="flex-1 flex gap-2">
                   <input type="text" defaultValue="30.03.26" className="w-[85px] bg-white border border-gray-400 h-[18px] px-1 text-[10px] outline-none" />
                   <input type="text" defaultValue="16:00" className="w-[65px] bg-white border border-gray-400 h-[18px] px-1 text-[10px] outline-none" />
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[100px] text-gray-700 text-[10.5px]">End Time</label>
                <div className="flex-1 flex gap-2">
                   <input type="text" defaultValue="30.03.26" className="w-[85px] bg-white border border-gray-400 h-[18px] px-1 text-[10px] outline-none" />
                   <input type="text" defaultValue="16:15" className="w-[65px] bg-white border border-gray-400 h-[18px] px-1 text-[10px] outline-none" />
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[100px] text-gray-700 text-[10.5px]">Duration</label>
                <div className="flex gap-2">
                   <input type="text" defaultValue="15" className="w-[158px] bg-white border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none" />
                   <span className="text-gray-700 text-[10.5px] italic">Minutes</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px] text-right pr-4">Priority</label>
                <div className="flex-1 relative">
                   <input type="text" defaultValue="Normal" className="w-full bg-white border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px] text-right pr-4">Meeting Location</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="mt-8">
          <div className="flex items-center group">
             <label className="w-[100px] text-gray-700 text-[10.5px] group-hover:text-black font-bold">Recurrence</label>
             <div className="w-[120px] relative">
                <input type="text" defaultValue="None" className="w-full bg-white border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
