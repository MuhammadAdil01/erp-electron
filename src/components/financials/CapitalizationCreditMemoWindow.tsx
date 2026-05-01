import React, { useState } from 'react';
import { FixedAssetWindowShell, FieldInput, DropdownInput, GoldBtn, TabBar, DataTable, AccountingTab } from './FixedAssetShared';

interface WS { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WS; onClose:()=>void; onUpdateState:(s:Partial<WS>)=>void; onFocus:()=>void; }

export const CapitalizationCreditMemoWindow: React.FC<Props> = (props) => {
  const [tab, setTab] = useState('Contents');
  return (
    <FixedAssetWindowShell title="Capitalization Credit Memo" {...props}>
      {/* Header */}
      <div className="grid grid-cols-2 gap-x-10 px-4 py-3 bg-[#f0f0f0] border-b border-gray-300 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Origin</span>
            <FieldInput className="flex-1"/>
            <span className="text-[11px] text-[#333] ml-3 shrink-0">Origin No.</span>
            <FieldInput className="w-20"/>
          </div>
          <div className="h-3"/>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Depreciation Area</span>
            <DropdownInput value="*" yellow className="flex-1"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Reference</span>
            <FieldInput className="flex-1"/>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">No.</span>
            <DropdownInput value="Primary" className="w-24"/>
            <FieldInput value="1" className="w-16"/>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">Status</span>
            <FieldInput value="Posted" readOnly className="w-40"/>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">Posting Date</span>
            <FieldInput value="08.04.26" className="w-28"/>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">Document Date</span>
            <FieldInput value="08.04.26" className="w-28"/>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">Asset Value Date</span>
            <FieldInput value="08.04.26" className="w-28"/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-2"><TabBar tabs={['Contents','Accounting']} active={tab} onChange={setTab}/></div>

      {/* Table */}
      {tab === 'Contents'
        ? <DataTable headers={['#','Asset No.','Asset Description','Total (LC)','Quantity','Remarks']} emptyRows={13}/>
        : <AccountingTab/>}

      {/* Footer */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex justify-between items-start gap-8 mb-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#333]">Remarks</span>
            <textarea className="h-14 w-52 border border-gray-400 bg-white shadow-inner resize-none p-1 text-[10.5px] outline-none hover:border-blue-400"/>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <span className="text-[11px] font-bold text-[#333]">Total</span>
            <FieldInput value="0.00" readOnly className="w-32"/>
          </div>
        </div>
        <div className="flex gap-2">
          <GoldBtn>Add</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
