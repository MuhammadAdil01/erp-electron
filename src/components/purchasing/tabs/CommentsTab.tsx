import React from 'react';
import { ClassicInput } from '../../ui/ClassicERPUI';

export const CommentsTab: React.FC = () => {
  const rows = ['PR - 1', 'PR - 2', 'PR - 3', 'PR - 4', 'PR - 5', 'PR - 6', 'PR - 7', 'PR - 8', 'PR - 9', 'PR - 10'];

  return (
    <div className="flex-1 flex flex-col gap-1 p-4 bg-white overflow-y-auto">
      {rows.map((label, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-[100px] text-[10.5px] font-bold text-[#333]">{label}</div>
          <ClassicInput className="flex-1" />
        </div>
      ))}
    </div>
  );
};
