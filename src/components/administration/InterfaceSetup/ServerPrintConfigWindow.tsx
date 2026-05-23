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

interface ServerPrintConfigWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const ServerPrintConfigWindow: React.FC<ServerPrintConfigWindowProps> = ({
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

  const [selectedPrinters, setSelectedPrinters] = useState<Record<string, boolean>>({
    'OneNote (Desktop)': true
  });
  const [defaultPrinters, setDefaultPrinters] = useState<Record<string, boolean>>({
    'AnyDesk Printer': true
  });

  const printers = [
    'AnyDesk Printer', 'HP LaserJet CP 1025', 'Microsoft Print to PDF', 'OneNote (Desktop)'
  ];

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[20px]";
  const sapSelectStyle = "w-full h-[20px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

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
        <span className="text-black font-medium text-[11.5px] tracking-tight">Server Print Configuration</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>
      <div className="p-3 flex flex-col gap-2">
         <div className="grid grid-cols-[100px_1fr_100px] gap-x-4 items-center max-w-2xl">
            <span className={sapLabelStyle}>Host</span>
            <select className={sapSelectStyle}><option>DESKTOP-BH8OQJ5</option></select>
            <div />
            <span className={sapLabelStyle}>Default Printer</span>
            <select className={sapSelectStyle}><option>AnyDesk Printer</option></select>
            <button className={sapButtonStyle}>Set as Default</button>
         </div>
      </div>

      <div className="flex-1 p-1.5 pt-0 flex flex-col overflow-hidden">
        <div className="flex-1 border border-gray-400 bg-white shadow-inner flex flex-col overflow-hidden">
          <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 font-medium text-[10.5px]">
            <div className="flex-[2] px-2 py-1">Printer Name</div>
            <div className="w-[80px] px-1 py-1 text-center">Selected</div>
            <div className="w-[80px] px-1 py-1 text-center">Default</div>
            <div className="w-[20px] shrink-0" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_19px,#f5f5f5_19px,#f5f5f5_20px)]">
            {printers.map((p, i) => (
              <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center text-[10.5px]">
                <div className="flex-[2] px-2 h-full flex items-center text-gray-800">{p}</div>
                <div className={`w-[80px] h-full flex items-center justify-center ${p === 'OneNote (Desktop)' ? 'bg-[#fffbd5]' : ''}`}>
                   <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 border-gray-400 cursor-pointer accent-blue-600" 
                    checked={!!selectedPrinters[p]}
                    onChange={(e) => setSelectedPrinters(prev => ({...prev, [p]: e.target.checked}))}
                   />
                </div>
                <div className="w-[80px] h-full flex items-center justify-center">
                   <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 border-gray-400 cursor-pointer accent-blue-600" 
                    checked={!!defaultPrinters[p]}
                    onChange={(e) => setDefaultPrinters(prev => ({...prev, [p]: e.target.checked}))}
                   />
                </div>
              </div>
            ))}
            {Array(15).fill(null).map((_, i) => (
              <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center">
                 <div className="flex-[2] px-2"></div><div className="w-[80px]"></div><div className="w-[80px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-2 pb-3 flex bg-[#ececec] justify-between">
         <div className="flex gap-1.5">
            <button onClick={() => {
              const all: Record<string, boolean> = {};
              printers.forEach(p => all[p] = true);
              setSelectedPrinters(all);
            }} className={sapActionButtonStyle}>Select All</button>
            <button onClick={() => setSelectedPrinters({})} className={sapActionButtonStyle}>Clear Selection</button>
         </div>
         <div className="flex gap-1.5">
            <button className={sapActionButtonStyle}>OK</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
         </div>
      </div>

      {/* Resize Handles */}
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
