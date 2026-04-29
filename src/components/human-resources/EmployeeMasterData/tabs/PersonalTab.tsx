import React from 'react';
import { ChevronDown } from 'lucide-react';

export const PersonalTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-[900px]">
       <div className="grid grid-cols-[1fr_1fr] gap-x-20">
          {/* Left Column */}
          <div className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-2">
            <label className="text-gray-700 text-right font-medium self-center text-[10.5px]">Gender</label>
            <div className="relative w-[140px]">
               <input type="text" defaultValue="Male" className="w-full bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
               <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white">
                 <ChevronDown className="w-3 h-3 text-gray-600" />
               </div>
            </div>

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">Date of Birth</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">Marital Status</label>
            <div className="relative w-[140px]">
               <input type="text" defaultValue="Single" className="w-full bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
               <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white">
                 <ChevronDown className="w-3 h-3 text-gray-600" />
               </div>
            </div>

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">No. of Children</label>
            <input type="text" className="w-[80px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">CNIC/NIC</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-[140px_1fr] gap-x-6 gap-y-2 border-l border-gray-200 pl-20">
            <label className="text-gray-700 text-right font-medium self-center text-[10.5px]">Citizenship</label>
            <div className="relative w-[140px]">
               <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
               <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white">
                 <ChevronDown className="w-3 h-3 text-gray-600" />
               </div>
            </div>

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">Passport No.</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

            <label className="text-gray-700 text-right font-medium self-center mt-2 whitespace-nowrap text-[10.5px]">Passport Expiration Date</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">Passport Issue Date</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

            <label className="text-gray-700 text-right font-medium self-center mt-2 text-[10.5px]">Passport Issuer</label>
            <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>
       </div>
    </div>
  );
};
