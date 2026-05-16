import React from 'react';
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

interface ChooseCompanyWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const ChooseCompanyWindow: React.FC<ChooseCompanyWindowProps> = ({
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

        const minW = 700;
        const minH = 500;

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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[100px] hover:brightness-95 active:shadow-inner";

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
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[12px] tracking-tight">Choose Company</span>
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
      <div className="flex-1 flex flex-col p-3 overflow-hidden bg-white m-1.5 border border-gray-400 shadow-inner">
        <div className="flex-1 flex flex-col overflow-hidden space-y-3">
           
           {/* Top Info Section */}
           <div className="grid grid-cols-[1fr_200px] gap-4 items-start">
              <div className="space-y-1.5 flex-1">
                 <div className="grid grid-cols-[80px_1fr_80px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>User ID</span>
                    <input type="text" className="w-full h-[18px] border border-gray-400 px-1 text-[11px] bg-[#f0f0f0]" />
                    <span className={sapLabelStyle}>Password</span>
                    <input type="password" className="w-full h-[18px] border border-gray-400 px-1 text-[11px] bg-[#f0f0f0]" />
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5" />
                    <span className="text-[11px] text-gray-500 italic">Log on with Current Domain User</span>
                 </div>
                 <div className="grid grid-cols-[100px_150px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Current Server</span>
                    <select className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd0]"><option value="HANADB">HANADB</option></select>
                    <select className="h-[18px] border border-gray-400 px-1 text-[11px]"><option value="NDB@192.168.">NDB@192.168.</option></select>
                 </div>
                 <div className="grid grid-cols-[100px_1fr] items-center gap-2 pr-20">
                    <span className={sapLabelStyle}>Database</span>
                    <input type="text" className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#f0f0f0]" />
                 </div>
              </div>
              <div className="flex flex-col justify-start items-end">
                 <button className={sapButtonStyle}>Change User</button>
              </div>
           </div>

           {/* Companies Section */}
           <div className="flex-1 flex flex-col space-y-1 overflow-hidden min-h-0">
              <span className="text-[11px] text-gray-700 font-bold">Companies on Current Server</span>
              <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                 <div className="flex-1 border border-gray-400 overflow-auto custom-scrollbar bg-white">
                    <table className="w-full border-collapse">
                       <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                          <tr className="border-b border-gray-400 text-left">
                             <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[200px]">Company Name</th>
                             <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[150px]">Database Name</th>
                             <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">Localization</th>
                             <th className="group/head relative border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">
                                Version
                                <div className="absolute right-1 top-1.5 opacity-40"><ChevronRight className="w-3 h-3 rotate-[-45deg]" /></div>
                             </th>
                          </tr>
                       </thead>
                       <tbody>
                          {[...Array(10)].map((_, i) => (
                            <tr key={i} className="border-b border-gray-100 h-6 hover:bg-orange-50 cursor-default">
                               <td className="border-r border-gray-100 px-1"></td>
                               <td className="border-r border-gray-100 px-1"></td>
                               <td className="border-r border-gray-100 px-1"></td>
                               <td className="border-r border-gray-100 px-1"></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="w-[120px] flex flex-col gap-2 shrink-0">
                    <div className="flex h-[18px] border border-gray-400 rounded-sm overflow-hidden shadow-sm">
                       <button className="flex-1 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border-r border-gray-400 text-[10px] font-bold">New</button>
                       <button className="px-1 bg-[#f0f0f0] hover:bg-gray-200 transition-colors"><ChevronRight className="w-2.5 h-2.5 rotate-90" /></button>
                    </div>
                    <button className={sapButtonStyle}>Refresh</button>
                    
                    <div className="mt-8 space-y-2">
                       <span className="text-[11px] font-bold text-gray-700 block">Find By:</span>
                       <div className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="findby" className="w-3 h-3" defaultChecked />
                             <span className="text-[11px]">Company Name</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="findby" className="w-3 h-3" />
                             <span className="text-[11px]">Database Name</span>
                          </label>
                       </div>
                       <input type="text" className="w-full h-[18px] border border-gray-400 px-1 text-[11px]" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer Buttons */}
           <div className="flex gap-2 pt-2 border-t border-gray-200 shrink-0">
              <button onClick={onClose} className={sapButtonStyle}>OK</button>
              <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
           </div>
        </div>
      </div>
    </div>
  );
};
