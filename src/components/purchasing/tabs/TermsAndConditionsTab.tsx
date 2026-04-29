import React from 'react';

export const TermsAndConditionsTab: React.FC = () => (
  <div className="flex-1 flex p-1 bg-white overflow-hidden">
    <textarea 
      className="flex-1 border border-[#d4d0c8] outline-none text-[10.5px] p-2 resize-none shadow-inner"
      placeholder="Enter Terms & Conditions here..."
    />
  </div>
);
