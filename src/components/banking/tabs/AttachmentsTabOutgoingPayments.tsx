import React from 'react';
import { ClassicTable, GreyBtn } from '../../ui/ClassicERPUI';
import { ChevronDown } from 'lucide-react';

export const AttachmentsTabOutgoingPayments: React.FC = () => {
  const headers = [
    '#', 'Target Path', 'File Name', 'File Extension', 'File Size', 
    'Attachment Date', 'Attached By', 'Free Text'
  ];

  return (
    <div className='flex-1 flex p-1 gap-2 overflow-hidden'>
      <div className='flex-1 flex flex-col overflow-hidden'>
        <ClassicTable headers={headers} rowCount={10}>
        </ClassicTable>
      </div>
      
      <div className='w-[100px] flex flex-col gap-1 pt-6'>
        <div className='flex flex-col gap-0 border border-[#d4d0c8] rounded-[1px] overflow-hidden'>
          <GreyBtn className='w-full flex justify-between items-center rounded-none border-b-0'>
            Browse <ChevronDown className='w-3 h-3 ml-1' />
          </GreyBtn>
        </div>
        <GreyBtn className='w-full opacity-50 cursor-default' disabled>Display</GreyBtn>
      </div>
    </div>
  );
};
