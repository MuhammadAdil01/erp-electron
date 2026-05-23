import React from 'react';
import { ChevronDown } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface DocumentDraftsReportProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full shadow-inner";
const sapButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd000]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const DocumentDraftsReport: React.FC<DocumentDraftsReportProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
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

      if (direction.includes('e')) newWidth = Math.max(500, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 500) newX = startXPos + deltaX;
        else newWidth = 500;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= 500) newY = startYPos + deltaY;
        else newHeight = 500;
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

  const sections = [
    {
      title: 'Sales - A/R',
      items: ['Sales Quotations', 'Sales Orders', 'Deliveries', 'Return Request', 'Returns', 'A/R Down Payment', 'A/R Invoices', 'A/R Credit Memos']
    },
    {
      title: 'Purchasing - A/P',
      items: ['Purchase Request', 'Purchase Quotation', 'Purchase Orders', 'Goods Receipt PO', 'Goods Return Request', 'Goods Return', 'A/P Down Payment', 'A/P Invoices', 'A/P Credit Memos']
    },
    {
      title: 'Inventory',
      items: ['Goods Receipt', 'Goods Issue', 'Inventory Transfer Request', 'Inventory Transfers']
    },
    {
      title: 'Inventory Counting Transactions',
      items: ['Inventory Counting', 'Inventory Opening Balances', 'Inventory Posting']
    }
  ];

  return (
    <div
      className="absolute bg-[#f0f0f0] border border-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden select-none"
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
      onClick={onFocus}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[101]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[101]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[101]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[101]" />
        </>
      )}

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[24px] bg-[#f0f0f0] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <span className="text-black text-[12px] font-medium truncate">Document Drafts Report - Selection Criteria</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      <div className="h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shrink-0" />

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
         {/* Top Controls */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-12">
               <div className="flex items-center gap-2">
                  <label className="w-[60px] text-[11px] text-gray-700">User</label>
                  <div className="w-[180px] relative group">
                     <input type="text" defaultValue="adirict" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fff9c4] w-full" />
                     <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700 underline underline-offset-2">Open Only</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
               <label className="text-[11px] text-gray-700">Date</label>
               <div className="w-[180px] relative group ml-8">
                  <input type="text" defaultValue="Creation Date" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full" />
                  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                     <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  </div>
               </div>
               <label className="text-[11px] text-gray-700 ml-2">From</label>
               <input type="text" defaultValue="24.09.25" className="w-[100px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               <label className="text-[11px] text-gray-700">To</label>
               <input type="text" defaultValue="24.09.25" className="w-[100px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
            </div>
         </div>

         {/* Grid of Sections */}
         <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-4">
            {sections.map((section, idx) => (
               <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1">
                     <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700 font-bold underline underline-offset-2">{section.title}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 pl-6">
                     {section.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Footer Buttons */}
      <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 flex items-center px-4 gap-2 shrink-0">
         <button onClick={onClose} className={sapButtonStyle}>OK</button>
         <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
      </div>
    </div>
  );
};
