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

interface CrystalServerConfigWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const CrystalServerConfigWindow: React.FC<CrystalServerConfigWindowProps> = ({
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

        const minW = 500;
        const minH = 300;

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

  const headerStyle = "border-r border-gray-400 px-2 py-1 text-left font-normal text-gray-700 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] whitespace-nowrap";
  const cellStyle = "border-r border-gray-300 px-2 py-0.5 text-[11px] text-black whitespace-nowrap overflow-hidden text-ellipsis h-[18px]";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
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
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">Crystal Server Configuration</span>
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

      <div className="h-2 bg-[#f39c12] border-b border-gray-400"></div>

      <div className="flex px-1.5 mt-2 bg-[#ececec]">
          <div className="px-6 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border border-gray-400 border-b-white z-10 bg-white shadow-sm">
            Crystal Servers
          </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-0.5 bg-white border border-gray-400 shadow-inner mx-1.5 mb-1.5">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[11px] border-collapse min-w-max">
            <thead className="sticky top-0 z-10 border-b border-gray-400 shadow-sm">
              <tr>
                <th className={`${headerStyle} w-8`}>#</th>
                <th className={`${headerStyle} w-48`}>Server Name</th>
                <th className={`${headerStyle} w-24`}>Port</th>
                <th className={`${headerStyle} w-32`}>User</th>
                <th className={`${headerStyle} w-32`}>Password</th>
                <th className={`${headerStyle} w-64`}>Info. View URL</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 matching photo */}
              <tr className="h-[18px] border-b border-gray-200 bg-white">
                <td className={`${cellStyle} text-center font-bold bg-gray-50 border-r-gray-400`}>1</td>
                <td className={cellStyle}>
                  <input type="text" className="w-full h-full bg-[#fffbd5] outline-none" />
                </td>
                <td className={cellStyle}>
                  <input type="text" className="w-full h-full outline-none" defaultValue="8080" />
                </td>
                <td className={cellStyle}></td>
                <td className={cellStyle}></td>
                <td className={cellStyle}></td>
              </tr>
              {/* Empty Rows */}
              {Array.from({ length: 15 }).map((_, i) => (
                <tr key={i} className={`h-[18px] border-b border-gray-100 ${i % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-white'}`}>
                  <td className={`${cellStyle} bg-gray-50 border-r-gray-400`}></td>
                  <td className={cellStyle}></td>
                  <td className={cellStyle}></td>
                  <td className={cellStyle}></td>
                  <td className={cellStyle}></td>
                  <td className={cellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-2 pt-0 flex justify-between bg-[#ececec]">
        <div className="flex gap-1.5">
           <button onClick={onClose} className={sapActionButtonStyle}>OK</button>
           <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
        </div>
        <div className="flex gap-1.5">
           <button className={sapActionButtonStyle}>Set as Default</button>
        </div>
      </div>

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
