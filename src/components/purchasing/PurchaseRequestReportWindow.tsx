import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface PurchaseRequestReportWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PurchaseRequestReportWindow: React.FC<PurchaseRequestReportWindowProps> = ({
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
        height: 580,
        zIndex: windowState.zIndex
      }}
    >
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Purchase Request Report - Selection Criteria</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 p-3 bg-[#f0f0f0] flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        <FieldRow label="Type" labelWidth="130px">
           <ClassicSel className="w-[250px] bg-[#ffed99]"><option>Item</option></ClassicSel>
        </FieldRow>
        
        <div className="flex items-center gap-2">
           <span className="text-[11px] w-[130px]">Code</span>
           <span className="text-[11px]">From</span>
           <ClassicInput className="w-[100px]" />
           <span className="text-[11px]">To</span>
           <ClassicInput className="w-[100px]" />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[11px] w-[130px]">Preferred Vendor</span>
           <span className="text-[11px]">From</span>
           <ClassicInput className="w-[100px]" />
           <span className="text-[11px]">To</span>
           <ClassicInput className="w-[100px]" />
        </div>
        <FieldRow label="Item Group" labelWidth="130px">
           <ClassicSel className="w-[300px]"><option>All</option></ClassicSel>
        </FieldRow>
        
        <div className="flex gap-2 items-center mt-1">
           <YellowBtn className="w-[130px] text-[11px] py-0.5 h-[18px] shrink-0 flex items-center justify-center">Properties</YellowBtn>
           <ClassicInput value="Ignore" className="w-[300px] h-[18px] bg-[#f0f0f0]" readOnly />
        </div>

        <div className="h-2" />

        {/* Requesters Section */}
        <div className="flex gap-4">
           <div className="flex-1 border border-[#d4d0c8] p-2 relative mt-2">
              <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[11px]">Requesters</span>
              <div className="flex flex-col gap-1 mt-1">
                 <div className="flex items-center gap-2">
                    <input type="radio" name="req" className="w-3.5 h-3.5" />
                    <span className="text-[11px] w-[120px]">Users</span>
                    <button className="bg-[#ffed99] border border-gray-400 px-1 text-[10px] h-[16px]">...</button>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="radio" name="req" className="w-3.5 h-3.5" />
                    <span className="text-[11px] w-[120px]">Employees</span>
                    <button className="bg-[#ffed99] border border-gray-400 px-1 text-[10px] h-[16px]">...</button>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="radio" name="req" className="w-3.5 h-3.5" defaultChecked />
                    <span className="text-[11px] w-[120px]">Users and Employees</span>
                 </div>
              </div>
           </div>
           <div className="w-[180px] flex flex-col gap-1.5 pt-4">
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5" /><span className="text-[11px] w-[80px]">Branch</span><button className="bg-[#ffed99] border border-gray-400 px-1 text-[10px] h-[16px]">...</button>
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5" /><span className="text-[11px] w-[80px]">Department</span><button className="bg-[#ffed99] border border-gray-400 px-1 text-[10px] h-[16px]">...</button>
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5" /><span className="text-[11px] w-[80px]">Project</span><button className="bg-[#ffed99] border border-gray-400 px-1 text-[10px] h-[16px]">...</button>
              </div>
           </div>
        </div>

        <div className="h-4" />

        {/* Date Ranges */}
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Document No.</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Posting Date</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[130px]">Valid Until</span>
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
              <span className="text-[11px] w-[130px]">Required Date</span>
              <span className="text-[11px]">From</span>
              <ClassicInput className="w-[100px]" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[100px]" />
           </div>
        </div>

        <div className="h-4" />
        
        <div className="flex items-center gap-2">
           <input type="checkbox" className="w-3.5 h-3.5" defaultChecked />
           <span className="text-[11px]">Display Open Purchase Requests Only</span>
        </div>
        <div className="flex items-center gap-2">
           <input type="checkbox" className="w-3.5 h-3.5" />
           <span className="text-[11px]">Display Purchase Requests from MRP Only</span>
        </div>

        <div className="mt-auto flex gap-2 pt-4">
           <YellowBtn className="min-w-[80px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
           <GreyBtn onClick={onClose} className="min-w-[80px] h-[22px] flex items-center justify-center text-[11px]">Cancel</GreyBtn>
        </div>
      </div>
    </div>
  );
};

