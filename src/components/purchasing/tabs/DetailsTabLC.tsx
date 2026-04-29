import React from 'react';
import { ClassicTable, ClassicInput, ClassicSel, FieldRow } from '../../ui/ClassicERPUI';

interface DetailsTabLCProps {
  onOpenShippingSetup: () => void;
}

export const DetailsTabLC: React.FC<DetailsTabLCProps> = ({ onOpenShippingSetup }) => {
  const headers = ['#', 'Item', 'Whse Price', 'Price List', 'Expenditure'];

  const handleTransportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'Define New') {
      onOpenShippingSetup();
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="flex-1 flex flex-col p-1 bg-white overflow-hidden">
      <div className="flex-1 border border-[#d4d0c8] bg-white overflow-y-auto custom-scrollbar mb-2">
        <ClassicTable headers={headers} rowCount={12} />
      </div>
      
      <div className="flex flex-col gap-1 w-[400px] p-1">
        <FieldRow label="Bill of Lading No." labelWidth="120px">
           <ClassicInput className="flex-1 shadow-none" />
        </FieldRow>
        <FieldRow label="Transport Type" labelWidth="120px">
           <ClassicSel onChange={handleTransportChange} className="flex-1 bg-[#ffed99]">
              <option value=""></option>
              <option value="Define New">Define New</option>
           </ClassicSel>
        </FieldRow>
      </div>
    </div>
  );
};
