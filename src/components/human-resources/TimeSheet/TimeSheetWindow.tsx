import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronRight } from 'lucide-react';
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

interface TimeSheetWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const TimeSheetWindow: React.FC<TimeSheetWindowProps> = ({ 
  show, 
  onClose, 
  windowState, 
  setWindowState 
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

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

  const tableHeaders = [
    "#", "Date", "Start Time", "End Time", "Time Sheet Account", 
    "Work Order No.", "Financial Project", "Cost Center", "Stage", 
    "Labour Item", "Service Call No.", "Break"
  ];

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
            <Clock className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-[11.5px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate">Time Sheet</span>
        </div>
        <WindowControls 
          onMinimize={() => setWindowState(p => ({ ...p, isMinimized: true }))}
          onMaximize={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))}
          onClose={onClose}
        />
      </div>

      {/* Header Info Section */}
      <div className="p-4 flex flex-wrap gap-x-20 gap-y-4 bg-[#f0f0f0]">
         {/* Left Column */}
         <div className="flex flex-col gap-1 w-[260px]">
            <div className="flex items-center">
               <label className="w-[100px] text-gray-700">Type</label>
               <div className="flex-1 relative">
                  <input type="text" defaultValue="Employee" className="w-full bg-white border border-gray-400 h-[18px] outline-none px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                  <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  </div>
               </div>
            </div>
            <div className="flex items-center">
               <label className="w-[100px] text-gray-700">Code</label>
               <div className="flex-1 relative">
                  <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                  <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-600 bg-white shadow-inner flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center opacity-70">
               <label className="w-[100px] text-gray-700">Name</label>
               <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] outline-none px-1" />
            </div>
            <div className="flex items-center opacity-70">
               <label className="w-[100px] text-gray-700">First Name</label>
               <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] outline-none px-1" />
            </div>
            <div className="flex items-center">
               <label className="w-[100px] text-gray-700">Department</label>
               <div className="flex-1 relative">
                  <input type="text" className="w-full bg-white border border-gray-400 h-[18px] outline-none px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                  <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column */}
         <div className="flex flex-col gap-1 w-[200px]">
            <div className="flex items-center">
               <label className="w-[80px] text-gray-700 text-right pr-3">No.</label>
               <input type="text" defaultValue="50" className="flex-1 bg-white border border-gray-400 h-[18px] outline-none px-1" />
            </div>
            <div className="flex items-center">
               <label className="w-[80px] text-gray-700 text-right pr-3">Date From</label>
               <input type="text" defaultValue="24.02.26" className="flex-1 bg-white border border-gray-400 h-[18px] outline-none px-1" />
            </div>
            <div className="flex items-center">
               <label className="w-[80px] text-gray-700 text-right pr-3">Date To</label>
               <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] outline-none px-1" />
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 mt-2 shrink-0 h-[24px]">
        {['Contents', 'Attachments'].map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 flex items-center justify-center cursor-pointer border border-gray-400 border-b-0 rounded-t-[4px] mr-[2px] transition-all relative ${activeTab === tab ? 'bg-white font-bold h-[25px] z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]' : 'bg-[#e0e0e0] h-[22px] mt-[2px] hover:bg-white text-gray-600 hover:text-black'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-orange-400 rounded-t-[4px]" />}
          </div>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 border border-gray-400 mx-4 border-t-0 bg-white mb-2 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col p-4 pt-2">
        <span className="text-gray-700 text-[10.5px] mb-2 font-medium">Time Recording</span>
        
        {/* Table Container */}
        <div className="flex-1 border border-gray-300 overflow-auto relative custom-scrollbar bg-white">
           <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 bg-[#f0f0f0] z-20 border-b border-gray-300 shadow-sm">
                 <tr>
                    {tableHeaders.map((header, i) => (
                       <th 
                        key={i} 
                        style={{ width: i === 0 ? '30px' : i === 4 ? '160px' : '90px' }}
                        className={`text-left px-2 py-1.5 font-medium text-gray-600 border-r border-gray-300 text-[10px] whitespace-nowrap bg-gradient-to-b from-white to-[#eeeeee] relative`}
                       >
                          <div className="flex items-center gap-1">
                            {header}
                            {header === "Time Sheet Account" && <div className="ml-auto opacity-40"><ChevronRight size={10} /></div>}
                            {i === tableHeaders.length - 1 && (
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-500 opacity-80 cursor-pointer hover:scale-110">
                                <ChevronRight size={14} className="rotate-[-45deg]" />
                              </div>
                            )}
                          </div>
                       </th>
                    ))}
                 </tr>
              </thead>
              <tbody>
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((row) => (
                   <tr key={row} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                      <td className="bg-[#f5f5f5] border-r border-gray-300 text-center text-gray-500 px-1 py-1 font-bold text-[10px] select-none">{row}</td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1 relative">
                        {row === 1 && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-30 flex items-center justify-center w-4 h-4 hover:opacity-100 cursor-pointer">
                             <ChevronDown size={12} />
                          </div>
                        )}
                      </td>
                      <td className="border-r border-gray-200 px-1 py-1 bg-[#f9f9f9]/80"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1 bg-[#f9f9f9]/80"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="border-r border-gray-200 px-1 py-1"></td>
                      <td className="px-1 py-1"></td>
                   </tr>
                 ))}
              </tbody>
           </table>
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
