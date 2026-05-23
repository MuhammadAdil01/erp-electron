import React from 'react';
import { X, Minus, Square, ChevronDown } from 'lucide-react';

interface RecurringPostingsWindowProps {
  onClose: () => void;
  onFocus: () => void;
  windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
  };
  onUpdateState: (state: Partial<RecurringPostingsWindowProps['windowState']>) => void;
}

export const RecurringPostingsWindow: React.FC<RecurringPostingsWindowProps> = ({
  onClose,
  onFocus,
  windowState,
  onUpdateState,
}) => {
  const isMaximized = windowState.isMaximized;

  const sapLabelStyle = "text-[11px] text-[#333333] font-medium whitespace-nowrap";
  const sapInputStyle = "text-[11px] border border-gray-400 px-1 py-0.5 bg-white focus:border-blue-500 focus:outline-none rounded-[1px]";
  const sapCheckboxStyle = "w-3.5 h-3.5 border-gray-400 rounded-[1px] accent-blue-600 cursor-pointer";
  const sapGoldButtonStyle = "px-4 py-0.5 text-[11px] font-bold border border-gray-600 rounded-[1px] shadow-sm hover:brightness-95 transition-all bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60";
  const sapButtonStyle = "px-4 py-0.5 text-[11px] font-medium border border-gray-500 rounded-[1px] shadow-sm hover:bg-gray-100 transition-colors bg-[#e1e1e1]";

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    if (isMaximized) return;

    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    
    const startWidth = windowState.width;
    const startHeight = windowState.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = windowState.x;
    const startYPos = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = windowState.x;
      let newY = windowState.y;
      let newWidth = windowState.width;
      let newHeight = windowState.height;

      if (direction.includes('e')) newWidth = Math.max(900, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(600, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = Math.max(900, startWidth - deltaX);
        if (newWidth > 900) newX = startXPos + deltaX;
      }
      
      if (direction.includes('n')) {
        newHeight = Math.max(600, startHeight - deltaY);
        if (newHeight > 600) newY = startYPos + deltaY;
      }

      onUpdateState({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onClick={onFocus}
      style={{
        position: 'absolute',
        left: isMaximized ? 0 : windowState.x,
        top: isMaximized ? 0 : windowState.y,
        width: isMaximized ? '100%' : windowState.width,
        height: isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        border: '1px solid #999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}
      className="recurring-postings-window"
    >
       {/* Resize Handles */}
       {!isMaximized && (
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
        onMouseDown={handleMouseDown}
        className="h-7 bg-gradient-to-b from-[#fdfdfd] to-[#dcdcdc] flex items-center justify-between px-2 cursor-default border-b border-[#999]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#444]">Recurring Postings</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMinimized: true }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMaximized: !isMaximized }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Square className="w-3 h-3 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gold accent bar */}
      <div className="h-1 bg-[#e8a01c] w-full shrink-0" />

      {/* Top Form Section */}
      <div className="p-2 space-y-1 bg-[#f0f0f0] shrink-0">
        <div className="grid grid-cols-[100px_80px_1fr] gap-2 items-end">
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Code</span>
            <input type="text" className={`${sapInputStyle} w-full bg-[#ffffe0] border-black/30 shadow-inner`} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Instance</span>
            <input type="text" className={`${sapInputStyle} w-full`} defaultValue="0" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Description</span>
            <input type="text" className={`${sapInputStyle} w-full`} />
          </div>
        </div>

        <div className="grid grid-cols-[70px_70px_70px_100px_1fr] gap-2 items-end pt-1">
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Ref. 1</span>
            <input type="text" className={sapInputStyle} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Ref. 2</span>
            <input type="text" className={sapInputStyle} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={sapLabelStyle}>Ref. 3</span>
            <input type="text" className={sapInputStyle} />
          </div>
          <div className="flex flex-col gap-0.5">
             <span className={sapLabelStyle}>Trans. Code</span>
             <select className={sapInputStyle} />
          </div>
          <div className="flex flex-col gap-0.5">
             <span className={sapLabelStyle}>Remarks</span>
             <input type="text" className={sapInputStyle} />
          </div>
        </div>

        <div className="flex items-center gap-8 pt-2">
           <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Automatic Tax</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer opacity-50">
              <input type="checkbox" className={sapCheckboxStyle} disabled />
              <span className={sapLabelStyle}>Manage Deferred Tax</span>
           </label>
           <div className="flex-1" />
           <label className="flex items-center gap-2 cursor-pointer opacity-50 pr-4">
              <input type="checkbox" className={sapCheckboxStyle} disabled />
              <span className={sapLabelStyle}>Manage WTax</span>
           </label>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white p-1">
        <div className="flex-1 overflow-auto border border-[#ccc]">
          <table className="w-full text-[10.5px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#e4e4e4] sticky top-0 z-10 border-b border-[#ccc]">
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">G/L Acct/BP Code</th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">G/L Account/BP Name</th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Debit</th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Credit</th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium flex items-center justify-between">
                  <span>Tax Group</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Distr. Rule</th>
                <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Project</th>
                <th className="p-0.5 text-left font-medium bg-[#f0f0f0]">Cost Element</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(20)].map((_, i) => (
                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'} border-b border-[#eee] hover:bg-blue-50/50`}>
                  <td className="border-r border-[#ccc] p-0.5 h-5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="border-r border-[#ccc] p-0.5"></td>
                  <td className="p-0.5 bg-[#f0f0f0]/30"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Area Footer */}
        <div className="bg-[#f0f0f0] border border-t-0 border-[#ccc] p-1">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center">
              <span className={`${sapLabelStyle} w-[150px] bg-[#e4e4e4] border border-[#ccc] px-2`}>Total:</span>
              <div className="w-[100px] bg-[#e4e4e4] border border-l-0 border-[#ccc] h-[18px]"></div>
              <div className="w-[100px] bg-[#e4e4e4] border border-l-0 border-[#ccc] h-[18px]"></div>
            </div>
            <div className="flex items-center">
               <span className={`${sapLabelStyle} w-[150px] bg-[#e4e4e4] border border-[#ccc] px-2`}>To Balance:</span>
               <div className="w-[100px] bg-[#e4e4e4] border border-l-0 border-[#ccc] h-[18px]"></div>
               <div className="w-[100px] bg-[#e4e4e4] border border-l-0 border-[#ccc] h-[18px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling and Bottom Controls Area */}
      <div className="p-2 space-y-1 bg-[#f0f0f0] shrink-0 border-t border-[#ccc]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`${sapLabelStyle} w-[80px]`}>Frequency</span>
              <div className="flex items-center gap-1">
                <select className={`${sapInputStyle} w-100`}>
                  <option>Monthly</option>
                </select>
                <select className={`${sapInputStyle} w-80`}>
                  <option>On13</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-10">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Valid Until</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
               <span className={`${sapLabelStyle} w-[80px]`}>Next Execution</span>
               <input type="text" className={`${sapInputStyle} w-100`} defaultValue="13.03.26" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button className={sapGoldButtonStyle}>Add</button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className={sapGoldButtonStyle}>Cancel</button>
        </div>
        <button className={sapGoldButtonStyle}>Confirmation List</button>
      </div>
    </div>
  );
};
