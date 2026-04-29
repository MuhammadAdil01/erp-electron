import React from 'react';
import { Users } from 'lucide-react';
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

interface NextOfKinWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const NextOfKinWindow: React.FC<NextOfKinWindowProps> = ({ 
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

        if (direction.includes('e')) newWidth = Math.max(500, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(400, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 500) newX = startXPos + deltaX;
          else newWidth = 500;
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

  const headers = ["#", "LineId", "Name", "Relation", "Contact No."];

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#f0f0f0] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.4)] border-t border-l border-white/50 border-r border-b border-black/40 rounded-[3px] overflow-hidden group/window font-sans text-[11px]"
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50" />
        </>
      )}

      {/* Window Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#6b6b6b] to-[#454545] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-black/40"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center border border-white/20 shrink-0">
            <Users className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-[11.5px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate">Next of Kin</span>
        </div>
        <WindowControls 
          onMinimize={() => setWindowState(p => ({ ...p, isMinimized: true }))}
          onMaximize={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))}
          onClose={onClose}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-auto custom-scrollbar bg-[#f0f0f0]">
        {/* Yellow header strip */}
        <div className="h-[4px] bg-gradient-to-r from-orange-400 to-yellow-500 w-full shrink-0" />

        {/* Header fields */}
        <div className="grid grid-cols-2 gap-x-12 p-4 pt-4">
           {/* Left Col */}
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">DocEntry</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
              </div>
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">Remark</label>
                 <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
              </div>
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">Employee Name</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
              </div>
           </div>
           {/* Right Col */}
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">DocNum</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
              </div>
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">Employee ID</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
              </div>
              <div className="flex items-center">
                 <label className="text-gray-700 w-[100px]">No of Children</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
              </div>
           </div>
        </div>

        {/* Data Grid Area */}
        <div className="flex-1 mx-4 mb-4 border border-gray-400 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
           <div className="flex-1 border border-gray-300 overflow-auto relative custom-scrollbar bg-white">
              <table className="w-full border-collapse table-fixed">
                 <thead className="sticky top-0 bg-[#f0f0f0] border-b border-gray-300 z-10 shadow-sm">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} style={{ width: i === 0 ? '30px' : 'auto' }} className="text-left px-2 py-1 font-medium text-gray-600 border-r border-gray-300 text-[10px] whitespace-nowrap bg-gradient-to-b from-white to-[#eeeeee]">
                           {h}
                        </th>
                      ))}
                    </tr>
                 </thead>
                 <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
                      <tr key={row} className="border-b border-gray-100 h-[20px] hover:bg-blue-50/20">
                         <td className="bg-[#f5f5f5] border-r border-gray-300 text-center text-gray-500 font-bold text-[10px] select-none">{row}</td>
                         <td className="border-r border-gray-100 px-1 py-0.5"></td>
                         <td className="border-r border-gray-100 px-1 py-0.5"></td>
                         <td className="border-r border-gray-100 px-1 py-0.5"></td>
                         <td className="px-1 py-0.5"></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex gap-2 pt-0 pb-3">
        <button className="px-10 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-white active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[100px] overflow-hidden group">
          <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
          <div className="absolute inset-0 border-r border-b border-black/10 pointer-events-none rounded-[1px]" />
          <span className="relative z-10 group-active:scale-[0.98] block">Add</span>
        </button>
        <button 
          onClick={onClose}
          className="px-10 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-white active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[100px] overflow-hidden group"
        >
          <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
          <div className="absolute inset-0 border-r border-b border-black/10 pointer-events-none rounded-[1px]" />
          <span className="relative z-10 group-active:scale-[0.98] block">Cancel</span>
        </button>
      </div>
    </div>
  );
};
