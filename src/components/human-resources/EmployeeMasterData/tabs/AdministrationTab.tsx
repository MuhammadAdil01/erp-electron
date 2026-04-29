import React from 'react';
import { ChevronDown } from 'lucide-react';

export const AdministrationTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-[800px]">
      <div className="grid grid-cols-[160px_1fr] flex-col gap-x-8 gap-y-2">
        <label className="text-gray-700 text-right font-medium self-center mt-1 text-[10.5px]">Start Date</label>
        <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

        <label className="text-gray-700 text-right font-medium self-center mt-3 text-[10.5px]">Status</label>
        <div className="relative w-[140px]">
           <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
        </div>

        <label className="text-gray-700 text-right font-medium self-center mt-3 text-[10.5px]">Termination Date</label>
        <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />

        <label className="text-gray-700 text-right font-medium self-center mt-3 text-[10.5px]">Termination Reason</label>
        <div className="relative w-[140px]">
           <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[20px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
        </div>
      </div>

      <div className="mt-10">
        <span className="font-bold underline decoration-dotted text-gray-800 text-[11px] tracking-wide uppercase opacity-80">Name Positioning</span>
        <div className="mt-4 flex flex-col gap-5 ml-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="w-[14px] h-[14px] rounded-full border border-gray-500 bg-white flex items-center justify-center group-hover:border-blue-400 shadow-inner p-[2px]">
               <div className="w-full h-full rounded-full bg-blue-600" />
            </div>
            <input type="radio" name="namePositioning" defaultChecked className="hidden" />
            <span className="text-gray-700 text-[10.5px]">Last Name, First Name</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="w-[14px] h-[14px] border border-gray-500 bg-white flex items-center justify-center group-hover:border-blue-400 shadow-inner rounded-[1px] p-[1px]">
               {/* Unchecked box */}
            </div>
            <input type="checkbox" className="hidden" />
            <span className="text-gray-700 text-[10.5px]">Display Comma</span>
          </label>
        </div>
      </div>
    </div>
  );
};
