import React from 'react';
import { ClassicTable } from '../../ui/ClassicERPUI';

export const VendorsTabLC: React.FC = () => {
  const headers = ['#', 'Vendor Code', 'Name'];

  return (
    <div className="flex-1 border border-[#d4d0c8] bg-white overflow-y-auto custom-scrollbar">
      <ClassicTable headers={headers} rowCount={10} />
    </div>
  );
};
