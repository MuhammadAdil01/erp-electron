import React from 'react';
import { WindowControls } from '../../ui/WindowControls';
import { YellowBtn, ClassicInput } from '../../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface CriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

const BaseCriteriaWindow: React.FC<CriteriaProps & { title: string; children: React.ReactNode }> = ({
  windowState, onClose, onUpdateState, onFocus, title, children
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
      const minW = 400; const minH = 150;

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
        </>
      )}

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className='h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0'>
        <span className='text-white text-[11px] font-bold'>{title}</span>
        <WindowControls onClose={onClose} onMinimize={() => onUpdateState({ isMinimized: true })} onMaximize={() => {}} />
      </div>

      {/* Content */}
      <div className='flex-1 p-6 flex flex-col gap-1 overflow-hidden bg-[#f0f0f0]'>
        {children}
      </div>

      {/* Footer */}
      <div className='h-[45px] bg-[#f0f0f0] border-t border-gray-300 p-2 px-4 flex items-center gap-2 shrink-0'>
        <YellowBtn className='px-10 h-[22px]'>OK</YellowBtn>
        <YellowBtn className='px-10 h-[22px]'>Cancel</YellowBtn>
      </div>
    </div>
  );
};

export const ReconLocateByRowNumberCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Visual Order</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Account Number</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);

export const ReconLocateByExactAmountCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Account Number</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Debit Amount (FC)</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);

export const ReconByDueDateCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>BP/Account Code</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Due Date</span>
      <span className='text-[11px] w-[80px]'>Greater or Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Due Date</span>
      <span className='text-[11px] w-[80px]'>Smaller or Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);

export const ReconByExactSumCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>BP/Account Code</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Debit Amount</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);

export const ReconBySumFCCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>BP/Account Code</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Debit Amount (FC)</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);

export const ReconByTransNumberCriteria: React.FC<CriteriaProps> = (props) => (
  <BaseCriteriaWindow {...props} title="Query - Selection Criteria">
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>BP/Account Code</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='bg-[#fff9c4] w-[120px] h-[18px]' />
    </div>
    <div className='flex items-center gap-2'>
      <span className='text-[11px] w-[140px]'>Transaction Number</span>
      <span className='text-[11px] w-[80px]'>Equal</span>
      <ClassicInput className='w-[120px] h-[18px]' />
    </div>
  </BaseCriteriaWindow>
);
