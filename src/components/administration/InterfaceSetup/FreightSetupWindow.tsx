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

interface FreightSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const FreightSetupWindow: React.FC<FreightSetupWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const freightData = [
    { name: 'Consultancy Fee Reco', expense: 'A104010010' },
    { name: 'Contractor Security', expense: 'L204010001' },
    { name: 'Defective Work Recov', expense: 'A104010025' },
    { name: 'Development Advance', expense: 'A202010001' },
    { name: 'Direct Vendor Paymen', expense: 'A202010002' },
    { name: 'Employees Receivable', expense: 'A201010002' },
    { name: 'Enlistment Fee Cont', expense: 'R404010001' },
    { name: 'Lab Testing', expense: 'O204010001' },
    { name: 'Mobilization Advance', expense: 'A104030001' },
    { name: 'Performance Security', expense: 'L204010001' },
    { name: 'Retention Money', expense: 'L207010001' },
  ];

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

        const minW = 800;
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

  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapTableInputStyle = "w-full h-full border-none px-1 text-[10.5px] outline-none bg-transparent";
  const sapSelectStyle = "w-full h-full border-none px-0.5 text-[10.5px] outline-none bg-transparent appearance-none";

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
        <span className="text-black font-medium text-[11.5px] tracking-tight">Freight - Setup</span>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Minus className="w-3.5 h-3.5 text-gray-600" /></div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5"><Square className="w-3 h-3 text-gray-600" /></div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white group"><X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" /></div>
        </div>
      </div>

      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      <div className="flex-1 p-1 flex flex-col overflow-hidden">
        <div className="flex-1 border border-gray-400 bg-white overflow-hidden shadow-inner flex flex-col">
          {/* Table Header */}
          <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 font-medium text-[10px] items-center shrink-0">
            <div className="w-[30px] px-1 py-1 text-center">#</div>
            <div className="w-[120px] px-2 py-1">Name</div>
            <div className="w-[100px] px-2 py-1">Revenue Account</div>
            <div className="w-[100px] px-2 py-1">Expense Account</div>
            <div className="w-[80px] px-2 py-1">Output Tax Group</div>
            <div className="w-[80px] px-2 py-1">Input Tax Group</div>
            <div className="w-[100px] px-2 py-1">Fixed Amount - Revenues</div>
            <div className="w-[100px] px-2 py-1">Fixed Amount - Expenses</div>
            <div className="w-[60px] px-1 py-1 text-center leading-tight">Gross Freight</div>
            <div className="w-[60px] px-1 py-1 text-center leading-tight">WTax Liable</div>
            <div className="w-[100px] px-2 py-1">Distribution Method</div>
            <div className="w-[100px] px-2 py-1">Drawing Method</div>
            <div className="w-[60px] px-1 py-1 text-center leading-tight">Stock/Fixed Asset</div>
            <div className="w-[60px] px-1 py-1 text-center leading-tight">Last Purchase Price</div>
            <div className="w-[80px] px-2 py-1">Distr. Rule</div>
            <div className="flex-1 min-w-[80px] px-2 py-1">Project</div>
            <div className="w-[16px] shrink-0" />
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_19px,#f5f5f5_19px,#f5f5f5_20px)]">
            <div className="min-w-max">
              {freightData.map((item, i) => (
                <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center text-[10.5px]">
                  <div className="w-[30px] px-1 text-center text-gray-400 font-bold">{i + 1}</div>
                  <div className="w-[120px] px-2 truncate h-full flex items-center">{item.name}</div>
                  <div className="w-[100px] px-2 h-full flex items-center justify-between group/cell">
                    <span className="truncate"></span>
                    <button className="invisible group-hover/cell:visible text-orange-400 mt-1"><ChevronRight className="w-3 h-3 rotate-180" /></button>
                  </div>
                  <div className="w-[100px] px-2 h-full flex items-center gap-1">
                    <button className="text-orange-400 mt-0.5"><ChevronRight className="w-3 h-3" /></button>
                    <span className="truncate">{item.expense}</span>
                  </div>
                  <div className="w-[80px] px-2 h-full flex items-center relative">
                    <select className={sapSelectStyle}><option></option></select>
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  <div className="w-[80px] px-2 h-full flex items-center relative">
                    <span className="truncate">GST-ZRI</span>
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  <div className="w-[100px] px-2 h-full"></div>
                  <div className="w-[100px] px-2 h-full"></div>
                  <div className="w-[60px] px-1 h-full flex items-center justify-center"><input type="checkbox" className="w-3 h-3 accent-blue-600" /></div>
                  <div className="w-[60px] px-1 h-full flex items-center justify-center"><input type="checkbox" className="w-3 h-3 accent-blue-600" defaultChecked /></div>
                  <div className="w-[100px] px-2 h-full flex items-center relative">
                    <span className="truncate">None</span>
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  <div className="w-[100px] px-2 h-full flex items-center relative text-blue-900 font-medium">
                    <span className="truncate">Total</span>
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  <div className="w-[60px] px-1 h-full flex items-center justify-center"><input type="checkbox" className="w-3 h-3 accent-blue-600" /></div>
                  <div className="w-[60px] px-1 h-full flex items-center justify-center"><input type="checkbox" className="w-3 h-3 accent-blue-600" /></div>
                  <div className="w-[80px] px-2 h-full"></div>
                  <div className="flex-1 min-w-[80px] px-2 h-full"></div>
                </div>
              ))}
              {Array(10).fill(null).map((_, i) => (
                <div key={i + 12} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center text-[10.5px]">
                  <div className="w-[30px] px-1 text-center text-gray-400 font-bold">{i + 12}</div>
                  <div className={`w-[120px] px-2 h-full ${i === 0 ? 'bg-[#fffbd5]' : ''}`}></div>
                  <div className="w-[100px] px-2 h-full flex items-center relative">
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  <div className="w-[100px] px-2 h-full flex items-center relative">
                    <div className="absolute right-0 top-0 bottom-0 px-0.5 flex items-center pointer-events-none border-l border-gray-300 bg-gray-50 h-full">
                       <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600"></div>
                    </div>
                  </div>
                  {Array(12).fill(null).map((_, j) => <div key={j} className="h-full border-l border-gray-100 flex-1"></div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 pb-3 flex bg-[#ececec] gap-1.5 shrink-0">
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
