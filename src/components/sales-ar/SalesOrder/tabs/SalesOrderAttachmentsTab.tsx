import React from 'react';

export const SalesOrderAttachmentsTab: React.FC = () => {
  const columns = [
    { label: '#', width: '30px' },
    { label: 'Target Path', width: '250px' },
    { label: 'File Name', width: '150px' },
    { label: 'Attachment Date', width: '120px' },
    { label: 'Free Text', width: '150px' }
  ];

  return (
    <div className="flex gap-4 h-full pt-4 select-none px-2 overflow-hidden">
       {/* Table Section */}
       <div className="flex-1 flex flex-col border border-gray-400 overflow-hidden bg-white">
          {/* Header */}
          <div className="flex bg-[#f0f0f0] border-b border-gray-400 shrink-0 h-[20px]">
             {columns.map((col, i) => (
                <div key={i} style={{ width: col.width }} className="px-1.5 py-0.5 text-[10px] font-bold text-[#333] border-r border-gray-300 last:border-r-0 flex items-center truncate">
                   {col.label}
                </div>
             ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto custom-scrollbar">
             {Array(15).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-100 h-[18px]">
                   <div style={{ width: '30px' }} className="border-r border-gray-200 bg-[#f0f0f0] flex items-center justify-center text-[10px] text-gray-500">{i + 1}</div>
                   {columns.slice(1).map((col, ci) => (
                      <div key={ci} style={{ width: col.width }} className="border-r border-gray-100 h-full" />
                   ))}
                </div>
             ))}
          </div>
       </div>

       {/* Buttons Section */}
       <div className="w-[100px] flex flex-col gap-2 shrink-0">
          <div className="relative group/btn">
             <button className="w-full h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] text-left px-2 flex items-center">
                Browse
             </button>
             <div className="absolute right-0 top-0 bottom-0 w-[16px] border-l border-gray-500/20 flex items-center justify-center pointer-events-none">
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-black/80" />
             </div>
          </div>
          <button disabled className="w-full h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-400 text-[11px] text-gray-400 shadow-sm rounded-[1px] cursor-not-allowed">
             Display
          </button>
          <div className="mt-auto pb-4">
             <button className="w-full h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px]">
                Delete
             </button>
          </div>
       </div>
    </div>
  );
};
