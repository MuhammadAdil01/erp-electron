import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface CompanyDetailsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const CompanyDetailsWindow: React.FC<CompanyDetailsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'accounting' | 'basic'>('general');
  const [activeLang, setActiveLang] = useState<'local' | 'foreign'>('local');

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

        const minW = 650;
        const minH = 750;

        if (direction.includes('e')) {
          newWidth = Math.max(minW, startWidth + deltaX);
        }
        if (direction.includes('s')) {
          newHeight = Math.max(minH, startHeight + deltaY);
        }
        
        if (direction.includes('w')) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth > minW) {
            newWidth = possibleWidth;
            newX = startXPos + deltaX;
          } else {
            newWidth = minW;
            newX = startXPos + (startWidth - minW);
          }
        }
        
        if (direction.includes('n')) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight > minH) {
            newHeight = possibleHeight;
            newY = startYPos + deltaY;
          } else {
            newHeight = minH;
            newY = startYPos + (startHeight - minH);
          }
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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 transition-colors";
  const sapYellowInputStyle = `${sapInputStyle} bg-[#fffbd0]`;
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer";

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'accounting', label: 'Accounting Data' },
    { key: 'basic', label: 'Basic Initialization' }
  ];

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px]"
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">Company Details</span>
        </div>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Minus className="w-3.5 h-3.5 text-gray-600" />
           </div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Square className="w-3 h-3 text-gray-600" />
           </div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group">
              <X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
           </div>
        </div>
      </div>

      {/* Tab Menu */}
      <div className="flex px-1.5 pt-1.5 gap-[1px] bg-[#ececec]">
        {tabs.map((tab) => (
          <div 
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-x border-t relative overflow-hidden transition-all
              ${activeTab === tab.key 
                ? 'bg-white border-gray-400 z-10 -mb-[1px] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]' 
                : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] border-gray-300 text-gray-600 hover:from-[#f5f5f5] hover:to-[#ebebeb]'}`}
          >
            {tab.label}
            {activeTab === tab.key && <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#ffd700]"></div>}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2.5 overflow-hidden bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner overflow-y-auto custom-scrollbar">
        
        {activeTab === 'general' && (
          <div className="space-y-4">
             {/* Local / Foreign toggle */}
             <div className="flex gap-[1px] border border-gray-300 w-fit p-0.5 bg-gray-50">
               <button 
                 onClick={() => setActiveLang('local')}
                 className={`px-3 py-0.5 text-[10px] rounded-[1px] ${activeLang === 'local' ? 'bg-white shadow-sm border border-gray-300 font-bold' : 'text-gray-600'}`}
               >Local Language</button>
               <button 
                 onClick={() => setActiveLang('foreign')}
                 className={`px-3 py-0.5 text-[10px] rounded-[1px] ${activeLang === 'foreign' ? 'bg-white shadow-sm border border-gray-300 font-bold' : 'text-gray-600'}`}
               >Foreign Language</button>
             </div>

             <div className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1 items-start max-w-xl">
               <span className={sapLabelStyle}>Company Name</span>
               <input type="text" className={sapYellowInputStyle} />
               
               <span className={sapLabelStyle}>Address</span>
               <textarea className="w-full h-16 border border-gray-400 px-1 py-0.5 text-[11px] outline-none resize-none" />

               <span className={sapLabelStyle}>Street/PO Box</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Street No.</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Block</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Building/Floor/Room</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>City</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Zip Code</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>County</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>State</span>
               <select className={sapInputStyle}><option></option></select>

               <span className={sapLabelStyle}>Country/Region</span>
               <select className={sapInputStyle}><option></option></select>

               <span className={sapLabelStyle}>Internet Address</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Printing Header</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Active Manager</span>
               <input type="text" className={sapInputStyle} />

               <div className="col-span-2 h-2"></div>

               <span className={sapLabelStyle}>Alias Name</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Telephone 1</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Telephone 2</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Fax</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>E-Mail</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>GLN</span>
               <input type="text" className={sapInputStyle} />
             </div>
          </div>
        )}

        {activeTab === 'accounting' && (
          <div className="space-y-4 max-w-xl">
             <div className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-1 items-start">
               <span className={sapLabelStyle}>Tax Office</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Federal Tax ID 1</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Federal Tax ID 2</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Federal Tax ID 3</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Additional ID</span>
               <input type="text" className={sapInputStyle} />

               <div className="col-span-2 h-4 border-b border-gray-100"></div>

               <span className={sapLabelStyle}>Company Tax Rate</span>
               <input type="text" className={sapInputStyle} defaultValue="0.00" />

               <span className={sapLabelStyle}>Exemption Number</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Tax Deduction Number</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>Tax Official</span>
               <input type="text" className={sapInputStyle} />

               <div className="col-span-2 h-2"></div>

               <div className="col-start-2 flex items-center gap-2 py-1">
                 <input type="checkbox" className={sapCheckboxStyle} />
                 <span className={sapLabelStyle}>Use Deferred Tax</span>
               </div>

               <div className="col-start-2 flex items-center gap-2 py-1">
                 <input type="checkbox" className={sapCheckboxStyle} />
                 <span className={sapLabelStyle}>Apply Exchange Rate on Deferred Tax</span>
               </div>

               <span className={sapLabelStyle}>Tax Rate Determination</span>
               <select className={sapInputStyle}><option>Posting Date</option></select>

               <span className={sapLabelStyle}>Holidays</span>
               <div className="flex bg-[#fffbd0] border border-gray-400 h-[18px] items-center">
                 <ChevronRight className="w-3 h-3 text-orange-500 mx-0.5" />
                 <select className="flex-1 bg-transparent border-none outline-none text-[11px] h-full"><option>Australian Holidays</option></select>
               </div>

               <div className="col-start-2 flex items-center gap-2 py-1">
                 <input type="checkbox" className={sapCheckboxStyle} />
                 <span className={sapLabelStyle}>Extended Tax Reporting</span>
               </div>

               <div className="col-span-2 h-4"></div>

               <span className={sapLabelStyle}>EORI Number</span>
               <input type="text" className={sapInputStyle} />

               <div className="col-start-2 flex items-center gap-2 py-1">
                 <input type="checkbox" className={sapCheckboxStyle} />
                 <span className={sapLabelStyle}>Allow External Calculation of Tax on A/R Documents</span>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'basic' && (
          <div className="space-y-4">
             <div className="grid grid-cols-[180px_1fr] gap-x-3 gap-y-1 items-start max-w-xl">
               <span className={sapLabelStyle}>Chart of Accounts Template</span>
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" defaultValue="User-Defined" readOnly />

               <span className={sapLabelStyle}>Local Currency</span>
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" defaultValue="Pakistani Rupee" readOnly />

               <span className={sapLabelStyle}>System Currency</span>
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" defaultValue="Pakistani Rupee" readOnly />

               <span className={sapLabelStyle}>Default Account Currency</span>
               <select className={sapInputStyle}><option>All Currencies</option></select>

               <div className="col-start-2 space-y-1 py-1">
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Display Credit Balance with Negative Sign</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Use Segmentation Accounts</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Allow Negative Amounts for Reversal Transaction Posting</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Permit More than One Document Type per Series</span>
                 </div>
                 <div className="flex items-center gap-2 pt-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Multi-Language Support</span>
                 </div>
                 <div className="col-span-2 h-2"></div>
                 <div className="flex items-start gap-2 pt-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <div className="flex-1">
                      <span className={sapLabelStyle}>Use Perpetual Inventory</span>
                      <div className="grid grid-cols-[150px_1fr] gap-2 mt-1">
                        <span className={sapLabelStyle}>Item Groups Valuation Method</span>
                        <select className={sapInputStyle}><option>FIFO</option></select>
                        <div className="col-start-2 space-y-1">
                           <div className="flex items-center gap-2">
                             <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                             <span className={sapLabelStyle}>Manage Item Cost per Warehouse</span>
                           </div>
                           <div className="flex items-center gap-2 opacity-50">
                             <input type="checkbox" className={sapCheckboxStyle} disabled />
                             <span className={sapLabelStyle}>Use Purchase Accounts Posting System</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" className={sapCheckboxStyle} />
                             <span className={sapLabelStyle}>Allow Stock Release Without Item Cost</span>
                           </div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        <span className={sapLabelStyle}>Manage Serial and Batch Cost By</span>
                        <div className="pl-4 space-y-1">
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="serial" className="w-3 h-3" defaultChecked />
                             <span className={sapLabelStyle}>Items Group Valuation Method</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                             <input type="radio" name="serial" className="w-3 h-3" />
                             <span className={sapLabelStyle}>Serial/Batch Valuation Method</span>
                           </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Enable Separate Net and Gross Price Mode</span>
                      </div>
                   </div>
                 </div>
               </div>

               <div className="col-span-2 h-2 border-b border-gray-100"></div>

               <span className={sapLabelStyle}>Ordering Party</span>
               <input type="text" className={sapInputStyle} />

               <span className={sapLabelStyle}>House Bank</span>
               <select className={sapInputStyle}><option></option></select>

               <span className={sapLabelStyle}>Default Bank Country/Region</span>
               <select className={sapInputStyle}><option></option></select>

               <span className={sapLabelStyle}>Default Bank</span>
               <select className={sapInputStyle}><option></option></select>

               <span className={sapLabelStyle}>Default Account No.</span>
               <div className="flex items-center border border-gray-400 h-[18px]">
                 <input type="text" className="flex-1 outline-none px-1 text-[11px] h-full" />
                 <ChevronRight className="w-4 h-4 text-gray-500 bg-gray-100 border-l border-gray-400 rotate-45 mb-1 mr-0.5" />
               </div>

               <span className={sapLabelStyle}>Default Branch</span>
               <input type="text" className="w-full h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" readOnly />

               <div className="col-start-2 flex items-center gap-2 pt-1">
                 <input type="checkbox" className={sapCheckboxStyle} />
                 <span className={sapLabelStyle}>Install Bank Statement Processing</span>
               </div>

               <div className="col-start-2 space-y-1 pt-4">
                 <div className="flex items-start gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <div className="flex-1">
                      <span className={sapLabelStyle}>Enable Fixed Assets</span>
                      <div className="grid grid-cols-[120px_1fr] gap-2 mt-1">
                        <span className={sapLabelStyle}>Calculate Depreciation By</span>
                        <select className={`${sapYellowInputStyle} !w-32`}><option>Month</option></select>
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Enable Multiple Branches</span>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-[40px] px-3 bg-[#ececec] flex items-center gap-2 border-t border-gray-300">
        <button className={sapButtonStyle}>Update</button>
        <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
      </div>
    </div>
  );
};
