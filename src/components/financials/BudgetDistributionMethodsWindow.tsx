import React from 'react';
import { FixedAssetWindowShell, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const SelectionInput: React.FC<{ yellow?: boolean; className?: string }> = ({ yellow, className='' }) => (
  <div className={`h-5 border border-gray-400 bg-white shadow-inner flex items-center justify-end px-0.5 ${yellow ? 'bg-[#fffae6]' : 'bg-white'} ${className}`}>
    <div className="w-3.5 h-3.5 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100">
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
    </div>
  </div>
);

const SimpleInput: React.FC<{ yellow?: boolean; value?: string; readOnly?: boolean; className?: string }> = ({ yellow, value='', readOnly, className='' }) => (
  <div className={`h-5 border border-gray-400 shadow-inner flex items-center px-1 ${yellow ? 'bg-[#fffae6]' : 'bg-white'} ${readOnly ? 'bg-[#e0e0e0] cursor-not-allowed' : ''} ${className}`}>
    <span className="text-[10.5px]">{value}</span>
  </div>
);

export const BudgetDistributionMethodsWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Budget Distribution Methods - Setup" {...props} minWidth={350} minHeight={450}>
      <div className="flex flex-col flex-1 bg-[#f0f0f0]">
        
        {/* Top Header */}
        <div className="px-5 py-3 flex gap-4">
          <div className="flex flex-col gap-1 w-16">
            <span className="text-[11px] text-[#333]">Method</span>
            <SelectionInput yellow className="w-full" />
          </div>
          <div className="flex flex-col gap-1 w-32">
            <span className="text-[11px] text-[#333]">Method Name</span>
            <SimpleInput yellow className="w-full" />
          </div>
          <div className="flex flex-col gap-1 w-24">
            <span className="text-[11px] text-[#333]">Total</span>
            <SimpleInput value="0.00" readOnly className="w-full" />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 mx-4 mb-4 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col" style={{minHeight:0}}>
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                <tr>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 text-left w-24">Month</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 text-left">Factor</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length: 12}).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 h-5">
                    <td className="border-r border-gray-200 bg-gray-50 px-2 text-[10.5px]">{i + 1}</td>
                    <td className="" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-4 bg-[#e5e5e5] border-t border-gray-400 shrink-0" />
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-300 bg-[#f0f0f0] shrink-0">
        <div className="flex gap-2">
          <GoldBtn>Find</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
          <div className="flex-1" />
          <GoldBtn className="text-gray-400 cursor-not-allowed hidden">Clear</GoldBtn>
          <button className="px-6 py-0.5 border border-gray-400 rounded-[3px] text-[11px] font-medium text-gray-400 bg-[#e0e0e0] shadow-none cursor-not-allowed w-20">Clear</button>
          <button className="px-4 py-0.5 border border-gray-400 rounded-[3px] text-[11px] font-medium text-gray-400 bg-[#e0e0e0] shadow-none cursor-not-allowed">Set as Default</button>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
