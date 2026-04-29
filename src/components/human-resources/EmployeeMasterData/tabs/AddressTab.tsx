import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AddressTabProps {}

export const AddressTab: React.FC<AddressTabProps> = () => {
  return (
    <div className="flex flex-col gap-8 max-w-[800px]">
      <div className="flex items-center gap-2">
        <span className="font-bold underline decoration-dotted text-gray-800 text-[11px] tracking-wide uppercase opacity-80">Home Address</span>
      </div>

      <div className="grid grid-cols-[160px_1fr] flex-col gap-x-8 gap-y-2">
        <label className="text-gray-700 text-right font-medium self-start mt-1">Temporary Address</label>
        <div className="max-w-[360px]">
           <textarea className="w-full bg-[#fff9c4] border border-gray-400 h-[48px] outline-none px-2 py-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px] resize-none focus:border-blue-400" />
        </div>

        <label className="text-gray-700 text-right font-medium self-start mt-3">Permanent Address</label>
        <div className="flex gap-10 mt-2">
          <div className="w-[360px]">
             <textarea className="w-full bg-[#fff9c4] border border-gray-400 h-[48px] outline-none px-2 py-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px] resize-none focus:border-blue-400" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <label className="text-gray-700 w-[120px] text-right">Building/Floor/Room</label>
             <input type="text" className="w-[120px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>
        </div>

        <label className="text-gray-700 text-right font-medium self-center mt-3">District</label>
        <div className="flex gap-10 mt-3">
           <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
           <div className="flex items-center gap-3 shrink-0">
             <label className="text-gray-700 w-[120px] text-right">State</label>
             <div className="relative w-[180px]">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
           </div>
        </div>

        <label className="text-gray-700 text-right font-medium self-center">City</label>
        <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

        <label className="text-gray-700 text-right font-medium self-center">Zip Code</label>
        <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

        <label className="text-gray-700 text-right font-medium self-center">County</label>
        <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

        <label className="text-gray-700 text-right font-medium self-center">Country/Region</label>
        <div className="relative w-[140px]">
           <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
           <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white">
             <ChevronDown className="w-3 h-3 text-gray-600" />
           </div>
        </div>
      </div>
    </div>
  );
};
