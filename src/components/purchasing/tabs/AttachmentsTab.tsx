import React from 'react';
import { ClassicTable, GreyBtn } from '../../ui/ClassicERPUI';

export const AttachmentsTab: React.FC = () => {
  const headers = [
    '#', 'Target Path', 'File Name', 'Attachment Date', 'Free Text', 'Copy to Target Document'
  ];

  return (
    <div className="flex-1 flex gap-2 p-1 bg-white">
      <div className="flex-1 border border-[#d4d0c8] bg-[#f0f0f0]/30 min-h-[150px]">
        <ClassicTable headers={headers} rowCount={8} />
      </div>
      <div className="w-[80px] flex flex-col gap-2 pt-1">
        <GreyBtn className="w-full text-[10px] bg-[#ffed99]/50">Browse</GreyBtn>
        <GreyBtn className="w-full text-[10px]">Display</GreyBtn>
        <GreyBtn className="w-full text-[10px]">Delete</GreyBtn>
      </div>
    </div>
  );
};
