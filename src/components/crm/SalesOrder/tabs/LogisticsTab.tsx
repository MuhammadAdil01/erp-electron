import React from 'react';
import { ChevronDown } from 'lucide-react';

export const LogisticsTab: React.FC = () => {
  return (
    <div className="flex gap-12 h-full pt-4 select-none px-2 shadow-sm">
       {/* Left Col - Addresses */}
       <div className="flex flex-col gap-4 w-[360px]">
          <div className="flex flex-col gap-1">
             <div className="flex items-center group">
                <label className="w-[100px] text-gray-700 text-[10.5px]">Ship To</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <textarea className="w-full h-[85px] bg-white border border-gray-400 p-1.5 text-[10.5px] outline-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] resize-none custom-scrollbar" />
             <div className="flex justify-end mt-[-10px] relative z-10 mr-1">
                <button className="w-[18px] h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-sm flex items-center justify-center shadow-sm active:shadow-inner">
                   <div className="flex gap-[1px]">
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                   </div>
                </button>
             </div>
          </div>

          <div className="flex flex-col gap-1 mt-2">
             <div className="flex items-center group">
                <label className="w-[100px] text-gray-700 text-[10.5px]">Bill To</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <textarea className="w-full h-[85px] bg-white border border-gray-400 p-1.5 text-[10.5px] outline-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] resize-none custom-scrollbar" />
             <div className="flex justify-end mt-[-10px] relative z-10 mr-1">
                <button className="w-[18px] h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 rounded-sm flex items-center justify-center shadow-sm active:shadow-inner">
                   <div className="flex gap-[1px]">
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                      <div className="w-[1.5px] h-[1.5px] bg-gray-600 rounded-full" />
                   </div>
                </button>
             </div>
          </div>

          <div className="flex items-center group mt-2">
             <label className="w-[100px] text-gray-700 text-[10.5px]">Shipping Type</label>
             <div className="flex-1 relative">
                <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white transition-colors">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>

       {/* Right Col - Checkboxes and Extra Fields */}
       <div className="flex-1 flex flex-col gap-1.5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer group mb-1 opacity-80">
             <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer" />
             <span className="text-[10.5px] text-gray-700 group-hover:text-black">Print Picking Sheet</span>
          </label>
          <div className="h-[1px] w-full bg-gray-300 my-1 ml-[-20px] max-w-[400px]" />
          
          <label className="flex items-center gap-2 cursor-pointer group hover:opacity-100 opacity-90">
             <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer accent-blue-600" />
             <span className="text-[10.5px] text-gray-700 group-hover:text-black font-semibold">Procure Non Drop-Ship Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer accent-blue-600" />
             <span className="text-[10.5px] text-gray-700 font-bold underline text-black">Procure Drop-Ship Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer accent-blue-600" />
             <span className="text-[10.5px] text-gray-700 font-bold text-black">Confirmed</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group mb-6">
             <input type="checkbox" defaultChecked className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer accent-blue-600" />
             <span className="text-[10.5px] text-gray-700 font-bold text-black border-b border-dotted border-gray-500">Allow Partial Delivery</span>
          </label>

          <div className="flex flex-col gap-1.5 mt-2 max-w-[340px]">
             <div className="flex items-center">
                <label className="w-[150px] text-gray-700 text-[10.5px]">Pick and Pack Remarks</label>
                <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm" />
             </div>
             <div className="flex items-center">
                <label className="w-[150px] text-gray-700 text-[10.5px]">BP Channel Name</label>
                <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm" />
             </div>
             <div className="flex items-center">
                <label className="w-[150px] text-gray-700 text-[10.5px]">BP Channel Contact</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
