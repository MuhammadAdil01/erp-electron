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

interface TaxFormulaCalculationWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const TaxFormulaCalculationWindow: React.FC<TaxFormulaCalculationWindowProps> = ({
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

        if (direction.includes('e')) newWidth = Math.max(600, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(400, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 600) newX = startXPos + deltaX;
          else newWidth = 600;
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

  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd0]";
  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap";
  const nonYellowInput = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-[#f0f0f0]";

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
          <span className="text-black font-medium text-[12px] tracking-tight">Tax Formula Calculation</span>
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
        <div className="flex flex-col gap-4 p-2 overflow-y-auto custom-scrollbar">
          {/* Header Form */}
          <div className="flex gap-8">
            <div className="flex-1 grid grid-cols-[120px_1fr] items-center gap-y-1.5">
              <span className={sapLabelStyle}>Employee Category</span>
              <select className={sapInputStyle}>
                <option value=""></option>
              </select>

              <span className={sapLabelStyle}>Period Year</span>
              <input type="text" className={sapInputStyle} />

              <span className={sapLabelStyle}>From Date</span>
              <input type="text" className={sapInputStyle} />

              <span className={sapLabelStyle}>No Of Months</span>
              <input type="text" className={sapInputStyle} />
            </div>

            <div className="flex-1 grid grid-cols-[120px_1fr] items-center gap-y-1.5">
              <span className={sapLabelStyle}>Code</span>
              <input type="text" className={nonYellowInput} />

              <span className={sapLabelStyle}>Document Date</span>
              <input type="text" className={nonYellowInput} value="24.02.26" readOnly />

              <span className={sapLabelStyle}>To Date</span>
              <input type="text" className={sapInputStyle} />

              <span className={sapLabelStyle}>Start Year</span>
              <input type="text" className={sapInputStyle} />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-400 min-h-[150px]">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-[#f0f0f0] border-b border-gray-400">
                      <th className="w-8 border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">#</th>
                      <th className="border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">Lower Amount</th>
                      <th className="border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">Higher Amount</th>
                      <th className="text-[11px] font-medium text-left px-1 py-1">Precentage</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-gray-200 h-6">
                      <td className="border-r border-gray-200 text-[11px] px-1">1</td>
                      <td className="border-r border-gray-200 px-1"></td>
                      <td className="border-r border-gray-200 px-1"></td>
                      <td className="px-1"></td>
                   </tr>
                   {[2,3,4,5,6].map(i => (
                     <tr key={i} className="border-b border-gray-200 h-6">
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                        <td></td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex gap-2 p-2 shrink-0">
          <button className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px] transition-all">
            Find
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 min-w-[100px] rounded-[1px] transition-all"
          >
            Cancel
          </button>
      </div>
    </div>
  );
};
