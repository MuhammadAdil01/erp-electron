import React from 'react';
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

interface GradePayScaleWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const GradePayScaleWindow: React.FC<GradePayScaleWindowProps> = ({
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

        if (direction.includes('e')) newWidth = Math.max(800, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(400, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 800) newX = startXPos + deltaX;
          else newWidth = 800;
        }
        
        if (direction.includes('n')) {
          newHeight = startHeight - deltaY;
          if (newHeight >= 400) newY = startYPos + deltaY;
          else newHeight = 400;
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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap";

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
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[12px] tracking-tight">Grade Pay Scale</span>
        </div>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Minus className="w-4 h-4 text-gray-600" />
           </div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Square className="w-3.5 h-3.5 text-gray-600" />
           </div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group">
              <X className="w-4 h-4 text-gray-600 group-hover:text-white" />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden bg-white m-1.5 border border-gray-400 shadow-inner">
        <div className="flex-1 flex flex-col overflow-hidden p-2">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-2 px-1">
             <div className="flex items-center gap-4">
                <span className={sapLabelStyle}>Grade</span>
                <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px]" />
             </div>
             <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                   <span className={sapLabelStyle}>DocNum</span>
                   <input type="text" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px] bg-[#f0f0f0]" value="34" readOnly />
                </div>
                <div className="flex items-center gap-2">
                   <span className={sapLabelStyle}>DocumentDate</span>
                   <div className="flex h-[18px] border border-gray-400 bg-[#3b82f6] text-white">
                      <input type="text" className="w-[80px] px-1 text-[11px] outline-none bg-transparent" value="24.02.26" readOnly />
                   </div>
                </div>
             </div>
          </div>

          {/* Large Table */}
          <div className="flex-1 border border-gray-400 overflow-auto custom-scrollbar">
             <table className="w-full border-collapse bg-white">
                <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                   <tr className="border-b border-gray-400">
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[60px]">Stages</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Basic Pay</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">HRA</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Utility Allowance</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Medical Allowance</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[120px]">Conveyance Allowance</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Adhoc 2017</th>
                      <th className="text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Adhoc 2018</th>
                   </tr>
                </thead>
                <tbody>
                   {[...Array(15)].map((_, i) => (
                     <tr key={i} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="border-r border-gray-200 px-1"></td>
                        <td className="px-1"></td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex items-center justify-between p-2 shrink-0">
          <div className="flex gap-2">
            <button className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px] transition-all">
              Add
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px] transition-all"
            >
              Cancel
            </button>
          </div>
          <button className="px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 rounded-[1px] transition-all">
            Add Row
          </button>
      </div>
    </div>
  );
};
