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

interface SalesAnalysisReportProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full shadow-inner";
const sapButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd000]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-6 h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const SalesAnalysisReport: React.FC<SalesAnalysisReportProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Customers');

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

      if (direction.includes('e')) newWidth = Math.max(700, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(500, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 700) newX = startXPos + deltaX;
        else newWidth = 700;
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

  const tabs = ['Customers', 'Items', 'Sales Employees'];

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
        <span className="text-black text-[12px] font-medium truncate">Sales Analysis Report - Selection Criteria</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      <div className="h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shrink-0" />

      {/* Tabs List */}
      <div className="flex bg-[#f0f0f0] border-b border-gray-400 px-10 pt-2 shrink-0">
         {tabs.map(tab => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-10 h-[22px] text-[11px] border border-gray-400 border-b-0 rounded-t-[3px] -ml-[1px] transition-all ${
                  activeTab === tab
                     ? 'bg-white font-bold relative z-20'
                     : 'bg-[#e4e4e4] text-gray-700 z-10 hover:bg-gray-200'
               }`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white border border-gray-400 m-1 flex flex-col p-4">
         {/* Shared Top Controls */}
         <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1.5fr] gap-4 border-b border-gray-200 pb-4 mb-4">
            {/* Period */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <input type="radio" name="period" defaultChecked className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Annual Report</span>
               </div>
               <div className="flex items-center gap-2">
                  <input type="radio" name="period" className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Monthly Report</span>
               </div>
               <div className="flex items-center gap-2">
                  <input type="radio" name="period" className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Quarterly Report</span>
               </div>
            </div>

            {/* Doc Type */}
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <input type="radio" name="doctype" defaultChecked className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Invoices</span>
               </div>
               <div className="flex items-center gap-2">
                  <input type="radio" name="doctype" className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Orders</span>
               </div>
               <div className="flex items-center gap-2">
                  <input type="radio" name="doctype" className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-gray-700">Delivery Notes</span>
               </div>
            </div>

            {/* Display Options */}
            {activeTab !== 'Sales Employees' && (
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <input type="radio" name="display" defaultChecked className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Individual Display</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <input type="radio" name="display" className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Group Display</span>
                  </div>
                  {activeTab === 'Customers' && (
                     <>
                        <div className="flex items-center gap-2 mt-2">
                           <input type="radio" name="total" defaultChecked className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">Total by Customer</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="radio" name="total" className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">Total by Blanket Agreement</span>
                        </div>
                     </>
                  )}
                  {activeTab === 'Items' && (
                     <>
                        <div className="flex items-center gap-2 mt-2">
                           <input type="radio" name="totalItem" defaultChecked className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">No Totals</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="radio" name="totalItem" className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">Total by Customer</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="radio" name="totalItem" className="w-3.5 h-3.5" />
                           <span className="text-[11px] text-gray-700">Total by Sales Employee</span>
                        </div>
                     </>
                  )}
               </div>
            )}
            {activeTab === 'Sales Employees' && <div />}

            {/* Dates */}
            <div className="flex flex-col gap-1 pl-4">
               <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2 w-[120px]">
                     <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Posting Date</span>
                  </div>
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" defaultValue="01.07.25" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" defaultValue="30.06.26" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
                  <div className="w-[18px] h-[18px] flex items-center justify-center">
                     <div className="w-[12px] h-[12px] rounded-full border border-blue-500 flex items-center justify-center text-[7px] text-blue-600 font-black">i</div>
                  </div>
               </div>
               <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2 w-[120px]">
                     <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Due Date</span>
                  </div>
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" defaultValue="01.07.25" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" defaultValue="30.06.26" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 w-[120px]">
                     <input type="checkbox" className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Document Date</span>
                  </div>
                  <span className="text-[11px] text-gray-700">From</span>
                  <input type="text" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
                  <span className="text-[11px] text-gray-700">To</span>
                  <input type="text" className="w-[80px] h-[18px] border border-gray-400 px-1 text-[11px]" />
               </div>
            </div>
         </div>

         {/* Main Selection Area */}
         <div className="flex-1 flex flex-col gap-4">
            <span className="text-[11px] text-gray-700 font-bold underline">Main Selection</span>
            
            <div className="flex flex-col gap-2 pl-4">
               <div className="flex items-center gap-8">
                  <label className="w-[100px] text-[11px] text-gray-700">
                     {activeTab === 'Customers' ? 'Customer' : activeTab === 'Items' ? 'Item' : 'Sales Employee'}
                  </label>
                  
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] text-gray-700">Code From</span>
                     <div className="w-[120px] relative group">
                        <input type="text" className={sapInputStyle} />
                        <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                           <div className="w-[12px] h-[12px] border border-gray-500 flex items-center justify-center bg-[#f0f0f0]">
                              <div className="w-[6px] h-[6px] rounded-full border border-blue-600" />
                           </div>
                        </div>
                     </div>
                     <span className="text-[11px] text-gray-700">To</span>
                     <div className="w-[120px] relative group">
                        <input type="text" className={sapInputStyle} />
                        <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                           <div className="w-[12px] h-[12px] border border-gray-500 flex items-center justify-center bg-[#f0f0f0]">
                              <div className="w-[6px] h-[6px] rounded-full border border-blue-600" />
                           </div>
                        </div>
                     </div>
                  </div>

                  {activeTab !== 'Sales Employees' && (
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-700">Group</span>
                        <div className="w-[120px] relative group">
                           <input type="text" defaultValue="All" className={sapInputStyle} />
                           <div className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {activeTab !== 'Sales Employees' && (
                  <div className="flex items-center gap-4 ml-[132px]">
                     <button className={sapGreyButtonStyle}>Properties</button>
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 italic">Properties</span>
                        <span className="text-[11px] text-gray-700">Ignore</span>
                     </div>
                  </div>
               )}

               {activeTab === 'Items' && (
                  <div className="flex items-center gap-2 mt-2">
                     <input type="checkbox" className="w-3.5 h-3.5" />
                     <span className="text-[11px] text-gray-700">Secondary Selection</span>
                  </div>
               )}

               {activeTab === 'Sales Employees' && (
                  <div className="flex flex-col gap-4 mt-4">
                     <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span className="text-[11px] text-gray-700">Include Inactive Sales Employee</span>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Bottom Controls */}
         <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
               <input type="checkbox" className="w-3.5 h-3.5" />
               <span className="text-[11px] text-gray-700 underline underline-offset-2">Display Amounts in System Currency</span>
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
