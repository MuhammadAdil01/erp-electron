import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ARInvoicePaymentContentsTab: React.FC = () => {
  const columns = [
    { label: '#', width: '30px' },
    { label: 'Item No.', width: '120px' },
    { label: 'Quantity', width: '80px' },
    { label: 'Unit Price', width: '90px' },
    { label: 'Discount %', width: '80px' },
    { label: 'Tax Code', width: '70px' },
    { label: 'WTax Liable', width: '80px' },
    { label: 'Total (LC)', width: '120px' },
    { label: 'Distr. Rule', width: '90px' },
    { label: 'UoM Code', width: '90px' },
    { label: 'COGS Distr. Rule', width: '120px' },
    { label: 'Country/Region of Origin', width: '160px' },
    { label: 'Blanket Agreement No.', width: '150px' },
    { label: 'Standard Item Identification', width: '180px' },
    { label: 'Commodity Classification', width: '160px' },
    { label: 'Retention %', width: '90px' },
    { label: 'IPC No.', width: '70px' },
    { label: 'Reje...', width: '50px' }
  ];

  return (
    <div className="flex flex-col h-full select-none pt-1">
       {/* Sub Header */}
       <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
             <label className="text-[11px] text-gray-700">Item/Service Type</label>
             <div className="relative group">
                <input type="text" defaultValue="Item" className="w-[100px] border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <label className="text-[11px] text-gray-700">Summary Type</label>
             <div className="relative group">
                <input type="text" defaultValue="No Summary" className="w-[120px] border border-gray-400 h-[18px] px-1 text-[11px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                   <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>
       </div>

       {/* Grid Area */}
       <div className="flex-1 flex gap-1 overflow-hidden">
          <div className="flex-1 border border-gray-400 overflow-hidden flex flex-col bg-white">
             {/* Header */}
             <div className="flex bg-[#f0f0f0] border-b border-gray-400 shrink-0 h-[20px] overflow-x-hidden">
                {columns.map((col, i) => (
                   <div key={i} style={{ width: col.width }} className="px-1.5 py-0.5 text-[10px] font-bold text-[#333] border-r border-gray-300 last:border-r-0 flex items-center truncate">
                      {col.label}
                   </div>
                ))}
             </div>

             {/* Body */}
             <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="min-w-fit">
                   <div className="flex border-b border-gray-200 h-[18px] bg-white">
                      <div style={{ width: '30px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f0f0f0]">1</div>
                      <div style={{ width: '120px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '80px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '90px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '80px' }} className="px-2 flex items-center justify-end text-[10px] border-r border-gray-200 h-full">0.00</div>
                      <div style={{ width: '70px' }} className="px-2 flex items-center text-[10px] font-bold border-r border-gray-200 h-full">S1</div>
                      <div style={{ width: '80px' }} className="border-r border-gray-200 h-full flex items-center justify-center">
                         <input type="checkbox" className="w-[12px] h-[12px]" />
                      </div>
                      <div style={{ width: '120px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '90px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '90px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '120px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '160px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '150px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '180px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '160px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '90px' }} className="px-2 flex items-center justify-end text-[10px] border-r border-gray-200 h-full">0.00</div>
                      <div style={{ width: '70px' }} className="border-r border-gray-200 h-full" />
                      <div style={{ width: '50px' }} className="border-r border-gray-200 h-full" />
                   </div>
                   {Array(20).fill(null).map((_, i) => (
                      <div key={i} className="flex border-b border-gray-100 h-[18px] bg-white">
                         <div style={{ width: '30px' }} className="border-r border-gray-200 bg-[#f0f0f0] flex items-center justify-center text-[10px] text-gray-500">{i + 2}</div>
                         {columns.slice(1).map((col, ci) => (
                            <div key={ci} style={{ width: col.width }} className="border-r border-gray-100 h-full" />
                         ))}
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right Arrow Controls */}
          <div className="w-[20px] flex flex-col gap-1 pt-[20px] shrink-0">
             <button className="w-[18px] h-[18px] border border-gray-500 bg-[#f0f0f0] flex items-center justify-center shadow-sm hover:brightness-95 active:shadow-inner">
                <ChevronUp className="w-3 h-3 text-black" />
             </button>
             <button className="w-[18px] h-[18px] border border-gray-500 bg-[#f0f0f0] flex items-center justify-center shadow-sm hover:brightness-95 active:shadow-inner">
                <ChevronDown className="w-3 h-3 text-black" />
             </button>
          </div>
       </div>

       {/* Horizontal Scroll Placeholder */}
       <div className="h-[16px] bg-[#f0f0f0] border border-gray-400 mt-1 flex items-center justify-between px-1 shrink-0">
          <div className="w-4 h-full flex items-center justify-center text-gray-500 text-[10px] cursor-pointer">◄</div>
          <div className="flex-1 mx-4 h-[10px] bg-gray-300 border border-gray-400 relative">
             <div className="absolute left-0 w-[100px] h-full bg-gradient-to-b from-white to-gray-400 border-x border-gray-500" />
          </div>
          <div className="w-4 h-full flex items-center justify-center text-gray-500 text-[10px] cursor-pointer">►</div>
       </div>
    </div>
  );
};
