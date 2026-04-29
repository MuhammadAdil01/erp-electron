import React from 'react';
import { FixedAssetWindowShell, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const SelectionInput: React.FC<{ yellow?: boolean; className?: string }> = ({ yellow, className='' }) => (
  <div className={`h-5 border border-gray-400 flex items-center justify-end px-0.5 ${yellow ? 'bg-[#fffae6]' : 'bg-white'} shadow-inner ${className}`}>
    <div className="w-3.5 h-3.5 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer bg-white hover:bg-gray-100">
      <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
    </div>
  </div>
);

export const AssetTransactionReportWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Asset Transaction Report - Selection Criteria" {...props} minWidth={600} minHeight={200}>
      <div className="px-5 py-4 flex flex-col gap-1.5 flex-1 bg-[#f0f0f0]">
        
        {/* Asset Class */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset Class</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right">From</span>
          <SelectionInput yellow className="w-48" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white w-20 shadow-inner" />
        </div>

        {/* Asset No. */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset No.</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right">From</span>
          <div className="h-5 border border-gray-400 bg-white w-48 shadow-inner" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white w-20 shadow-inner" />
        </div>

        {/* Posting Date */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Posting Date</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right">From</span>
          <div className="h-5 border border-gray-400 bg-white w-48 shadow-inner" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white w-20 shadow-inner" />
        </div>

        {/* Document Date */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Document Date</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right">From</span>
          <div className="h-5 border border-gray-400 bg-white w-48 shadow-inner" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white w-20 shadow-inner" />
        </div>

        {/* Asset Value Date */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Asset Value Date</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right">From</span>
          <div className="h-5 border border-gray-400 bg-white w-48 shadow-inner" />
          <span className="text-[11px] text-[#333] w-6 shrink-0 text-center">To</span>
          <div className="h-5 border border-gray-400 bg-white w-20 shadow-inner" />
        </div>

        <div className="h-2" />

        {/* Transaction Type */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Transaction Type</span>
          <span className="text-[11px] text-[#333] w-24 shrink-0 pr-4 text-right"></span>
          <button className="h-5 px-3 bg-[#e8e8e8] border border-gray-500 hover:bg-[#d8d8d8] text-[10.5px] font-bold text-gray-700 flex items-center shadow-sm">
            ...
          </button>
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
