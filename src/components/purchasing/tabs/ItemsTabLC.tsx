import React from 'react';
import { ClassicTable } from '../../ui/ClassicERPUI';

export const ItemsTabLC: React.FC = () => {
  const headers = [
    '#', 'Item No.', 'Qty', 'Base Doc. Price', 'Base Doc. Value', 'Proj. Cust.', 'Customs Value', 
    'Expenditure', 'Alloc. Costs Val.', 'Whse Price', 'Total', 'Total Costs', 'Warehouse', 
    'Release No.', 'Var. Costs', 'Const. Costs', 'Expected Customs', 
    'FOB and Included Costs', 'Project', 'Distr. Rule'
  ];

  return (
    <div className="flex-1 border border-[#d4d0c8] bg-white overflow-y-auto custom-scrollbar overflow-x-auto">
      <ClassicTable headers={headers} rowCount={12} />
    </div>
  );
};
