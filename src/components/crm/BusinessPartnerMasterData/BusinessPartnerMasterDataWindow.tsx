import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { PaymentTermsTab } from './tabs/PaymentTermsTab';
import { PaymentRunTab } from './tabs/PaymentRunTab';
import { AccountingTab } from './tabs/AccountingTab';
import { RemarksTab } from './tabs/RemarksTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface BusinessPartnerMasterDataWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const BusinessPartnerMasterDataWindow: React.FC<BusinessPartnerMasterDataWindowProps> = ({ 
  windowState, 
  onClose, 
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('General');
  const [status, setStatus] = useState('Active');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    e.preventDefault();
    onFocus();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialWindowX = windowState.x;
    const initialWindowY = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: initialWindowX + (moveEvent.clientX - startX),
        y: initialWindowY + (moveEvent.clientY - startY)
      });
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
    onFocus();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = windowState.x;
    const initialY = windowState.y;
    const initialW = windowState.width;
    const initialH = windowState.height;
    const minW = 900;
    const minH = 500;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let x = initialX;
      let y = initialY;
      let w = initialW;
      let h = initialH;

      if (direction.includes('e')) w = Math.max(minW, initialW + dx);
      if (direction.includes('s')) h = Math.max(minH, initialH + dy);
      
      if (direction.includes('w')) {
        w = Math.max(minW, initialW - dx);
        if (w !== initialW) x = initialX + (initialW - w);
      }
      
      if (direction.includes('n')) {
        h = Math.max(minH, initialH - dy);
        if (h !== initialH) y = initialY + (initialH - h);
      }

      onUpdateState({ x, y, width: w, height: h });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const tabs = ['General', 'Payment Terms', 'Payment Run', 'Accounting', 'Remarks'];

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#f0f0f0] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.4)] border-t border-l border-white/50 border-r border-b border-black/40 rounded-[3px] overflow-hidden group/window font-sans text-[11px]"
      onClick={onFocus}
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

      {/* Window Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#6b6b6b] to-[#454545] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-black/40"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center border border-white/20 shrink-0">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-[11.5px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate">Business Partner Master Data</span>
        </div>
        <WindowControls 
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
          onClose={onClose}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f0f0]">
        {/* Yellow header strip */}
        <div className="h-[4px] bg-gradient-to-r from-orange-400 to-yellow-500 w-full shrink-0" />

        {/* Top Field Section */}
        <div className="p-4 pt-4 flex gap-x-32 bg-[#f0f0f0] shrink-0 overflow-x-auto custom-scrollbar">
           {/* Left Col */}
           <div className="flex flex-col gap-1 w-[320px] shrink-0">
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Code</label>
                 <div className="flex-1 flex gap-1">
                    <input type="text" className="w-[80px] bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                    <div className="flex-1 relative">
                       <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                       <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                          <ChevronDown className="w-3 h-3 text-gray-600" />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Name</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Foreign Name</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Group</label>
                 <div className="flex-1 relative">
                    <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                       <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Currency</label>
                 <div className="flex-1 relative">
                    <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                       <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center">
                 <label className="w-[100px] text-gray-700">Federal Tax ID</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
              </div>
           </div>

           {/* Right Col */}
           <div className="flex flex-col gap-1 w-[320px] shrink-0">
              <div className="flex items-center">
                 <label className="w-[120px] text-gray-700 text-right pr-4">BP Currency</label>
                 <div className="flex-1 relative">
                    <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                       <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center mt-6">
                 <label className="w-[120px] text-gray-700 text-right pr-4 font-bold">Orders</label>
                 <input type="text" defaultValue="0.00" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none text-right shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] font-mono text-[10.5px]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[120px] text-gray-700 text-right pr-4">Opportunities</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 outline-none text-right shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] font-mono text-[10.5px]" />
              </div>
           </div>
        </div>

        {/* Tabs Ribbon */}
        <div className="flex px-4 mt-2 shrink-0 h-[24px]">
          {tabs.map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 flex items-center justify-center cursor-pointer border border-gray-400 border-b-0 rounded-t-[4px] mr-[2px] transition-all relative ${activeTab === tab ? 'bg-white font-bold h-[25px] z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]' : 'bg-[#e0e0e0] h-[22px] mt-[2px] hover:bg-white text-gray-600 hover:text-black'}`}
            >
              <span className="text-[10px]">{tab}</span>
              {activeTab === tab && <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-orange-400 rounded-t-[4px]" />}
            </div>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 border border-gray-400 mx-4 border-t-0 bg-white mb-2 shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col p-6 pt-8 relative">
           {activeTab === 'General' && (
             <div className="grid grid-cols-[260px_1fr_260px] gap-x-12 min-h-[400px]">
                {/* Column 1 - Contacts */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center">
                      <label className="w-[100px] text-gray-700">Tel 2</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   <div className="flex items-center mb-6">
                      <label className="w-[100px] text-gray-700">Mobile Phone</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   
                   <div className="flex items-center opacity-70">
                      <label className="w-[100px] text-gray-700">Contact Person</label>
                      <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                   </div>
                   <div className="flex items-center">
                      <label className="w-[100px] text-gray-700">ID No. 2</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   <div className="flex items-center">
                      <label className="w-[100px] text-gray-700">CNIC</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   <div className="flex items-center mt-4">
                      <label className="w-[100px] text-gray-700 leading-tight">BP Channel Code</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   <div className="flex items-center mt-4">
                      <label className="w-[100px] text-gray-700">Territory</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                </div>

                {/* Column 2 - Shipping/Business */}
                <div className="flex flex-col gap-1.5 pt-8">
                   <div className="flex items-center">
                      <label className="w-[140px] text-gray-700">Shipping Type</label>
                      <div className="flex-1 relative">
                         <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                         <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                            <ChevronDown className="w-3 h-3 text-gray-600" />
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center">
                      <label className="w-[140px] text-gray-700">Factoring Indicator</label>
                      <div className="flex-1 flex gap-1">
                         <input type="text" className="w-[80px] bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                         <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                      </div>
                   </div>
                   <div className="flex items-center">
                      <label className="w-[140px] text-gray-700 leading-tight">Business Partner Project</label>
                      <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                   </div>
                   <div className="flex items-center">
                      <label className="w-[140px] text-gray-700">Industry</label>
                      <div className="flex-1 relative">
                         <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
                         <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                            <ChevronDown className="w-3 h-3 text-gray-600" />
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center">
                      <label className="w-[140px] text-gray-700">Type of Business</label>
                      <div className="flex-1 relative">
                         <input type="text" defaultValue="Company" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 font-bold shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                         <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                            <ChevronDown className="w-3 h-3 text-gray-600" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Column 3 - Real Estate / Projects */}
                <div className="flex flex-col gap-1 pr-2">
                   {[
                     'Real State Category', 'Real Estate Type', 'Ballot Name', 'Ballot Category'
                   ].map(label => (
                     <div key={label} className="flex items-center mb-0.5">
                        <label className="w-[130px] text-gray-700 text-[10.5px] leading-tight pr-3 text-right">{label}</label>
                        <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                     </div>
                   ))}
                   
                   <div className="mt-4 flex flex-col gap-1">
                      <div className="flex items-center">
                         <label className="w-[130px] text-gray-700 pr-3 text-right">Project</label>
                         <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                      </div>
                      <div className="flex items-center mb-4">
                         <label className="w-[130px] text-gray-700 pr-3 text-right">Phase</label>
                         <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                      </div>

                      <div className="flex items-center">
                         <label className="w-[130px] text-gray-700 pr-3 text-right font-bold">Block</label>
                         <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                      </div>
                      <div className="flex items-center mt-6">
                         <label className="w-[130px] text-gray-700 pr-3 text-right font-bold">Sector</label>
                         <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-[10.5px]" />
                      </div>
                   </div>

                   <div className="mt-auto mb-10 flex items-center gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5 bg-white border border-gray-400 cursor-pointer" />
                      <span className="text-gray-700 text-[10.5px]">Block Sending Marketing Content</span>
                      <button className="ml-auto w-6 h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[14px] leading-0 pb-1 hover:to-[#bbbbbb] active:shadow-inner rounded-[1px]">...</button>
                   </div>
                </div>

                {/* Bottom Radio Group */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 bg-white/50 p-2 rounded-sm select-none">
                   {['Active', 'Inactive', 'Advanced'].map(r => (
                     <label key={r} className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          onClick={() => setStatus(r)}
                          className={`w-[13px] h-[13px] rounded-full border border-gray-500 flex items-center justify-center transition-all ${status === r ? 'bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]' : 'bg-[#f0f0f0] hover:bg-white'}`}
                        >
                           {status === r && <div className="w-1.5 h-1.5 rounded-full bg-black/80 shadow-[0_0_1px_black]" />}
                        </div>
                        <span className={`text-[10.5px] ${status === r ? 'font-bold' : 'text-gray-600'}`}>{r}</span>
                     </label>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'Payment Terms' && <PaymentTermsTab />}
           {activeTab === 'Payment Run' && <PaymentRunTab />}
           {activeTab === 'Accounting' && <AccountingTab />}
           {activeTab === 'Remarks' && <RemarksTab />}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-2 pt-0 pb-3 h-[45px] shrink-0">
          <button className="px-10 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-white active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[100px] overflow-hidden group">
            <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
            <div className="absolute inset-0 border-r border-b border-black/10 pointer-events-none rounded-[1px]" />
            <span className="relative z-10 group-active:scale-[0.98] block">Find</span>
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-white active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[100px] overflow-hidden group"
          >
            <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
            <div className="absolute inset-0 border-r border-b border-black/10 pointer-events-none rounded-[1px]" />
            <span className="relative z-10 group-active:scale-[0.98] block">Cancel</span>
          </button>
          
          <button className="ml-auto px-6 h-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 text-[10.5px] font-bold shadow-sm hover:from-white active:to-[#bbbbbb] active:shadow-inner rounded-[2px] border-b-black/40">
            You Can Also
          </button>
        </div>
      </div>
    </div>
  );
};
