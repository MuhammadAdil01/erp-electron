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

interface ElectronicFileManagerSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const ElectronicFileManagerSetupWindow: React.FC<ElectronicFileManagerSetupWindowProps> = ({
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

        const minW = 600;
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

  const tableData = [
    { name: 'eDoc Document Information Extraction - Marketing Documents Import (System)', desc: 'eDoc Document Information Extraction - Marketing Documents Import (System)', menu: '', path: '', version: '1.04', type: 'Electronic Document for Document Information Extraction Import' },
    { name: 'eDoc PEPPOL - WS Parameters (System)', desc: 'eDoc PEPPOL - WS Parameters (System)', menu: '', path: '', version: '1.06', type: 'Electronic Document for PEPPOL Web Service' },
    { name: 'eDoc PEPPOL - Credit Note (System)', desc: 'eDoc PEPPOL - Credit Note (System)', menu: '', path: '', version: '1.04', type: 'Electronic Document for PEPPOL Credit Note' },
    { name: 'eDoc PEPPOL - Marketing Documents (System)', desc: 'eDoc PEPPOL - Marketing Documents (System)', menu: '', path: '', version: '1.14', type: 'Electronic Document for PEPPOL Invoice' },
    { name: 'eDoc PEPPOL - Credit Note Import (System)', desc: 'eDoc PEPPOL - Credit Note Import (System)', menu: '', path: '', version: '1.02', type: 'Electronic Document for PEPPOL Import' },
    { name: 'eDoc PEPPOL - Marketing Documents Import (System)', desc: 'eDoc PEPPOL - Marketing Documents Import (System)', menu: '', path: '', version: '1.03', type: 'Electronic Document for PEPPOL Import' },
  ];

  const headerStyle = "border-r border-gray-400 px-2 py-1 text-left font-normal text-gray-700 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] whitespace-nowrap";
  const cellStyle = "border-r border-gray-300 px-2 py-0.5 text-[11px] text-black whitespace-nowrap overflow-hidden text-ellipsis";

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
          <span className="text-black font-medium text-[11.5px] tracking-tight">Electronic File Manager - Setup</span>
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

      <div className="flex-1 overflow-hidden flex flex-col p-0.5 bg-white border border-gray-400 shadow-inner m-1.5 mt-2">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[11px] border-collapse min-w-max">
            <thead className="sticky top-0 z-10 border-b border-gray-400 shadow-sm">
              <tr>
                <th className={`${headerStyle} w-8`}>#</th>
                <th className={`${headerStyle} w-64`}>Name</th>
                <th className={`${headerStyle} w-64`}>Description</th>
                <th className={`${headerStyle} w-32`}>Menu Name</th>
                <th className={`${headerStyle} w-32`}>Menu Path</th>
                <th className={`${headerStyle} w-16`}>Version</th>
                <th className={`${headerStyle} w-64`}>Format Type</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className={`h-[18px] border-b border-gray-200 hover:bg-[#ffed99]/30 cursor-default ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'}`}>
                  <td className={`${cellStyle} text-center bg-gray-50 border-r-gray-400`}>{i + 1}</td>
                  <td className={cellStyle}>{row.name}</td>
                  <td className={cellStyle}>{row.desc}</td>
                  <td className={cellStyle}>{row.menu}</td>
                  <td className={cellStyle}>{row.path}</td>
                  <td className={cellStyle}>{row.version}</td>
                  <td className={cellStyle}>{row.type}</td>
                </tr>
              ))}
              {Array.from({ length: 15 }).map((_, i) => (
                <tr key={i + tableData.length} className={`h-[18px] border-b border-gray-100 ${ (i + tableData.length) % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'}`}>
                  <td className={`${cellStyle} bg-gray-50 border-r-gray-400`}></td>
                  <td className={cellStyle}></td>
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

      <div className="p-2 pt-0 flex gap-1.5 bg-[#ececec]">
        <button onClick={onClose} className="px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner">OK</button>
        <button onClick={onClose} className="px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal">Cancel</button>
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
