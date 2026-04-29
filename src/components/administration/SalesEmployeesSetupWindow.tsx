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

interface SalesEmployeesSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const SalesEmployeesSetupWindow: React.FC<SalesEmployeesSetupWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [employees, setEmployees] = useState([
    { id: 1, name: '-No Sales Employee-', remarks: '', active: true, employee: '', tel: '', mobile: '', fax: '', email: '', isDefault: true },
    { id: 2, name: '', remarks: '', active: true, employee: '', tel: '', mobile: '', fax: '', email: '', isDefault: false },
    ...Array(18).fill({}).map((_, i) => ({ id: i + 3, name: '', remarks: '', active: false, employee: '', tel: '', mobile: '', fax: '', email: '', isDefault: false }))
  ]);

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

  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapDisabledButtonStyle = "px-4 py-0.5 bg-gray-200 border border-gray-400 text-gray-500 text-[11px] rounded-[1px] min-w-[100px] cursor-not-allowed";
  
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
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">Sales Employees/Buyers - Setup</span>
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
      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-1.5 overflow-hidden">
        <div className="flex-1 border border-gray-400 bg-white shadow-inner overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 font-medium shrink-0">
            <div className="w-[30px] px-1 py-1 text-center">#</div>
            <div className="flex-[2] min-w-[150px] px-2 py-1">Sales Employee Name</div>
            <div className="flex-[1.5] min-w-[120px] px-2 py-1">Remarks</div>
            <div className="w-[50px] px-1 py-1 text-center">Active</div>
            <div className="flex-[1.5] min-w-[120px] px-2 py-1">Employee</div>
            <div className="flex-[1] min-w-[100px] px-2 py-1">Telephone</div>
            <div className="flex-[1] min-w-[100px] px-2 py-1">Mobile</div>
            <div className="flex-[1] min-w-[100px] px-2 py-1">Fax</div>
            <div className="flex-[1.5] min-w-[150px] px-2 py-1">E-Mail</div>
            <div className="w-[20px] shrink-0" /> {/* Scrollbar spacer */}
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-[repeating-linear-gradient(white,white_19px,#f5f5f5_19px,#f5f5f5_20px)] min-h-full">
              {employees.map((emp, index) => (
                <div key={emp.id} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center text-[10.5px]">
                  <div className="w-[30px] px-1 text-center text-gray-500 font-bold">{emp.id}</div>
                  <div className={`flex-[2] min-w-[150px] h-full px-2 flex items-center ${emp.id === 2 ? 'bg-[#fffbd5]' : ''}`}>
                    {emp.name}
                  </div>
                  <div className="flex-[1.5] min-w-[120px] h-full px-2 flex items-center">{emp.remarks}</div>
                  <div className="w-[50px] h-full flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-3 h-3 accent-blue-600 border-gray-400 border rounded-[1px]" 
                      defaultChecked={emp.active}
                      disabled={emp.id === 1}
                    />
                  </div>
                  <div className="flex-[1.5] min-w-[120px] h-full px-2 flex items-center">{emp.employee}</div>
                  <div className="flex-[1] min-w-[100px] h-full px-2 flex items-center">{emp.tel}</div>
                  <div className="flex-[1] min-w-[100px] h-full px-2 flex items-center">{emp.mobile}</div>
                  <div className="flex-[1] min-w-[100px] h-full px-2 flex items-center">{emp.fax}</div>
                  <div className="flex-[1.5] min-w-[150px] h-full px-2 flex items-center">{emp.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-2 pt-0 flex bg-[#ececec] justify-between items-center">
         <div className="flex gap-1.5">
            <button className={sapButtonStyle}>OK</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
         </div>
         <button className={sapDisabledButtonStyle}>Set as Default</button>
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
