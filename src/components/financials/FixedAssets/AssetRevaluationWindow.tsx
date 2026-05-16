import React, { useState } from 'react';
import { FixedAssetWindowShell, FieldInput, DropdownInput, GoldBtn } from './FixedAssetShared';

interface WS { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WS; onClose:()=>void; onUpdateState:(s:Partial<WS>)=>void; onFocus:()=>void; }

export const AssetRevaluationWindow: React.FC<Props> = (props) => {
  const [ifrsPosting, setIfrsPosting] = useState(false);

  return (
    <FixedAssetWindowShell title="Asset Revaluation" {...props} minWidth={950} minHeight={600}>
      {/* Header */}
      <div className="grid grid-cols-2 gap-x-10 px-4 py-3 bg-[#f0f0f0] border-b border-gray-300 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-40 shrink-0">Depreciation Area</span>
            <DropdownInput value="Main Area" className="flex-1"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-40 shrink-0">Reference</span>
            <FieldInput className="flex-1"/>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-40 shrink-0">Revaluation Percentage %</span>
            <FieldInput value="100.00" className="flex-1"/>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-[#333] shrink-0">Number</span>
            <DropdownInput value="Primary" className="w-24"/>
            <FieldInput value="1" className="w-16"/>
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

      {/* IFRS Checkbox */}
      <div className="px-4 py-2 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={ifrsPosting} onChange={e=>setIfrsPosting(e.target.checked)} className="w-3.5 h-3.5 accent-[#f39c12]"/>
          <span className="text-[11px] text-[#333]">IFRS Posting</span>
        </label>
      </div>

      {/* Table */}
      <div className="flex-1 border border-gray-400 mx-4 mb-2 bg-white shadow-sm overflow-auto custom-scrollbar" style={{minHeight:0}}>
        <table className="w-full border-collapse" style={{minWidth:900}}>
          <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
            <tr>
              {['#','Asset No.','Asset Description','NBV','Revaluation Percentage %','New NBV','Difference','Remarks'].map((h,i)=>(
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
              <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
              <td className="border-r border-gray-200 px-1">
                <div className="h-4 border border-gray-200 bg-white flex items-center px-1">
                  <span className="text-[10px] text-gray-600">0.00</span>
                </div>
              </td>
              <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
              <td className="border-r border-gray-200 px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
              <td className="px-1"><div className="h-4 border border-gray-200 bg-white"/></td>
            </tr>
            {Array.from({length:14}).map((_,i)=>(
              <tr key={i} className="border-b border-gray-100 h-6">
                {Array.from({length:8}).map((_,j)=><td key={j} className="border-r border-gray-100"/>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex justify-between items-start gap-8 mb-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#333]">Remarks</span>
            <textarea className="h-14 w-52 border border-gray-400 bg-white shadow-inner resize-none p-1 text-[10.5px] outline-none hover:border-blue-400"/>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <span className="text-[11px] text-[#333] shrink-0">Journal Remark</span>
            <div className="w-48 h-5 border border-gray-400 bg-white flex items-center px-2 shadow-inner">
              <span className="text-[10.5px]">Fixed Asset Revaluation</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2"><GoldBtn>Add</GoldBtn><GoldBtn onClick={props.onClose}>Cancel</GoldBtn></div>
      </div>
    </FixedAssetWindowShell>
  );
};
