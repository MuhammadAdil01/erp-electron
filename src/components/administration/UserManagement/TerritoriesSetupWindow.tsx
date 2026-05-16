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

interface TerritoriesSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const TerritoriesSetupWindow: React.FC<TerritoriesSetupWindowProps> = ({
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

        const minW = 500;
        const minH = 400;

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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[20px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white shadow-inner";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal disabled:opacity-50 disabled:cursor-not-allowed";

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
      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400">
        <span className="text-black font-medium text-[11.5px] tracking-tight">Territories - Setup</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      <div className="flex-1 p-3 flex gap-4 overflow-hidden">
        {/* Left Side: Details */}
        <div className="w-[280px] flex flex-col gap-2 shrink-0">
           <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2 mb-1">Territory Details</span>
           <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 items-center">
              <span className={sapLabelStyle}>Name</span>
              <input type="text" className={sapInputStyle} />
              <span className={sapLabelStyle}>Parent Territory</span>
              <input type="text" className={sapInputStyle} disabled />
              <span className={sapLabelStyle}>Location Order</span>
              <input type="text" className={sapInputStyle} disabled />
           </div>
           <div className="mt-auto">
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5 border border-gray-400" />
                 <span className={sapLabelStyle}>Show Inactive</span>
              </div>
           </div>
        </div>

        {/* Right Side: Tree View */}
        <div className="flex-1 border border-gray-400 bg-white overflow-y-auto custom-scrollbar p-1 shadow-inner">
           <div className="flex items-center gap-1 py-1 px-2 hover:bg-blue-50 cursor-default group">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
              <span className="text-[11px] font-bold text-blue-900">-No Territory-</span>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 pb-3 flex bg-[#ececec] justify-between">
         <div className="flex gap-1.5 text-[11px]">
            <button className={sapButtonStyle}>OK</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
         </div>
         <div className="flex gap-1.5 opacity-50 cursor-not-allowed">
            <button className={sapButtonStyle} disabled>Set Inactive</button>
            <button className={sapButtonStyle} disabled>Add Same-Level</button>
            <button className={sapButtonStyle} disabled>Add Sub-Level</button>
         </div>
      </div>

      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};
