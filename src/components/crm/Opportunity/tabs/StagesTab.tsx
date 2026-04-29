import React from 'react';
import { Search } from 'lucide-react';

export const StagesTab: React.FC = () => {
  const columns = [
    { label: '#', width: '25px' },
    { label: 'Start Date', width: '90px' },
    { label: 'Closing Date', width: '100px' },
    { label: 'Sales Employee', width: '140px' },
    { label: 'Stage', width: '80px' },
    { label: '%', width: '50px' },
    { label: 'Potential Amount', width: '120px' },
    { label: 'Weighted Amount', width: '120px' },
    { label: 'Show BPs Docs', width: '100px' },
    { label: 'Document Type', width: '120px' },
    { label: 'Doc. No.', width: '80px' },
    { label: 'Activities', width: '80px' },
    { label: 'Owner', width: '100px' }
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-x-auto custom-scrollbar pt-2">
       <div className="min-w-[1300px] flex flex-col border border-gray-400 h-[300px] mb-2 shadow-sm">
          {/* Header */}
          <div className="flex bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-b border-gray-400 shrink-0 h-[22px]">
             {columns.map((col, i) => (
                <div key={i} style={{ width: col.width }} className="px-1.5 py-1 text-[10.5px] font-bold text-gray-700 border-r border-gray-300 last:border-r-0 flex items-center text-gray-600">
                   {col.label}
                </div>
             ))}
          </div>

          {/* Data Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="flex border-b border-gray-200 h-[22px] bg-white hover:bg-blue-50 transition-colors">
                <div style={{ width: '25px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f8f8f8]">1</div>
                <div style={{ width: '90px' }} className="px-2 flex items-center text-[10.5px] border-r border-gray-200">30.03.26</div>
                <div style={{ width: '100px' }} className="border-r border-gray-200" />
                <div style={{ width: '140px' }} className="px-2 flex items-center text-[10.5px] border-r border-gray-200">-No Sales Employee-</div>
                <div style={{ width: '80px' }} className="border-r border-gray-200" />
                <div style={{ width: '50px' }} className="px-2 flex items-center justify-end text-[10.5px] border-r border-gray-200 font-mono">0.00</div>
                <div style={{ width: '120px' }} className="px-2 flex items-center justify-end text-[10.5px] border-r border-gray-200 font-mono">0.00</div>
                <div style={{ width: '120px' }} className="px-2 flex items-center justify-end text-[10.5px] border-r border-gray-200 font-mono">0.00</div>
                <div style={{ width: '100px' }} className="flex items-center justify-center border-r border-gray-200">
                   <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 accent-blue-600 cursor-pointer" />
                </div>
                <div style={{ width: '120px' }} className="border-r border-gray-200" />
                <div style={{ width: '80px' }} className="border-r border-gray-200" />
                <div style={{ width: '80px' }} className="flex items-center justify-center border-r border-gray-200">
                   <button className="w-5 h-4 flex items-center justify-center opacity-70 hover:opacity-100">
                      <Search className="w-3.5 h-3.5 text-orange-600 fill-current" />
                   </button>
                </div>
                <div style={{ width: '100px' }} className="border-r border-gray-200" />
             </div>
             {Array(12).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 h-[22px] bg-white group hover:bg-gray-50/50">
                   <div style={{ width: '25px' }} className="border-r border-gray-200 bg-[#f8f8f8] flex items-center justify-center text-[10px] text-gray-400 h-full">{i + 2}</div>
                   {columns.slice(1).map((col, ci) => (
                      <div key={ci} style={{ width: col.width }} className="border-r border-gray-200 last:border-r-0 h-full" />
                   ))}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
