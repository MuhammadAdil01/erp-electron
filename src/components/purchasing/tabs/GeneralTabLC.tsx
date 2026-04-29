import React from 'react';
import { ClassicInput, FieldRow } from '../../ui/ClassicERPUI';

export const GeneralTabLC: React.FC = () => (
  <div className="flex-1 p-3 bg-white flex flex-col gap-2">
    <FieldRow label="Trans. No." labelWidth="120px">
       <ClassicInput className="w-[180px] bg-[#f0f0f0]" readOnly />
    </FieldRow>
    <FieldRow label="Journal Remarks" labelWidth="120px">
       <ClassicInput className="w-[220px] bg-[#ffed99]" defaultValue="Landed Costs" />
    </FieldRow>
  </div>
);
