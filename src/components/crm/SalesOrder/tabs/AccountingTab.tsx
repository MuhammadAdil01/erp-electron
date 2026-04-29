import React from 'react';
import { ChevronDown } from 'lucide-react';

export const AccountingTab: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-16 h-full pt-4 select-none px-2 shadow-sm">
       {/* Left Col */}
       <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Journal Remark</label>
             <textarea className="flex-1 h-[45px] bg-white border border-gray-400 p-1.5 text-[10.5px] outline-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] resize-none custom-scrollbar" />
          </div>

          <div className="flex flex-col gap-1.5 mt-10 max-w-[340px]">
             <div className="flex items-center group">
                <label className="w-[140px] text-gray-700 text-[10.5px]">Payment Terms</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center group">
                <label className="w-[140px] text-gray-700 text-[10.5px]">Payment Method</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center group">
                <label className="w-[140px] text-gray-700 text-[10.5px]">Central Bank Ind.</label>
                <div className="flex-1 relative transition-all">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-10 border-t border-gray-300 pt-6 max-w-[420px]">
             <span className="text-[10.5px] font-bold text-gray-700 mb-3 block">Manually Recalculate Due Date:</span>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="relative group">
                      <input type="text" defaultValue="0" className="w-[45px] border border-gray-400 h-[18px] px-2 text-right text-[10.5px] outline-none shadow-sm font-mono" />
                      <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-l border-gray-400 flex flex-col items-center justify-center gap-[1px]">
                         <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[4.5px] border-b-gray-600 cursor-pointer hover:border-b-black" />
                         <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] border-t-gray-600 cursor-pointer hover:border-t-black" />
                      </div>
                   </div>
                   <span className="text-[10.5px] text-gray-600 font-medium tracking-tight">Months +</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="relative group">
                      <input type="text" defaultValue="0" className="w-[45px] border border-gray-400 h-[18px] px-2 text-right text-[10.5px] outline-none shadow-sm font-mono" />
                      <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-l border-gray-400 flex flex-col items-center justify-center gap-[1px]">
                         <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[4.5px] border-b-gray-600 cursor-pointer hover:border-b-black" />
                         <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] border-t-gray-600 cursor-pointer hover:border-t-black" />
                      </div>
                   </div>
                   <span className="text-[10.5px] text-gray-600 font-medium tracking-tight">Days</span>
                </div>
             </div>
             <div className="flex items-center mt-5">
                <label className="w-[160px] text-gray-700 text-[10.5px] font-medium">Cash Discount Date Offset:</label>
                <input type="text" className="w-[65px] border border-gray-400 h-[18px] px-1 shadow-sm outline-none text-[10.5px] text-right font-mono" />
             </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer group mt-8 opacity-80 hover:opacity-100 transition-opacity">
             <input type="checkbox" className="w-[13.5px] h-[13.5px] border border-gray-400 rounded-[1px] cursor-pointer accent-blue-600" />
             <span className="text-[10.5px] text-gray-700 font-bold underline decoration-gray-400">Use Shipped Goods Account</span>
          </label>
       </div>

       {/* Right Col */}
       <div className="flex flex-col gap-1.5 max-w-[360px] pt-1">
          <div className="flex items-center">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Business Partner Project</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm select-all" />
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Create QR Code From</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm" />
          </div>
          <div className="h-[2px] w-full bg-gray-200 my-4 opacity-50" />

          <div className="flex items-center opacity-70 cursor-not-allowed">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Cancellation Date</label>
             <input type="text" disabled className="flex-1 bg-[#f5f5f5] border border-gray-300 h-[18px] px-1 text-[10.5px]" />
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Required Date</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm select-all font-mono" />
          </div>
          <div className="h-[2px] w-full bg-gray-200 my-4 opacity-50" />

          <div className="flex items-center group">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Indicator</label>
             <div className="flex-1 relative">
                <input type="text" className="w-full border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px] shadow-sm" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Federal Tax ID</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm uppercase" />
          </div>
          <div className="h-[2px] w-full bg-gray-200 my-4 opacity-50" />

          <div className="flex items-center">
             <label className="w-[160px] text-gray-700 text-[10.5px]">Order Number</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm" />
          </div>
          
          <div className="mt-20 flex items-center gap-6">
             <label className="text-gray-700 text-[10.5px] font-bold underline decoration-gray-500 text-black">Referenced Document</label>
             <button className="px-[14px] h-[20px] bg-gradient-to-b from-white via-gray-100 to-gray-300 border border-gray-400 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.1)] active:shadow-inner text-gray-800 font-extrabold flex items-center justify-center text-[12px] pb-[4px]">...</button>
          </div>
       </div>
    </div>
  );
};
