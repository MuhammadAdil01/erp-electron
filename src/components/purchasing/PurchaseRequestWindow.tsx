import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, FieldRow, cn 
} from '../ui/ClassicERPUI';
import { ContentsTab } from './tabs/ContentsTab';
import { AttachmentsTab } from './tabs/AttachmentsTab';
import { InitialStatementTab } from './tabs/InitialStatementTab';
import { CommentsTab } from './tabs/CommentsTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface PurchaseRequestWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PurchaseRequestWindow: React.FC<PurchaseRequestWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
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
    
    const startWidth = windowState.width;
    const startHeight = windowState.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = windowState.x;
    const startYPos = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = windowState.x;
      let newY = windowState.y;
      let newWidth = windowState.width;
      let newHeight = windowState.height;

      const minW = 600;
      const minH = 400;

      if (direction.includes('e')) newWidth = Math.max(minW, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(minH, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= minW) newX = startXPos + deltaX;
        else newWidth = minW;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= minH) newY = startYPos + deltaY;
        else newHeight = minH;
      }

      onUpdateState({ x: newX, y: newY, width: newWidth, height: newHeight });
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
      <div 
        onMouseDown={handleDrag}
        className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default"
      >
        <span className="text-white text-[11px] font-bold">Purchase Request</span>
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
             <FieldRow label="Requester" labelWidth="100px">
                <div className="flex w-full gap-1">
                  <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <ClassicSel className="flex-1">
                    <option>User</option>
                  </ClassicSel>
                  <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <ClassicInput value="adirict" readOnly className="flex-1" />
                </div>
             </FieldRow>
             <FieldRow label="Requester Name" labelWidth="100px">
                <ClassicInput value="Additional Director ICT" readOnly className="w-full" />
             </FieldRow>
             <FieldRow label="Branch" labelWidth="100px">
                <ClassicSel className="w-full">
                  <option></option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="Department" labelWidth="100px">
                <ClassicSel className="w-full">
                  <option></option>
                </ClassicSel>
             </FieldRow>
             <div className="flex items-center gap-2 mt-1 mb-1 ml-[100px]">
                <input type="checkbox" defaultChecked className="w-3 h-3" />
                <span className="text-[10.5px]">Send E-Mail if PO or GRPO is Added</span>
             </div>
             <FieldRow label="E-Mail Address" labelWidth="100px">
                <ClassicInput className="w-full" />
             </FieldRow>
          </div>

          {/* Middle Column (Approvals) */}
          <div className="flex-1 min-w-[280px]">
             <FieldRow label="Additional Director Approval" labelWidth="160px">
                <ClassicSel className="w-full">
                  <option>Unapproved</option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="Director Approval" labelWidth="160px">
                <ClassicSel className="w-full">
                  <option>Unapproved</option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="Secy. Approval" labelWidth="160px">
                <ClassicSel className="w-full">
                  <option>Unapproved</option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="P.D. Approval" labelWidth="160px">
                <ClassicSel className="w-full">
                  <option>Unapproved</option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="PR Routed to" labelWidth="160px">
                <ClassicInput className="w-full" />
             </FieldRow>
             <FieldRow label="Route To" labelWidth="160px">
                <ClassicInput className="w-full bg-[#e0e0e0]" readOnly />
             </FieldRow>
          </div>

          {/* Right Column (Status & Dates) */}
          <div className="w-[200px]">
             <div className="flex items-center gap-1 mb-1">
                <div className="text-[10.5px] w-[80px]">No.</div>
                <ClassicSel className="w-[60px]">
                  <option>DHAB-PR</option>
                </ClassicSel>
                <ClassicInput value="207" className="w-[50px] text-right" readOnly />
             </div>
             <FieldRow label="Status" labelWidth="80px">
                <ClassicSel className="w-full">
                  <option>Open</option>
                </ClassicSel>
             </FieldRow>
             <FieldRow label="Posting Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full" />
             </FieldRow>
             <FieldRow label="Valid Until" labelWidth="80px">
                <ClassicInput value="19.04.26" className="w-full" />
             </FieldRow>
             <FieldRow label="Document Date" labelWidth="80px">
                <ClassicInput value="19.03.26" className="w-full" />
             </FieldRow>
             <FieldRow label="Required Date" labelWidth="80px">
                <ClassicInput className="w-full" />
             </FieldRow>
             
             <div className="flex justify-end gap-2 mt-2">
                <span className="text-[10.5px] italic text-gray-600">Referenced Document</span>
                <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
                  <span className="text-[10px] font-bold">...</span>
                </div>
             </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex border-b border-[#808080] mt-1">
          {['Contents', 'Attachments', 'Initial Statement', 'Comments'].map(t => (
            <ClassicTab 
              key={t}
              label={t}
              isActive={activeTab === t}
              onClick={() => setActiveTab(t)}
            />
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-white border border-[#808080] border-t-0 flex flex-col overflow-hidden">
          {activeTab === 'Contents' && <ContentsTab />}
          {activeTab === 'Attachments' && <AttachmentsTab />}
          {activeTab === 'Initial Statement' && <InitialStatementTab />}
          {activeTab === 'Comments' && <CommentsTab />}
        </div>

        {/* Footer Section */}
        <div className="flex justify-between mt-1 items-end">
           {/* Left Part */}
           <div className="flex flex-col gap-1 w-[400px]">
              <FieldRow label="Owner" labelWidth="80px">
                 <ClassicInput className="flex-1" />
              </FieldRow>
              <div className="flex gap-2">
                <div className="text-[10.5px] w-[80px]">Remarks</div>
                <textarea className="flex-1 h-[60px] border border-[#d4d0c8] outline-none text-[10.5px] p-1 resize-none" />
              </div>
           </div>

           {/* Right Part (Totals) */}
           <div className="flex flex-col gap-1 w-[250px]">
              <FieldRow label="Total Before Discount" labelWidth="120px">
                 <ClassicInput className="w-full bg-[#f0f0f0]" readOnly />
              </FieldRow>
              <FieldRow label="Freight" labelWidth="120px">
                 <div className="flex w-full">
                    <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer h-[18px]">
                      <ChevronRight className="w-3 h-3 text-orange-600" />
                    </div>
                    <ClassicInput className="flex-1 h-[18px]" />
                 </div>
              </FieldRow>
              <FieldRow label="Tax" labelWidth="120px">
                 <ClassicInput className="w-full bg-[#f0f0f0]" readOnly />
              </FieldRow>
              <FieldRow label="Total Payment Due" labelWidth="120px">
                 <div className="flex w-full items-center gap-2">
                    <span className="text-[10px] text-gray-600">PKR</span>
                    <ClassicInput value="0.00" className="flex-1 text-right bg-[#f0f0f0]" readOnly />
                 </div>
              </FieldRow>
           </div>
        </div>

        {/* Bottom Bar Actions */}
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
    </div>
  );
};
