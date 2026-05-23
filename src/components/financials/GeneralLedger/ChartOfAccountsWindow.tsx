import React, { useState } from 'react';
import { X, Minus, Square, ChevronDown } from 'lucide-react';

interface ChartOfAccountsWindowProps {
  onClose: () => void;
  onFocus: () => void;
  windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
  };
  onUpdateState: (state: Partial<ChartOfAccountsWindowProps['windowState']>) => void;
}

export const ChartOfAccountsWindow: React.FC<ChartOfAccountsWindowProps> = ({
  onClose,
  onFocus,
  windowState,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState('Assets');
  const isMaximized = windowState.isMaximized;

  const sapLabelStyle = "text-[11px] text-[#333333] font-medium whitespace-nowrap";
  const sapInputStyle = "text-[11px] border border-gray-300 px-1 py-0.5 bg-white focus:border-blue-500 focus:outline-none rounded-[1px]";
  const sapCheckboxStyle = "w-3 h-3 border-gray-300 rounded-[1px] accent-blue-600";
  const sapButtonStyle = "px-4 py-0.5 text-[11px] font-medium border border-gray-400 rounded-[1px] shadow-sm hover:bg-gray-100 transition-colors";

  const categories = [
    'Assets', 'Liabilities', 'Capital and Reserves', 'Revenue',
    'Cost of sales', 'Operating costs', 'Non-operating income and expenditure',
    'Taxation and Extraordinary Items', '#9', '#10'
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();

    if (isMaximized) return;

    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();

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

      if (direction.includes('e')) newWidth = Math.max(600, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(400, startHeight + deltaY);

      if (direction.includes('w')) {
        newWidth = Math.max(600, startWidth - deltaX);
        if (newWidth > 600) newX = startXPos + deltaX;
      }

      if (direction.includes('n')) {
        newHeight = Math.max(400, startHeight - deltaY);
        if (newHeight > 400) newY = startYPos + deltaY;
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
      onClick={onFocus}
      style={{
        position: 'absolute',
        left: isMaximized ? 0 : windowState.x,
        top: isMaximized ? 0 : windowState.y,
        width: isMaximized ? '100%' : windowState.width,
        height: isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        border: '1px solid #999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        userSelect: 'none',
      }}
      className="chart-of-accounts-window"
    >
      {/* Resize Handles */}
      {!isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-7 bg-[#e1e1e1] flex items-center justify-between px-2 cursor-default border-b border-[#ccc]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#444]">Chart of Accounts</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMinimized: true }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMaximized: !isMaximized }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Square className="w-3 h-3 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gold accent bar */}
      <div className="h-1 bg-[#e8a01c] w-full" />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">

        {/* Left Side: G/L Account Details */}
        <div className="w-[380px] flex flex-col space-y-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#003399] underline decoration-blue-800 underline-offset-2 italic">G/L Account Details</span>

            <div className="flex items-center gap-16 ml-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="accType" className="w-3.5 h-3.5" />
                <span className={sapLabelStyle}>Title</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="accType" defaultChecked className="w-3.5 h-3.5" />
                <span className={sapLabelStyle}>Active Account</span>
              </label>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
              <span className={sapLabelStyle}>G/L Account</span>
              <input type="text" className={`${sapInputStyle} w-full bg-[#ffffe0] border-black/30 shadow-inner`} />

              <span className={sapLabelStyle}>Name</span>
              <input type="text" className={`${sapInputStyle} w-full`} />

              <span className={sapLabelStyle}>Dev/Non-Dev</span>
              <input type="text" className={`${sapInputStyle} w-full`} />

              <span className={sapLabelStyle}>Currency</span>
              <select className={`${sapInputStyle} w-full`}>
                <option>Pakistani Rupee</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Confidential</span>
            </label>
            <div className="flex items-center gap-2">
              <span className={sapLabelStyle}>Level</span>
              <input type="text" className={`${sapInputStyle} w-16 text-center bg-gray-100`} defaultValue="2" />
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
            <span className={sapLabelStyle}>Balance</span>
            <div className="flex items-center gap-1">
              <input type="text" className={`${sapInputStyle} w-24 bg-gray-100 text-right`} defaultValue="0.00" />
              <select className={`${sapInputStyle} w-16`}>
                <option>PKR</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <span className="text-[11px] font-bold text-[#003399] underline decoration-blue-800 underline-offset-2 italic">G/L Account Properties</span>

            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
              <span className={sapLabelStyle}>Account Type</span>
              <select className={`${sapInputStyle} w-full`}>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-y-0.5 ml-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Control Account</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Indexed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Cash Account</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Reval. (Currency)</span>
              </label>
            </div>

            <div className="space-y-0.5 pt-2 ml-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Block Manual Posting</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Cash Flow Relevant</span>
              </label>
            </div>
          </div>

          <div className="space-y-1 pt-4">
            <span className="text-[11px] font-bold text-gray-700">Relevant for Cost Accounting</span>
            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Project</span>
              </label>
              <input type="text" className={`${sapInputStyle} bg-[#ffffe0] w-32`} />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-700">Distribution Rule</span>
            <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Departments</span>
              </label>
              <input type="text" className={`${sapInputStyle} bg-[#ffffe0] w-32`} />
            </div>
          </div>
        </div>

        {/* Center Section: Tree View */}
        <div className="flex-1 flex flex-col bg-white border border-gray-400 overflow-hidden relative shadow-inner">
          <div className="bg-[#e4e4e4] px-2 py-1 flex items-center justify-between border-b border-gray-300">
            <div className="flex items-center gap-2">
              <ChevronDown className="w-3 h-3 text-gray-600" />
              <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400">Assets</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 pt-1 font-mono text-[10.5px]">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1.5 pl-0 cursor-pointer hover:bg-blue-50">
                <ChevronDown className="w-3 h-3 text-blue-800" />
                <span className="text-blue-800 font-bold underline">A1 - Non Current Assets</span>
              </div>
              <div className="flex flex-col space-y-1 pl-4">
                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-blue-50">
                  <ChevronDown className="w-3 h-3 text-blue-700" />
                  <span className="text-blue-700 font-bold">A101 - "PROPERTY, PLANT & EQUIPMENT"</span>
                </div>
                <div className="flex flex-col space-y-1 pl-4">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:bg-blue-50">
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600 font-bold">A10101 - OPERATING FIXED ASSETS</span>
                  </div>
                  <div className="flex flex-col space-y-0.5 pl-8 text-gray-700">
                    <span className="hover:text-blue-600 cursor-pointer">A101010001 - Building</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010002 - Furniture & Fixture</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010003 - Tools & Equipment</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010004 - Office Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010005 - Electric Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010006 - Fire Equipment</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010007 - Vehicles</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010008 - Horticulture Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010009 - Security Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010010 - IT Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010011 - Electric Instalations</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010012 - Engineering Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010013 - Lab Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010014 - Containerized Offices</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010015 - New Office Complex</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010016 - Computer Equipment</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101010017 - Crockery & Cutlery</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1 pl-4 pt-1">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:bg-blue-50">
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600 font-bold">A10102 - meezan bank</span>
                  </div>
                  <div className="flex flex-col space-y-0.5 pl-8 text-gray-700">
                    <span className="hover:text-blue-600 cursor-pointer">A101020001 - Acc Depn-Building</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020002 - Acc Depn-Furniture & Fixture</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020003 - Acc Depn-Tools & Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020004 - Acc Depn-Office Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020005 - Acc Depn-Electric Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020006 - Acc Depn-Fire Equipment</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020007 - Acc Depn-Vehicles</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020008 - Acc Depn-Horticulture Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020009 - Acc Depn-Security Equipments</span>
                    <span className="hover:text-blue-600 cursor-pointer">A101020010 - Acc Depn-IT Equipments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f0f0f0] border-t border-gray-300 p-2 flex items-center justify-end gap-2 text-[11px]">
            <span className="text-gray-600">Level</span>
            <input type="text" className={`${sapInputStyle} w-24 text-center`} defaultValue="10" />
          </div>
        </div>

        {/* Right Section: Category Tabs */}
        <div className="w-[110px] flex flex-col pt-1">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`
                h-[45px] text-[10px] font-bold border border-gray-400 border-b-0
                flex items-center justify-center text-center px-1 leading-tight
                transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]
                ${idx === categories.length - 1 ? 'border-b' : ''}
                ${activeTab === cat
                  ? 'bg-white text-black translate-x-[-2px] z-10 border-r-0'
                  : 'bg-gradient-to-b from-[#f2f2f2] to-[#d0d0d0] text-gray-700 hover:from-gray-100'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="h-10 px-3 flex items-center gap-2 border-t border-gray-300 bg-[#f0f0f0]">
        <button className={`${sapButtonStyle} bg-[#ffed99] hover:bg-[#e8a01c]`}>Find</button>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={`${sapButtonStyle} bg-[#ffed99] hover:bg-[#e8a01c]`}
        >
          Cancel
        </button>
        <button className="px-10 py-0.5 text-[11px] font-medium border border-gray-400 rounded-[1px] bg-[#e1e1e1] text-gray-500 cursor-not-allowed ml-8">
          Account Details
        </button>
      </div>
    </div>
  );
};