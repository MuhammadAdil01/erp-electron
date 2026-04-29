import React from 'react';
import { ClassicTable, ClassicSel, ClassicInput } from '../../ui/ClassicERPUI';

export const ContentsTabPO: React.FC = () => {
  const headers = [
    '#', 'Item No.', 'Quantity', 'Unit Price', 'Discount %', 'Tax Code', 'Total (LC)', 
    'Distr. Rule', 'UoM Code', 'Country/Region of Origin', 'Blanket Agreement No.', 
    'Standard Item Identification', 'Commodity Classification', 'Retention %', 
    'IPC No.', 'Rejected Quantity'
  ];

  return (
    <div className="flex-1 flex flex-col gap-2 p-1 bg-white">
      <div className="flex items-center gap-6 mb-1 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10.5px]">Item/Service Type</span>
          <ClassicSel className="w-[100px]">
            <option>Item</option>
            <option>Service</option>
          </ClassicSel>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2 pr-2">
           <span className="text-[10.5px]">Summary Type</span>
           <ClassicSel className="w-[100px]">
             <option>No Summary</option>
           </ClassicSel>
        </div>
      </div>
      
      <div className="flex-1 border border-[#d4d0c8] bg-white overflow-y-auto custom-scrollbar overflow-x-auto">
        <ClassicTable headers={headers} rowCount={12}>
          <tr className="border-b border-[#f0f0f0] h-[18px]">
            <td className="border-r border-[#f0f0f0] text-center text-[10.5px]">1</td>
            <td className="border-r border-[#f0f0f0]"><ClassicInput className="w-full border-none shadow-none" /></td>
            <td className="border-r border-[#f0f0f0]"><ClassicInput className="w-full border-none shadow-none text-right" /></td>
            <td className="border-r border-[#f0f0f0]"><ClassicInput className="w-full border-none shadow-none text-right" /></td>
            <td className="border-r border-[#f0f0f0] text-right px-2 text-[10.5px]">0.00</td>
            <td className="border-r border-[#f0f0f0] px-2 text-[10.5px]">GST-ZR1</td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0] text-right px-2 text-[10.5px]">0.00</td>
            <td className="border-r border-[#f0f0f0]"></td>
            <td className="border-r border-[#f0f0f0]"></td>
          </tr>
        </ClassicTable>
      </div>
    </div>
  );
};
