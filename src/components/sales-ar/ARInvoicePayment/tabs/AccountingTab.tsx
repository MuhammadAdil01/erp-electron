import React from 'react';
import { ChevronDown } from 'lucide-react';

export const AccountingTab: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-12 h-full pt-4 select-none px-2">
       {/* Left Col */}
       <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1">
             <label className="w-[140px] text-[11px] text-gray-700">Journal Remark</label>
             <textarea className="flex-1 h-[40px] border border-gray-400 p-1 text-[11px] outline-none shadow-inner resize-none" />
          </div>

          <div className="flex flex-col gap-1 mt-4">
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">Payment Terms</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">Payment Method</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[140px] text-[11px] text-gray-700">Central Bank Ind.</label>
                <div className="flex-1 relative group">
                   <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-4 border-t border-gray-300 pt-4">
             <span className="text-[11px] font-bold text-gray-700">Manually Recalculate Due Date:</span>
             <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                   <input type="text" defaultValue="0" className="w-[40px] border border-gray-400 h-[18px] px-1 text-right text-[11px] outline-none" />
                   <span className="text-[11px] text-gray-700">Months +</span>
                </div>
                <div className="flex items-center gap-1">
                   <input type="text" defaultValue="0" className="w-[40px] border border-gray-400 h-[18px] px-1 text-right text-[11px] outline-none" />
                   <span className="text-[11px] text-gray-700">Days</span>
                </div>
             </div>
             <div className="flex items-center mt-3">
                <label className="w-[160px] text-[11px] text-gray-700">Cash Discount Date Offset:</label>
                <input type="text" className="w-[60px] border border-gray-400 h-[18px] px-1 text-right text-[11px] outline-none" />
             </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-6">
             <input type="checkbox" className="w-[13px] h-[13px]" />
             <span className="text-[11px] text-gray-700">Use Shipped Goods Account</span>
          </label>
       </div>

       {/* Right Col */}
       <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Business Partner Project</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Create QR Code From</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
          </div>
          <div className="h-[1px] bg-gray-300 my-2" />

          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Cancellation Date</label>
             <input type="text" disabled className="flex-1 bg-[#f0f0f0] border border-gray-400 h-[18px] px-1 text-[11px]" />
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Required Date</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
          </div>
          <div className="h-[1px] bg-gray-300 my-2" />

          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Indicator</label>
             <div className="flex-1 relative group">
                <input type="text" className="w-full border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Federal Tax ID</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
          </div>
          <div className="h-[1px] bg-gray-300 my-2" />

          <div className="flex items-center">
             <label className="w-[160px] text-[11px] text-gray-700">Order Number</label>
             <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
          </div>
          
          <div className="mt-12 flex items-center gap-4">
             <label className="text-[11px] text-gray-700 font-bold underline">Referenced Document</label>
             <button className="px-2 h-[18px] bg-[#f0f0f0] border border-gray-500 rounded-[1px] flex items-center justify-center text-[10px] font-bold">...</button>
          </div>
       </div>
    </div>
  );
};
