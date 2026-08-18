import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface UserDefaultsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const UserDefaultsWindow: React.FC<UserDefaultsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState('General');
  const [nestedTab, setNestedTab] = useState('Local Language');

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

        const minW = 500;
        const minH = 550;

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
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapYellowInputStyle = "w-[124px] h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]";
  const sapSelectStyle = "w-full h-[18px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapTextareaStyle = "w-full h-12 border border-gray-400 px-1 py-0.5 text-[11px] outline-none focus:border-orange-400 resize-none";

  const tabs = ['General', 'Defaults', 'Display', 'Print', 'Credit Cards', 'Path'];
  const nestedTabs = ['Local Language', 'Foreign Language'];

  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-blue-600";
  const sapSectionTitleStyle = "text-[11px] font-bold text-gray-800 underline underline-offset-2 mb-2 block";

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
      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">User Defaults</span>
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

      {/* Ribbon */}
      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      {/* Header Info */}
      <div className="p-3 pb-1 flex flex-col gap-1.5">
         <div className="grid grid-cols-[100px_1fr] gap-x-4 max-w-sm">
            <span className={sapLabelStyle}>Code</span>
            <input type="text" className={sapYellowInputStyle} />
            <span className={sapLabelStyle}>Description</span>
            <input type="text" className={sapInputStyle} />
         </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex px-1.5 pt-1.5 bg-[#ececec] shrink-0">
        {tabs.map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border border-gray-300 relative transition-all -ml-[1px]
              ${activeTab === tab 
                ? 'bg-white border-gray-400 border-b-white z-10' 
                : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5]'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner relative">
        
        {activeTab === 'General' && (
          <div className="h-full flex flex-col">
            {/* Nested Tabs */}
            <div className="flex px-1 pt-1 bg-white shrink-0">
              {nestedTabs.map((nt) => (
                <div 
                  key={nt}
                  onClick={() => setNestedTab(nt)}
                  className={`px-4 py-0.5 text-[10.5px] cursor-default rounded-t-[2px] border border-gray-300 relative -ml-[1px]
                    ${nestedTab === nt 
                      ? 'bg-white border-gray-400 border-b-white z-20 font-bold' 
                      : 'bg-[#f0f0f0] text-gray-500 hover:bg-gray-100'}`}
                >
                  {nt}
                </div>
              ))}
            </div>

            {/* Inner Content Box */}
            <div className="flex-1 border border-gray-400 bg-white p-3 overflow-hidden shadow-sm">
               {nestedTab === 'Local Language' && (
                  <div className="space-y-1.5 max-w-sm">
                     <div className="grid grid-cols-[100px_1fr] gap-x-4">
                        <span className={sapLabelStyle}>Address</span>
                        <textarea className={sapTextareaStyle}></textarea>
                     </div>
                     <div className="grid grid-cols-[100px_1fr] gap-x-4 items-center">
                        <span className={sapLabelStyle}>Country/Region</span>
                        <div className="relative">
                           <select className={sapSelectStyle}><option></option></select>
                           <div className="absolute right-0 top-0 bottom-0 px-1 flex items-center pointer-events-none bg-gray-100 border-l border-gray-400 h-full">
                              <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-700"></div>
                           </div>
                        </div>
                     </div>
                     {[
                      'Additional ID', 'Printing Header', 'Tel. 1', 'Telephone 2', 'Fax', 'E-Mail'
                     ].map(label => (
                        <div key={label} className="grid grid-cols-[100px_1fr] gap-x-4 items-center">
                           <span className={sapLabelStyle}>{label}</span>
                           <input type="text" className={sapInputStyle} />
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'Defaults' && (
          <div className="h-full flex flex-col p-2 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-[150px_200px] gap-y-1.5 items-center">
              <span className={sapLabelStyle}>Time Format</span>
              <select className={sapSelectStyle}><option>24H</option></select>
              <span className={sapLabelStyle}>Date Format</span>
              <select className={sapSelectStyle}><option>DD.MM.YY</option></select>
              <span className={sapLabelStyle}>Date Separator</span>
              <select className={sapSelectStyle}><option>.</option></select>
              
              <div className="h-2 col-span-2" />
              
              <span className={sapLabelStyle}>Decimal Separator</span>
              <input type="text" className={sapInputStyle} defaultValue="." />
              <span className={sapLabelStyle}>Thousands Separator</span>
              <input type="text" className={sapInputStyle} defaultValue="," />
              
              <div className="h-2 col-span-2" />
              
              <span className={sapLabelStyle}>Sales Employee</span>
              <div className="relative">
                <select className={sapSelectStyle}><option>-No Sales Employee-</option></select>
              </div>
              
              <span className={sapLabelStyle}>Warehouse</span>
              <div className="flex gap-0.5">
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
              </div>
              <span className={sapLabelStyle}>Cash on Hand</span>
              <div className="flex gap-0.5">
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
              </div>
              <span className={sapLabelStyle}>Checks Received</span>
              <div className="flex gap-0.5">
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
              </div>
              <span className={sapLabelStyle}>Default Customer for A/R Invoice and Payment</span>
              <div className="flex gap-0.5">
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
              </div>
            </div>

            <div className="space-y-1.5 mt-auto pt-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Use Warehouse Address in A/P Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Allow Creating Fixed Assets in Marketing Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Take Control of eDoc Processing in Electronic Document Monitor</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Display' && (
          <div className="h-full flex flex-col p-2 space-y-4">
            <div className="grid grid-cols-[150px_200px] gap-y-1.5 items-center">
               <span className={sapLabelStyle}>Skin Style</span>
               <select className={sapSelectStyle}><option></option></select>
               <span className={sapLabelStyle}>Color</span>
               <select className={sapSelectStyle}><option></option></select>
               <span className={sapLabelStyle}>Language</span>
               <select className={sapSelectStyle}><option></option></select>
               <span className={sapLabelStyle}>Font</span>
               <select className={sapSelectStyle}><option></option></select>
               <span className={sapLabelStyle}>Font Size</span>
               <select className={sapSelectStyle}><option></option></select>
            </div>
            
            <div className="space-y-1">
               <span className={sapLabelStyle}>Preview</span>
               <div className="w-full h-24 border border-gray-300 bg-white flex items-center justify-center">
                  <span className="text-sm">AaBbYyZz - abcd</span>
               </div>
            </div>

            <div className="grid grid-cols-[150px_150px_60px] gap-x-1 items-center">
               <span className={sapLabelStyle}>Background</span>
               <input type="text" className={sapInputStyle} />
               <button className={sapButtonStyle}>Browse...</button>
            </div>

            <div className="space-y-1">
               <span className={sapLabelStyle}>Preview</span>
               <div className="w-full h-24 border border-dashed border-gray-400 bg-[#f9f9f9]"></div>
            </div>

            <div className="grid grid-cols-[150px_200px] items-center">
               <span className={sapLabelStyle}>Image Display</span>
               <select className={sapSelectStyle}><option></option></select>
            </div>
          </div>
        )}

        {activeTab === 'Print' && (
          <div className="h-full flex flex-col p-2 space-y-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-[150px_200px] items-center">
               <span className={sapLabelStyle}>Document:</span>
               <select className={sapSelectStyle}><option>A/R Invoice</option></select>
            </div>

            <div className="space-y-2">
               <span className={sapSectionTitleStyle}>Print Layout Designer and Crystal Report Properties:</span>
               <div className="grid grid-cols-[150px_1fr] gap-x-4">
                  <span className={sapLabelStyle}>When Adding Document</span>
                  <div className="space-y-1 text-[11px] text-gray-700">
                     {['Export to MS-Word', 'Print Document', 'E-Mail Document', 'Export to PDF'].map(label => (
                        <div key={label} className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} />
                           <span>{label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-[150px_60px] gap-y-1.5 items-center">
               <span className={sapLabelStyle}>Copies (Incl. Original)</span>
               <input type="text" className={sapInputStyle} defaultValue="1" />
               <span className={sapLabelStyle}>Copies for Manual Series</span>
               <input type="text" className={sapInputStyle} defaultValue="1" />
            </div>

            <div className="grid grid-cols-[150px_1fr] gap-x-4">
               <span className={sapLabelStyle}>Permanent Remarks for Printing</span>
               <textarea className={sapTextareaStyle}></textarea>
            </div>

            <div className="space-y-2 pt-2">
               <span className={sapSectionTitleStyle}>Print Layout Designer Only Properties:</span>
               <div className="grid grid-cols-[150px_100px] items-center">
                  <span className={sapLabelStyle}>Print Payment with Invoice</span>
                  <select className={sapSelectStyle}><option>No</option></select>
               </div>
               <div className="space-y-1">
                  {[
                    'Print Payment & Invoice in Succession', 
                    'Print Discount Data', 
                    'Print Mfr Catalog No. instead of Item No.'
                  ].map(label => (
                    <div key={label} className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} defaultChecked={label === 'Print Discount Data'} />
                       <span className={sapLabelStyle}>{label}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Credit Cards' && (
          <div className="flex-1 flex flex-col border border-gray-400 bg-white overflow-hidden shadow-inner">
             <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 font-medium">
                <div className="w-8 px-1 py-0.5 text-center">#</div>
                <div className="w-32 px-2 py-0.5">Credit Card</div>
                <div className="w-32 px-2 py-0.5">G/L Account</div>
                <div className="flex-1 px-2 py-0.5">Account Name</div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_19px,#f5f5f5_19px,#f5f5f5_20px)]">
                {Array(20).fill(null).map((_, i) => (
                   <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[20px] items-center hover:bg-blue-50">
                      <div className="w-8 px-1 text-center text-gray-400">{i + 1}</div>
                      <div className="w-32 px-2"></div>
                      <div className="w-32 px-2"></div>
                      <div className="flex-1 px-2"></div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'Path' && (
          <div className="h-full flex flex-col p-3 space-y-4">
            <div className="grid grid-cols-[150px_1fr_30px] gap-x-1 items-center">
               <span className={sapLabelStyle}>Attachments Folder</span>
               <input type="text" className={sapInputStyle} />
               <button className="h-[18px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[10px] flex items-center justify-center hover:brightness-95 active:shadow-inner">...</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-2 pt-0 flex bg-[#ececec] gap-1.5">
         <button className={sapActionButtonStyle}>Add</button>
         <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
      </div>

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
    </div>
  );
};
