import React from 'react';
import { Calendar } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { ClassicInput, ClassicSel, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface ChecksForPaymentCriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const ChecksForPaymentCriteria: React.FC<ChecksForPaymentCriteriaProps> = ({
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
      const minW = 400; const minH = 300;

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

  const Row = ({ label, children, labelWidth = '120px' }: { label: string; children: React.ReactNode; labelWidth?: string }) => (
    <div className='flex items-center text-[10.5px] mb-1.5'>
      <label className='text-gray-700 shrink-0' style={{ width: labelWidth }}>{label}</label>
      <div className='flex items-center gap-4 flex-1'>
        {children}
      </div>
    </div>
  );

  const FromTo = () => (
    <>
      <div className='flex items-center gap-1 flex-1'>
        <span className='text-gray-500 w-[35px] shrink-0'>From</span>
        <div className='relative flex-1'>
          <ClassicInput className='w-full' />
          <div className='absolute right-0 top-0 bottom-0 w-[18px] flex items-center justify-center bg-[#f0f0f0] border-l border-[#d4d0c8]'>
            <Calendar className='w-3 h-3 text-blue-600' />
          </div>
        </div>
      </div>
      <div className='flex items-center gap-1 flex-1'>
        <span className='text-gray-500 w-[20px] shrink-0'>To</span>
        <ClassicInput className='w-full' />
      </div>
    </>
  );

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
        <span className='text-white text-[11px] font-bold'>Checks for Payment - Selection Criteria</span>
        <WindowControls onClose={onClose} onMinimize={() => onUpdateState({ isMinimized: true })} onMaximize={() => {}} />
      </div>

      <div className='flex-1 p-4 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar'>
        <Row label='House Bank' labelWidth='100px'>
          <ClassicSel className='w-full'><option>All Banks</option></ClassicSel>
        </Row>
        <div className='h-[1px] bg-gray-300 my-2' />
        <Row label='Internal Number'><FromTo /></Row>
        <Row label='Check Date'><FromTo /></Row>
        <Row label='Check Number'><FromTo /></Row>

        <div className='mt-4 p-2 border border-gray-300 rounded-[2px] bg-white/50'>
          <div className='text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-wider'>Selection Criteria for Payments</div>
          <div className='flex flex-col gap-1.5'>
            {[
              'Direct', 'From Bank Transfer', 'From Check', 'From Credit Card', 'From Cash'
            ].map(item => (
              <label key={item} className='flex items-center gap-2 cursor-pointer'>
                <input type='checkbox' className='w-3 h-3' defaultChecked />
                <span className='text-[10.5px]'>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='h-[40px] bg-[#f0f0f0] border-t border-gray-300 p-2 px-3 flex gap-2 shrink-0'>
        <YellowBtn className='px-8 h-[22px]'>OK</YellowBtn>
        <GreyBtn onClick={onClose} className='px-8 h-[22px]'>Cancel</GreyBtn>
      </div>
    </div>
  );
};
