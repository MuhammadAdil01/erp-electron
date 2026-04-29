import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface RecurringTransactionTemplatesWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const RecurringTransactionTemplatesWindow: React.FC<RecurringTransactionTemplatesWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className={cn("absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
        windowState.isMaximized ? "inset-0 !w-full !h-full" : ""
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: 450,
        height: 380,
        zIndex: windowState.zIndex
      }}
    >
      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Recurring Transaction Templates - Selection Criteria</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 p-3 bg-[#f0f0f0] flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
           <input type="checkbox" className="w-3.5 h-3.5" />
           <span className="text-[11px]">Display Valid Templates Only</span>
        </div>

        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[140px]">Start Date</span>
              <span className="text-[11px] w-[35px]">From</span>
              <ClassicInput className="flex-1 max-w-[120px] bg-[#ffed99]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="flex-1 max-w-[120px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[140px]">Valid</span>
              <span className="text-[11px] w-[35px]">From</span>
              <ClassicInput className="flex-1 max-w-[120px]" />
              <span className="text-[11px]">Until</span>
              <ClassicInput className="flex-1 max-w-[120px]" />
           </div>
           
           <div className="h-2" />

           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[140px]">BP Code</span>
              <span className="text-[11px] w-[35px]">From</span>
              <ClassicInput className="flex-1 max-w-[120px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="flex-1 max-w-[120px]" />
           </div>

           <FieldRow label="Customer Group" labelWidth="140px">
              <ClassicSel className="flex-1"><option></option></ClassicSel>
           </FieldRow>
           <FieldRow label="Vendor Group" labelWidth="140px">
              <ClassicSel className="flex-1"><option></option></ClassicSel>
           </FieldRow>

           <div className="flex gap-2 items-center mt-1">
              <YellowBtn className="w-[140px] text-[11px] py-0.5 h-[18px] shrink-0 flex items-center justify-center underline">Properties</YellowBtn>
              <div className="flex-1 h-[18px] border border-[#d4d0c8] bg-[#f0f0f0]" />
           </div>

           <div className="h-4" />

           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[140px]">Documents</span>
              <div className="flex items-center gap-1 flex-1">
                 <div className="flex-1 h-[18px] border border-[#d4d0c8] bg-white shadow-inner" />
                 <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
                    <span className="text-[10px] font-bold">...</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-auto flex gap-2 pt-2">
           <YellowBtn className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
           <GreyBtn onClick={onClose} className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Cancel</GreyBtn>
        </div>
      </div>
    </div>
  );
};

