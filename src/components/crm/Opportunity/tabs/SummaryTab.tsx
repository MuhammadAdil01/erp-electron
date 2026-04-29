import React, { useState } from 'react';

export const SummaryTab: React.FC = () => {
  const [status, setStatus] = useState('Open');

  return (
    <div className="flex flex-col h-full bg-white select-none pt-4 select-none px-2 shadow-sm">
       <div className="flex items-center mb-6">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Opportunity Status</label>
          <div className="flex items-center gap-8">
             {['Open', 'Won', 'Lost'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                   <div 
                     onClick={() => setStatus(s)}
                     className={`w-[13.5px] h-[13.5px] rounded-full border border-gray-500 flex items-center justify-center transition-all shadow-sm ${status === s ? 'bg-white' : 'bg-[#f0f0f0] hover:bg-white'}`}
                   >
                      {status === s && <div className="w-[7px] h-[7px] rounded-full bg-black/80" />}
                   </div>
                   <span className={`text-[10.5px] ${status === s ? 'font-bold underline text-black' : 'text-gray-600'}`}>{s}</span>
                </label>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-[1fr_380px] gap-x-12 h-[220px]">
          {/* Left Fields */}
          <div className="flex flex-col gap-1.5 pt-2">
             <div className="flex items-center opacity-60">
                <label className="w-[140px] text-gray-700 text-[10.5px]">Document Type</label>
                <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
             </div>
             <div className="flex items-center opacity-60">
                <label className="w-[140px] text-gray-700 text-[10.5px]">Document No.</label>
                <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
             </div>
             <label className="flex items-center gap-2 mt-6 cursor-pointer group opacity-80">
                <input type="checkbox" className="w-[13px] h-[13px] border border-gray-500 rounded-[1px] cursor-pointer" />
                <span className="text-gray-700 text-[10.5px] group-hover:text-black leading-tight">Show Documents Related to the BP</span>
             </label>
          </div>

          {/* Right Reason Table */}
          <div className="flex flex-col border border-gray-400 bg-white overflow-hidden shadow-sm h-full rounded-sm">
             <div className="bg-[#f0f0f0] border-b border-gray-300 flex items-center shrink-0 h-[22px]">
                <span className="px-2 text-[10.5px] font-bold text-gray-700 underline">Reasons:</span>
             </div>
             <div className="flex bg-[#e4e4e4] border-b border-gray-400 shrink-0 h-[22px]">
                <div style={{ width: '25px' }} className="px-1.5 py-1 text-[10px] font-bold text-gray-700 border-r border-gray-300 flex items-center">#</div>
                <div style={{ width: '355px' }} className="px-1.5 py-1 text-[10px] font-bold text-gray-700 flex items-center">
                   Description
                   <div className="ml-auto w-3.5 h-3.5 bg-white border border-gray-400 rounded-sm flex items-center justify-center opacity-70">
                      <div className="w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45 translate-x-[-0.5px] translate-y-[0.5px]" />
                   </div>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex border-b border-gray-200 h-[20px] bg-white group hover:bg-blue-50 transition-colors">
                   <div style={{ width: '25px' }} className="px-1 flex items-center justify-center text-[10px] border-r border-gray-200 bg-[#f8f8f8]">1</div>
                   <div style={{ width: '355px' }} className="h-full" />
                </div>
                {Array(8).fill(null).map((_, i) => (
                   <div key={i} className="flex border-b border-gray-200 h-[20px] bg-white group hover:bg-gray-50/50">
                      <div style={{ width: '25px' }} className="border-r border-gray-200 bg-[#f8f8f8] flex items-center justify-center text-[10px] text-gray-400 h-full">{i + 2}</div>
                      <div style={{ width: '355px' }} className="h-full" />
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};
