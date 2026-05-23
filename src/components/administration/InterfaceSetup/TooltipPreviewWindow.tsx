import React, { useState } from 'react';
import { X, Minus, Square, ChevronUp, ChevronDown } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface TooltipPreviewWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const TooltipPreviewWindow: React.FC<TooltipPreviewWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [selectedObjectId, setSelectedObjectId] = useState(1);
  const [enableTooltipPreview, setEnableTooltipPreview] = useState(true);

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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-blue-600";

  const objects = [
    { id: 1, name: 'Chart of Accounts', enabled: true },
    { id: 2, name: 'Business Partners', enabled: true },
    { id: 3, name: 'Item Master Data', enabled: true },
    { id: 4, name: 'Contact Persons', enabled: true },
    { id: 5, name: 'Journal Entry', enabled: true },
    { id: 6, name: 'Payment Terms', enabled: true },
    { id: 7, name: 'Warehouses', enabled: true },
    { id: 8, name: 'Sales Tax Codes', enabled: true },
    { id: 9, name: 'Payment Methods', enabled: true },
    { id: 10, name: 'Employee Master Data', enabled: true },
    { id: 11, name: 'Blanket Agreement', enabled: true },
    { id: 12, name: 'Others', enabled: true },
  ];

  const properties = [
    { id: 1, name: 'Account Code', visible: true },
    { id: 2, name: 'Account Name', visible: true },
    { id: 3, name: 'Foreign Name', visible: true },
    { id: 4, name: 'Account [Active/Title]', visible: false },
    { id: 5, name: 'Confidential Account', visible: false },
    { id: 6, name: 'Account Level', visible: false },
    { id: 7, name: 'Account Currency', visible: true },
    { id: 8, name: 'Current Balance', visible: true },
    { id: 9, name: 'Balance in System Currency', visible: false },
    { id: 10, name: 'Balance in Account Currency', visible: false },
    { id: 11, name: 'Account Type', visible: true },
    { id: 12, name: 'Control Account', visible: false },
    { id: 13, name: 'Cash Account', visible: false },
    { id: 14, name: 'Advance Payments', visible: false },
    { id: 15, name: 'Block Manual Posting', visible: false },
    { id: 16, name: 'Indexed Account', visible: false },
    { id: 17, name: 'Revaluation Coordinated', visible: false },
    { id: 18, name: 'Details', visible: true },
    { id: 19, name: 'Dev/Non-Dev Budget', visible: false },
  ];

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px]"
    >
      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">Tooltip Preview - Setup</span>
        </div>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Minus className="w-3.5 h-3.5 text-gray-600" />
           </div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Square className="w-3 h-3 text-gray-600" />
           </div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group">
              <X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
           </div>
        </div>
      </div>

      {/* Ribbon */}
      <div className="h-2 bg-[#f39c12] border-b border-gray-400"></div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
        
        <div className="flex items-center gap-2 mb-2">
           <input 
            type="checkbox" 
            className={sapCheckboxStyle} 
            checked={enableTooltipPreview}
            onChange={() => setEnableTooltipPreview(!enableTooltipPreview)}
           />
           <span className={sapLabelStyle}>Enable Tooltip Preview</span>
        </div>

        <div className="flex-1 flex gap-2 min-h-0">
           {/* Left Table: Objects */}
           <div className="w-[300px] flex flex-col border border-gray-400 bg-white">
              <div className="grid grid-cols-[30px_1fr_60px] bg-gray-100 border-b border-gray-300 h-6 items-center px-1 sticky top-0 z-10">
                 <span className="text-[10px] font-bold text-gray-600">#</span>
                 <span className="text-[10px] font-bold text-gray-600 pl-1 border-l border-gray-300 h-full flex items-center">Object Name</span>
                 <span className="text-[10px] font-bold text-gray-600 pl-1 border-l border-gray-300 h-full flex items-center">Enabled</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {objects.map((obj) => (
                    <div 
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id)}
                      className={`grid grid-cols-[30px_1fr_60px] min-h-[19px] border-b border-gray-100 items-center px-1 cursor-default
                        ${selectedObjectId === obj.id ? 'bg-[#fff6d5]' : 'odd:bg-white even:bg-[#f8f8f8] hover:bg-blue-50/50'}`}
                    >
                       <span className="text-[10px] text-gray-500 border-r border-gray-100 h-full flex items-center justify-center">{obj.id}</span>
                       <span className="text-[11px] text-gray-800 pl-1">{obj.name}</span>
                       <div className="flex justify-center border-l border-gray-100 h-full items-center">
                          <input type="checkbox" className={sapCheckboxStyle} defaultChecked={obj.enabled} />
                       </div>
                    </div>
                 ))}
                 {/* Empty rows to fill height */}
                 {Array.from({ length: 15 }).map((_, i) => (
                    <div key={`empty-left-${i}`} className="grid grid-cols-[30px_1fr_60px] h-[19px] border-b border-gray-50 odd:bg-white even:bg-[#f8f8f8]">
                       <span className="border-r border-gray-50"></span>
                       <span></span>
                       <span className="border-l border-gray-50"></span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Middle Buttons */}
           <div className="flex flex-col justify-center gap-1 px-1">
              <button className="p-1 hover:bg-gray-200 rounded border border-gray-300 shadow-sm transition-colors">
                 <ChevronUp className="w-4 h-4 text-gray-700" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded border border-gray-300 shadow-sm transition-colors">
                 <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
           </div>

           {/* Right Table: Properties */}
           <div className="flex-1 flex flex-col border border-gray-400 bg-white min-w-0">
              <div className="grid grid-cols-[30px_2.5fr_1fr] bg-gray-100 border-b border-gray-300 h-6 items-center px-1 sticky top-0 z-10">
                 <span className="text-[10px] font-bold text-gray-600">#</span>
                 <span className="text-[10px] font-bold text-gray-600 pl-1 border-l border-gray-300 h-full flex items-center">Property Name</span>
                 <span className="text-[10px] font-bold text-gray-600 pl-1 border-l border-gray-300 h-full flex items-center">Visible</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {properties.map((prop) => (
                    <div 
                      key={prop.id}
                      className={`grid grid-cols-[30px_2.5fr_1fr] min-h-[19px] border-b border-gray-100 items-center px-1 cursor-default
                        ${prop.id === 1 && selectedObjectId === 1 ? 'bg-[#fff6d5]' : 'odd:bg-white even:bg-[#f8f8f8] hover:bg-blue-50/50'}`}
                    >
                       <span className="text-[10px] text-gray-500 border-r border-gray-100 h-full flex items-center justify-center">{prop.id}</span>
                       <span className="text-[11px] text-gray-800 pl-1">{prop.name}</span>
                       <div className="flex justify-center border-l border-gray-100 h-full items-center">
                          <input type="checkbox" className={sapCheckboxStyle} defaultChecked={prop.visible} />
                       </div>
                    </div>
                 ))}
                 {/* Empty rows to fill height */}
                 {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`empty-right-${i}`} className="grid grid-cols-[30px_2.5fr_1fr] h-[19px] border-b border-gray-50 odd:bg-white even:bg-[#f8f8f8]">
                       <span className="border-r border-gray-50"></span>
                       <span></span>
                       <span className="border-l border-gray-50"></span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-2 pt-0 flex gap-1.5 shrink-0 bg-[#ececec]">
        <button className={sapButtonStyle}>OK</button>
        <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
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
