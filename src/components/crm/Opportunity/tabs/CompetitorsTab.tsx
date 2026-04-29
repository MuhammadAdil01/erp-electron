import React from 'react';

export const CompetitorsTab: React.FC = () => {
  const columns = [
    { label: '#', width: '25px' },
    { label: 'Name', width: '250px' },
    { label: 'Threat Level', width: '200px' },
    { label: 'Remarks', width: '350px' },
    { label: 'Won', width: '60px' }
  ];

  return (
    <div className="flex flex-col h-full bg-white select-none pt-2">
       <div className="flex flex-col border border-gray-400 h-[300px] overflow-hidden shadow-sm">
          <div className="flex bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-b border-gray-400 shrink-0 h-[22px]">
             {columns.map((col, i) => (
                <div key={i} style={{ width: col.width }} className="px-1.5 py-1 text-[10.5px] font-bold text-gray-700 border-r border-gray-300 last:border-r-0 flex items-center text-gray-600">
                   {col.label}
                   {col.label === 'Won' && (
                      <div className="ml-auto w-3.5 h-3.5 bg-white border border-gray-400 rounded-sm flex items-center justify-center opacity-70">
                         <div className="w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45 translate-x-[-0.5px] translate-y-[0.5px]" />
                      </div>
                   )}
                </div>
             ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="flex border-b border-gray-200 h-[22px] bg-white group hover:bg-blue-50 transition-colors">
                <div style={{ width: '25px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f8f8f8]">1</div>
                <div style={{ width: '250px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '200px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '350px' }} className="border-r border-gray-200 h-full" />
                <div style={{ width: '60px' }} className="flex items-center justify-center border-r border-gray-200 last:border-r-0 h-full">
                   <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 accent-blue-600 cursor-pointer" />
                </div>
             </div>
             {Array(11).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 h-[22px] bg-white group hover:bg-gray-50/50">
                   <div style={{ width: '25px' }} className="border-r border-gray-200 bg-[#f8f8f8] flex items-center justify-center text-[10px] text-gray-400 h-full">{i + 2}</div>
                   {columns.slice(1, -1).map((col, ci) => (
                      <div key={ci} style={{ width: col.width }} className="border-r border-gray-200 h-full" />
                   ))}
                   <div style={{ width: '60px' }} className="border-r border-gray-200 last:border-r-0 h-full" />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
