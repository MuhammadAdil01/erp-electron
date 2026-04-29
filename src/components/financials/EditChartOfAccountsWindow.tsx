import React, { useState } from 'react';
import { ResizableCriteriaWindow } from '../ui/ResizableCriteriaWindow';
import { WindowManagerReturn } from '../../hooks/useWindowManager';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
  wm: WindowManagerReturn;
}

const YellowArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
    <path d="M4 12H16M16 12L10 6M16 12L10 18" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EditChartOfAccountsWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus, wm }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const items = [
    'Assets',
    'Liabilities',
    'Capital and Reserves',
    'Revenue',
    'Cost of sales',
    'Operating costs',
    'Non-operating income and expenditure',
    'Taxation and Extraordinary Items',
    '#9',
    '#10'
  ];

  const handleToggle = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSelectAll = () => setSelectedItems(items);
  const handleClearSelection = () => setSelectedItems([]);

  const handleItemClick = (item: string) => {
    // Open a generic window for data not provided
    wm.openWindow('dataNotProvided', `Data Not Provided - ${item}`);
  };

  return (
    <ResizableCriteriaWindow
      title="Edit Chart of Accounts - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={350}
      initialHeight={350}
      footer={
        <div className="h-[40px] p-2 flex items-center justify-between mb-1 shrink-0 bg-[#f0f0f0] gap-2">
           <div className="flex gap-2">
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
           </div>
           <div className="flex gap-2">
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={handleSelectAll}>Select All</button>
              <button className="w-[95px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={handleClearSelection}>Clear Selection</button>
           </div>
        </div>
      }
    >
      <div className="flex-1 p-4 bg-white overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 min-h-[16px]">
            <input 
              type="checkbox" 
              className="w-3.5 h-3.5 cursor-pointer" 
              checked={selectedItems.includes(item)}
              onChange={() => handleToggle(item)}
            />
            <div className="mt-0.5 cursor-pointer" onClick={() => handleItemClick(item)}><YellowArrow /></div>
            <span 
               className="text-[11px] text-gray-800 cursor-pointer hover:underline pl-0.5"
               onClick={() => handleItemClick(item)}
            >
               {item}
            </span>
          </div>
        ))}
      </div>
    </ResizableCriteriaWindow>
  );
};
