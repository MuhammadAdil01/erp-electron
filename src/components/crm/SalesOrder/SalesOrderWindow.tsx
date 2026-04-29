import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';
import { SalesOrderContentsTab } from './tabs/SalesOrderContentsTab';
import { LogisticsTab } from './tabs/LogisticsTab';
import { AccountingTab } from './tabs/AccountingTab';
import { SalesOrderAttachmentsTab } from './tabs/SalesOrderAttachmentsTab';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface SalesOrderWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const SalesOrderWindow: React.FC<SalesOrderWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');

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

      if (direction.includes('e')) newWidth = Math.max(1000, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(600, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 1000) newX = startXPos + deltaX;
        else newWidth = 1000;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= 600) newY = startYPos + deltaY;
        else newHeight = 600;
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

  const tabs = ['Contents', 'Logistics', 'Accounting', 'Attachments'];

  return (
    <div
      className="absolute bg-[#f0f0f0] border-2 border-[#d4d0c8] shadow-[2px_2px_15px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden select-none rounded-sm"
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
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

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[30px] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-blue-800"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
             <div className="w-3.5 h-3.5 border-t-2 border-l-2 border-white/80" />
          </div>
          <span className="text-white text-[11.5px] font-bold tracking-wider drop-shadow-sm">Sales Order</span>
        </div>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col p-4 pb-2 gap-4 overflow-hidden pt-6">
         {/* Top Section */}
         <div className="grid grid-cols-[1fr_380px] gap-x-16 shrink-0 px-2">
            {/* Left Col */}
            <div className="flex flex-col gap-1.5">
               <div className="flex items-center group">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Customer</label>
                  <div className="flex-1 relative group">
                     <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] focus:border-blue-500" />
                     <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                        <div className="w-3.5 h-3.5 bg-[#f5f5f5] border border-gray-500 flex items-center justify-center">
                           <div className="w-1.5 h-1.5 rounded-full border border-blue-600" />
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Name</label>
                  <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 text-[10.5px] shadow-sm focus:border-blue-500 outline-none" />
               </div>
               <div className="flex items-center group">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Contact Person</label>
                  <div className="flex-1 relative group">
                     <input type="text" className="w-full bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] pr-[36px] shadow-sm focus:border-blue-500" />
                     <div className="absolute right-[18px] top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                     </div>
                     <div className="absolute right-0 top-1.5 bottom-1.5 w-[18px] flex items-center justify-center border-l border-gray-300">
                        <div className="w-[11px] h-[11px] rounded-full border border-blue-500 flex items-center justify-center text-[7px] text-blue-600 font-extrabold pb-[0.5px]">i</div>
                     </div>
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Customer Ref. No.</label>
                  <input type="text" className="flex-1 bg-white border border-gray-400 h-[18px] px-1 outline-none text-[10.5px] shadow-sm focus:border-blue-500" />
               </div>
               <div className="flex items-center group">
                  <div className="w-[130px] relative cursor-pointer">
                     <span className="text-[10.5px] text-gray-700 underline decoration-gray-400">Local Currency</span>
                     <ChevronDown className="inline-block ml-1 w-3 h-3 text-gray-400" />
                  </div>
                  <div className="flex-1" />
               </div>
            </div>

            {/* Right Col */}
            <div className="flex flex-col gap-1.5 pt-0.5">
               <div className="flex items-center gap-1 shrink-0">
                  <label className="w-[100px] text-gray-700 text-[10.5px]">No.</label>
                  <div className="flex flex-1 gap-1">
                     <div className="w-[110px] relative group">
                        <input type="text" defaultValue="...." className="w-full border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm focus:border-blue-500" />
                        <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                           <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                     </div>
                     <input type="text" defaultValue="1" className="flex-1 border border-gray-400 h-[18px] px-2 text-[10.5px] outline-none shadow-sm text-right focus:border-blue-500" />
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="w-[100px] text-gray-700 text-[10.5px]">Status</label>
                  <input type="text" defaultValue="Open" disabled className="flex-1 bg-white border border-gray-400 h-[18px] px-2 text-[10.5px] shadow-inner font-bold text-black" />
               </div>
               <div className="flex items-center">
                  <label className="w-[100px] text-gray-700 text-[10.5px]">Posting Date</label>
                  <input type="text" defaultValue="30.03.26" className="flex-1 border border-gray-400 h-[18px] px-2 text-[10.5px] outline-none shadow-sm font-mono focus:border-blue-500" />
               </div>
               <div className="flex items-center">
                  <label className="w-[100px] text-gray-700 text-[10.5px]">Delivery Date</label>
                  <input type="text" className="flex-1 border border-gray-400 h-[18px] px-2 outline-none text-[10.5px] shadow-sm font-mono focus:border-blue-500" />
               </div>
               <div className="flex items-center">
                  <label className="w-[100px] text-gray-700 text-[10.5px]">Document Date</label>
                  <input type="text" defaultValue="30.03.26" className="flex-1 border border-gray-400 h-[18px] px-2 text-[10.5px] outline-none shadow-sm font-mono focus:border-blue-500" />
               </div>
            </div>
         </div>

         {/* Tab Container */}
         <div className="flex-1 flex flex-col overflow-hidden mt-2">
            {/* Tabs List */}
            <div className="flex px-2 gap-[1px] shrink-0">
               {tabs.map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-8 h-[22px] text-[11px] border-t border-l border-r rounded-t-[2px] transition-all focus:outline-none flex items-center justify-center ${
                        activeTab === tab
                           ? 'bg-white border-gray-400 font-bold translate-y-[1px] relative z-20 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]'
                           : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600 hover:to-white z-10'
                     }`}
                  >
                     {tab}
                  </button>
               ))}
            </div>

            {/* Tab Panel */}
            <div className="flex-1 border border-gray-400 bg-white p-4 overflow-hidden flex flex-col shadow-[rgba(0,0,0,0.1)_0px_2px_10px_-2px] pt-2 relative z-10">
               <div className="flex-1 flex flex-col overflow-hidden">
                  {activeTab === 'Contents' && <SalesOrderContentsTab />}
                  {activeTab === 'Logistics' && <LogisticsTab />}
                  {activeTab === 'Accounting' && <AccountingTab />}
                  {activeTab === 'Attachments' && <SalesOrderAttachmentsTab />}
               </div>
            </div>
         </div>

         {/* Bottom Section (Summary Sidebar & Footer) */}
         <div className="grid grid-cols-[1fr_380px] gap-x-16 shrink-0 px-2 mt-2">
            {/* Left Col (Extra info) */}
            <div className="flex flex-col gap-1.5">
               <div className="flex items-center group">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Sales Employee</label>
                  <div className="flex-1 relative group">
                     <input type="text" defaultValue="-No Sales Employee-" className="w-full border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm pr-[36px] focus:border-blue-500" />
                     <div className="absolute right-[18px] top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer group-hover:to-white">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                     </div>
                     <div className="absolute right-0 top-1.5 bottom-1.5 w-[18px] flex items-center justify-center border-l border-gray-300">
                        <div className="w-[11px] h-[11px] rounded-full border border-blue-500 flex items-center justify-center text-[7px] text-blue-600 font-extrabold pb-[0.5px]">i</div>
                     </div>
                  </div>
               </div>
               <div className="flex items-center group">
                  <label className="w-[130px] text-gray-700 text-[10.5px]">Owner</label>
                  <div className="flex-1 flex gap-1 items-center">
                     <input type="text" className="w-[100px] border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm focus:border-blue-500" />
                     <input type="text" className="flex-1 border border-gray-400 h-[18px] px-1 text-[10.5px] outline-none shadow-sm focus:border-blue-500" />
                  </div>
               </div>
               <div className="flex items-start gap-1.5 mt-8">
                  <label className="w-[130px] text-gray-700 text-[10.5px] font-bold underline decoration-gray-400">Remarks</label>
                  <textarea className="flex-1 h-[70px] bg-white border border-gray-400 p-2 text-[10.5px] outline-none shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] resize-none custom-scrollbar" />
               </div>
            </div>

            {/* Right Col (Calculations) */}
            <div className="flex flex-col gap-1.5 pt-1">
               <div className="flex items-center">
                  <label className="flex-1 text-gray-700 text-[10.5px]">Total Before Discount</label>
                  <input type="text" disabled className="w-[150px] border border-gray-400 h-[20px] px-2 text-right text-[10.5px] bg-[#e1e1e1] shadow-inner font-mono" />
               </div>
               <div className="flex items-center gap-1.5">
                  <label className="flex-1 text-gray-700 text-[10.5px]">Discount</label>
                  <div className="flex items-center gap-1">
                     <input type="text" className="w-[50px] border border-gray-400 h-[20px] px-1 text-right text-[10.5px] shadow-sm outline-none focus:border-blue-500 font-mono" />
                     <span className="text-[10.5px] text-gray-500 font-bold ml-1">%</span>
                     <input type="text" className="w-[85px] border border-gray-400 h-[20px] px-2 text-right text-[10.5px] shadow-sm outline-none focus:border-blue-500 font-mono" />
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="flex-1 text-gray-700 text-[10.5px]">Freight</label>
                  <div className="w-[150px] relative group">
                     <input type="text" className="w-full border border-gray-400 h-[20px] px-2 text-right text-[10.5px] shadow-sm pr-[20px] outline-none focus:border-blue-500 font-mono" />
                     <div className="absolute right-0 top-0 bottom-0 w-[20px] flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] border-l border-gray-400 cursor-pointer group-hover:to-white">
                        <ArrowRight className="w-3.5 h-3.5 text-yellow-600 inline-block fill-yellow-600" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center">
                  <label className="flex-1 text-gray-700 text-[10.5px]">Tax</label>
                  <input type="text" className="w-[150px] border border-gray-400 h-[20px] px-2 text-right text-[10.5px] shadow-sm outline-none focus:border-blue-500 font-mono" />
               </div>
               <div className="flex items-center mt-2 pt-1 border-t border-gray-300">
                  <label className="flex-1 text-gray-800 text-[11.5px] font-bold">Total</label>
                  <div className="w-[150px] flex items-center justify-between border border-gray-500 h-[24px] px-2 bg-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] rounded-sm">
                     <span className="text-[10px] text-gray-400 font-black tracking-tighter">PKR</span>
                     <span className="text-[12px] font-black tracking-tight">0.00</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Button Footer */}
      <div className="h-[48px] bg-[#f0f0f0] border-t border-gray-400 flex items-center justify-between px-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pt-1">
        <div className="flex items-center gap-4">
          <div className="relative group/add flex items-center">
             <button className="flex items-center gap-2 px-10 h-[24px] bg-gradient-to-b from-[#fffefe] via-[#fff9c4] to-[#f8f1cf] border border-gray-500 text-[11px] font-black shadow-[0_1px_2px_rgba(0,0,0,0.1)] rounded-sm hover:from-white active:shadow-inner border-b-gray-700">
               Add & New
             </button>
             <div className="absolute right-0 top-0 bottom-0 w-[24px] border-l border-gray-500/20 flex items-center justify-center cursor-pointer hover:bg-black/5 rounded-r-sm">
                <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4.5px] border-t-black/80" />
             </div>
          </div>
          <button className="px-5 h-[24px] bg-gradient-to-b from-white via-[#f5f5f5] to-[#eeeeee] border border-gray-500 text-[11.5px] font-bold shadow-sm rounded-sm active:shadow-inner text-black/40 border-b-gray-400 cursor-not-allowed">
             Add Draft & New
          </button>
          <button className="px-5 h-[24px] bg-gradient-to-b from-white via-gray-50 to-[#e5e5e5] border border-gray-600 text-[11.5px] font-bold shadow-sm rounded-sm active:shadow-inner transition-all border-b-gray-400" onClick={onClose}>
             Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-6 h-[24px] bg-gradient-to-b from-white to-[#eeeeee] border border-gray-400 text-[11px] font-extrabold text-black/40 shadow-sm rounded-sm cursor-not-allowed">
              Copy From
           </button>
           <button className="px-6 h-[24px] bg-gradient-to-b from-white to-[#eeeeee] border border-gray-400 text-[11px] font-extrabold text-black/40 shadow-sm rounded-sm cursor-not-allowed">
              Copy To
           </button>
        </div>
      </div>
    </div>
  );
};
