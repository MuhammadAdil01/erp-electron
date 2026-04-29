import React from 'react';
import { ClassicTable, ClassicInput, FieldRow } from '../../ui/ClassicERPUI';

export const ContentsTabOutgoingPayments: React.FC = () => {
  const headers = [
    'Selected', 'Document No.', 'Installment', 'Document Type', 'Date', '*',
    'Description', 'Total', 'WTax Amount', 'Balance Due', 'Cash Discount %',
    'Total Payment', 'Distr. Rule', 'Overdue Days', 'Blocked',
    'Payment Order Run', 'Blanket Agreement', 'Challan #'
  ];

  return (
    <div className='flex-1 flex flex-col p-1 overflow-hidden'>
      <ClassicTable headers={headers} rowCount={15}>
        <tr className='border-b border-[#f0f0f0] h-[18px] bg-white'>
          <td className='border-r border-[#f0f0f0] p-0 text-center'>
            <input type='checkbox' className='w-3 h-3' />
          </td>
          {[...Array(headers.length - 1)].map((_, i) => (
            <td key={i} className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
          ))}
        </tr>
      </ClassicTable>

      <div className='flex justify-between items-start mt-1 px-1'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <input type='checkbox' className='w-3 h-3' id='paymentOnAccount' />
            <label htmlFor='paymentOnAccount' className='text-[10.5px]'>Payment on Account</label>
            <ClassicInput className='w-[100px] h-[18px] ml-1' defaultValue='0.00' readOnly />
          </div>
        </div>

        <div className='flex flex-col gap-1 w-[250px]'>
          <FieldRow label='WTax Amount' labelWidth='120px'>
            <ClassicInput className='w-full bg-[#f0f0f0]' readOnly />
          </FieldRow>
          <FieldRow label='Total Amount Due' labelWidth='120px'>
            <div className='flex w-full gap-1'>
              <ClassicInput className='flex-1 bg-[#f0f0f0]' defaultValue='0.00' readOnly />
              <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold'>?</div>
            </div>
          </FieldRow>
          <FieldRow label='Open Balance' labelWidth='120px'>
            <ClassicInput className='w-full bg-[#f0f0f0]' readOnly />
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
