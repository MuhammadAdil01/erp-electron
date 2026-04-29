import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { ClassicInput, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface CreditCardManagementCriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CreditCardManagementCriteria: React.FC<CreditCardManagementCriteriaProps> = ({
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
      const minW = 400; const minH = 180;

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

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className='flex items-center text-[10.5px] mb-2'>
      <label className='w-[100px] text-gray-700 shrink-0'>{label}</label>
      <div className='flex items-center gap-4 flex-1'>
        {children}
      </div>
    </div>
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

      <div onMouseDown={handleDrag} className='h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0'>
        <span className='text-white text-[11px] font-bold'>Credit Card Management - Selection Criteria</span>
        <WindowControls onClose={onClose} onMinimize={() => onUpdateState({ isMinimized: true })} onMaximize={() => {}} />
      </div>

      <div className='flex-1 p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar'>
        <Row label='Credit Card'>
          <div className='flex items-center gap-1 flex-1'>
            <span className='text-gray-500 w-[35px] shrink-0'>From</span>
            <div className='relative flex-1'>
              <ClassicInput className='w-full' />
              <div className='absolute right-0 top-0 bottom-0 w-[18px] flex items-center justify-center bg-[#f0f0f0] border-l border-[#d4d0c8]'>
                <Globe className='w-3 h-3 text-blue-600 font-bold' />
              </div>
            </div>
          </div>
          <div className='flex items-center gap-1 flex-1'>
            <span className='text-gray-500 w-[20px] shrink-0'>To</span>
            <ClassicInput className='w-full' />
          </div>
        </Row>

        <Row label='Date'>
          <div className='flex items-center gap-1 flex-1'>
            <span className='text-gray-500 w-[35px] shrink-0'>From</span>
            <ClassicInput className='w-full' />
          </div>
          <div className='flex items-center gap-1 flex-1'>
            <span className='text-gray-500 w-[20px] shrink-0'>To</span>
            <ClassicInput className='w-full' />
          </div>
        </Row>

        <div className='flex items-center gap-2 mt-2'>
          <input type='checkbox' className='w-3 h-3' id='undepositedVouchers' />
          <label htmlFor='undepositedVouchers' className='text-[10.5px]'>Display Undeposited Vouchers Only</label>
        </div>
      </div>

      <div className='h-[40px] bg-[#f0f0f0] border-t border-gray-300 p-2 px-3 flex gap-2 shrink-0'>
        <YellowBtn className='px-8 h-[22px]'>OK</YellowBtn>
        <GreyBtn onClick={onClose} className='px-8 h-[22px]'>Cancel</GreyBtn>
      </div>
    </div>
  );
};
