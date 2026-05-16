import React from 'react';
import { ChevronDown, Calendar, ArrowRight } from 'lucide-react';
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

interface BackorderReportProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full shadow-inner";
const sapButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd000]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const BackorderReport: React.FC<BackorderReportProps> = ({
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

      if (direction.includes('e')) newWidth = Math.max(600, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 600) newX = startXPos + deltaX;
        else newWidth = 600;
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

  const warehouses = [
    { code: '01', name: 'General Warehouse' },
    { code: 'Adm', name: 'Admin' },
    { code: 'Electric', name: 'Electric' },
    { code: 'Fin', name: 'Finance' },
    { code: 'HR', name: 'Human Resources Branch' }
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
        <span className="text-black text-[12px] font-medium truncate">Backorder - Selection Criteria</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      <div className="h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shrink-0" />

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
         {/* Top Grid */}
         <div className="flex flex-col gap-1.5 pl-2">
            <div className="flex items-center gap-8">
               <label className="w-[100px] text-[11px] text-gray-700">Delivery Date</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <div className="w-[180px] relative group">
                     <input type="text" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fff9c4] w-full" />
                     <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" />
                     </div>
                  </div>
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
            <div className="flex items-center gap-8">
               <label className="w-[100px] text-[11px] text-gray-700">Customer Code</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
            <div className="flex items-center gap-8">
               <label className="w-[100px] text-[11px] text-gray-700">Document No.</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
         </div>

         {/* Items Section */}
         <div className="flex flex-col border border-gray-300 p-3 pt-1 relative">
            <span className="absolute top-[-9px] left-3 bg-[#f0f0f0] px-1 text-[11px] text-gray-700 font-bold underline underline-offset-2">Items</span>
            <div className="flex flex-col gap-2 mt-4">
               <div className="flex items-center gap-8">
                  <label className="w-[100px] text-[11px] text-gray-700 ml-2">Code</label>
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] text-gray-700">From</span>
                     <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                     <span className="text-[11px] text-gray-700">To</span>
                     <input type="text" className="w-[180px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <label className="w-[100px] text-[11px] text-gray-700 ml-2">Item Group</label>
                  <div className="w-[500px] relative group">
                     <input type="text" className={sapInputStyle} />
                     <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4 ml-[116px]">
                  <button className={sapGreyButtonStyle}>Properties</button>
                  <span className="text-[11px] text-gray-700">Ignore</span>
               </div>
            </div>
         </div>

         {/* Warehouses Section */}
         <div className="flex flex-col border border-gray-300 p-3 pt-1 relative flex-1">
            <span className="absolute top-[-9px] left-3 bg-[#f0f0f0] px-1 text-[11px] text-gray-700 font-bold underline underline-offset-2">Warehouses</span>
            
            <div className="flex flex-col h-full gap-2 mt-4 overflow-hidden">
               <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col">
                  {/* Table Header */}
                  <div className="flex bg-[#f0f0f0] border-b border-gray-400 h-[22px] shrink-0">
                     <div className="w-[30px] border-r border-gray-300" />
                     <div className="w-[200px] px-2 py-0.5 text-[11px] font-bold text-gray-700 border-r border-gray-300 flex items-center">Location</div>
                     <div className="w-[120px] px-2 py-0.5 text-[11px] font-bold text-gray-700 border-r border-gray-300 flex items-center">Whse Code</div>
                     <div className="flex-1 px-2 py-0.5 text-[11px] font-bold text-gray-700 flex items-center">Whse Name</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="flex-1 overflow-auto custom-scrollbar">
                     <div className="flex border-b border-gray-100 h-[22px]">
                        <div className="w-[30px] flex items-center justify-center border-r border-gray-200">
                           <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                        </div>
                        <div className="w-[200px] border-r border-gray-200 flex items-center px-1">
                           <ChevronDown className="w-3.5 h-3.5 text-gray-700" />
                        </div>
                        <div className="w-[120px] border-r border-gray-200 flex items-center px-1" />
                        <div className="flex-1 flex items-center px-1" />
                     </div>
                     {warehouses.map((wh, i) => (
                        <div key={i} className="flex border-b border-gray-100 h-[22px] hover:bg-blue-50">
                           <div className="w-[30px] flex items-center justify-center border-r border-gray-200">
                              <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                           </div>
                           <div className="w-[200px] border-r border-gray-200 flex items-center px-1" />
                           <div className="w-[120px] border-r border-gray-200 flex items-center px-2 gap-2">
                              <ArrowRight className="w-3.5 h-3.5 text-yellow-600" />
                              <span className="text-[11px] text-gray-700 font-bold">{wh.code}</span>
                           </div>
                           <div className="flex-1 flex items-center px-2">
                              <span className="text-[11px] text-gray-700">{wh.name}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-end gap-2 shrink-0">
                  <button className={sapGreyButtonStyle}>Expand</button>
                  <button className={sapGreyButtonStyle}>Collapse</button>
               </div>
            </div>
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
