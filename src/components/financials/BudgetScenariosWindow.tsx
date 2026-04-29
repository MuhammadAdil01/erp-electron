import React from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

export const BudgetScenariosWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Budget Scenarios - Setup" {...props} minWidth={700} minHeight={300}>
      <div className="flex flex-col flex-1 bg-[#f0f0f0]">
        
        {/* Top Header */}
        <div className="px-5 py-3 flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-24 shrink-0">Fiscal Year</span>
          <DropdownInput value="01.07.25" yellow className="w-40" />
        </div>

        {/* Data Table */}
        <div className="flex-1 mx-4 mb-2 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col" style={{minHeight:0}}>
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                <tr>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8">#</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left">Budget Name</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-32">Based On</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-32">Initial Ratio (%)</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-32">Rounding Method</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-32">Distr. Rule</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 text-left w-32">Project</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length: 10}).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 h-5">
                    <td className="border-r border-gray-200 bg-gray-50"/>
                    <td className="border-r border-gray-200"/>
                    <td className="border-r border-gray-200"/>
                    <td className="border-r border-gray-200"/>
                    <td className="border-r border-gray-200"/>
                    <td className="border-r border-gray-200"/>
                    <td className="" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-4 bg-[#e5e5e5] border-t border-gray-400 shrink-0" />
        </div>

        {/* Buttons Right Aligned */}
        <div className="px-4 pb-2 flex justify-end gap-2 shrink-0">
          <GoldBtn>Copy Scenario</GoldBtn>
          <GoldBtn>Import Scenario</GoldBtn>
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-300 bg-[#f0f0f0] shrink-0">
        <div className="flex gap-2">
          <GoldBtn>OK</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
