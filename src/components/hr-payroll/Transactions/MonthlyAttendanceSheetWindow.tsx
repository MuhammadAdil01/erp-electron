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

interface MonthlyAttendanceSheetWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const MonthlyAttendanceSheetWindow: React.FC<MonthlyAttendanceSheetWindowProps> = ({
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
        if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 900) newX = startXPos + deltaX;
          else newWidth = 900;
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

  const sapInputStyle = "w-full h-[18px] border border-gray-300 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd0]";
  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap";
  const nonYellowInput = "w-full h-[18px] border border-gray-300 px-1 text-[11px] outline-none bg-[#f0f0f0]";

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
          <span className="text-black font-medium text-[12px] tracking-tight">Monthly Attendance Sheet</span>
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
           <div className="grid grid-cols-[1fr_1fr] gap-x-12 mb-4">
              <div className="flex flex-col gap-1">
                 <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Location</span>
                    <select className="w-full h-[18px] border border-gray-300 px-1 text-[11px]"><option value=""></option></select>
                 </div>
                 <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Pay Period *</span>
                    <input type="text" className={sapInputStyle} />
                 </div>
                 <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>From Date</span>
                    <input type="text" className={nonYellowInput} />
                 </div>
                 <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className={sapLabelStyle}>Pay Period Month</span>
                    <input type="text" className={nonYellowInput} />
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>No</span>
                    <select className="w-[100px] h-[18px] border border-gray-300 px-1 text-[11px]"><option value="Primary">Primary</option></select>
                    <input type="text" className="w-[60px] h-[18px] border border-gray-300 px-1 text-[11px] bg-[#f0f0f0]" value="19" readOnly />
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Date</span>
                    <div className="w-[168px] flex h-[18px] border border-gray-300 bg-[#fffbd0]">
                       <input type="text" className="w-full px-1 text-[11px] outline-none bg-transparent" value="24.02.26" readOnly />
                    </div>
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Status</span>
                    <input type="text" className="w-[168px] h-[18px] border border-gray-300 px-1 text-[11px] bg-[#f0f0f0]" value="Open" readOnly />
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Year</span>
                    <input type="text" className="w-[168px] h-[18px] border border-gray-300 px-1 text-[11px] bg-[#f0f0f0]" value="2026" readOnly />
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>To Date</span>
                    <input type="text" className="w-[168px] h-[18px] border border-gray-300 px-1 text-[11px] bg-[#f0f0f0]" />
                 </div>
                 <div className="flex items-center gap-2 self-end">
                    <span className={sapLabelStyle}>Type</span>
                    <select className="w-[100px] h-[18px] border border-gray-300 px-1 text-[11px]"><option value=""></option></select>
                    <button className="px-4 h-[18px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px]">Find</button>
                 </div>
              </div>
           </div>

           {/* Table Section */}
           <div className="flex-1 border border-gray-400 overflow-auto custom-scrollbar bg-[#f8f9fa]">
              <table className="w-full border-collapse">
                 <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                    <tr className="border-b border-gray-400">
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[30px]">#</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Employee ID</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[120px]">Employee Name</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">ID No.</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Department</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Designation</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Total Days</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Working Days</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">No of Present Days</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">LOP Days</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Payable Leaves</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">OT Hours</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Short Time Hours</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Normal OT Hours</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Sunday</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">MisBioMateriDays</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Comp-Off Days</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[80px]">Annual Leave</th>
                       <th className="border-r border-gray-300 text-[10px] font-medium text-left px-1 py-1 min-w-[100px]">Half Day Leave</th>
                       <th className="text-[10px] font-medium text-left px-1 py-1 min-w-[40px]">C...</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white">
                    <tr className="border-b border-gray-200 h-6">
                       <td className="border-r border-gray-200 px-1 text-[10px] text-center">1</td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200 text-[#0000ee] underline px-1 cursor-pointer"></td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200"></td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="border-r border-gray-200 px-1 text-right">0.00</td>
                       <td className="px-1 text-right">0.00</td>
                    </tr>
                    {[...Array(15)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100 h-6">
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Remarks & Footer */}
           <div className="flex flex-col gap-2 mt-4 px-1 pb-1">
              <div className="flex items-center gap-2">
                 <span className={sapLabelStyle}>Remarks</span>
                 <input type="text" className="w-[300px] h-[22px] border border-gray-300 px-1 text-[11px]" />
              </div>
              <div className="flex items-center justify-between mt-2">
                 <div className="flex gap-2">
                    <button className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px]">Add</button>
                    <button onClick={onClose} className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px]">Cancel</button>
                    <button className="px-8 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] ml-12">Daily.Att.Sheet</button>
                 </div>
                 <button className="px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px]">New Joiners Report</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
