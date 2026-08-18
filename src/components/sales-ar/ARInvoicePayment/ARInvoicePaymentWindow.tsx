import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { ARInvoicePaymentContentsTab }    from './tabs/ARInvoicePaymentContentsTab';
import { LogisticsTab }                   from './tabs/LogisticsTab';
import { AccountingTab }                  from './tabs/AccountingTab';
import { ARInvoicePaymentAttachmentsTab } from './tabs/ARInvoicePaymentAttachmentsTab';

interface WindowState {
  x:           number;
  y:           number;
  width:       number;
  height:      number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex:      number;
}

interface ARInvoicePaymentWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

// ─── Shared style constants ───────────────────────────────────────────────────
const sapLabelStyle = 'text-[11px] text-[#333] whitespace-nowrap leading-[18px]';
const sapInputStyle = 'h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full shadow-inner';
const sapButtonStyle = 'px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd000]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center';
const sapGreyButtonStyle = 'px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center';

const tabs = ['Contents', 'Logistics', 'Accounting', 'Attachments'];
const MIN_W = 900;
const MIN_H = 600;

// ─── Small reusable pieces ────────────────────────────────────────────────────
const LookupDotButton: React.FC = () => (
  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
    <div className="w-[12px] h-[12px] border border-gray-500 flex items-center justify-center bg-[#f0f0f0]">
      <div className="w-[6px] h-[6px] rounded-full border border-blue-600" />
    </div>
  </div>
);

const ChevronButton: React.FC = () => (
  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
    <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
  </div>
);

const InfoBadge: React.FC = () => (
  <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
    <div className="w-[12px] h-[12px] rounded-full border border-blue-500 flex items-center justify-center text-[7px] text-blue-600 font-black">i</div>
  </div>
);

const FieldRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-1">
    <label className="w-[110px] text-[11px] text-gray-700 shrink-0">{label}</label>
    {children}
  </div>
);

export const ARInvoicePaymentWindow: React.FC<ARInvoicePaymentWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (ev: MouseEvent) => {
      onUpdateState({ x: ev.clientX - startX, y: ev.clientY - startY });
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
    e.preventDefault();
    const startWidth  = windowState.width;
    const startHeight = windowState.height;
    const startX      = e.clientX;
    const startY      = e.clientY;
    const startXPos   = windowState.x;
    const startYPos   = windowState.y;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      let newX      = startXPos;
      let newY      = startYPos;
      let newWidth  = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth  = Math.max(MIN_W, startWidth  + deltaX);
      if (direction.includes('s')) newHeight = Math.max(MIN_H, startHeight + deltaY);

      if (direction.includes('w')) {
        const candidate = startWidth - deltaX;
        if (candidate >= MIN_W) { newWidth = candidate; newX = startXPos + deltaX; }
        else                    { newWidth = MIN_W;     newX = startXPos + (startWidth - MIN_W); }
      }

      if (direction.includes('n')) {
        const candidate = startHeight - deltaY;
        if (candidate >= MIN_H) { newHeight = candidate; newY = startYPos + deltaY; }
        else                    { newHeight = MIN_H;     newY = startYPos + (startHeight - MIN_H); }
      }

      onUpdateState({ x: newX, y: newY, width: newWidth, height: newHeight });
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
      className="absolute bg-[#f0f0f0] border border-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
      style={{
        left:   windowState.isMaximized ? 0 : windowState.x,
        top:    windowState.isMaximized ? 0 : windowState.y,
        width:  windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Resize Handles - Wider for better hit area */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')}  className="absolute top-0 left-4 right-4 h-[6px] cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('s')}  className="absolute bottom-0 left-4 right-4 h-[6px] cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('e')}  className="absolute top-4 bottom-4 right-0 w-[6px] cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('w')}  className="absolute top-4 bottom-4 left-0 w-[6px] cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-[12px] h-[12px] cursor-nwse-resize z-[110]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-[12px] h-[12px] cursor-nesw-resize z-[110]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-[12px] h-[12px] cursor-nesw-resize z-[110]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-[12px] h-[12px] cursor-nwse-resize z-[110]" />
        </>
      )}

      {/* Title Bar */}
      <div
        onMouseDown={handleDrag}
        className="h-[24px] bg-[#f0f0f0] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400 select-none relative z-10"
      >
        <span className="text-black text-[12px] font-medium truncate">A/R Invoice + Payment</span>
        <div onMouseDown={e => e.stopPropagation()}>
          <WindowControls
            onClose={onClose}
            onMinimize={() => onUpdateState({ isMinimized: true })}
            onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
          />
        </div>
      </div>

      <div className="h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 min-h-0">
          
          {/* Header Section */}
          <div className="grid grid-cols-[1.2fr_1fr] gap-12 shrink-0">
            {/* Left Column */}
            <div className="flex flex-col gap-1">
              <FieldRow label="Customer">
                <div className="flex-1 relative group">
                  <input type="text" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fff9c4] w-full" />
                  <LookupDotButton />
                </div>
              </FieldRow>
              <FieldRow label="Name">
                <input type="text" className={sapInputStyle} />
              </FieldRow>
              <FieldRow label="Contact Person">
                <div className="flex-1 relative group">
                  <input type="text" className={sapInputStyle} />
                  <ChevronButton />
                </div>
                <InfoBadge />
              </FieldRow>
              <FieldRow label="Customer Ref. No.">
                <input type="text" className={sapInputStyle} />
              </FieldRow>
              <div className="flex items-center gap-1">
                <div className="w-[110px] flex items-center gap-1 cursor-pointer">
                  <span className="text-[11px] text-gray-700 underline">Local Currency</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-1">
              <FieldRow label="No.">
                <div className="flex flex-1 gap-1">
                  <div className="w-[100px] relative group">
                    <input type="text" defaultValue="DHAB-AR" className={sapInputStyle} />
                    <ChevronButton />
                  </div>
                  <input type="text" defaultValue="61146" className={sapInputStyle} />
                </div>
              </FieldRow>
              <FieldRow label="Status">
                <input type="text" defaultValue="Open" disabled className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#f0f0f0] w-full font-bold" />
              </FieldRow>
              <FieldRow label="Posting Date">
                <input type="text" defaultValue="01.04.26" className={sapInputStyle} />
              </FieldRow>
              <FieldRow label="Due Date">
                <input type="text" className={sapInputStyle} />
              </FieldRow>
              <FieldRow label="Document Date">
                <input type="text" defaultValue="01.04.26" className={sapInputStyle} />
              </FieldRow>
            </div>
          </div>

          {/* Tabs Container */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="flex gap-[1px] shrink-0">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 h-[22px] text-[11px] border border-gray-400 rounded-t-[3px] flex items-center justify-center transition-all select-none ${
                    activeTab === tab
                      ? 'bg-white border-b-white font-bold relative z-20 translate-y-[1px]'
                      : 'bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] border-b-gray-400 text-gray-700 z-10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex-1 border border-gray-400 bg-white overflow-hidden flex flex-col p-1 pt-2 min-h-0">
              {activeTab === 'Contents'    && <ARInvoicePaymentContentsTab />}
              {activeTab === 'Logistics'   && <LogisticsTab />}
              {activeTab === 'Accounting'  && <AccountingTab />}
              {activeTab === 'Attachments' && <ARInvoicePaymentAttachmentsTab />}
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-[1.2fr_1fr] gap-12 shrink-0">
            {/* Left Column */}
            <div className="flex flex-col gap-1">
              <FieldRow label="Sales Employee">
                <div className="flex-1 relative group">
                  <input type="text" defaultValue="-No Sales Employee-" className={sapInputStyle} />
                  <ChevronButton />
                </div>
                <InfoBadge />
              </FieldRow>
              <FieldRow label="Owner">
                <div className="flex-1 flex gap-1 items-center">
                  <input type="text" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <input type="text" className={sapInputStyle} />
                </div>
              </FieldRow>
              <div className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" className="w-[13px] h-[13px]" />
                <span className="text-[11px] text-gray-700">Payment Order Run</span>
              </div>
              <div className="flex items-start gap-1 mt-2">
                <label className="w-[110px] text-[11px] text-gray-700 shrink-0">Remarks</label>
                <textarea className="flex-1 h-[60px] border border-gray-400 p-1 text-[11px] outline-none shadow-inner resize-none" />
              </div>
            </div>

            {/* Right Column Totals */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700">Total Before Discount</label>
                <input type="text" disabled className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] bg-[#f0f0f0]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="flex-1 text-[11px] text-gray-700">Discount</label>
                <div className="flex items-center gap-1">
                  <input type="text" className="w-[40px] h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">%</span>
                  <input type="text" className="w-[85px] h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 flex items-center gap-1">
                  <button className="w-5 h-[18px] bg-[#f0f0f0] border border-gray-400 flex items-center justify-center text-[10px]">...</button>
                  <label className="text-[11px] text-gray-700">Total Down Payment</label>
                </div>
                <input type="text" className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none" />
              </div>
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700">Freight</label>
                <div className="w-[140px] relative group">
                  <input type="text" className="h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none pr-[20px] w-full" />
                  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                    <ArrowRight className="w-3.5 h-3.5 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700">Tax</label>
                <input type="text" className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none" />
              </div>
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700">WTax Amount</label>
                <input type="text" className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] outline-none" />
              </div>
              <div className="flex items-center mt-2">
                <label className="flex-1 text-[11px] text-gray-700 font-bold">Total</label>
                <div className="w-[140px] flex items-center justify-between h-[20px] border border-gray-400 px-1 bg-white relative">
                  <span className="text-[10px] text-gray-400">PKR</span>
                  <span className="text-[11px] font-bold">0.00</span>
                  <div className="absolute right-[-22px] top-0 flex items-center justify-center h-full">
                    <div className="w-[18px] h-[18px] bg-yellow-100 border border-yellow-600 flex items-center justify-center cursor-pointer">
                      <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700">Applied Amount</label>
                <input type="text" disabled className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] bg-[#f0f0f0]" />
              </div>
              <div className="flex items-center">
                <label className="flex-1 text-[11px] text-gray-700 font-bold text-red-600 underline">Balance Due</label>
                <input type="text" disabled className="w-[140px] h-[18px] border border-gray-400 px-1 text-right text-[11px] bg-[#f0f0f0] font-bold text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 flex items-center px-4 justify-between shrink-0 select-none">
          <div className="flex gap-2">
            <button className={sapButtonStyle}>Add & New</button>
            <button className={sapGreyButtonStyle}>Add Draft & New</button>
            <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
          </div>
          <div className="flex gap-2">
            <button className={sapGreyButtonStyle}>Copy From</button>
            <button className={sapGreyButtonStyle}>Copy To</button>
          </div>
        </div>
      </div>
    </div>
  );
};