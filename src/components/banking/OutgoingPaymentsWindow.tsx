import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, cn 
} from '../ui/ClassicERPUI';
import { ContentsTabOutgoingPayments } from './tabs/ContentsTabOutgoingPayments';
import { AttachmentsTabOutgoingPayments } from './tabs/AttachmentsTabOutgoingPayments';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface OutgoingPaymentsWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const OutgoingPaymentsWindow: React.FC<OutgoingPaymentsWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');
  const [bpType, setBpType] = useState('Vendor');

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
      const minW = 900; const minH = 600;

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
        <span className='text-white text-[11px] font-bold'>Outgoing Payments</span>
        <div className='flex gap-1 items-center'>
          <button className='p-0.5 hover:bg-white/20 text-white rounded-[1px]'><Minus className='w-3 h-3' /></button>
          <button className='p-0.5 hover:bg-white/20 text-white rounded-[1px]'><Square className='w-3 h-3' /></button>
          <button onClick={onClose} className='p-0.5 hover:bg-red-500 text-white rounded-[1px]'><X className='w-3 h-3' /></button>
        </div>
      </div>

      <div className='flex-1 flex flex-col p-2 gap-2 overflow-hidden bg-[#f0f0f0]'>
        {/* Header Section */}
        <div className='flex gap-4 justify-between shrink-0'>
          {/* Left Column */}
          <div className='grid grid-cols-[100px_1fr] gap-x-2 gap-y-0.5 flex-1 min-w-[250px] max-w-[350px]'>
            <div className='text-[10.5px]'>Code</div>
            <div className='flex gap-1'>
              <ClassicInput className='flex-1 bg-[#fffbd5]' />
              <div className='bg-orange-100 border border-orange-400 p-0.5 flex items-center cursor-pointer'>
                <ChevronRight className='w-3 h-3 text-orange-600 font-bold' />
              </div>
            </div>
            
            <div className='text-[10.5px]'>Name</div>
            <ClassicInput className='w-full' />

            <div className='text-[10.5px]'>Pay To</div>
            <div className='flex gap-1'>
              <ClassicSel className='w-[80px]'><option></option></ClassicSel>
              <div className='flex-1 relative flex flex-col bg-white border border-[#808080] h-[40px] px-1 overflow-y-auto'>
                {/* Text area style input */}
              </div>
            </div>

            <div className='text-[10.5px]'>Contact Person</div>
            <ClassicSel className='w-full'><option></option></ClassicSel>

            <div className='text-[10.5px]'>Project</div>
            <div className='flex gap-1'>
              <ClassicInput className='flex-1' />
              <div className='bg-orange-100 border border-orange-400 p-0.5 flex items-center cursor-pointer'>
                <ChevronRight className='w-3 h-3 text-orange-600 font-bold' />
              </div>
            </div>

            <div className='text-[10.5px]'>Blanket Agreement</div>
            <div className='flex gap-1'>
              <ClassicInput className='flex-1' />
              <div className='bg-orange-100 border border-orange-400 p-0.5 flex items-center cursor-pointer'>
                <ChevronRight className='w-3 h-3 text-orange-600 font-bold' />
              </div>
            </div>
          </div>

          {/* Center Column (Radio Selection) */}
          <div className='flex flex-col gap-1 px-4 self-start'>
            {[
              { id: 'Vendor', label: 'Vendor' },
              { id: 'Customer', label: 'Customer' },
              { id: 'Account', label: 'Account' }
            ].map(opt => (
              <label key={opt.id} className='flex items-center gap-2 cursor-pointer'>
                <input 
                  type='radio' 
                  className='w-3 h-3 mt-0.5' 
                  checked={bpType === opt.id} 
                  onChange={() => setBpType(opt.id)} 
                />
                <span className='text-[10.5px]'>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Right Column (Status & Dates) */}
          <div className='grid grid-cols-[100px_1fr] gap-x-2 gap-y-0.5 min-w-[220px] max-w-[280px]'>
            <div className='text-[10.5px]'>No.</div>
            <div className='flex gap-1'>
              <ClassicSel className='w-[80px]'><option>DHAB-OP</option></ClassicSel>
              <ClassicInput value='2710' className='flex-1 text-right bg-[#f0f0f0]' readOnly />
            </div>

            <div className='text-[10.5px]'>Posting Date</div>
            <ClassicInput className='w-full' defaultValue='15.04.26' />

            <div className='text-[10.5px]'>Due Date</div>
            <ClassicInput className='w-full' defaultValue='15.04.26' />

            <div className='text-[10.5px]'>Document Date</div>
            <ClassicInput className='w-full' defaultValue='15.04.26' />

            <div className='text-[10.5px]'>Reference</div>
            <ClassicInput className='w-full' />

            <div className='text-[10.5px]'>Transaction No.</div>
            <ClassicInput className='w-full bg-[#f0f0f0]' readOnly />

            <div className='text-[10.5px]'>WTax Code</div>
            <ClassicInput className='w-full' />

            <div className='text-[10.5px]'>WTax Base Sum</div>
            <ClassicInput className='w-full' />
          </div>
        </div>

        <div className='flex items-center gap-2 mt-1'>
          <input type='checkbox' className='w-3 h-3' id='billingAddress' />
          <label htmlFor='billingAddress' className='text-[10.5px]'>Display Invoices with Matching Billing Address</label>
        </div>

        {/* Tabs Row */}
        <div className='flex border-b border-[#808080] shrink-0 mt-1'>
          {['Contents', 'Attachments'].map(t => (
            <ClassicTab key={t} label={t} isActive={activeTab === t} onClick={() => setActiveTab(t)} />
          ))}
        </div>

        {/* Tab Content Area */}
        <div className='flex-1 bg-white border border-[#808080] border-t-0 flex flex-col overflow-hidden'>
          {activeTab === 'Contents' && <ContentsTabOutgoingPayments />}
          {activeTab === 'Attachments' && <AttachmentsTabOutgoingPayments />}
        </div>

        <div className='flex justify-end shrink-0 mt-0.5 -mr-1 px-1'>
          <div className='flex items-center gap-1'>
            <span className='text-[10.5px]'>Referenced Document</span>
            <div className='bg-orange-100 border border-orange-400 px-1 py-0 h-[18px] flex items-center cursor-pointer ml-1'>
              <span className='text-[10px] font-bold'>...</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className='flex justify-between mt-0.5 items-end shrink-0'>
          <div className='flex flex-col gap-1 flex-1'>
            <div className='grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 w-[400px]'>
              <div className='text-[10.5px]'>Remarks</div>
              <ClassicInput className='w-full' />
              
              <div className='text-[10.5px]'>Journal Remarks</div>
              <ClassicInput className='w-full' defaultValue='Outgoing Payments - DHAB-OP' />
            </div>

            <div className='flex items-center gap-2 mt-2'>
              <input type='checkbox' className='w-3 h-3' id='paymentWizard' />
              <label htmlFor='paymentWizard' className='text-[10.5px]'>Created by Payment Wizard</label>
            </div>

            <div className='flex gap-1.5 mt-2'>
              <YellowBtn className='min-w-[80px]'>Add</YellowBtn>
              <GreyBtn onClick={onClose} className='min-w-[80px]'>Cancel</GreyBtn>
            </div>
          </div>

          <div className='flex gap-1.5 self-end'>
            <GreyBtn className='min-w-[80px]'>Deselect All</GreyBtn>
            <GreyBtn className='min-w-[80px]'>Select All</GreyBtn>
            <YellowBtn className='min-w-[120px] text-[10px]'>Add in Sequence</YellowBtn>
          </div>
        </div>
      </div>
    </div>
  );
};
