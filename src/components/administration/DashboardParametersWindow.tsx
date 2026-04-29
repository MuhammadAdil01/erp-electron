import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface DashboardParametersWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const DashboardParametersWindow: React.FC<DashboardParametersWindowProps> = ({
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
        const minW = 400;
        const minH = 300;

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
  const sapInputStyle = "w-full h-[20px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapYellowInputStyle = "w-full h-[20px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]";
  const sapSelectStyle = "w-full h-[20px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white";
  const yellowButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";

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
        <span className="text-black font-medium text-[11.5px] tracking-tight">Dashboard Parameters - Setup</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      <div className="p-3 flex flex-col gap-3">
         <div className="flex gap-4 items-center">
            <div className="grid grid-cols-[50px_80px] gap-2 items-center">
               <span className={sapLabelStyle}>Code</span>
               <input type="text" className={sapYellowInputStyle} />
            </div>
            <div className="grid grid-cols-[50px_120px] gap-2 items-center">
               <span className={sapLabelStyle}>Name</span>
               <input type="text" className={sapInputStyle} />
            </div>
            <div className="grid grid-cols-[40px_100px] gap-2 items-center">
               <span className={sapLabelStyle}>Type</span>
               <select className={sapSelectStyle}><option>Single</option></select>
            </div>
         </div>
      </div>

      <div className="flex-1 p-1.5 pt-0 flex flex-col overflow-hidden">
        <div className="flex-1 border border-gray-400 bg-white overflow-hidden shadow-inner flex flex-col">
          <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 font-medium text-[10px]">
            <div className="w-[30px] px-1 py-1 text-center">#</div>
            <div className="w-[100px] px-2 py-1">Name</div>
            <div className="flex-1 px-2 py-1">Value</div>
            <div className="w-[20px] shrink-0" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_19px,#f5f5f5_19px,#f5f5f5_20px)]">
             <div className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center text-[10.5px]">
                <div className="w-[30px] px-1 text-center text-gray-400 font-bold">1</div>
                <div className="w-[100px] px-2"></div>
                <div className="flex-1 px-2">0.00</div>
             </div>
             {Array(15).fill(null).map((_, i) => (
                <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center">
                   <div className="w-[30px] px-1 text-center text-gray-400 font-bold">{i + 2}</div>
                   <div className="w-[100px] px-2 h-full flex items-center"></div>
                   <div className="flex-1 px-2"></div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="p-2 pb-3 flex bg-[#ececec] gap-1.5">
         <button className={yellowButtonStyle}>Add</button>
         <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
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
