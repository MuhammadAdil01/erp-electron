import React, { useState } from 'react';
import { FixedAssetWindowShell, FieldInput, DropdownInput, GoldBtn, TabBar, AccountingTab } from './FixedAssetShared';

interface WS { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WS; onClose:()=>void; onUpdateState:(s:Partial<WS>)=>void; onFocus:()=>void; }

export const TransferWindow: React.FC<Props> = (props) => {
  const [tab, setTab] = useState('Contents');

  return (
    <FixedAssetWindowShell title="Transfer" {...props} minWidth={950}>
      {/* Header */}
      <div className="grid grid-cols-2 gap-x-10 px-4 py-3 bg-[#f0f0f0] border-b border-gray-300 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-32 shrink-0">Origin</span>
            <FieldInput className="flex-1"/>
            <span className="text-[11px] text-[#333] ml-3 shrink-0">Origin No.</span>
            <FieldInput className="w-20"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-32 shrink-0">Transaction Type</span>
            <DropdownInput value="Asset Transfer" className="flex-1"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-32 shrink-0">Depreciation Area</span>
            <DropdownInput value="*" yellow className="flex-1"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-32 shrink-0">Reference</span>
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
            <FieldInput value="Posted" readOnly className="w-36"/>
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

      {tab === 'Contents' ? (
        <div className="flex-1 border border-gray-400 mx-4 mb-2 bg-white shadow-sm overflow-auto custom-scrollbar" style={{minHeight:0}}>
          <table className="w-full border-collapse" style={{minWidth:950}}>
            <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
              <tr>
                {['#','Asset No.','Asset Description','Target Asset No.','Target Asset Description','Partial','Quantity','APC','Remarks'].map((h,i)=>(
                  <th key={i} className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 whitespace-nowrap text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 h-6">
                <td className="text-[10px] px-2 border-r border-gray-300 bg-gray-50 text-center w-6 font-medium">1</td>
                <td className="px-1 py-0.5 border-r border-gray-300 w-24">
                  <div className="h-4 border border-gray-400 bg-[#fffae6] flex items-center justify-end pr-0.5">
                    <div className="w-3 h-3 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer"><div className="w-1.5 h-1.5 bg-gray-600"/></div>
                  </div>
                </td>
                <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
                <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-400 bg-[#fffae6] flex items-center justify-end pr-0.5"><div className="w-3 h-3 border border-gray-500 rounded-[2px] flex items-center justify-center cursor-pointer"><div className="w-1.5 h-1.5 bg-gray-600"/></div></div></td>
                <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
                <td className="border-r border-gray-200 px-1 w-10"><div className="h-4 flex items-center justify-center"><div className="w-3 h-3 border border-gray-400 bg-white"/></div></td>
                <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
                <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
                <td className="px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
              </tr>
              {Array.from({length:12}).map((_,i)=>(
                <tr key={i} className="border-b border-gray-100 h-6">
                  {Array.from({length:9}).map((_,j)=><td key={j} className="border-r border-gray-100"/>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <AccountingTab/>}

      {/* Footer */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex flex-col gap-1 mb-3">
          <span className="text-[11px] text-[#333]">Remarks</span>
          <textarea className="h-14 w-52 border border-gray-400 bg-white shadow-inner resize-none p-1 text-[10.5px] outline-none hover:border-blue-400"/>
        </div>
        <div className="flex gap-2"><GoldBtn>Add</GoldBtn><GoldBtn onClick={props.onClose}>Cancel</GoldBtn></div>
      </div>
    </FixedAssetWindowShell>
  );
};
