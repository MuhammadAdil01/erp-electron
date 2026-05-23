import React from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';
import { Calendar } from 'lucide-react';

interface WS { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WS; onClose:()=>void; onUpdateState:(s:Partial<WS>)=>void; onFocus:()=>void; }

export const DepreciationRunWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Depreciation Run" {...props} minWidth={700} minHeight={500}>
      {/* Top form */}
      <div className="px-4 py-4 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Depreciation Area</span>
          <DropdownInput value="Main Area" className="w-48"/>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Depreciate To</span>
          <div className="flex items-center border border-gray-400 bg-white h-5 shadow-inner">
            <span className="text-[10.5px] px-2">30.04.26</span>
            <div className="border-l border-gray-400 h-full flex items-center px-1 bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <Calendar className="w-3 h-3 text-gray-600"/>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push table down */}
      <div className="h-6 shrink-0"/>

      {/* Previous Depreciation Runs label */}
      <div className="px-4 mb-1 shrink-0">
        <span className="text-[11px] font-bold text-[#333]">Previous Depreciation Runs</span>
      </div>

      {/* Previous Runs Table */}
      <div className="flex-1 border border-gray-400 mx-4 mb-4 bg-white shadow-sm overflow-auto custom-scrollbar" style={{minHeight:0}}>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
            <tr>
              {['#','Run','Status','Depreciation Area','Depreciate To','Posting Date','Depreciation','Remarks'].map((h,i)=>(
                <th key={i} className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 whitespace-nowrap text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length:20}).map((_,i)=>(
              <tr key={i} className="border-b border-gray-100 h-6">
                {Array.from({length:8}).map((_,j)=><td key={j} className="border-r border-gray-100"/>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 shrink-0 flex gap-2">
        <GoldBtn>Preview</GoldBtn>
        <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
      </div>
    </FixedAssetWindowShell>
  );
};
