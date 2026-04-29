import React from 'react';
import { ClassicTable, GreyBtn, YellowBtn } from '../../ui/ClassicERPUI';

export const AttachmentsTabAPCM: React.FC = () => {
  const headers = [
    '#', 'Target Path', 'File Name', 'Attachment Date', 'Free Text', 'Copy to Target Document'
  ];

  return (
    <div className="flex-1 flex gap-2 p-1 bg-white">
      <div className="flex-1 border border-[#d4d0c8] bg-[#f0f0f0]/30 min-h-[150px]">
        <ClassicTable headers={headers} rowCount={10} />
      </div>
      <div className="w-[100px] flex flex-col gap-2 pt-1 pr-1">
        <YellowBtn className="w-full text-[11px] font-medium h-[22px] flex items-center justify-center">Browse</YellowBtn>
        <GreyBtn className="w-full text-[11px] font-medium h-[22px] flex items-center justify-center">Display</GreyBtn>
        <GreyBtn className="w-full text-[11px] font-medium h-[22px] flex items-center justify-center">Delete</GreyBtn>
      </div>
    </div>
  );
};
