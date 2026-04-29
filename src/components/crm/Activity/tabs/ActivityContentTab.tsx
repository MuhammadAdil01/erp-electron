import React from 'react';

export const ActivityContentTab: React.FC = () => {
  return (
    <div className="h-full w-full bg-white p-1 flex flex-col pt-4">
       <textarea 
         className="flex-1 w-full bg-[#fff9c4] border border-gray-400 p-2 outline-none resize-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.1)] custom-scrollbar text-[11px] font-sans"
         placeholder=""
       />
    </div>
  );
};


export const ActivityAttachmentsTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full p-4 bg-[#f0f0f0]/50 border border-dotted border-gray-400 rounded-sm items-center justify-center pt-8">
       <div className="text-gray-400 italic text-[11px]">No attachments found</div>
       <button className="px-6 py-1 bg-gradient-to-b from-white to-[#cccccc] border border-gray-500 text-[10.5px] font-bold rounded-sm shadow-sm hover:from-white active:shadow-inner">Browse...</button>
    </div>
  );
};
