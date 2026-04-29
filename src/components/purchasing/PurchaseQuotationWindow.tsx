import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';
import { ContentsTabPQ } from './tabs/ContentsTabPQ';
import { LogisticsTab } from './tabs/LogisticsTab';
import { AccountingTab } from './tabs/AccountingTab';
import { AttachmentsTab } from './tabs/AttachmentsTab';
import { InitialStatementTab } from './tabs/InitialStatementTab';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface PurchaseQuotationWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PurchaseQuotationWindow: React.FC<PurchaseQuotationWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

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
      const minW = 700; const minH = 500;

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
      className={cn(
        "absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
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
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[60] hover:bg-orange-400/40" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-[60] hover:bg-orange-400/40 flex items-end justify-end">
             <div className="w-1.5 h-1.5 border-r border-b border-gray-400 m-0.5" />
          </div>
        </>
      )}

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default">
        <span className="text-white text-[11px] font-bold">Purchase Quotation</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden bg-[#f0f0f0]">
        
        {/* Header Section */}
        <div className="flex gap-8">
          {/* Left Column */}
          <div className="flex-1 min-w-[300px]">
             <FieldRow label="Vendor" labelWidth="100px">
                <div className="flex w-full gap-1">
                   <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                   </div>
                   <ClassicInput className="flex-1 bg-[#ffed99]" />
                </div>
             </FieldRow>
             <FieldRow label="Name" labelWidth="100px">
                <ClassicInput className="w-full" />
             </FieldRow>
             <FieldRow label="Contact Person" labelWidth="100px">
                <div className="flex flex-1 relative">
                   <ClassicSel className="flex-1">
                      <option></option>
                   </ClassicSel>
                   <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer ml-1">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                   </div>
                </div>
             </FieldRow>
             <FieldRow label="Vendor Ref. No." labelWidth="100px">
                <ClassicInput className="w-full" />
             </FieldRow>
             <FieldRow label="Local Currency" labelWidth="100px">
                <ClassicSel className="w-full">
                   <option>PKR</option>
                </ClassicSel>
             </FieldRow>
             <div className="flex items-center gap-1 mb-1">
                <div className="text-[10.5px] w-[100px]">Group No.</div>
                <ClassicSel className="w-[80px]">
                   <option>DHAB-PQ</option>
                </ClassicSel>
                <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer ml-1">
                   <ChevronRight className="w-3 h-3 text-orange-600" />
                </div>
                <ClassicInput value="359" className="w-[50px] text-right" readOnly />
             </div>
          </div>

          {/* Middle Column (Approvals) */}
          <div className="flex-1 min-w-[280px]">
             <FieldRow label="Project Director Approval" labelWidth="180px">
                <ClassicSel className="w-full"><option>Unapproved</option></ClassicSel>
             </FieldRow>
             <FieldRow label="Secretary Approval" labelWidth="180px">
                <ClassicSel className="w-full"><option>Unapproved</option></ClassicSel>
             </FieldRow>
             <FieldRow label="Procurement Director Approval" labelWidth="180px">
                <ClassicSel className="w-full"><option>Unapproved</option></ClassicSel>
             </FieldRow>
             <FieldRow label="Routed to" labelWidth="180px">
                <ClassicInput className="w-full" />
             </FieldRow>
          </div>

          {/* Right Column (Status & Dates) */}
          <div className="w-[200px]">
             <div className="flex items-center gap-1 mb-1">
                <div className="text-[10.5px] w-[80px]">No.</div>
                <ClassicSel className="w-[60px]"><option>DHAB-PQ</option></ClassicSel>
                <ClassicInput value="632" className="w-[50px] text-right" readOnly />
             </div>
             <FieldRow label="Status" labelWidth="80px">
                <ClassicSel className="w-full"><option>Open</option></ClassicSel>
             </FieldRow>
             <FieldRow label="Posting Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full" />
             </FieldRow>
             <FieldRow label="Valid Until" labelWidth="80px">
                <ClassicInput className="w-full" />
             </FieldRow>
             <FieldRow label="Document Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full" />
             </FieldRow>
             <FieldRow label="Required Date" labelWidth="80px">
                <ClassicInput className="w-full" />
             </FieldRow>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-[#808080] mt-1 overflow-x-auto custom-scrollbar">
          {['Contents', 'Logistics', 'Accounting', 'Attachments', 'Initial Statement', 'Comments'].map(t => (
            <ClassicTab key={t} label={t} isActive={activeTab === t} onClick={() => setActiveTab(t)} />
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white border border-[#808080] border-t-0 flex flex-col overflow-hidden">
          {activeTab === 'Contents' && <ContentsTabPQ />}
          {activeTab === 'Logistics' && <LogisticsTab />}
          {activeTab === 'Accounting' && <AccountingTab />}
          {activeTab === 'Attachments' && <AttachmentsTab />}
          {activeTab === 'Initial Statement' && <InitialStatementTab />}
          {activeTab === 'Comments' && <div className="flex-1 flex flex-col gap-1 p-4 bg-white overflow-y-auto">
             {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-[100px] text-[10.5px] font-bold text-[#333]">PQ - {i + 1}</div>
                  <ClassicInput className="flex-1" />
                </div>
             ))}
          </div>}
        </div>

        {/* Footer Section */}
        <div className="flex justify-between mt-1 items-end">
           <div className="flex flex-col gap-1 w-[400px]">
              <FieldRow label="Buyer" labelWidth="80px">
                 <div className="flex flex-1 items-center gap-1">
                    <ClassicSel className="flex-1"><option>-No Sales Employee-</option></ClassicSel>
                    <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                    </div>
                 </div>
              </FieldRow>
              <FieldRow label="Owner" labelWidth="80px"><ClassicInput className="flex-1" /></FieldRow>
              <div className="flex gap-2">
                <div className="text-[10.5px] w-[80px]">Remarks</div>
                <textarea className="flex-1 h-[60px] border border-[#d4d0c8] outline-none text-[10.5px] p-1 resize-none" />
              </div>
           </div>

           <div className="flex flex-col gap-1 w-[250px]">
              <FieldRow label="Total Before Discount" labelWidth="120px"><ClassicInput className="w-full bg-[#f0f0f0]" readOnly /></FieldRow>
              <div className="flex gap-2 items-center mb-1">
                <div className="text-[10.5px] w-[120px] shrink-0">Discount</div>
                <ClassicInput value="0.00" className="w-[60px] text-right" />
                <span className="text-[10.5px]">%</span>
                <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-orange-600" />
                </div>
                <ClassicInput className="flex-1 h-[18px] bg-[#f0f0f0]" readOnly />
              </div>
              <FieldRow label="Freight" labelWidth="120px">
                 <div className="flex w-full">
                    <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer h-[18px]">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                    </div>
                    <ClassicInput className="flex-1 h-[18px]" />
                 </div>
              </FieldRow>
              <FieldRow label="Tax" labelWidth="120px"><ClassicInput className="w-full bg-[#f0f0f0]" readOnly /></FieldRow>
              <FieldRow label="Total Payment Due" labelWidth="120px">
                 <div className="flex w-full items-center gap-2">
                    <span className="text-[10px] text-gray-600">PKR</span>
                    <ClassicInput value="0.00" className="flex-1 text-right bg-[#f0f0f0]" readOnly />
                 </div>
              </FieldRow>
           </div>
        </div>

        {/* Bottom Actions Area */}
        <div className="flex justify-between items-center mt-2 border-t border-[#d4d0c8] pt-2">
          <div className="flex gap-2">
             <YellowBtn className="min-w-[80px]">Add & New</YellowBtn>
             <YellowBtn className="min-w-[100px]">Add Draft & New</YellowBtn>
             <GreyBtn onClick={onClose} className="min-w-[80px]">Cancel</GreyBtn>
          </div>
          <div className="flex gap-2 opacity-30 pointer-events-none">
             <GreyBtn className="min-w-[80px]">Copy From</GreyBtn>
             <GreyBtn className="min-w-[80px]">Copy To</GreyBtn>
          </div>
        </div>
      </div>
      
      {/* Resize Handle */}
      {!windowState.isMaximized && (
        <div 
          onMouseDown={handleResize('se')}
          className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-[60] flex items-end justify-end"
        >
           <div className="w-1.5 h-1.5 border-r border-b border-gray-400 m-0.5" />
        </div>
      )}
    </div>
  );
};
