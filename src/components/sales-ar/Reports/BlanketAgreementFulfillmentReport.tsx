import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface BlanketAgreementFulfillmentReportProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full shadow-inner";
const sapButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd000]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const BlanketAgreementFulfillmentReport: React.FC<BlanketAgreementFulfillmentReportProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Customers');
  const [isGroupOpen, setIsGroupOpen] = useState(false);

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

      if (direction.includes('e')) newWidth = Math.max(550, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 550) newX = startXPos + deltaX;
        else newWidth = 550;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= 500) newY = startYPos + deltaY;
        else newHeight = 500;
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

  const customerGroups = [
    'Bldg Contr', 'Civil Infra Contr', 'Club', 'Customers', 'Inventory', 
    'Lessee', 'Shop', 'Tenants', 'All', 'None'
  ];

  return (
    <div
      className="absolute bg-[#f0f0f0] border border-gray-500 shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden select-none"
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
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[100]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[100]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[101]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[101]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[101]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[101]" />
        </>
      )}

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[24px] bg-[#f0f0f0] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <span className="text-black text-[12px] font-medium truncate">Blanket Agreement Fulfillment Report - Selection Criteria</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      <div className="h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shrink-0" />

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
         {/* Top Section */}
         <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-4">
               <label className="w-[120px] text-[11px] text-gray-700">Agreement Method</label>
               <div className="w-[200px] relative group">
                  <input type="text" defaultValue="Items Method" className={sapInputStyle} />
                  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                     <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <label className="w-[120px] text-[11px] text-gray-700">Agreement No.</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
         </div>

         {/* Tabs Section */}
         <div className="flex flex-col flex-1 min-h-[150px] mt-2 relative">
            <div className="flex gap-[1px] shrink-0 translate-y-[1px]">
               <button 
                  onClick={() => setActiveTab('Items')}
                  className={`px-8 h-[22px] text-[11px] border border-gray-400 rounded-t-[3px] transition-all ${activeTab === 'Items' ? 'bg-white font-bold relative z-20 border-b-white' : 'bg-[#e4e4e4] z-10 border-b-gray-400 hover:bg-gray-200'}`}
               >
                  Items
               </button>
               <button 
                  onClick={() => setActiveTab('Customers')}
                  className={`px-8 h-[22px] text-[11px] border border-gray-400 rounded-t-[3px] transition-all -ml-[1px] ${activeTab === 'Customers' ? 'bg-white font-bold relative z-20 border-b-white' : 'bg-[#e4e4e4] z-10 border-b-gray-400 hover:bg-gray-200'}`}
               >
                  Customers
               </button>
            </div>
            
            <div className="flex-1 border border-gray-400 bg-white p-4 flex flex-col gap-2">
               {activeTab === 'Customers' && (
                  <>
                     <div className="flex items-center gap-4">
                        <label className="w-[100px] text-[11px] text-gray-700">BP Code</label>
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] text-gray-700">From</span>
                           <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                           <span className="text-[11px] text-gray-700">To</span>
                           <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="w-[100px] text-[11px] text-gray-700">Customer Group</label>
                        <div className="w-[450px] relative">
                           <div 
                              onClick={() => setIsGroupOpen(!isGroupOpen)}
                              className="h-[18px] border border-[#f0c800] bg-[#fff9c4] flex items-center px-1 justify-between cursor-default"
                           >
                              <span className="text-[11px] text-gray-700">All</span>
                              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                           </div>
                           {isGroupOpen && (
                              <div className="absolute top-[18px] left-0 right-0 border border-gray-400 bg-white shadow-lg z-[100] py-1 max-h-[150px] overflow-auto">
                                 {customerGroups.map((g, i) => (
                                    <div 
                                       key={i} 
                                       onClick={() => setIsGroupOpen(false)}
                                       className={`px-2 py-0.5 text-[11px] hover:bg-[#ffec99] cursor-default ${g === 'All' ? 'bg-[#ffec99]' : ''}`}
                                    >
                                       {g}
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <button className={sapGreyButtonStyle}>Properties</button>
                        <span className="text-[11px] text-gray-700">Ignore</span>
                     </div>
                  </>
               )}
               {activeTab === 'Items' && (
                  <div className="text-[11px] text-gray-500 italic">Item selection filters...</div>
               )}
            </div>
         </div>

         {/* Dates Section */}
         <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-4">
               <label className="w-[120px] text-[11px] text-gray-700">Start Date</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
            <div className="flex items-center gap-4">
               <label className="w-[120px] text-[11px] text-gray-700">End Date</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
            <div className="flex items-center gap-4">
               <label className="w-[120px] text-[11px] text-gray-700">Termination Date</label>
               <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[120px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none" />
               </div>
            </div>
         </div>

         {/* Bottom Checkboxes Section */}
         <div className="grid grid-cols-[1fr_250px] gap-4 mt-2">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <label className="w-[120px] text-[11px] text-gray-700">Agreement Type</label>
                  <button className="w-[24px] h-[18px] bg-[#fefefe] border border-gray-400 flex items-center justify-center text-[10px] shadow-sm">...</button>
               </div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <label className="w-[120px] text-[11px] text-gray-700">Agreement Status</label>
                  <button className="w-[24px] h-[18px] bg-[#fefefe] border border-gray-400 flex items-center justify-center text-[10px] shadow-sm">...</button>
               </div>
               <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" />
                  <label className="w-[120px] text-[11px] text-gray-700">Fulfilled</label>
                  <button className="w-[24px] h-[18px] bg-[#fefefe] border border-gray-400 flex items-center justify-center text-[10px] shadow-sm">...</button>
               </div>
            </div>
            
            <div className="flex items-center gap-4 justify-end h-fit pt-2">
               <label className="text-[11px] text-gray-700">Price Mode</label>
               <div className="w-[150px] relative group">
                  <input type="text" defaultValue="Net" className={sapInputStyle} />
                  <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                     <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Buttons */}
      <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 flex items-center px-4 gap-2 shrink-0">
         <button onClick={onClose} className={sapButtonStyle}>OK</button>
         <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
      </div>
    </div>
  );
};
