import React from 'react';
import { X, Minus, Square, Calendar } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface LeaveMasterWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const LeaveMasterWindow: React.FC<LeaveMasterWindowProps> = ({
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

  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd0]";
  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap";
  const checkboxLabelStyle = "text-[11px] text-gray-700 ml-1";

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
          <span className="text-black font-medium text-[12px] tracking-tight">Leave Master</span>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {/* Top Sections */}
          <div className="flex gap-8 mb-4">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="grid grid-cols-[160px_1fr] items-center gap-y-1.5">
                <span className={sapLabelStyle}>Leave Code *</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Description</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Total Leaves in Year *</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Total Leaves in Year for Trainer</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Leave Type</span>
                <select className={sapInputStyle}>
                  <option value="Others">Others</option>
                </select>

                <div />
                <div className="flex items-center mt-1">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className={checkboxLabelStyle}>Applicable During Probation</span>
                </div>

                <div />
                <div className="flex items-center">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className={checkboxLabelStyle}>Encashable</span>
                </div>

                <span className={sapLabelStyle}>Min Balance for Encash</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Max Leave to Encash</span>
                <input type="text" className={sapInputStyle} />

                <div />
                <div className="flex items-center mt-1">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className={checkboxLabelStyle}>Payable Leave</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="grid grid-cols-[160px_1fr] items-center gap-y-1.5">
                <span className={sapLabelStyle}>Max Monthly Appli.</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Min Continuous</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Max Continuous</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Min Conti. Dur. Prob.</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Max Conti. Dur. Prob.</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Effective From</span>
                <div className="relative">
                    <input type="text" className={sapInputStyle} />
                    <Calendar className="absolute right-0.5 top-0.5 w-3 h-3 text-gray-500" />
                </div>

                <div />
                <div className="flex items-center mt-1">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className={checkboxLabelStyle}>Carry Forward to Next Year</span>
                </div>

                <span className={sapLabelStyle}>Max.Leave Carry Fwd.</span>
                <input type="text" className={sapInputStyle} />

                <div />
                <div className="flex items-center mt-1">
                  <input type="checkbox" className="w-3 h-3" />
                  <span className={checkboxLabelStyle}>Close</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="border border-gray-400 mt-2 mb-2 min-h-[120px]">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-[#f0f0f0] border-b border-gray-400">
                      <th className="w-8 border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">#</th>
                      <th className="border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">From Date</th>
                      <th className="border-r border-gray-300 text-[11px] font-medium text-left px-1 py-1">To Date</th>
                      <th className="text-[11px] font-medium text-left px-1 py-1">Lock</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-gray-200 h-6">
                      <td className="border-r border-gray-200 text-[11px] px-1">1</td>
                      <td className="border-r border-gray-200"></td>
                      <td className="border-r border-gray-200"></td>
                      <td></td>
                   </tr>
                   {[2,3,4,5].map(i => (
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

          {/* Remarks Section */}
          <div className="grid grid-cols-[120px_1fr] items-start mt-4">
             <span className={sapLabelStyle + " pt-1"}>Remarks</span>
             <textarea className="w-full h-16 border border-gray-400 p-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd0] resize-none"></textarea>
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
