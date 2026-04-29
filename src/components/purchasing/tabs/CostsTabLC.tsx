import React, { useState } from 'react';
import { ClassicTable, YellowBtn, cn } from '../../ui/ClassicERPUI';

export const CostsTabLC: React.FC = () => {
  const [subTab, setSubTab] = useState('Fixed');
  const headers = ['#', 'Landed Costs', 'Allocation By', 'Amount', 'Factor', 'Include for Customs'];

  return (
    <div className="flex-1 flex gap-2 p-1 bg-white">
      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
        {/* Sub-tabs */}
        <div className="flex gap-1 border-b border-[#d4d0c8] mb-1">
          <div 
             onClick={() => setSubTab('Fixed')}
             className={cn("px-4 py-0.5 text-[10.5px] cursor-pointer border-t border-l border-r border-[#d4d0c8] -mb-[1px]", subTab === 'Fixed' ? "bg-white font-bold" : "bg-[#f0f0f0]")}
          >Fixed Costs</div>
          <div 
             onClick={() => setSubTab('Variable')}
             className={cn("px-4 py-0.5 text-[10.5px] cursor-pointer border-t border-l border-r border-[#d4d0c8] -mb-[1px]", subTab === 'Variable' ? "bg-white font-bold" : "bg-[#f0f0f0]")}
          >Variable Costs</div>
        </div>
        
        <div className="flex-1 border border-[#d4d0c8] bg-white overflow-hidden relative">
           <ClassicTable headers={headers} rowCount={10}>
              <tr className="border-b border-[#f0f0f0] h-[18px]">
                 <td className="border-r border-[#f0f0f0] text-center text-[10.5px]">1</td>
                 <td className="border-r border-[#f0f0f0]"></td>
                 <td className="border-r border-[#f0f0f0]"></td>
                 <td className="border-r border-[#f0f0f0]"></td>
                 <td className="border-r border-[#f0f0f0]"></td>
                 <td className="border-r border-[#f0f0f0]"></td>
              </tr>
           </ClassicTable>
           <div className="absolute bottom-1 right-2 bg-white px-2 text-[10.5px] border border-[#d4d0c8]">0.00</div>
        </div>
      </div>
      
      <div className="w-[120px] flex flex-col gap-2 pt-6 pr-1">
        <YellowBtn className="w-full text-[11px] h-[22px] flex items-center justify-center">Recalculate</YellowBtn>
        <div className="h-4" />
        <YellowBtn className="w-full text-[11px] h-[22px] flex items-center justify-center">Clear Table</YellowBtn>
        <YellowBtn className="w-full text-[11px] h-[22px] flex items-center justify-center">New Landed Costs</YellowBtn>
      </div>
    </div>
  );
};
