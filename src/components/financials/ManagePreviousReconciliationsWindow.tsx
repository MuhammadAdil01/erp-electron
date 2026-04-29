import React from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 bg-white px-1 text-[11px] outline-none focus:border-orange-400";
const sapCheckboxStyle = "w-3 h-3 border border-gray-400 rounded-sm bg-white shrink-0 accent-orange-500 cursor-pointer";
const sapButtonStyle = "px-6 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal text-black";

export const ManagePreviousReconciliationsWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell 
      title="Manage Previous Internal Reconciliations - Selection Criteria" 
      {...props} 
      minWidth={520} 
      minHeight={210}
    >
      <div className="px-5 py-3 flex flex-col gap-1.5 flex-1 bg-[#ececec]">
        
        {/* Previous Reconciliation for */}
        <div className="flex items-center gap-16 mb-0.5">
          <span className={sapLabelStyle}>Previous Reconciliation for</span>
          <DropdownInput value="BP" yellow className="w-28" />
        </div>

        {/* Include Inactive Business Partners */}
        <div className="flex items-center gap-2 mb-1 pl-0.5">
          <input type="checkbox" className={sapCheckboxStyle} id="includeInactive" />
          <label htmlFor="includeInactive" className={sapLabelStyle}>Include Inactive Business Partners</label>
        </div>

        {/* G/L Acct/BP Code From */}
        <div className="flex items-center">
          <span className={`${sapLabelStyle} w-44`}>G/L Acct/BP Code From</span>
          <input className={`${sapInputStyle} w-28`} />
          <span className={`${sapLabelStyle} mx-3`}>To</span>
          <input className={`${sapInputStyle} w-28`} />
        </div>

        {/* Date From */}
        <div className="flex items-center">
          <span className={`${sapLabelStyle} w-44`}>Date From</span>
          <input className={`${sapInputStyle} w-28`} />
          <span className={`${sapLabelStyle} mx-3`}>To</span>
          <input className={`${sapInputStyle} w-28`} />
        </div>

        {/* Reconciliation No. From */}
        <div className="flex items-center">
          <span className={`${sapLabelStyle} w-44`}>Reconciliation No. From</span>
          <input className={`${sapInputStyle} w-28`} />
          <span className={`${sapLabelStyle} mx-3`}>To</span>
          <input className={`${sapInputStyle} w-28`} />
        </div>

        {/* Consider Connected BPs */}
        <div className="flex items-center gap-2 mt-1 pl-0.5">
          <input type="checkbox" className={sapCheckboxStyle} id="considerConnected" />
          <label htmlFor="considerConnected" className={sapLabelStyle}>Consider Connected BPs</label>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-[#ececec] shrink-0">
        <div className="flex gap-2">
          <GoldBtn className="px-8!">OK</GoldBtn>
          <button onClick={props.onClose} className={sapButtonStyle}>Cancel</button>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};

