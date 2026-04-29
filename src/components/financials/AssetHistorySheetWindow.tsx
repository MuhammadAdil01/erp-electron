import React from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';
import { CornerDownRight } from 'lucide-react';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const SelectionInput: React.FC<{ yellow?: boolean; className?: string }> = ({ yellow, className='' }) => (
  <div className={`h-5 border border-gray-400 flex items-center justify-end px-0.5 ${yellow ? 'bg-[#fffae6]' : 'bg-white'} shadow-inner ${className}`}>
    <div className="w-3.5 h-3.5 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100">
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
    </div>
  </div>
);

export const AssetHistorySheetWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Asset History Sheet - Selection Criteria" {...props} minWidth={650} minHeight={200}>
      <div className="px-5 py-4 flex flex-col gap-1.5 flex-1 bg-[#f0f0f0]">
        
        {/* Asset Class */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset Class</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0">From</span>
          <SelectionInput yellow className="w-48" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <SelectionInput className="w-48" />
        </div>

        {/* Balance Sheet Account */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Balance Sheet Account</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0"></span>
          <SelectionInput className="w-48" />
        </div>

        {/* Depreciation Area */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Depreciation Area</span>
          <div className="flex items-center justify-end w-12 pr-1">
            <CornerDownRight className="w-3.5 h-3.5 text-yellow-500 shrink-0" strokeWidth={3} />
          </div>
          <DropdownInput value="Main Area" className="w-48" />
        </div>

        {/* Period & Subperiod */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Period</span>
          <DropdownInput value="2026" className="w-16" />
          <span className="text-[11px] text-[#333] w-20 shrink-0 text-right pr-2">Subperiod From</span>
          <DropdownInput value="" className="w-[100px]" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <DropdownInput value="" className="w-[100px]" />
        </div>

        {/* Template */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Template</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0"></span>
          <DropdownInput value="" className="w-48" />
        </div>

      </div>

      <div className="px-5 py-3 border-t border-gray-300 bg-[#f0f0f0] shrink-0">
        <div className="flex gap-2">
          <GoldBtn>OK</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
