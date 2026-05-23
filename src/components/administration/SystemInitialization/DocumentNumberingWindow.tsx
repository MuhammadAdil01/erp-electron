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

interface DocumentNumberingWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const DocumentNumberingWindow: React.FC<DocumentNumberingWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  // Data from reference image
  const documentData = [
    { document: 'Sales Blanket Agreement', series: '-SBA', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Purchase Blanket Agreement', series: '-PBA', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Fixed Asset Capitalization', series: 'Primary', first: '1', next: '18', last: '', changeMenu: '' },
    { document: 'Fixed Asset Capitalization Credit Memo', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Inventory Counting', series: '-IC', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Fixed Asset Manual Depreciation', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Fixed Asset Revaluation', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Fixed Asset Transfer', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Fixed Asset Retirement', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Purchase Request', series: 'PR', first: '1', next: '207', last: '', changeMenu: '' },
    { document: 'Incoming Payment Order', series: 'IPO', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Outgoing Payment Order', series: '-OPO', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'TaxAdjustment', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Advance Salary', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'EmployeeSuggestions', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'EmployeeTicketingSystem', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'GradePayScale', series: 'Primary', first: '1', next: '34', last: '', changeMenu: '' },
    { document: 'New Joiner CheckList Form', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Performance Appraisal', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Transfer of Manpower', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Camp Change', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'ManPower Requisition', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Transfer of Manpower', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Monthly Camp Food', series: 'Primary', first: '1', next: '16', last: '', changeMenu: '' },
    { document: 'Payroll Gratuity', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Payroll Leave Applications', series: '2026', first: '26000001', next: '26000232', last: '', changeMenu: '' },
    { document: 'Payroll Loan Application', series: 'Primary', first: '1', next: '111', last: '', changeMenu: '' },
    { document: 'Payroll Daily Attendance Sheet', series: 'Primary', first: '1', next: '111', last: '', changeMenu: '' },
    { document: 'Payroll Monthly Attendance Sheet', series: 'Primary', first: '1', next: '19', last: '', changeMenu: '' },
    { document: 'Payroll Processing', series: 'Primary', first: '1', next: '14', last: '', changeMenu: '' },
    { document: 'PayElementUpdation', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Payroll LeaveSettlement', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'OT Processing', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'HR Leave Joining Report', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Bonus Calculation', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'LeaveOBUpdation', series: 'Primary', first: '1', next: '3', last: '', changeMenu: '' },
    { document: 'Increment Updation', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Payroll Final Settlement', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'TaxSlab', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Reimbursement', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Next of Kin', series: 'Primary', first: '1', next: '1', last: '', changeMenu: '' },
    { document: 'Family Detail', series: 'Primary', first: '1', next: '2', last: '', changeMenu: '' },
  ];

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

        const minW = 900;
        const minH = 600;

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

  const sapLabelStyle = "text-[11.5px] text-gray-800 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-white focus:border-orange-400";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px] border-t-2 border-[#e8a01c]"
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
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-black font-semibold text-[11.5px] tracking-tight">Document Numbering - Setup</span>
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

      {/* Main Content Area */}
      <div className="flex-1 bg-white mx-1 mt-1 border border-gray-400 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="flex bg-[#f2f2f2] border-b border-gray-300 select-none sticky top-0 z-10 h-6 items-center">
          <div className={`${sapLabelStyle} w-8 px-1 border-r border-gray-300 text-center font-bold`}>#</div>
          <div className={`${sapLabelStyle} w-1/4 px-1 border-r border-gray-300 font-bold`}>Document</div>
          <div className={`${sapLabelStyle} w-1/6 px-1 border-r border-gray-300 font-bold`}>Default Series</div>
          <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-300 text-right font-bold`}>First No.</div>
          <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-300 text-right font-bold`}>Next No.</div>
          <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-300 text-right font-bold text-[#404040]`}>Last No.</div>
          <div className={`${sapLabelStyle} flex-1 px-1 font-bold text-[#404040]`}>Change Menu Names</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {documentData.map((row, idx) => (
            <div key={idx} className={`flex border-b border-gray-200 items-center h-[20px] hover:bg-blue-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
              <div className={`${sapLabelStyle} w-8 px-1 border-r border-gray-200 text-center text-gray-500`}>{idx + 1}</div>
              <div className={`${sapLabelStyle} w-1/4 px-1 border-r border-gray-200`}>{row.document}</div>
              <div className="w-1/6 h-full px-1 border-r border-gray-200 flex items-center">
                <input type="text" className={sapInputStyle} defaultValue={row.series} />
              </div>
              <div className="w-32 h-full px-1 border-r border-gray-200 flex items-center">
                <input type="text" className={`${sapInputStyle} text-right`} defaultValue={row.first} />
              </div>
              <div className="w-32 h-full px-1 border-r border-gray-200 flex items-center">
                <input type="text" className={`${sapInputStyle} text-right`} defaultValue={row.next} />
              </div>
              <div className="w-32 h-full px-1 border-r border-gray-200 flex items-center">
                <input type="text" className={`${sapInputStyle} text-right`} defaultValue={row.last} />
              </div>
              <div className="flex-1 h-full px-1 flex items-center">
                <input type="text" className={sapInputStyle} defaultValue={row.changeMenu} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="h-[40px] px-3 bg-[#ececec] flex items-center gap-2 shrink-0 border-t border-gray-300">
        <button onClick={onClose} className={sapButtonStyle}>OK</button>
        <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
      </div>

       {/* Diagonal Resize Icon Placeholder */}
       <div className="absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center opacity-30 select-none pointer-events-none">
          <div className="w-1.5 h-[1px] bg-gray-600 rotate-45 translate-x-1 translate-y-1"></div>
          <div className="w-1.5 h-[1px] bg-gray-600 rotate-45 translate-x-[2px] translate-y-[2px]"></div>
       </div>
    </div>
  );
};
