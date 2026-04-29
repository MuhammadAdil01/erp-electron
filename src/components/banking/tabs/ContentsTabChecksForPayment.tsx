import React from 'react';
import { ClassicTable } from '../../ui/ClassicERPUI';

export const ContentsTabChecksForPayment: React.FC = () => {
  const headers = ['#', 'Remarks', 'Amount'];

  return (
    <div className='flex-1 flex flex-col p-1 overflow-hidden'>
      <ClassicTable headers={headers} rowCount={10}>
        <tr className='border-b border-[#f0f0f0] h-[18px] bg-white'>
          <td className='border-r border-[#f0f0f0] p-0 text-center text-[10.5px] w-[30px]'>1</td>
          <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
          <td className='p-0 text-[10.5px] px-1 text-right w-[120px]'></td>
        </tr>
        {[...Array(9)].map((_, i) => (
          <tr key={i} className='border-b border-[#f0f0f0] h-[18px] bg-white'>
            <td className='border-r border-[#f0f0f0] p-0 text-center text-[10.5px]'>{i + 2}</td>
            <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
            <td className='p-0 text-[10.5px] px-1'></td>
          </tr>
        ))}
      </ClassicTable>
    </div>
  );
}
