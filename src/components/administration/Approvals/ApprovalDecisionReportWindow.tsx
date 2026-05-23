import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface ApprovalDecisionReportWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenSelectionUsers: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const ApprovalDecisionReportWindow: React.FC<ApprovalDecisionReportWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenSelectionUsers
}) => {
  return (
    <ResizableCriteriaWindow
      title="Approval Decision Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={500}
      minHeight={350}
    >
      <div className="flex-1 p-4 bg-[#f0f0f0] flex flex-col gap-4 overflow-hidden">
        
        {/* Decision Section */}
        <div className="flex flex-col border border-gray-400 p-3 relative pt-3">
          <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[11px] font-bold text-[#333] underline">Decision</span>
          <div className="flex flex-col gap-1 mt-1">
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className={sapLabelStyle}>No Decision Yet</span></label>
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className={sapLabelStyle}>Approved</span></label>
             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className={sapLabelStyle}>Rejected</span></label>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1 items-center px-1">
           <span className={sapLabelStyle}>Originator From</span>
           <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1">
                 <input type="text" className={`${sapInputStyle} !bg-[#fffbd0]`} />
                 <div onClick={onOpenSelectionUsers} className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                 </div>
              </div>
              <span className={sapLabelStyle}>To</span>
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
           </div>

           <span className={sapLabelStyle}>Authorizer From</span>
           <div className="flex items-center gap-2">
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
              <span className={sapLabelStyle}>To</span>
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
           </div>

           <span className={sapLabelStyle}>Template From</span>
           <div className="flex items-center gap-2">
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
              <span className={sapLabelStyle}>To</span>
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
           </div>

           <span className={sapLabelStyle}>Request Date From</span>
           <div className="flex items-center gap-2">
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
              <span className={sapLabelStyle}>To</span>
              <div className="flex-1"><input type="text" className={sapInputStyle} /></div>
           </div>
        </div>

        <div className="flex gap-2 shrink-0 pt-4 mt-auto">
           <button className={sapButtonStyle}>OK</button>
           <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
