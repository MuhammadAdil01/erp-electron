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

interface PrintPreferencesWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const PrintPreferencesWindow: React.FC<PrintPreferencesWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState('General');

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

        const minW = 550;
        const minH = 500;

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
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400";
  const sapSelectStyle = "w-full h-[18px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-blue-600";

  const tabs = ['General', 'Per Document', 'Per Report'];

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
          <span className="text-black font-medium text-[11.5px] tracking-tight">Print Preferences</span>
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
      <div className="h-2 bg-[#f39c12] border-b border-gray-400"></div>

      {/* Tabs */}
      <div className="flex px-1.5 pt-1 bg-[#ececec]">
        {tabs.map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border border-gray-300 relative transition-all -ml-[1px]
              ${activeTab === tab 
                ? 'bg-white border-gray-400 border-b-white z-10 shadow-sm' 
                : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5]'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner overflow-y-auto custom-scrollbar">
        
        {activeTab === 'General' && (
          <div className="space-y-4">
             {/* Numeric Inputs Section */}
             <div className="grid grid-cols-[180px_100px] gap-x-2 gap-y-1.5 items-center max-w-sm">
                <span className={sapLabelStyle}>Max. Rows per Page</span>
                <input type="text" className={`${sapInputStyle} bg-[#fffbd5] text-right`} defaultValue="99" />
                
                <span className={sapLabelStyle}>Print With Vertical Compression</span>
                <select className={sapSelectStyle}><option>100</option></select>

                <span className={sapLabelStyle}>Top Margin (cm)</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Bottom Margin (cm)</span>
                <input type="text" className={sapInputStyle} />

                <span className={sapLabelStyle}>Max. Rows per Page in Export</span>
                <input type="text" className={`${sapInputStyle} text-right`} defaultValue="10" />

                <span className={sapLabelStyle}>When Printing Layout Including SN, Print</span>
                <select className={sapSelectStyle}><option>Serial No.</option></select>
             </div>

             <div className="h-2"></div>

             {/* Checkboxes Section */}
             <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Print Text as Picture</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Print on Letter Paper</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Print SAP Business One Generation Message for PLD</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Print SAP Business One Generation Message for Crystal Reports</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Print Draft Watermark on Draft Documents</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Generate PDF When Printing</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Print Canceled or Cancelation Watermark on Applicable Documents</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Use System Print Preference for Crystal Reports</span>
                </div>
                
                <div className="h-1"></div>
                
                <div className="flex items-start gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={`${sapLabelStyle} leading-[14px] whitespace-normal`}>
                      When Adding Marketing Documents, Payments and Deposits, Use Attachments Folder as Default Path to Export PDFs
                   </span>
                </div>
                <div className="flex items-center gap-2 pl-6">
                   <input type="checkbox" className={sapCheckboxStyle} disabled />
                   <span className={`${sapLabelStyle} text-gray-500`}>Attach Exported PDFs to Marketing Documents, Payments and Deposits</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Per Document' && (
          <div className="space-y-4 flex flex-col h-full">
             <div className="grid grid-cols-[80px_180px_1fr] gap-x-2 items-center">
                <span className={sapLabelStyle}>Document:</span>
                <select className={sapSelectStyle}><option>Journal Entry</option></select>
                <div className="flex items-center gap-2 ml-4">
                   <span className={sapLabelStyle}>Permanent Remarks for Printing</span>
                   <select className={`${sapSelectStyle} !w-32`}><option></option></select>
                </div>
             </div>

             <div className="grid grid-cols-[1fr_200px] gap-x-4 flex-1">
                <div className="space-y-4">
                   <div className="space-y-1 mt-2">
                      <span className="text-[11px] font-bold text-gray-700">Print Layout Designer and Crystal Reports Preferences</span>
                      <div className="bg-[#f8f8f8] border border-gray-200 p-2 space-y-1.5">
                         <span className="text-[10.5px] font-medium text-blue-800 underline underline-offset-2">When Adding Document:</span>
                         <div className="space-y-1 pl-1">
                            <div className="flex items-center gap-2">
                               <input type="checkbox" className={sapCheckboxStyle} />
                               <span className={sapLabelStyle}>Print Document</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <input type="checkbox" className={sapCheckboxStyle} />
                               <span className={sapLabelStyle}>E-Mail Document</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <input type="checkbox" className={sapCheckboxStyle} />
                               <span className={sapLabelStyle}>Export to PDF</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-700">Print Layout Designer Preferences Only</span>
                      <textarea className="w-full h-24 border border-gray-400 p-1 text-[11px] outline-none bg-white resize-none"></textarea>
                   </div>
                </div>

                <div className="flex flex-col pt-6">
                   <div className="w-full h-full border border-gray-300 bg-white"></div>
                </div>
             </div>

             <div className="h-[1px] bg-gray-300 my-2"></div>

             <div className="space-y-2">
                <div className="grid grid-cols-[100px_1fr_150px] gap-2 items-center">
                   <span className={sapLabelStyle}>E-Mail Subject</span>
                   <input type="text" className={`${sapInputStyle} bg-[#fffbd5]`} />
                   <button className={`${sapButtonStyle} !py-0 !h-5 !text-[7px]`}>Inserted Predefined Texts</button>
                </div>
                <div className="space-y-1">
                   <span className={sapLabelStyle}>E-Mail Body</span>
                   <div className="relative">
                      <textarea className="w-full h-32 border border-gray-400 p-1 text-[11px] outline-none bg-white resize-none"></textarea>
                      <div className="absolute bottom-[-24px] right-0">
                         <button className={`${sapButtonStyle} !py-0 !h-5 !text-[10px]`}>Inserted Predefined Texts</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Per Report' && (
          <div className="space-y-4 flex flex-col h-full">
             <div className="grid grid-cols-[80px_230px] gap-x-2 items-center">
                <span className={sapLabelStyle}>Report</span>
                <select className={`${sapSelectStyle} bg-[#fffbd5]`}><option>Aging Report</option></select>
             </div>

             <div className="space-y-3 pt-2">
                <div className="grid grid-cols-[100px_1fr_150px] gap-2 items-center">
                   <span className={sapLabelStyle}>E-Mail Subject</span>
                   <input type="text" className={sapInputStyle} />
                   <button className={`${sapButtonStyle} !py-0 !h-5 !text-[7px]`}>Inserted Predefined Texts</button>
                </div>

                <div className="space-y-1">
                   <span className={sapLabelStyle}>E-Mail Body</span>
                   <div className="relative">
                      <textarea className="w-full h-64 border border-gray-400 p-1 text-[11px] outline-none bg-white resize-none"></textarea>
                      <div className="absolute bottom-[-24px] right-0">
                         <button className={`${sapButtonStyle} !py-0 !h-5 !text-[10px]`}>Inserted Predefined Texts</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="p-2 pt-0 flex gap-1.5 shrink-0">
        <button className={sapButtonStyle}>Update</button>
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
