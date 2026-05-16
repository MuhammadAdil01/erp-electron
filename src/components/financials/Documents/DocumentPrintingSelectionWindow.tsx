import React from 'react';
import { X, Minus, Square, ChevronDown } from 'lucide-react';

interface DocumentPrintingSelectionWindowProps {
  onClose: () => void;
  onFocus: () => void;
  windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
  };
  onUpdateState: (state: Partial<DocumentPrintingSelectionWindowProps['windowState']>) => void;
}

export const DocumentPrintingSelectionWindow: React.FC<DocumentPrintingSelectionWindowProps> = ({
  onClose,
  onFocus,
  windowState,
  onUpdateState,
}) => {
  const isMaximized = windowState.isMaximized;

  const sapLabelStyle = "text-[11px] text-[#333333] font-normal whitespace-nowrap";
  const sapInputStyle = "text-[11.5px] border border-gray-400 px-1 py-0.5 bg-white focus:border-blue-500 focus:outline-none rounded-[1px]";
  const sapCheckboxStyle = "w-4 h-4 border-gray-400 rounded-[1px] accent-blue-600 cursor-pointer";
  const sapGoldButtonStyle = "px-6 py-0.5 text-[11px] font-medium border border-gray-600 rounded-[1px] shadow-sm hover:brightness-95 transition-all bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60";

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    if (isMaximized) return;

    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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

      if (direction.includes('e')) newWidth = Math.max(550, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(450, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = Math.max(550, startWidth - deltaX);
        if (newWidth > 550) newX = startXPos + deltaX;
      }
      
      if (direction.includes('n')) {
        newHeight = Math.max(450, startHeight - deltaY);
        if (newHeight > 450) newY = startYPos + deltaY;
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
      onClick={onFocus}
      style={{
        position: 'absolute',
        left: isMaximized ? 0 : windowState.x,
        top: isMaximized ? 0 : windowState.y,
        width: isMaximized ? '100%' : windowState.width,
        height: isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        border: '1px solid #999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}
      className="document-printing-selection-window"
    >
      {/* Resize Handles */}
      {!isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-7 bg-gradient-to-b from-[#fdfdfd] to-[#dcdcdc] flex items-center justify-between px-2 cursor-default border-b border-[#999]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-normal text-[#444]">Document Printing - Selection Criteria</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMinimized: true }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMaximized: !isMaximized }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Square className="w-3 h-3 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-10 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Top Section */}
        <div className="space-y-1">
          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Document Type</span>
            <div className="flex items-center border border-gray-400 rounded-[1px] bg-white pr-1">
              <select className="flex-1 text-[11.5px] px-1 py-0.5 appearance-none focus:outline-none bg-white">
                <option>Outgoing Payments</option>
                <optgroup label="Sales">
                  <option>Sales Quotations</option>
                  <option>Sales Orders</option>
                  <option>Deliveries</option>
                  <option>Return Request</option>
                  <option>Returns</option>
                  <option>A/R Down Payment</option>
                  <option>A/R Invoices</option>
                  <option>A/R Credit Memos</option>
                </optgroup>
                <optgroup label="Purchase">
                  <option>Purchase Request</option>
                  <option>Purchase Quotation</option>
                  <option>Purchase Orders</option>
                  <option>Goods Receipt PO</option>
                  <option>Goods Return Request</option>
                  <option>Goods Return</option>
                  <option>A/P Down Payment</option>
                  <option>A/P Invoices</option>
                  <option>A/P Credit Memos</option>
                </optgroup>
                <optgroup label="Banking">
                  <option>Incoming Payments</option>
                  <option>Deposits</option>
                  <option>Outgoing Payments</option>
                  <option>Checks for Payment</option>
                  <option>Journal Entries</option>
                </optgroup>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Posting Date From</span>
            <div className="flex items-center gap-2">
              <input type="text" className={`${sapInputStyle} w-24`} defaultValue="01.09.25" />
              <span className={sapLabelStyle}>To</span>
              <input type="text" className={`${sapInputStyle} w-24`} defaultValue="25.09.25" />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Series</span>
            <div className="flex items-center border border-gray-400 rounded-[1px] bg-white pr-1">
              <select className="flex-1 text-[11.5px] px-1 py-0.5 appearance-none focus:outline-none bg-white">
                <option>All</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="space-y-1 pt-4">
          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Account From</span>
            <div className="flex items-center gap-2">
              <input type="text" className={`${sapInputStyle} w-32`} />
              <span className={sapLabelStyle}>To</span>
              <input type="text" className={`${sapInputStyle} w-32`} />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>BP Code From</span>
            <div className="flex items-center gap-2">
               <input type="text" className={`${sapInputStyle} w-32`} />
               <span className={sapLabelStyle}>To</span>
               <input type="text" className={`${sapInputStyle} w-32`} />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Customer Group</span>
            <div className="flex items-center border border-gray-400 rounded-[1px] bg-white pr-1">
              <select className="flex-1 text-[11.5px] px-1 py-0.5 appearance-none focus:outline-none bg-white">
                <option>All</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Vendor Group</span>
            <div className="flex items-center border border-gray-400 rounded-[1px] bg-white pr-1">
              <select className="flex-1 text-[11.5px] px-1 py-0.5 appearance-none focus:outline-none bg-white">
                <option>All</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4 pt-1">
            <button className={sapGoldButtonStyle}>Properties</button>
            <div className="flex items-center border border-gray-400 rounded-[1px] bg-white pr-1">
              <select className="flex-1 text-[11.5px] px-1 py-0.5 appearance-none focus:outline-none bg-white">
                <option>Ignore</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Checkboxes Section */}
        <div className="space-y-1 pt-2">
           <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Only Documents Still to Be Printed</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Only Documents Still to Be E-Mailed</span>
           </label>
           <div className="h-2" />
           <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Obtain printer settings from default printing layout</span>
           </label>
        </div>

        {/* Bottom Section */}
        <div className="space-y-1 pt-4">
           <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>Internal Number From</span>
            <div className="flex items-center gap-2">
               <input type="text" className={`${sapInputStyle} w-32`} />
               <span className={sapLabelStyle}>To</span>
               <input type="text" className={`${sapInputStyle} w-32`} />
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr] items-center gap-x-4">
            <span className={sapLabelStyle}>No. of Copies</span>
            <input type="text" className={`${sapInputStyle} w-32`} defaultValue="1" />
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="h-10 px-4 bg-[#f0f0f0] border-t border-[#ccc] flex items-center gap-2 shrink-0">
        <button className={sapGoldButtonStyle}>OK</button>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={sapGoldButtonStyle}>Cancel</button>
      </div>
    </div>
  );
};
