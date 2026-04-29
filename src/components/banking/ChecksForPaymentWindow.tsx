import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight, Search, ChevronUp, ChevronDown, ChevronLeft } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, cn 
} from '../ui/ClassicERPUI';
import { ContentsTabChecksForPayment } from './tabs/ContentsTabChecksForPayment';
import { AttachmentsTabChecksForPayment } from './tabs/AttachmentsTabChecksForPayment';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface ChecksForPaymentWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const ChecksForPaymentWindow: React.FC<ChecksForPaymentWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

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
      const minW = 850; const minH = 650;

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
      className={cn(
        'fixed bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden',
        windowState.isMaximized ? 'inset-0 !w-full !h-full' : ''
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
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
        <span className='text-white text-[11px] font-bold'>Checks for Payment</span>
        <div className='flex gap-1 items-center'>
          <button className='p-0.5 hover:bg-white/20 text-white rounded-[1px]'><Minus className='w-3 h-3' /></button>
          <button className='p-0.5 hover:bg-white/20 text-white rounded-[1px]'><Square className='w-3 h-3' /></button>
          <button onClick={onClose} className='p-0.5 hover:bg-red-500 text-white rounded-[1px]'><X className='w-3 h-3' /></button>
        </div>
      </div>

      <div className='flex-1 flex flex-col p-2 gap-2 overflow-hidden bg-[#f0f0f0]'>
        
        {/* Header Section */}
        <div className='flex gap-10 justify-between shrink-0 mb-2'>
          {/* Left Column */}
          <div className='grid grid-cols-[120px_1fr] gap-x-2 gap-y-0.5 flex-1 min-w-[350px] max-w-[450px]'>
            <div className='text-[10.5px]'>To Order of</div>
            <div className='flex gap-1'>
              <ClassicInput className='w-[120px] bg-[#fffbd5]' />
              <div className='bg-[#f0f0f0] border border-[#808080] rounded-[1px] p-0.5 flex items-center cursor-pointer'>
                <Search className='w-3.5 h-3.5 text-gray-700' />
              </div>
              <ClassicInput className='flex-1' />
            </div>
            
            <div className='text-[10.5px]'>Pay To</div>
            <div className='border border-[#808080] bg-white h-[45px] px-1 overflow-y-auto'>
              {/* Text area placeholder */}
            </div>

            <div className='h-4' /> <div />

            <div className='text-[10.5px]'>Credited G/L Acct</div>
            <div className='flex gap-1'>
                <ClassicInput className='w-[120px]' />
                <ClassicInput className='flex-1' />
            </div>
          </div>

          {/* Right Column */}
          <div className='grid grid-cols-[120px_1fr] gap-x-2 gap-y-0.5 min-w-[250px] max-w-[300px]'>
            <div className='text-[10.5px]'>Internal ID</div>
            <ClassicInput className='w-full bg-[#f0f0f0]' value='2677' readOnly />

            <div className='text-[10.5px]'>Reference</div>
            <ClassicInput className='w-full' value='2677' />

            <div className='text-[10.5px]'>Posting Date</div>
            <ClassicInput className='w-full' defaultValue='15.04.26' />

            <div className='text-[10.5px]'>Referenced Document</div>
            <div className='bg-orange-100 border border-orange-400 px-1 py-0 h-[18px] w-fit flex items-center cursor-pointer'>
              <span className='text-[10px] font-bold'>...</span>
            </div>

            <div className='text-[10.5px]'>Trans. No.</div>
            <div className='flex items-center gap-2'>
                <ClassicInput className='flex-1 bg-[#f0f0f0]' readOnly />
                <div className='flex items-center gap-1'>
                    <input type='checkbox' className='w-3 h-3' id='createJournal' defaultChecked />
                    <label htmlFor='createJournal' className='text-[10.5px] whitespace-nowrap'>Create Journal Entry</label>
                </div>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className='flex border-b border-[#808080] shrink-0'>
          {['Contents', 'Attachments'].map(t => (
            <ClassicTab key={t} label={t} isActive={activeTab === t} onClick={() => setActiveTab(t)} />
          ))}
        </div>

        {/* Tab Content Area */}
        <div className='flex-1 bg-white border border-[#808080] border-t-0 flex flex-col overflow-hidden'>
          {activeTab === 'Contents' && <ContentsTabChecksForPayment />}
          {activeTab === 'Attachments' && <AttachmentsTabChecksForPayment />}
        </div>

        {/* Middle Section Form */}
        <div className='grid grid-cols-[1fr_250px] gap-10 mt-1 shrink-0'>
            <div className='flex flex-col gap-1'>
                <div className='text-[10.5px] font-medium'>Journal Remarks</div>
                <ClassicInput className='w-[280px] h-[35px]' />
            </div>
            <div className='flex flex-col gap-1'>
                <div className='flex items-center justify-between text-[10.5px]'>
                    <span>Total</span>
                    <ClassicInput className='w-[150px] bg-[#f0f0f0]' readOnly />
                </div>
                <div className='flex items-center justify-between text-[10.5px] mt-1'>
                    <span>Amount Due</span>
                    <ClassicInput className='w-[150px] bg-[#f0f0f0]' readOnly />
                </div>
            </div>
        </div>

        {/* Form Section */}
        <div className='flex flex-col gap-1.5 mt-2 shrink-0 border-t border-gray-300 pt-3'>
            <div className='grid grid-cols-[100px_1fr_120px_1fr] gap-x-4 gap-y-1.5'>
                <div className='text-[10.5px]'>Signature</div>
                <ClassicInput className='w-[200px]' />
                <div className='text-[10.5px]'>Pay to Order of</div>
                <ClassicInput className='flex-1' />

                <div className='text-[10.5px]'>Total</div>
                <ClassicInput className='w-[200px] bg-[#f0f0f0]' readOnly />
                <div className='text-[10.5px]'>Amount in Words</div>
                <ClassicInput className='flex-1' />
            </div>
        </div>

        {/* Bottom Grid/Status Bar */}
        <div className='grid grid-cols-[80px_120px_150px_150px_120px_100px_80px_100px] gap-2 items-center mt-3 pt-2 shrink-0'>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Due Date</span>
                <ClassicInput className='w-full' defaultValue='15.04.26' />
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold uppercase'>Endors.</span>
                <div className='flex items-center gap-1'>
                    <ClassicSel className='flex-1'><option>No</option></ClassicSel>
                    <div className='w-4 h-4 bg-gray-200 border border-gray-400 rounded-full flex items-center justify-center cursor-pointer'>
                        <span className='text-[9px] font-bold'>∞</span>
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Country/Region</span>
                <ClassicSel className='w-full'><option></option></ClassicSel>
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Bank</span>
                <ClassicSel className='w-full'><option></option></ClassicSel>
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Account</span>
                <ClassicInput className='w-full bg-[#f0f0f0]' readOnly />
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Branch</span>
                <ClassicInput className='w-full bg-[#f0f0f0]' readOnly />
            </div>
            <div className='flex flex-col gap-0.5 items-center justify-center pt-3'>
                <div className='flex items-center gap-1'>
                    <input type='checkbox' className='w-3 h-3' id='manual' />
                    <label htmlFor='manual' className='text-[10px]'>Manual</label>
                </div>
            </div>
            <div className='flex flex-col gap-0.5'>
                <span className='text-[9px] text-gray-500 font-bold'>Check No.</span>
                <ClassicInput className='w-full' />
            </div>
        </div>

        {/* Footer Area */}
        <div className='flex justify-between items-end mt-4 shrink-0 px-2'>
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                    <input type='checkbox' className='w-3 h-3' id='blankPaper' />
                    <label htmlFor='blankPaper' className='text-[10px]'>Print on Blank Paper</label>
                </div>
                <span className='text-[10px] text-gray-500'>Printing/Spacing</span>
            </div>

            <div className='flex items-center gap-6'>
                {/* D-Pad Control */}
                <div className='relative w-12 h-12 flex items-center justify-center'>
                    <ChevronUp className='absolute top-0 w-3 h-3 text-gray-600 cursor-pointer' />
                    <ChevronDown className='absolute bottom-0 w-3 h-3 text-gray-600 cursor-pointer' />
                    <ChevronLeft className='absolute left-0 w-3 h-3 text-gray-600 cursor-pointer' />
                    <ChevronRight className='absolute right-0 w-3 h-3 text-gray-600 cursor-pointer' />
                    <span className='text-[8px] font-bold'>0,0</span>
                </div>

                <div className='flex gap-1.5'>
                    <YellowBtn className='min-w-[80px]'>Add</YellowBtn>
                    <GreyBtn onClick={onClose} className='min-w-[80px]'>Cancel</GreyBtn>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
