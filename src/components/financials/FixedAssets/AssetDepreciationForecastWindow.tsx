import React, { useState } from 'react';
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

export const AssetDepreciationForecastWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Asset Depreciation Forecast Report - Selection Criteria" {...props} minWidth={600} minHeight={200}>
      <div className="px-5 py-4 flex flex-col gap-1.5 flex-1 bg-[#f0f0f0]">
        
        {/* Asset No. */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset No.</span>
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

        {/* Forecast Date */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Forecast Date</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0">From</span>
          <div className="h-5 border border-gray-400 bg-white flex items-center px-1 w-48 shadow-inner">
            <span className="text-[10.5px]">01.07.25</span>
          </div>
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white flex items-center px-1 w-48 shadow-inner">
            <span className="text-[10.5px]">30.06.26</span>
          </div>
        </div>

        <div className="h-4" />

        {/* Summarize By */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Summarize By</span>
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
