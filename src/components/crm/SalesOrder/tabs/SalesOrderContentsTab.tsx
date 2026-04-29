import React from 'react';
import { ChevronDown } from 'lucide-react';

export const SalesOrderContentsTab: React.FC = () => {
  const columns = [
    { label: '#', width: '25px' },
    { label: 'Item No.', width: '100px' },
    { label: 'Quantity', width: '70px' },
    { label: 'Unit Price', width: '80px' },
    { label: 'Discount %', width: '70px' },
    { label: 'Tax Code', width: '60px' },
    { label: 'Total (LC)', width: '110px' },
    { label: 'Distr. Rule', width: '80px' },
    { label: 'UoM Code', width: '80px' },
    { label: 'COGS Distr. Rule', width: '110px' },
    { label: 'Country/Region of Origin', width: '160px' },
    { label: 'Blanket Agreement No.', width: '140px' },
    { label: 'Allow Procmnt. Doc.', width: '130px' },
    { label: 'Standard Item Identification', width: '180px' },
    { label: 'Commodity Classification', width: '160px' },
    { label: 'Retention %', width: '80px' },
    { label: 'IPC No.', width: '60px' }
  ];

  return (
    <div className="flex flex-col h-full select-none overflow-x-auto custom-scrollbar pt-2">
       <div className="flex items-center gap-4 mb-2 shrink-0">
          <div className="flex items-center gap-2">
             <label className="text-gray-700 text-[10.5px]">Item/Service Type</label>
             <div className="relative group">
                <input type="text" defaultValue="Item" className="w-[100px] border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm shadow-black/5" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
             <label className="text-gray-700 text-[10.5px]">Summary Type</label>
             <div className="relative group">
                <input type="text" defaultValue="No Summary" className="w-[120px] border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm shadow-black/5" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>

       <div className="min-w-[1800px] flex flex-col border border-gray-400 h-[300px] shadow-sm rounded-sm mb-1 overflow-hidden">
          {/* Header */}
          <div className="flex bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-b border-gray-400 shrink-0 h-[22px]">
             {columns.map((col, i) => (
                <div key={i} style={{ width: col.width }} className="px-1.5 py-1 text-[10px] font-bold text-gray-700 border-r border-gray-300 last:border-r-0 flex items-center truncate">
                   {col.label}
                </div>
             ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="flex border-b border-gray-200 h-[20px] bg-white group hover:bg-blue-50 transition-colors">
                <div style={{ width: '25px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f8f8f8]">1</div>
                <div style={{ width: '100px' }} className="border-r border-gray-200 h-full select-all" />
                <div style={{ width: '70px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '80px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '70px' }} className="px-2 flex items-center justify-end text-[10px] font-mono border-r border-gray-200 h-full">0.00</div>
                <div style={{ width: '60px' }} className="px-2 flex items-center text-[10px] font-bold border-r border-gray-200 h-full">S1</div>
                <div style={{ width: '110px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '80px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '80px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '110px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '160px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '140px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '130px' }} className="flex items-center justify-center border-r border-gray-200 h-full">
                   <input type="checkbox" className="w-[12px] h-[12px] border border-gray-400 accent-blue-600 cursor-pointer" />
                </div>
                <div style={{ width: '180px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '160px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '80px' }} className="px-2 flex items-center justify-end text-[10px] font-mono border-r border-gray-200 h-full">0.00</div>
                <div style={{ width: '60px' }} className="border-r border-gray-200 last:border-r-0 h-full" />
             </div>
             {Array(13).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 h-[20px] bg-white group hover:bg-gray-50/50 transition-colors">
                   <div style={{ width: '25px' }} className="border-r border-gray-200 bg-[#f8f8f8] flex items-center justify-center text-[10px] text-gray-400 h-full">{i + 2}</div>
                   {columns.slice(1).map((col, ci) => (
                      <div key={ci} style={{ width: col.width }} className="border-r border-gray-200 last:border-r-0 h-full" />
                   ))}
                </div>
             ))}
          </div>
       </div>

       {/* Horizontal Scroll Bar Placeholder */}
       <div className="h-[18px] bg-[#f0f0f0] border-t border-gray-400 flex items-center px-1 shrink-0 mb-1">
          <div className="w-3 h-3 border-l border-t border-gray-400 rotate-[-135deg] ml-1 opacity-60" />
          <div className="flex-1 h-3.5 mx-2 bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border border-gray-400 rounded-sm flex items-center justify-center gap-0.5 shadow-inner">
             <div className="w-0.5 h-1.5 bg-gray-500/40" />
             <div className="w-0.5 h-1.5 bg-gray-500/40" />
             <div className="w-0.5 h-1.5 bg-gray-500/40" />
          </div>
          <div className="w-3 h-3 border-l border-t border-gray-400 rotate-45 mr-1 opacity-60" />
       </div>
    </div>
  );
};
