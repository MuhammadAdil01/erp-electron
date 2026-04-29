import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface DashboardManagerWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const DashboardManagerWindow: React.FC<DashboardManagerWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  if (!show || windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setWindowState(prev => ({
        ...prev,
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      }));
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

      setWindowState(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newWidth = prev.width;
        let newHeight = prev.height;
        const minW = 700;
        const minH = 500;

        if (direction.includes('e')) {
          newWidth = Math.max(minW, startWidth + deltaX);
        }
        if (direction.includes('s')) {
          newHeight = Math.max(minH, startHeight + deltaY);
        }
        
        if (direction.includes('w')) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth > minW) {
            newWidth = possibleWidth;
            newX = startXPos + deltaX;
          } else {
            newWidth = minW;
            newX = startXPos + (startWidth - minW);
          }
        }
        
        if (direction.includes('n')) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight > minH) {
            newHeight = possibleHeight;
            newY = startYPos + deltaY;
          } else {
            newHeight = minH;
            newY = startYPos + (startHeight - minH);
          }
        }

        return { ...prev, x: newX, y: newY, width: newWidth, height: newHeight };
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[20px]";
  const sapInputStyle = "w-full h-[20px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#f5f5f5]";
  const sapTextareaStyle = "w-full h-full border border-gray-400 px-1 py-0.5 text-[11px] outline-none focus:border-orange-400 resize-none";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const yellowButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden select-none text-[11px]"
    >
      <div onMouseDown={handleDrag} className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400">
        <span className="text-black font-medium text-[11.5px] tracking-tight">Dashboard Manager</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      <div className="flex px-1.5 pt-1.5 gap-0.5">
         <div className="px-5 py-0.5 bg-white border border-gray-400 border-b-0 rounded-t-[3px] z-10 font-medium">Crystal Dashbo...</div>
      </div>

      <div className="flex-1 flex gap-2 p-3 pt-1 overflow-hidden">
        {/* Left Side: Tree View */}
        <div className="w-[220px] border border-gray-400 bg-white flex flex-col overflow-hidden shrink-0 shadow-inner">
           <div className="bg-[#fffbd5]/50 flex items-center gap-1.5 p-1 border-b border-gray-300">
              <ChevronRight className="w-3.5 h-3.5 text-black rotate-90" />
              <span className="font-bold">SAP Dashboard Package 2</span>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 pt-0.5 space-y-1">
              {[
                'Service Call - SAP HANA', 'Sales Analysis - SAP HANA', 'Cash Flow Forecast - SAP HANA',
                'Purchase Quotations - SAP HANA', 'Stock Status - SAP HANA', 'Delivery Analysis - SAP HANA',
                'Sales Employee Performance Target - SA', 'Payment Collection Analysis - SAP HANA',
                'Stock Counting Recommendation - SAP'
              ].map((item, i) => (
                <div key={i} className="pl-4 py-0.5 hover:bg-blue-50 cursor-default text-[10.5px] text-gray-700">{item}</div>
              ))}
           </div>
        </div>

        {/* Right Side: Details Pane */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden border border-gray-400 rounded-[2px] bg-white/50 p-3">
           <div className="grid grid-cols-[100px_1fr] gap-y-1.5 items-center max-w-lg">
              <span className={sapLabelStyle}>ID</span>
              <input type="text" className={sapInputStyle} defaultValue="SAP_DASHBOARD_002" readOnly />
              <span className={sapLabelStyle}>Name</span>
              <input type="text" className={sapInputStyle} defaultValue="SAP Dashboard Package 2" readOnly />
              <span className={sapLabelStyle}>Author</span>
              <input type="text" className={sapInputStyle} defaultValue="SAP" readOnly />
              <span className={sapLabelStyle}>Version</span>
              <input type="text" className={sapInputStyle} defaultValue="1.0.1" readOnly />
              <span className={sapLabelStyle}>Date Imported</span>
              <div className="flex gap-2">
                 <input type="text" className="w-[100px] h-5 border border-gray-400 px-1 bg-[#f5f5f5]" defaultValue="30.05.23" readOnly />
                 <input type="text" className="w-[80px] h-5 border border-gray-400 px-1 bg-[#f5f5f5]" defaultValue="13:26" readOnly />
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                 <span className={sapLabelStyle}>Powered by SAP HANA</span>
                 <input type="checkbox" className="w-3.5 h-3.5" defaultChecked />
              </div>
           </div>

           <div className="flex-1 flex flex-col pt-1">
              <span className={sapLabelStyle}>Description</span>
              <div className="flex-1 border border-gray-400 bg-white shadow-inner">
                 <textarea className={sapTextareaStyle} defaultValue="SAP Dashboard Package 2" readOnly></textarea>
              </div>
           </div>

           <div className="flex justify-end gap-1.5 mt-1">
              <button className={yellowButtonStyle}>Export</button>
              <button className={sapButtonStyle}>Delete</button>
           </div>
        </div>
      </div>

      <div className="p-2 pb-3 flex bg-[#ececec] justify-between items-center">
         <div className="flex gap-1.5">
            <button className={sapButtonStyle}>OK</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
         </div>
         <button className={sapButtonStyle}>Import</button>
      </div>

      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-50" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-50" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize z-50" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize z-50" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize z-50" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize z-50" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize z-50" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50" />
        </>
      )}
    </div>
  );
};
