import React from 'react';
import { ChevronDown } from 'lucide-react';

export const LogisticsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-12 h-full pt-4 select-none px-2">
       {/* Left Col - Addresses */}
       <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
             <div className="flex items-center">
                <label className="w-[100px] text-[11px] text-gray-700">Ship To</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <textarea className="w-full h-[80px] border border-gray-400 p-1 text-[11px] outline-none shadow-inner resize-none" />
             <div className="flex justify-end mt-[-10px] mr-1 relative z-10">
                <button className="w-[16px] h-[16px] bg-[#f0f0f0] border border-gray-500 rounded-[1px] flex items-center justify-center">
                   <div className="flex gap-[1px]">
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                   </div>
                </button>
             </div>
          </div>

          <div className="flex flex-col gap-1">
             <div className="flex items-center">
                <label className="w-[100px] text-[11px] text-gray-700">Bill To</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <textarea className="w-full h-[80px] border border-gray-400 p-1 text-[11px] outline-none shadow-inner resize-none" />
             <div className="flex justify-end mt-[-10px] mr-1 relative z-10">
                <button className="w-[16px] h-[16px] bg-[#f0f0f0] border border-gray-500 rounded-[1px] flex items-center justify-center">
                   <div className="flex gap-[1px]">
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                   </div>
                </button>
             </div>
          </div>

          <div className="flex items-center">
             <label className="w-[100px] text-[11px] text-gray-700">Shipping Type</label>
             <div className="flex-1 relative group">
                <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>

       {/* Right Col - Checkboxes and Extra Fields */}
       <div className="flex flex-col gap-1 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Print Picking Sheet</span>
          </label>
          <div className="h-[1px] bg-gray-300 my-2" />
          
          <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Procure Non Drop-Ship Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Procure Drop-Ship Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Confirmed</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Allow Partial Delivery</span>
          </label>

          <div className="flex flex-col gap-1 mt-6">
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">Pick and Pack Remarks</label>
                <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">BP Channel Name</label>
                <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">BP Channel Contact</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
