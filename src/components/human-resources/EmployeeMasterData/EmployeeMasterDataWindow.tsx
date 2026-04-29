import React, { useState } from 'react';
import { Users, User, ChevronDown } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { AddressTab } from './tabs/AddressTab';
import { AdministrationTab } from './tabs/AdministrationTab';
import { PersonalTab } from './tabs/PersonalTab';
import { BankTab } from './tabs/BankTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface EmployeeMasterDataWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const EmployeeMasterDataWindow: React.FC<EmployeeMasterDataWindowProps> = ({ 
  show, 
  onClose, 
  windowState, 
  setWindowState 
}) => {
  const [activeFormTab, setActiveFormTab] = useState('Address');

  if (!show || windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setWindowState(prev => ({
        ...prev,
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      }));
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

      setWindowState(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newWidth = prev.width;
        let newHeight = prev.height;

        if (direction.includes('e')) newWidth = Math.max(400, startWidth + deltaX);
        if (direction.includes('s')) newHeight = Math.max(300, startHeight + deltaY);
        
        if (direction.includes('w')) {
          newWidth = startWidth - deltaX;
          if (newWidth >= 400) newX = startXPos + deltaX;
          else newWidth = 400;
        }
        
        if (direction.includes('n')) {
          newHeight = startHeight - deltaY;
          if (newHeight >= 300) newY = startYPos + deltaY;
          else newHeight = 300;
        }

        return { ...prev, x: newX, y: newY, width: newWidth, height: newHeight };
      });
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
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#f0f0f0] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.4)] border-t border-l border-white/50 border-r border-b border-black/40 rounded-[3px] overflow-hidden group/window"
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[60]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[60]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[60]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[60]" />
        </>
      )}

      {/* Window Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#6b6b6b] to-[#454545] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-black/40"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
            <Users className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-[11.5px] tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Employee Master Data</span>
        </div>
        <WindowControls 
          onMinimize={() => setWindowState(p => ({ ...p, isMinimized: true }))}
          onMaximize={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))}
          onClose={onClose}
        />
      </div>

      {/* Window Content */}
      <div className="flex-1 flex flex-col p-1 overflow-hidden bg-[#f0f0f0]">
        {/* Yellow header strip */}
        <div className="h-[5px] bg-gradient-to-r from-orange-400 to-yellow-500 w-full mb-1 shrink-0 rounded-t-[1px]" />

        <div className="flex-1 flex flex-col overflow-auto custom-scrollbar">
          {/* Top Section: Basic Info */}
          <div className="flex gap-10 mb-6 mt-2 px-4">
            <div className="flex flex-col gap-1.5 w-[240px]">
              {[
                { label: 'Employee Code', value: '' },
                { label: 'Name', value: '', bold: true },
                { label: 'Middle Name', value: '' },
                { label: 'Father Name', value: '' },
                { label: 'Job Title', value: '' },
                { label: 'Position', value: '', dropdown: true }
              ].map((field, idx) => (
                <div key={idx} className="flex items-center">
                  <label className={`w-[90px] text-gray-700 text-[10.5px] ${field.bold ? 'font-bold' : ''}`}>{field.label}</label>
                  <div className="flex-1 relative">
                     <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-1.5 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                     {field.dropdown && (
                       <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:from-white hover:to-[#dddddd]">
                         <ChevronDown className="w-3 h-3 text-gray-600" />
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 w-[240px]">
              {[
                { label: '.... No.', value: '', white: true },
                { label: 'ID No.', value: '', white: true },
                { label: 'Ext. Employee No.', value: '' },
                { label: 'Office Phone', value: '' },
                { label: 'Ext.', value: '' },
                { label: 'Mobile Phone', value: '' }
              ].map((field, idx) => (
                <div key={idx} className="flex items-center">
                  <label className="w-[110px] text-gray-700 text-[10.5px] text-right pr-3">{field.label}</label>
                  <input 
                    type="text" 
                    className={`flex-1 border border-gray-400 h-[18px] outline-none px-1.5 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px] ${field.white ? 'bg-white' : 'bg-[#fff9c4]'}`} 
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 flex justify-end pr-4">
              <div className="w-[110px] h-[130px] bg-gradient-to-br from-[#e0e0e0] to-[#f8f8f8] border border-gray-400 flex flex-col items-center justify-center text-gray-300 relative shadow-sm rounded-[1px]">
                 <User size={56} className="opacity-15" />
                 <div className="absolute inset-0 border-[1px] border-white/60 pointer-events-none" />
                 <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-gray-300 opacity-50" />
              </div>
            </div>
          </div>

          {/* Tabs Bar */}
          <div className="flex px-4 border-b border-gray-400 shrink-0 h-[26px]">
            {['Address', 'Administration', 'Personal', 'Bank', 'Determination', 'Attachments'].map(tab => (
              <div 
                key={tab}
                onClick={() => setActiveFormTab(tab)}
                className={`px-5 flex items-center justify-center cursor-pointer border border-gray-400 border-b-0 rounded-t-[4px] text-[10.5px] mr-[2px] transition-all relative ${activeFormTab === tab ? 'bg-[#f0f0f0] font-bold z-10 -mb-[1px] h-[27px] shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'bg-[#e0e0e0] z-0 overflow-hidden mt-[2px] h-[24px] hover:bg-white text-gray-600 hover:text-black'}`}
              >
                {tab}
                {activeFormTab === tab && <div className="absolute top-0 left-0 right-0 h-[2px] bg-orange-400 rounded-t-[4px]" />}
              </div>
            ))}
          </div>

          {/* Tab Content Box */}
          <div className="flex-1 border border-gray-400 mx-4 border-t-0 bg-[#f8f8f8] shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] overflow-auto mb-2">
            {activeFormTab === 'Address' && <div className="p-8"><AddressTab /></div>}
            {activeFormTab === 'Administration' && <div className="p-8"><AdministrationTab /></div>}
            {activeFormTab === 'Personal' && <div className="p-8"><PersonalTab /></div>}
            {activeFormTab === 'Bank' && <div className="p-2"><BankTab /></div>}
          </div>
        </div>

        {/* Footer Buttons Area */}
        <div className="flex gap-1.5 p-3 shrink-0 border-t border-gray-300 bg-[#f0f0f0] shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
          <button className="px-8 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-[#f8f8f8] active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[80px]">
            <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
            Find
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-1 bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#d8d8d8] border border-gray-500 text-[11px] font-bold shadow-sm hover:via-[#f8f8f8] active:to-[#c0c0c0] active:shadow-inner relative rounded-[2px] min-w-[80px]"
          >
            <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none rounded-[1px]" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
