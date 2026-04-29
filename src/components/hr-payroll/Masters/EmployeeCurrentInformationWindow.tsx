import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { EmployeeDetailsTab } from './tabs/EmployeeDetailsTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface EmployeeCurrentInformationWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const EmployeeCurrentInformationWindow: React.FC<EmployeeCurrentInformationWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState('Employee Details');

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

        if (direction.includes('e')) newWidth = Math.max(700, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 700) newX = startXPos + deltaX;
          else newWidth = 700;
        }
        
        if (direction.includes('n')) {
          newHeight = startHeight - deltaY;
          if (newHeight >= 500) newY = startYPos + deltaY;
          else newHeight = 500;
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

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none"
    >
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

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#7e7e7e] to-[#4c4c4c] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-black/40"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium text-[12px] tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Employee Current Information</span>
        </div>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Minus className="w-4 h-4 text-white" />
           </div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Square className="w-3.5 h-3.5 text-white" />
           </div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors group">
              <X className="w-4 h-4 text-white" />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-1.5 overflow-hidden">
        {/* Yellow/Orange Top Line */}
        <div className="h-[6px] bg-gradient-to-r from-orange-400 to-yellow-500 w-full mb-1.5 rounded-sm shrink-0" />

        {/* Tab Headers */}
        <div className="flex px-4 border-b border-gray-400 shrink-0 h-[26px]">
          {['Employee Details', 'Leave Details'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 flex items-center justify-center cursor-pointer border border-gray-400 border-b-0 rounded-t-[4px] text-[11px] mr-[2px] transition-all relative ${activeTab === tab ? 'bg-white font-bold z-10 -mb-[1px] h-[27px] shadow-[0_-1px_2px_rgba(0,0,0,0.1)]' : 'bg-[#d8d8d8] z-0 overflow-hidden mt-[2.5px] h-[24px] hover:bg-[#e0e0e0] text-gray-700 hover:text-black'}`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Tab Body Column Container */}
        <div className="flex-1 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col mb-1 mx-1">
           <div className="flex-1 overflow-auto custom-scrollbar">
              {activeTab === 'Employee Details' && <EmployeeDetailsTab />}
              {activeTab === 'Leave Details' && <div className="p-8 text-gray-400 text-[11px]">Leave Details Component (Placeholder)</div>}
           </div>
        </div>

        {/* Footer Area */}
        <div className="flex gap-2 p-2 shrink-0">
           <button className="px-10 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px]">
             Add
           </button>
           <button 
             onClick={onClose}
             className="px-10 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px]"
           >
             Cancel
           </button>
        </div>
      </div>
    </div>
  );
};
