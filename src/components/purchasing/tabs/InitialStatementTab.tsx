import React from 'react';

export const InitialStatementTab: React.FC = () => (
  <div className="flex-1 flex flex-col gap-4 p-4 bg-white overflow-y-auto">
    <div className="flex-1 min-h-[100px]">
      <div className="text-[10.5px] text-[#333] font-bold mb-1">Statement I</div>
      <textarea className="w-full h-full border border-[#d4d0c8] outline-none p-2 text-[11px] shadow-inner focus:border-orange-400 resize-none" />
    </div>
    <div className="flex-1 min-h-[100px]">
      <div className="text-[10.5px] text-[#333] font-bold mb-1">Statement II</div>
      <textarea className="w-full h-full border border-[#d4d0c8] outline-none p-2 text-[11px] shadow-inner focus:border-orange-400 resize-none" />
    </div>
    <div className="flex-1 min-h-[100px]">
      <div className="text-[10.5px] text-[#333] font-bold mb-1">Statement III</div>
      <textarea className="w-full h-full border border-[#d4d0c8] outline-none p-2 text-[11px] shadow-inner focus:border-orange-400 resize-none" />
    </div>
  </div>
);
