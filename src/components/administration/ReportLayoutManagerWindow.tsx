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

interface ReportLayoutManagerWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const ReportLayoutManagerWindow: React.FC<ReportLayoutManagerWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState('List');
  
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
        const minW = 600;
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

  const menuItems = [
    'Administration*', 'Financials*', 'CRM*', 'Opportunities*', 'Sales - A/R*', 
    'Purchasing - A/P*', 'Business Partners*', 'Banking*', 'Inventory*', 
    'Resources', 'Production*', 'MRP*', 'HR Payroll', 'Service*', 
    'Human Resources*', 'Project Management*', 'Lost Reports', 'Add-On Layouts'
  ];

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
        <span className="text-black font-medium text-[11.5px] tracking-tight">Report and Layout Manager</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-1 bg-[#ececec]">
        {['List', 'Search'].map(tab => (
           <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-0.5 text-[11px] cursor-default border border-gray-400 rounded-t-[3px] border-b-0 relative -mb-[1px] 
              ${activeTab === tab ? 'bg-white z-10' : 'bg-gradient-to-b from-[#f5f5f5] to-[#ececec] text-gray-600 hover:brightness-95'}`}
           >
             {tab}
           </div>
        ))}
      </div>

      <div className="flex-1 flex p-2 pt-0 overflow-hidden">
        <div className="flex-1 border border-gray-400 bg-white shadow-inner flex flex-col p-2 overflow-hidden">
           {activeTab === 'List' && (
             <div className="flex flex-col h-full gap-1">
                <div className="flex gap-4 items-center text-[10.5px] px-1 py-1 bg-white">
                   <span className="font-bold text-orange-600 italic">Asterisk Indicates</span>
                   <div className="flex items-center gap-1">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" defaultChecked />
                      <span>Report</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" defaultChecked />
                      <span>Layout</span>
                   </div>
                </div>

                <div className="flex-1 border border-gray-300 overflow-y-auto custom-scrollbar p-1">
                   {menuItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-blue-50 group cursor-default">
                         <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                         <span className={`text-[11px] ${item.includes('*') ? 'text-blue-900 font-bold' : 'text-gray-700'}`}>{item}</span>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="p-2 pb-3 flex bg-[#ececec] justify-between">
         <div className="flex gap-1.5">
            <button className={sapButtonStyle}>OK</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
            <button className={sapButtonStyle}>Refresh</button>
         </div>
         <div className="flex gap-1.5">
            <button className={sapButtonStyle}>Export</button>
            <button className={sapButtonStyle}>Import</button>
         </div>
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
