import React, { useState } from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 bg-white px-1 text-[11px] outline-none focus:border-orange-400";
const sapRadioStyle = "w-3.5 h-3.5 accent-orange-500 cursor-pointer";
const sapCheckboxStyle = "w-3.5 h-3.5 border border-gray-400 rounded-sm bg-white shrink-0 accent-orange-500 cursor-pointer";

type ReconciliationType = 'manual' | 'automatic' | 'semi-automatic';

export const ReconciliationWindow: React.FC<Props> = (props) => {
  const [reconType, setReconType] = useState<ReconciliationType>('semi-automatic');

  return (
    <FixedAssetWindowShell title="G/L Internal Reconciliation - Selection Criteria" {...props} minWidth={700} minHeight={480}>
      <div className="px-5 py-4 flex flex-col gap-4 flex-1 bg-[#f0f0f0]">
        
        {/* Reconciliation Type Block */}
        <div className="flex items-center gap-10">
          <span className={sapLabelStyle}>Reconciliation Type</span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input type="radio" name="reconType" checked={reconType==='manual'} onChange={()=>setReconType('manual')} className={sapRadioStyle} />
              <span className={sapLabelStyle}>Manual</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input type="radio" name="reconType" checked={reconType==='automatic'} onChange={()=>setReconType('automatic')} className={sapRadioStyle} />
              <span className={sapLabelStyle}>Automatic</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input type="radio" name="reconType" checked={reconType==='semi-automatic'} onChange={()=>setReconType('semi-automatic')} className={sapRadioStyle} />
              <span className={sapLabelStyle}>Semi-Automatic</span>
            </label>
          </div>
        </div>

        {/* Core Info Block */}
        <div className="flex flex-col gap-1.5 pl-0.5">
          <div className="flex items-center">
            <span className={`${sapLabelStyle} w-32`}>Reconciliation Date</span>
            <input className={`${sapInputStyle} w-44`} defaultValue="09.04.26" />
          </div>
          <div className="flex items-center">
            <span className={`${sapLabelStyle} w-32`}>G/L Account</span>
            <input className={`${sapInputStyle} w-44`} />
          </div>
        </div>

        {/* Link and Checkbox Section */}
        <div className="flex flex-col gap-2.5 mt-2 pl-0.5">
          <span className="text-[11px] text-blue-700 underline cursor-pointer hover:text-blue-900 w-fit">
            Trans. Selection Criteria
          </span>
          <div className="flex items-center gap-2">
            <input type="checkbox" className={sapCheckboxStyle} id="dateCheck" />
            <label htmlFor="dateCheck" className={sapLabelStyle}>Date</label>
          </div>
        </div>

        {/* Parameters Table Block */}
        {reconType === 'semi-automatic' && (
          <div className="mt-2 pl-0.5 max-w-[550px]">
            {/* Headers */}
            <div className="flex items-center mb-2 pb-1 border-b border-gray-300">
               <span className="text-[11px] text-[#333] italic border-b border-[#333] leading-tight mr-16">Parameters</span>
               <span className="text-[11px] text-[#333] italic border-b border-[#333] leading-tight mr-28">Priority Weighting</span>
               <span className="text-[11px] text-[#333] italic border-b border-[#333] leading-tight">Max. Deviation</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2 ml-1">
              <div className="flex items-center">
                <span className={`${sapLabelStyle} w-24`}>Amount</span>
                <DropdownInput value="High" className="w-[185px] mr-10" />
                <input className={`${sapInputStyle} w-24`} />
              </div>
              
              <div className="flex items-center">
                <span className={`${sapLabelStyle} w-24`}>Date</span>
                <DropdownInput value="Posting Date" className="w-16 mr-1" />
                <DropdownInput value="Medium" className="w-24 mr-10" />
                <input className={`${sapInputStyle} w-24`} />
              </div>

              <div className="flex items-center">
                <span className={`${sapLabelStyle} w-24`}>Reference</span>
                <DropdownInput value="Ref. 1 (Row)" className="w-16 mr-1" />
                <DropdownInput value="Low" className="w-24 mr-10" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-[#f0f0f0] shrink-0">
        <div className="flex gap-2">
          <GoldBtn className="px-6!">Reconcile</GoldBtn>
          <GoldBtn onClick={props.onClose} className="px-6!">Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};

