import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const PaymentRunTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full p-2 overflow-y-auto custom-scrollbar">
       {/* House Bank Group */}
       <div className="w-[380px] bg-[#f0f0f0] border border-gray-300 p-4 pt-6 relative shadow-sm h-fit shrink-0">
          <span className="absolute -top-2.5 left-2 bg-white px-2 text-gray-700 font-bold text-[11px] border-x border-gray-300 rounded-t-[2px]">House Bank</span>
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px]">Country/Region</label>
                <div className="flex-1 relative pr-[22px]">
                   <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                   <div className="absolute right-[22px] top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                   <div className="absolute -right-3 top-0 bottom-0 flex items-center">
                     <button className="w-[15px] h-[15px] bg-[#eeeeee] border border-gray-400 rounded-sm flex items-center justify-center text-[10px] shadow-sm hover:bg-white active:shadow-inner font-serif transition-colors">ⓘ</button>
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px]">Bank</label>
                <div className="flex-1 relative pl-[22px]">
                   <div className="absolute left-0 top-0 bottom-0 w-[20px] flex items-center justify-center">
                      <button className="text-orange-600 hover:scale-110 transition-transform">
                        <Search className="w-3 h-3 fill-current ml-1" />
                      </button>
                   </div>
                   <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px]">Account</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center opacity-70">
                <label className="w-[120px] text-gray-700 text-[10.5px]">Branch</label>
                <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
             </div>
             <div className="flex items-center">
                <label className="w-[120px] text-gray-700 text-[10.5px]">IBAN</label>
                <div className="flex-1 relative">
                   <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
             <div className="flex items-center opacity-70">
                <label className="w-[120px] text-gray-700 text-[10.5px]">BIC/SWIFT Code</label>
                <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
             </div>
             <div className="flex items-center opacity-70">
                <label className="w-[120px] text-gray-700 text-[10.5px]">Control No.</label>
                <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner" />
             </div>
          </div>
       </div>

       {/* Reference Details Bottom Section */}
       <div className="flex flex-col gap-2.5 mt-8 px-2 max-w-[400px]">
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px] pr-2">Reference Details</label>
             <input type="text" className="w-[120px] bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
          </div>
          <div className="flex items-center gap-2">
             <input type="checkbox" className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-sm cursor-pointer accent-blue-600" />
             <label className="text-gray-700 text-[10.5px] w-[119px] shrink-0">Payment Block</label>
             <div className="w-[120px] relative shrink-0">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <input type="checkbox" className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-sm cursor-pointer accent-blue-600" />
             <label className="text-gray-700 text-[10.5px]">Single Payment</label>
          </div>
          <div className="flex items-center gap-2">
             <input type="checkbox" className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-sm cursor-pointer accent-blue-600" />
             <label className="text-gray-700 text-[10.5px]">Collection Authorization</label>
          </div>
          <div className="flex items-center mt-2 group">
             <label className="w-[140px] text-gray-700 text-[10.5px] leading-tight pr-2 group-hover:text-black">Bank Charges Allocation Code</label>
             <div className="w-[60px] relative">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
