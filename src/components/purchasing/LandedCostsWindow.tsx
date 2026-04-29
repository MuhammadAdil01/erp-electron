import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';
import { ItemsTabLC } from './tabs/ItemsTabLC';
import { CostsTabLC } from './tabs/CostsTabLC';
import { VendorsTabLC } from './tabs/VendorsTabLC';
import { DetailsTabLC } from './tabs/DetailsTabLC';
import { GeneralTabLC } from './tabs/GeneralTabLC';
import { AttachmentsTabLC } from './tabs/AttachmentsTabLC';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface LandedCostsWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenShippingSetup: () => void;
}

export const LandedCostsWindow: React.FC<LandedCostsWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus, onOpenShippingSetup
}) => {
  const [activeTab, setActiveTab] = useState('Items');

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

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    const startW = windowState.width; const startH = windowState.height;
    const startX = e.clientX; const startY = e.clientY;
    const startXP = windowState.x; const startYP = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX; const dy = moveEvent.clientY - startY;
      let newX = windowState.x; let newY = windowState.y;
      let newW = windowState.width; let newH = windowState.height;
      const minW = 800; const minH = 600;

      if (direction.includes('e')) newW = Math.max(minW, startW + dx);
      if (direction.includes('s')) newH = Math.max(minH, startH + dy);
      if (direction.includes('w')) {
        newW = startW - dx;
        if (newW >= minW) newX = startXP + dx; else newW = minW;
      }
      if (direction.includes('n')) {
        newH = startH - dy;
        if (newH >= minH) newY = startYP + dy; else newH = minH;
      }
      onUpdateState({ x: newX, y: newY, width: newW, height: newH });
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
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50" />
        </>
      )}

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Landed Costs</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden bg-[#f0f0f0]">
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1 w-[450px]">
             <FieldRow label="Vendor" labelWidth="100px">
                <div className="flex w-full gap-1">
                   <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                   </div>
                   <ClassicInput className="flex-1 bg-[#ffed99]" />
                </div>
             </FieldRow>
             <FieldRow label="Broker" labelWidth="100px">
                <div className="flex w-full gap-1">
                   <div className="bg-[#f0f0f0] border border-[#d4d0c8] p-0.5 flex items-center cursor-pointer">
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                   </div>
                   <ClassicInput className="flex-1" />
                </div>
             </FieldRow>
             <div className="flex items-center gap-6 mt-1">
                <div className="w-[100px] shrink-0">
                  <ClassicSel className="w-[80px]"><option>PKR</option></ClassicSel>
                </div>
                <div className="flex items-center gap-1">
                   <input type="checkbox" className="w-3 h-3" />
                   <span className="text-[10.5px]">Closed Document</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-1 w-[200px]">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] w-[80px]">Number</span>
                <ClassicInput value="1" className="flex-1 bg-[#f0f0f0] text-right" readOnly />
             </div>
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] w-[80px]">Series</span>
                <ClassicSel className="flex-1"><option>DHAB-LC</option></ClassicSel>
             </div>
             <FieldRow label="Posting Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full text-center" />
             </FieldRow>
             <FieldRow label="Due Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full text-center" />
             </FieldRow>
             <FieldRow label="Reference" labelWidth="80px">
                <ClassicInput className="w-full" />
             </FieldRow>
             <FieldRow label="File No." labelWidth="80px">
                <ClassicInput className="w-full" />
             </FieldRow>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-[#808080] mt-1 overflow-x-auto custom-scrollbar shrink-0">
          {['Items', 'Costs', 'Vendors', 'Details', 'General', 'Attachments'].map(t => (
            <ClassicTab key={t} label={t} isActive={activeTab === t} onClick={() => setActiveTab(t)} />
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white border border-[#808080] border-t-0 flex flex-col overflow-hidden">
          {activeTab === 'Items' && <ItemsTabLC />}
          {activeTab === 'Costs' && <CostsTabLC />}
          {activeTab === 'Vendors' && <VendorsTabLC />}
          {activeTab === 'Details' && <DetailsTabLC onOpenShippingSetup={onOpenShippingSetup} />}
          {activeTab === 'General' && <GeneralTabLC />}
          {activeTab === 'Attachments' && <AttachmentsTabLC />}
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end shrink-0 py-1">
           <div className="flex flex-col gap-1 w-[450px]">
              <FieldRow label="Projected Customs" labelWidth="120px">
                 <ClassicInput className="w-[100px] h-[18px] bg-[#f0f0f0]" readOnly />
              </FieldRow>
              <FieldRow label="Actual Customs" labelWidth="120px">
                 <ClassicInput className="w-[100px] h-[18px] bg-white shadow-inner" />
              </FieldRow>
              <FieldRow label="Customs Date" labelWidth="120px">
                 <ClassicInput value="19.03.26" className="w-[100px] h-[18px]" />
              </FieldRow>
              <div className="flex items-center gap-1 my-0.5 ml-[120px]">
                 <input type="checkbox" className="w-3 h-3" defaultChecked />
                 <span className="text-[10.5px]">Customs Affects Inventory</span>
              </div>
              <div className="flex gap-2">
                <div className="text-[10.5px] w-[60px]">Remarks</div>
                <textarea className="flex-1 h-[50px] border border-[#d4d0c8] outline-none text-[10.5px] p-1 resize-none shadow-inner" />
              </div>
           </div>

           <div className="flex flex-col gap-1 w-[350px]">
              <FieldRow label="Total Freight Charges" labelWidth="150px">
                 <ClassicInput className="w-[100px] h-[18px] bg-[#f0f0f0]" readOnly />
              </FieldRow>
              <FieldRow label="Amount to Balance" labelWidth="150px">
                 <ClassicInput className="w-[100px] h-[18px] bg-[#f0f0f0]" readOnly />
              </FieldRow>
              <div className="h-2" />
              <div className="flex flex-col gap-0.5">
                 <div className="flex justify-end gap-2 items-center">
                   <span className="text-[10.5px] w-[150px] text-right">Before Tax</span>
                   <div className="w-[120px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0]" />
                 </div>
                 <div className="flex justify-end gap-2 items-center">
                   <span className="text-[10.5px] w-[150px] text-right">Tax 1</span>
                   <div className="w-[120px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0]" />
                 </div>
                 <div className="flex justify-end gap-2 items-center">
                   <span className="text-[10.5px] w-[150px] text-right">Tax 2</span>
                   <div className="w-[120px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0]" />
                 </div>
                 <div className="flex justify-end gap-2 items-center mt-1">
                   <span className="text-[10.5px] w-[150px] text-right font-bold underline">Total</span>
                   <div className="w-[120px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0]" />
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Actions Area */}
        <div className="flex justify-between items-center border-t border-[#d4d0c8] pt-2 shrink-0">
          <div className="flex gap-2">
             <YellowBtn className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Add</YellowBtn>
             <YellowBtn onClick={onClose} className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Cancel</YellowBtn>
          </div>
          <div>
             <GreyBtn className="min-w-[100px] h-[22px] flex items-center justify-center text-[11px]">Copy From</GreyBtn>
          </div>
        </div>
      </div>
    </div>
  );
};

