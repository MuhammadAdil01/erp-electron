import React from 'react';
import { ChevronDown } from 'lucide-react';

export const PotentialTab: React.FC = () => {
  const columns = [
    { label: '#', width: '25px' },
    { label: 'Description', width: '220px' },
    { label: 'Primary', width: '60px' }
  ];

  return (
    <div className="grid grid-cols-[1fr_340px] gap-x-12 h-full pt-4">
       {/* Left Col */}
       <div className="flex flex-col gap-1.5">
          <div className="flex items-center group">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Predicted Closing In</label>
             <div className="flex-1 flex gap-2">
                <input type="text" className="w-[85px] bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-sm shadow-black/5 text-[10.5px]" />
                <div className="flex-1 relative">
                   <input type="text" defaultValue="Days" className="w-full bg-white border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none" />
                   <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Predicted Closing Date</label>
             <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
          </div>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Potential Amount</label>
             <input type="text" defaultValue="0.00" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 text-right text-[10.5px] font-mono outline-none shadow-sm" />
          </div>
          <div className="flex items-center opacity-60 pointer-events-none">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Weighted Amount</label>
             <input type="text" defaultValue="0.00" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 text-right text-[10.5px] font-mono shadow-inner" />
          </div>
          <div className="flex items-center">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Gross Profit %</label>
             <input type="text" defaultValue="0.00" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 text-right text-[10.5px] font-mono outline-none shadow-sm" />
          </div>
          <div className="flex items-center opacity-60 pointer-events-none">
             <label className="w-[140px] text-gray-700 text-[10.5px]">Gross Profit Total</label>
             <input type="text" defaultValue="0.00" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 text-right text-[10.5px] font-mono shadow-inner" />
          </div>
          <div className="flex items-center mt-4 group">
             <label className="w-[140px] text-gray-700 text-[10.5px] font-bold">Level of Interest</label>
             <div className="flex-1 relative">
                <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-sm shadow-black/5" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>

       {/* Right Col - Interest Range Table */}
       <div className="flex flex-col border border-gray-400 bg-white overflow-hidden shadow-sm h-[200px]">
          <div className="bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-b border-gray-400 flex items-center shrink-0 h-[22px]">
             <span className="px-2 text-[10.5px] font-bold text-gray-700">Interest Range</span>
          </div>
          <div className="flex bg-[#e4e4e4] border-b border-gray-400 shrink-0 h-[22px]">
             {columns.map((col, i) => (
                <div key={i} style={{ width: col.width }} className="px-1 py-1 text-[10px] font-bold border-r border-gray-300 last:border-r-0 flex items-center text-gray-600">
                   {col.label}
                   {col.label === 'Primary' && (
                      <div className="ml-auto w-3.5 h-3.5 bg-white border border-gray-400 rounded-sm flex items-center justify-center opacity-70">
                         <div className="w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45 translate-x-[-0.5px] translate-y-[0.5px]" />
                      </div>
                   )}
                </div>
             ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="flex border-b border-gray-200 h-[20px] bg-white group hover:bg-blue-50 transition-colors">
                <div style={{ width: '25px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f8f8f8]">1</div>
                <div style={{ width: '220px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '60px' }} className="flex items-center justify-center h-full">
                   <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 rounded-none cursor-pointer accent-blue-600" />
                </div>
             </div>
             {Array(8).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 h-[20px] bg-white">
                   <div style={{ width: '25px' }} className="border-r border-gray-200 bg-[#f8f8f8] h-full flex items-center justify-center text-[10px] text-gray-400">{i + 2}</div>
                   <div style={{ width: '220px' }} className="border-r border-gray-200 h-full" />
                   <div style={{ width: '60px' }} className="h-full" />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
