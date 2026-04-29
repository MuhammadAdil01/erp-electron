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

interface LeaveApplicationWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const LeaveApplicationWindow: React.FC<LeaveApplicationWindowProps> = ({
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

        if (direction.includes('e')) newWidth = Math.max(900, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(600, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 900) newX = startXPos + deltaX;
          else newWidth = 900;
        }
        
        if (direction.includes('n')) {
          newHeight = startHeight - deltaY;
          if (newHeight >= 600) newY = startYPos + deltaY;
          else newHeight = 600;
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
          <span className="text-black font-medium text-[12px] tracking-tight">Leave Application</span>
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
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-2">
           {/* Header Info */}
           <div className="grid grid-cols-[1fr_1fr] gap-x-12 mb-4">
              <div className="flex flex-col gap-1">
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Location</span>
                    <select className={sapInputStyle}><option value=""></option></select>
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>.... *</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Employee Name</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Designation</span>
                    <select className={sapInputStyle}><option value=""></option></select>
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Last Leave From Date</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Last Leave To Date</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Leave Code *</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Leave Name</span>
                    <input type="text" className={nonYellowInput} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>From Date *</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>To Date *</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>No of Days Leave Req.</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Balance Leave</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>No.</span>
                    <select className="w-[100px] h-[18px] border border-gray-400 px-1 text-[11px]"><option value="102">102</option></select>
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Doc Date</span>
                    <div className="w-[168px] flex h-[18px] border border-gray-400 bg-[#fffbd0]">
                       <input type="text" className="w-full px-1 text-[11px] outline-none bg-transparent" value="24.02.26" readOnly />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Status</span>
                    <select className="w-[168px] h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd0]"><option value="Open">Open</option></select>
                 </div>
                 <div className="mt-2 flex flex-col gap-1 w-[168px] self-end">
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>DOJ</span>
                       <input type="text" className={nonYellowInput} />
                    </div>
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>DOJ After Leave</span>
                       <input type="text" className={nonYellowInput} />
                    </div>
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>Leave Type</span>
                       <select className={sapInputStyle}><option value="Full">Full</option></select>
                    </div>
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>Signed By</span>
                       <input type="text" className={sapInputStyle} />
                    </div>
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>Contact No.</span>
                       <input type="text" className={sapInputStyle} />
                    </div>
                    <div className="flex flex-col">
                       <span className={sapLabelStyle}>Prepared By *</span>
                       <input type="text" className={sapInputStyle} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Notes Section */}
           <div className="flex flex-col gap-1 mb-4">
              <span className={sapLabelStyle}>Notes</span>
              <textarea className="w-full h-16 border border-gray-400 p-1 text-[11px] outline-none bg-[#fffbd0] resize-none"></textarea>
           </div>

           {/* Office Use Section */}
           <div className="mt-4 p-2 bg-gray-100/50 border border-dotted border-gray-400 rounded-[2px]">
              <span className="text-[11px] font-bold text-gray-700 italic block mb-2 underline">Office Use</span>
              <div className="grid grid-cols-[140px_300px] items-center gap-x-2">
                 <span className={sapLabelStyle}>Approved By DO / GM</span>
                 <input type="text" className={sapInputStyle} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <input type="checkbox" className="w-3.5 h-3.5" />
                 <span className={sapLabelStyle}>Approved</span>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="flex gap-2 p-2 shrink-0">
          <button className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[100px]">Find</button>
          <button onClick={onClose} className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[100px]">Cancel</button>
      </div>
    </div>
  );
};
