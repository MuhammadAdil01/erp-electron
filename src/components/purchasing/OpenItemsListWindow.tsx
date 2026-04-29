import React from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';
import { 
  ClassicTable, YellowBtn, ClassicSel, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface OpenItemsListWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const OpenItemsListWindow: React.FC<OpenItemsListWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

  const headers = [
    '#', 'Doc. Series', 'Doc. No.', 'Customer Ref. No.', 'Installment No.', 'Customer Code', 
    'Customer Name', 'Days Overdue', 'Due Date', 'Amount', 'Net', 'Tax', 
    'Original Amount', 'Posting Date', 'Document Date', 'Document Type', 'Blanket Agreement'
  ];

  const data = [
    { series: '....', no: '224418', inst: '1 of 1', code: '01/OL/GP2079/B', days: '3700', due: '31.01.16', amt: 'PKR 14,250.00' },
    { series: '....', no: '250473', inst: '1 of 1', code: '01/OL/GP0047/B', days: '3700', due: '31.01.16', amt: 'PKR 14,250.00' },
    { series: '....', no: '464191', inst: '1 of 1', code: '01/OL/CP0005/A', days: '3700', due: '31.01.16', amt: 'PKR 22,830.00' },
    { series: '....', no: '464192', inst: '1 of 1', code: '01/OL/CP0005/A', days: '3700', due: '31.01.16', amt: 'PKR 14,250.00' },
    { series: '....', no: '464193', inst: '1 of 1', code: '01/OL/CP0005/A', days: '3700', due: '31.01.16', amt: 'PKR 14,250.00' },
  ];

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
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
    onFocus();
    const startW = windowState.width; const startH = windowState.height;
    const startX = e.clientX; const startY = e.clientY;
    const startXP = windowState.x; const startYP = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX; const dy = moveEvent.clientY - startY;
      let newX = windowState.x; let newY = windowState.y;
      let newW = windowState.width; let newH = windowState.height;
      const minW = 800; const minH = 600;

      if (direction.includes('e')) newW = Math.max(minW, startW + dx);
      if (direction.includes('s')) newH = Math.max(minH, startH + dy);
      if (direction.includes('w')) {
        newW = startW - dx;
        if (newW >= minW) newX = startXP + dx; else newW = minW;
      }
      if (direction.includes('n')) {
        newH = startH - dy;
        if (newH >= minH) newY = startYP + dy; else newH = minH;
      }
      onUpdateState({ x: newX, y: newY, width: newW, height: newH });
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
      className={cn("absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
        windowState.isMaximized ? "inset-0 !w-full !h-full" : ""
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
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

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Open Items List</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white flex flex-col p-2 gap-2 overflow-hidden bg-[#f0f0f0]">
        
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
             <span className="text-[11px]">Currency</span>
             <ClassicSel className="w-[150px]"><option>Local Currency</option></ClassicSel>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[11px]">Open Documents</span>
             <ClassicSel className="w-[180px] bg-[#ffed99]"><option>A/R Invoices</option></ClassicSel>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 border border-[#808080] bg-white overflow-hidden flex flex-col relative">
           <ClassicTable headers={headers} rowCount={30}>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-[#f0f0f0] h-[18px]">
                   <td className="border-r border-[#f0f0f0] text-center text-[10.5px] bg-[#f0f0f0]/30">{i+1}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] truncate">{row.series}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]">
                      <div className="flex items-center gap-1">
                         <div className="bg-[#ffed99] border border-[#f39c12] p-0 flex items-center cursor-pointer">
                            <ChevronRight className="w-2.5 h-2.5 text-orange-600" />
                         </div>
                         <span>{row.no}</span>
                      </div>
                   </td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]"></td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]">{row.inst}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]">
                      <div className="flex items-center gap-1">
                         <div className="bg-[#ffed99] border border-[#f39c12] p-0 flex items-center cursor-pointer">
                            <ChevronRight className="w-2.5 h-2.5 text-orange-600" />
                         </div>
                         <span>{row.code}</span>
                      </div>
                   </td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]"></td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-right">{row.days}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-center">{row.due}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-right">{row.amt}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-right">{row.amt}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-right">PKR 0.00</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-right">{row.amt}</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-center">01.07.15</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px] text-center">01.07.15</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]">A/R Invoices</td>
                   <td className="border-r border-[#f0f0f0] px-1 text-[10.5px]"></td>
                </tr>
              ))}
           </ClassicTable>
        </div>

        {/* Footer Actions */}
        <div className="h-[30px] flex items-center px-1 shrink-0">
           <YellowBtn className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
        </div>
      </div>
    </div>
  );
};

