import React, { useState } from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const SelectionInput: React.FC<{ yellow?: boolean; className?: string }> = ({ yellow, className='' }) => (
  <div className={`h-5 border border-gray-400 flex items-center justify-end px-0.5 ${yellow ? 'bg-[#fffae6]' : 'bg-white'} shadow-inner ${className}`}>
    <div className="w-3.5 h-3.5 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100">
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
    </div>
  </div>
);

export const AssetStatusReportWindow: React.FC<Props> = (props) => {
  const [showNew, setShowNew] = useState(false);
  const [showActive, setShowActive] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  return (
    <FixedAssetWindowShell title="Asset Status Report - Selection Criteria" {...props} minWidth={600} minHeight={200}>
      <div className="px-5 py-4 flex flex-col gap-1.5 flex-1 bg-[#f0f0f0]">
        
        {/* Asset No. */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset No.</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0">From</span>
          <SelectionInput yellow className="w-48" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <SelectionInput className="w-48" />
        </div>

        {/* Asset Class */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset Class</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0">From</span>
          <SelectionInput yellow className="w-48" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <SelectionInput className="w-48" />
        </div>

        {/* Period */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Period</span>
          <span className="text-[11px] text-[#333] w-12 shrink-0"></span>
          <DropdownInput value="2026" className="w-48" />
        </div>

        <div className="h-2" />

        {/* Checkboxes */}
        <div className="flex flex-col gap-1 ml-[150px]">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="checkbox" checked={showNew} onChange={e=>setShowNew(e.target.checked)} className="w-3.5 h-3.5 accent-[#f39c12]"/>
            <span className="text-[11px] text-[#333]">Display New Fixed Assets</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="checkbox" checked={showActive} onChange={e=>setShowActive(e.target.checked)} className="w-3.5 h-3.5 accent-[#f39c12]"/>
            <span className="text-[11px] text-[#333]">Display Active Fixed Assets</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} className="w-3.5 h-3.5 accent-[#f39c12]"/>
            <span className="text-[11px] text-[#333]">Display Inactive Fixed Assets</span>
          </label>
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
