import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { WindowControls } from '../ui/WindowControls';
import { ClassicTable, ClassicSel, YellowBtn, cn } from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface PaymentDraftsReportWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PaymentDraftsReportWindow: React.FC<PaymentDraftsReportWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

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
      const minW = 600; const minH = 400;

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

  const headers = ['Document', 'Document No.', 'Posting Date', 'BP Code', 'Document Total', 'Document Remarks', 'Closed'];

  return (
    <div
      className='fixed flex flex-col bg-[#f0f0f0] border border-[#808080] shadow-xl rounded-[3px] overflow-hidden select-none'
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className='absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('s')} className='absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('e')} className='absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('w')} className='absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('nw')} className='absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('ne')} className='absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('sw')} className='absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('se')} className='absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-[60] hover:bg-orange-400/40 flex items-end justify-end'>
            <div className='w-1.5 h-1.5 border-r border-b border-gray-400 m-0.5' />
          </div>
        </>
      )}

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className='h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0'>
        <span className='text-white text-[11px] font-bold'>Payment Drafts Report</span>
        <WindowControls onClose={onClose} onMinimize={() => onUpdateState({ isMinimized: true })} onMaximize={() => {}} />
      </div>

      <div className='flex flex-col flex-1 p-1 bg-[#f0f0f0] overflow-hidden'>
        {/* Filter Header */}
        <div className='flex items-center gap-6 p-1 py-2 text-[10.5px] border-b border-gray-300 shrink-0'>
          <div className='flex items-center gap-2'>
            <span>User</span>
            <ClassicSel className='w-[150px] bg-[#fffbd5]'><option>adirict</option></ClassicSel>
          </div>
          <div className='flex items-center gap-1'>
            <input type='checkbox' className='w-3 h-3' id='openOnly' defaultChecked />
            <label htmlFor='openOnly'>Open Only</label>
          </div>
          <div className='flex items-center gap-1.5 ml-10'>
            <div className='flex items-center gap-1'>
              <input type='checkbox' className='w-3 h-3' id='incoming' defaultChecked />
              <label htmlFor='incoming'>Incoming Payments</label>
            </div>
            <div className='flex items-center gap-1'>
              <input type='checkbox' className='w-3 h-3' id='outgoing' defaultChecked />
              <label htmlFor='outgoing'>Outgoing Payment</label>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className='flex-1 p-1 bg-white overflow-hidden mt-1'>
          <ClassicTable headers={headers} rowCount={15}>
            {[...Array(15)].map((_, i) => (
              <tr key={i} className='border-b border-[#f0f0f0] h-[18px] bg-white'>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1'></td>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 text-right'></td>
                <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 flex-1'></td>
                <td className='p-0 text-[10.5px] px-1 text-center w-[60px]'></td>
              </tr>
            ))}
          </ClassicTable>
        </div>

        {/* Footer Area with Horizontal Scrollbar placeholder for small widths */}
        <div className='h-[12px] bg-gray-200 border-t border-gray-300 relative'>
            <div className='absolute left-0 top-0 bottom-0 bg-gray-300 w-24' />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className='h-[40px] bg-[#f0f0f0] border-t border-gray-300 p-2 px-3 flex gap-2 shrink-0'>
        <YellowBtn className='px-8 h-[22px]'>OK</YellowBtn>
        <YellowBtn onClick={onClose} className='px-8 h-[22px]'>Cancel</YellowBtn>
      </div>
    </div>
  );
};
