import React from 'react';

export const ActivityAttachmentsTab: React.FC = () => {
  const columns = [
    { label: '#', width: '30px' },
    { label: 'Target Path', width: '250px' },
    { label: 'File Name', width: '150px' },
    { label: 'Attachment Date', width: '120px' }
  ];

  const emptyRows = Array(6).fill(null);

  return (
    <div className="flex gap-4 p-2 h-full bg-white select-none">
       {/* Table Section */}
       <div className="flex-1 flex flex-col border border-gray-400 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-b border-gray-400">
             {columns.map((col, i) => (
                <div 
                  key={i} 
                  style={{ width: col.width }}
                  className="px-2 py-1 text-[10.5px] font-bold text-gray-700 border-r border-gray-300 last:border-r-0 flex items-center h-[22px]"
                >
                   {col.label}
                   {col.label === 'Attachment Date' && (
                     <div className="ml-auto w-3.5 h-3.5 bg-white border border-gray-400 rounded-sm flex items-center justify-center opacity-70">
                        <div className="w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45 translate-x-[-0.5px] translate-y-[0.5px]" />
                     </div>
                   )}
                </div>
             ))}
          </div>

          {/* Body */}
          <div className="flex-1 bg-white overflow-y-auto custom-scrollbar">
             {emptyRows.map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 hover:bg-blue-50 transition-colors h-[20px]">
                   {columns.map((col, ci) => (
                      <div 
                        key={ci} 
                        style={{ width: col.width }}
                        className="border-r border-gray-200 last:border-r-0 h-full bg-[#f8f8f8]"
                      />
                   ))}
                </div>
             ))}
          </div>

          {/* Horizontal Scroll Bar Placeholder */}
          <div className="h-[18px] bg-[#f0f0f0] border-t border-gray-400 flex items-center px-1">
             <div className="w-3 h-3 border-l border-t border-gray-400 rotate-[-135deg] ml-1" />
             <div className="flex-1 h-3.5 mx-2 bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border border-gray-400 rounded-sm flex items-center justify-center gap-0.5">
                <div className="w-0.5 h-1.5 bg-gray-500" />
                <div className="w-0.5 h-1.5 bg-gray-500" />
                <div className="w-0.5 h-1.5 bg-gray-500" />
             </div>
             <div className="w-3 h-3 border-l border-t border-gray-400 rotate-45 mr-1" />
          </div>
       </div>

       {/* Buttons Section */}
       <div className="w-[120px] flex flex-col gap-2 pt-2">
          <div className="relative group/btn">
             <button className="w-full h-[22px] bg-gradient-to-b from-[#ffffff] via-[#fff9c4] to-[#f8f1cf] border border-gray-500 text-[11px] font-bold shadow-sm rounded-[3px] text-left px-4 group-active/btn:shadow-inner">
                Browse
             </button>
             <div className="absolute right-0 top-0 bottom-0 w-[20px] border-l border-gray-500/30 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-black/80" />
             </div>
          </div>

          <button disabled className="w-full h-[22px] bg-gradient-to-b from-white to-[#eeeeee] border border-gray-400 text-[11px] font-bold text-gray-400 shadow-sm rounded-[3px] cursor-not-allowed">
             Display
          </button>

          <div className="mt-auto mb-1">
             <button className="w-full h-[22px] bg-gradient-to-b from-white to-[#eeeeee] border border-gray-500 text-[11px] font-bold shadow-sm rounded-[3px] hover:from-white active:shadow-inner">
                Delete
             </button>
          </div>
       </div>
    </div>
  );
};
