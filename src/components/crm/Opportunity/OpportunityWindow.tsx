import React, { useState } from 'react';
import { User, ChevronDown, Search } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { PotentialTab } from './tabs/PotentialTab';
import { OpportunityGeneralTab } from './tabs/OpportunityGeneralTab';
import { StagesTab } from './tabs/StagesTab';
import { PartnersTab } from './tabs/PartnersTab';
import { CompetitorsTab } from './tabs/CompetitorsTab';
import { SummaryTab } from './tabs/SummaryTab';
import { OpportunityAttachmentsTab } from './tabs/OpportunityAttachmentsTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface OpportunityWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const OpportunityWindow: React.FC<OpportunityWindowProps> = ({ 
  windowState, 
  onClose, 
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Potential');
  const [target, setTarget] = useState('Sales');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
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
    const startWidth = windowState.width;
    const startHeight = windowState.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = windowState.x;
    const startYPos = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = windowState.x;
      let newY = windowState.y;
      let newWidth = windowState.width;
      let newHeight = windowState.height;

      if (direction.includes('e')) newWidth = Math.max(900, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 900) newX = startXPos + deltaX;
        else newWidth = 900;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= 500) newY = startYPos + deltaY;
        else newHeight = 500;
      }

      return onUpdateState({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const tabs = ['Potential', 'General', 'Stages', 'Partners', 'Competitors', 'Summary', 'Attachments'];

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
          <span className="text-white font-semibold text-[11.5px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] truncate">Opportunity</span>
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

        {/* Top Header Fields */}
        <div className="p-4 pt-4 flex gap-x-24 bg-[#f0f0f0] shrink-0 overflow-x-auto custom-scrollbar">
           {/* Left Col */}
           <div className="flex flex-col gap-1 w-[340px] shrink-0">
              <div className="flex items-center mb-1">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Opportunity Target</label>
                 <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                       <div 
                         onClick={() => setTarget('Sales')}
                         className={`w-[13px] h-[13px] rounded-full border border-gray-500 flex items-center justify-center transition-all ${target === 'Sales' ? 'bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]' : 'bg-[#f0f0f0] hover:bg-white'}`}
                       >
                          {target === 'Sales' && <div className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                       </div>
                       <span className={`text-[10.5px] ${target === 'Sales' ? 'font-bold underline text-black' : 'text-gray-600'}`}>Sales</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                       <div 
                         onClick={() => setTarget('Purchasing')}
                         className={`w-[13px] h-[13px] rounded-full border border-gray-500 flex items-center justify-center transition-all ${target === 'Purchasing' ? 'bg-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]' : 'bg-[#f0f0f0] hover:bg-white'}`}
                       >
                          {target === 'Purchasing' && <div className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                       </div>
                       <span className={`text-[10.5px] ${target === 'Purchasing' ? 'font-bold underline text-black' : 'text-gray-600'}`}>Purchasing</span>
                    </label>
                 </div>
              </div>

              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Business Partner Code</label>
                 <div className="flex-1 relative pr-[24px]">
                    <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm select-all" />
                    <button className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[10px] shadow-sm hover:from-white active:shadow-inner rounded-[1px]">
                       <div className="w-3.5 h-3.5 rounded-full bg-gray-300 border border-gray-400 flex flex-col gap-[1px] items-center justify-center scale-90">
                          <div className="w-2 h-[1px] bg-gray-600" />
                          <div className="w-2 h-[1px] bg-gray-600" />
                       </div>
                    </button>
                 </div>
              </div>
              <div className="flex items-center opacity-60">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Business Partner Name</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Contact Person</label>
                 <div className="flex-1 relative">
                    <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white transition-colors">
                       <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center opacity-70">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Total Amount Invoiced</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 text-right text-[10.5px] shadow-inner" />
              </div>
              <div className="flex items-center opacity-60">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Business Partner Territory</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Sales Employee</label>
                 <div className="flex-1 relative">
                    <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[16px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:to-white">
                       <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                 </div>
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Owner</label>
                 <div className="flex-1 relative pr-[24px]">
                    <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px]" />
                    <button className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[10px] shadow-sm hover:from-white active:shadow-inner rounded-[1px]">
                       <Search className="w-3 h-3 text-orange-600 fill-current" />
                    </button>
                 </div>
              </div>
              <label className="flex items-center gap-2 mt-0.5 cursor-pointer group">
                 <input type="checkbox" className="w-[13px] h-[13px] border border-gray-400 rounded-[1px] cursor-pointer" />
                 <span className="text-gray-700 text-[10.5px] group-hover:text-black leading-tight">Display in System Currency</span>
              </label>
           </div>

           {/* Right Col */}
           <div className="flex flex-col gap-1 w-[340px] shrink-0">
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Opportunity Name</label>
                 <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Opportunity No.</label>
                 <input type="text" defaultValue="9" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px] font-mono" />
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Status</label>
                 <input type="text" defaultValue="Open" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px] font-bold" />
              </div>
              <div className="flex items-center">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Start Date</label>
                 <input type="text" defaultValue="30.03.26" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
              </div>
              <div className="flex items-center opacity-60">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Closing Date</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
              </div>
              <div className="flex items-center opacity-60">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Open Activities</label>
                 <input type="text" disabled className="flex-1 bg-[#e1e1e1] border border-gray-400 h-[18px] px-1 shadow-inner text-[10.5px]" />
              </div>
              <div className="flex items-center mt-2">
                 <label className="w-[140px] text-gray-700 text-[10.5px]">Closing %</label>
                 <div className="flex-1 relative flex items-center pr-[40px]">
                    <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm" />
                    <span className="absolute right-2 text-[14px] font-bold text-gray-800 pointer-events-none select-none drop-shadow-[1px_1px_0_rgba(255,255,255,1)]">%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Tab Strip */}
        <div className="flex px-4 mt-2 bg-[#f0f0f0] shrink-0 h-[26px]">
          {tabs.map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 h-[24px] flex items-center justify-center cursor-pointer border border-[#d4d0c8] border-b-0 rounded-t-[3px] transition-all text-[10.5px] font-medium mr-[2px] ${activeTab === tab ? 'bg-white font-bold z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] h-[27px] mt-[-3px] relative' : 'bg-[#e4e4e4] hover:bg-[#eaeaea] text-gray-600 hover:text-black mt-[1px]'}`}
            >
               {activeTab === tab && (
                 <>
                   <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-400 rounded-t-[3px]" />
                   <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white z-30" />
                 </>
               )}
               {tab}
            </div>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 border border-[#d4d0c8] bg-white mx-4 mb-2 p-6 overflow-hidden flex flex-col relative shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] pt-2">
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'Potential' && <PotentialTab />}
              {activeTab === 'General' && <OpportunityGeneralTab />}
              {activeTab === 'Stages' && <StagesTab />}
              {activeTab === 'Partners' && <PartnersTab />}
              {activeTab === 'Competitors' && <CompetitorsTab />}
              {activeTab === 'Summary' && <SummaryTab />}
              {activeTab === 'Attachments' && <OpportunityAttachmentsTab />}
           </div>
        </div>

        {/* Action Footer */}
        <div className="px-4 pb-3 flex items-center justify-between shrink-0 h-[50px] relative overflow-hidden bg-[#f0f0f0]">
          <div className="flex items-center gap-2">
             <button className="px-12 h-[24px] bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#f8f1cf] hover:to-[#fff9c4] border border-gray-500 text-[11px] font-extrabold shadow-sm rounded-[3px] border-b-gray-700 active:shadow-inner flex items-center justify-center min-w-[100px] transition-all">
               Add
             </button>
             <button 
               onClick={onClose}
               className="px-10 h-[24px] bg-gradient-to-b from-white via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-white rounded-[3px] active:to-[#c0c0c0] active:shadow-inner flex items-center justify-center min-w-[100px]"
             >
               Cancel
             </button>
          </div>

          <div className="flex items-center gap-2">
             <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#eeeeee] border border-gray-400 text-[10.5px] font-bold text-gray-500 shadow-sm rounded-[3px] hover:opacity-100 transition-opacity">
                Related Activities
             </button>
             <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#eeeeee] border border-gray-400 text-[10.5px] font-bold text-gray-500 shadow-sm rounded-[3px] hover:opacity-100 transition-opacity">
                Related Documents
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
