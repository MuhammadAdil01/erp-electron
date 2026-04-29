import React from 'react';

export const RemarksTab: React.FC = () => {
  return (
    <div className="h-full w-full bg-white p-1">
       <textarea 
         className="w-full h-full bg-[#fff9c4] border border-gray-400 p-2 outline-none resize-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1)] custom-scrollbar text-[11px] font-sans"
         placeholder=""
       />
    </div>
  );
};
