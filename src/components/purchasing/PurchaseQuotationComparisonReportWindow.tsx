import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface PurchaseQuotationComparisonReportWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PurchaseQuotationComparisonReportWindow: React.FC<PurchaseQuotationComparisonReportWindowProps> = ({
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
        width: 550,
        height: 520,
        zIndex: windowState.zIndex
      }}
    >
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Purchase Quotation Comparison Report - Selection Criteria</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 p-3 bg-[#f0f0f0] flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        <FieldRow label="Type" labelWidth="130px">
           <ClassicSel className="w-[300px] bg-[#ffed99]"><option>Item</option></ClassicSel>
        </FieldRow>
        
        {/* Item Section */}
        <div className="border border-[#d4d0c8] p-2 mt-2 flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[120px]">Code</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <FieldRow label="Item Group" labelWidth="120px">
              <ClassicSel className="w-[300px]"><option>All</option></ClassicSel>
           </FieldRow>
           <div className="flex gap-2 items-center mt-1">
              <YellowBtn className="w-[120px] text-[11px] py-0.5 h-[18px] shrink-0 flex items-center justify-center">Properties</YellowBtn>
              <ClassicInput value="Ignore" className="w-[300px] h-[18px] bg-[#f0f0f0]" readOnly />
           </div>
        </div>

        <div className="h-1" />
        <span className="text-[11px] font-medium ml-1">Vendors</span>
        
        {/* Vendor Section */}
        <div className="border border-[#d4d0c8] p-2 flex flex-col gap-1.5">
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[120px]">Code</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <FieldRow label="Vendor Group" labelWidth="120px">
              <ClassicSel className="w-[300px]"><option>All</option></ClassicSel>
           </FieldRow>
           <div className="flex gap-2 items-center mt-1">
              <YellowBtn className="w-[120px] text-[11px] py-0.5 h-[18px] shrink-0 flex items-center justify-center">Properties</YellowBtn>
              <ClassicInput value="Ignore" className="w-[300px] h-[18px] bg-[#f0f0f0]" readOnly />
           </div>
        </div>

        <div className="h-4" />

        {/* Ranges */}
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Required Date</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Document Date</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Document No.</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Group No.</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
        </div>

        <div className="h-4" />
        
        <div className="flex items-center gap-2">
           <input type="checkbox" className="w-3.5 h-3.5" defaultChecked />
           <span className="text-[11px]">Display Open Purchase Quotations Only</span>
        </div>

        <div className="mt-auto flex gap-2 pt-4">
           <YellowBtn className="min-w-[80px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
           <GreyBtn onClick={onClose} className="min-w-[80px] h-[22px] flex items-center justify-center text-[11px]">Cancel</GreyBtn>
        </div>
      </div>
    </div>
  );
};

