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

interface UsersSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const UsersSetupWindow: React.FC<UsersSetupWindowProps> = ({
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
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400";
  const sapYellowInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd5]";
  const sapSelectStyle = "w-full h-[18px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-blue-600";

  const tabs = ['General', 'Services', 'Display'];

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
          <span className="text-black font-medium text-[11.5px] tracking-tight">Users - Setup</span>
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

      {/* Header Info */}
      <div className="p-3 bg-white mx-1.5 mt-1.5 border border-gray-400 shadow-inner flex flex-col gap-1">
         <div className="flex gap-16">
            <div className="flex items-center gap-2">
               <input type="checkbox" className={sapCheckboxStyle} />
               <span className={sapLabelStyle}>Superuser</span>
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" className={sapCheckboxStyle} />
               <span className={sapLabelStyle}>Mobile User</span>
            </div>
         </div>
         <div className="grid grid-cols-[100px_1fr] gap-x-4 max-w-sm mt-1">
            <span className={sapLabelStyle}>User Code</span>
            <input type="text" className={sapYellowInputStyle} />
            <span className={sapLabelStyle}>User Name</span>
            <input type="text" className={sapYellowInputStyle} />
            <span className={sapLabelStyle}>Defaults</span>
            <div className="flex gap-0.5">
               <input type="text" className={sapYellowInputStyle} />
               <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex px-1.5 pt-1.5 bg-[#ececec]">
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
             <div className="grid grid-cols-[180px_1fr] gap-x-4 max-w-sm">
                <span className={sapLabelStyle}>Bind with Microsoft Windows Account</span>
                <input type="text" className={sapInputStyle} />
                <span className={sapLabelStyle}>Employee</span>
                <div className="flex gap-0.5">
                   <select className={sapYellowInputStyle}><option></option></select>
                   <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">i</button>
                </div>
                <span className={sapLabelStyle}>E-Mail</span>
                <input type="text" className={sapYellowInputStyle} />
                <span className={sapLabelStyle}>Mobile Phone</span>
                <input type="text" className={sapYellowInputStyle} />
                <span className={sapLabelStyle}>Mobile Device ID</span>
                <input type="text" className={sapYellowInputStyle} />
                <span className={sapLabelStyle}>Fax</span>
                <input type="text" className={sapYellowInputStyle} />

                <div className="col-span-2 h-2"></div>

                <span className={sapLabelStyle}>Branch</span>
                <select className={sapSelectStyle}><option>PD Office</option></select>
                <span className={sapLabelStyle}>Department</span>
                <select className={sapSelectStyle}><option>General</option></select>
                <span className={sapLabelStyle}>Groups</span>
                <div className="flex gap-0.5">
                   <input type="text" className={sapInputStyle} />
                   <button className="px-1.5 bg-gray-100 border border-gray-400 text-[10px]">...</button>
                </div>
                
                <div className="col-span-2 h-4"></div>

                <span className={sapLabelStyle}>Password</span>
                <input type="password" className={sapInputStyle} defaultValue="****" />
             </div>

             <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Password Never Expires</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Change Password at Next Logon</span>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Locked</span>
                </div>

                <div className="h-4"></div>

                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Enable Setting Integration Packages</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Services' && (
          <div className="space-y-4">
             <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">At the Beginning of Each Session</span>
                <div className="pl-1 space-y-1.5 mt-1">
                   {[
                    'Perform Data Check', 'Open Exchange Rates Table', 'Display Recurring Postings on Execution',
                    'Display Recurring Transactions on Execution'
                   ].map(label => (
                    <div key={label} className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>{label}</span>
                    </div>
                   ))}
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Send Alert for Activities Scheduled for Today</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Display Inbox When New Message Arrives</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Display Latest 100 Messages/Alerts</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Open Postdated Checks Window</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Display Worklist When New Task Arrives</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-[180px_80px] gap-x-4 max-w-sm pt-2">
                <span className={sapLabelStyle}>Update Messages (Min.)</span>
                <input type="text" className={sapYellowInputStyle} defaultValue="5" />
                <span className={sapLabelStyle}>Screen Locking Time (Min.)</span>
                <input type="text" className={sapYellowInputStyle} defaultValue="30" />
                <span className={sapLabelStyle}>Open Postdated Credit Vouchers Window</span>
                <select className={sapSelectStyle}><option>No</option></select>
             </div>

             <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                   <span className={sapLabelStyle}>Show License Information at Startup</span>
                </div>
                
                <div className="space-y-1">
                   <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2 opacity-60">Alternative Keyboard Usage</span>
                   <div className="pl-1 space-y-1 mt-1 opacity-60">
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} disabled />
                         <span className={sapLabelStyle}>Use Numeric Keypad Enter Key as Tab Key</span>
                      </div>
                      <div className="pl-5 space-y-1">
                         <span className="text-[10px] text-gray-500">Use Numeric Keypad Period Key as Separator on Display Tab</span>
                         <span className="text-[10px] text-gray-500 block">Enable Document Operations by Mouse Only (Such as Add, Update, OK)</span>
                      </div>
                   </div>
                </div>

                <div className="pt-2 flex justify-between items-end">
                   <span className="text-[10px] text-blue-700 underline cursor-pointer">Microsoft 365 Account and Export Templates</span>
                   <button className={sapButtonStyle}>Restore Defaults</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Display' && (
          <div className="space-y-4">
             <div className="grid grid-cols-[180px_200px] gap-x-4 max-w-md">
                <span className={sapLabelStyle}>Skin Style</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Color</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Language</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Font</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Font Size</span>
                <select className={sapYellowInputStyle}><option></option></select>
             </div>

             <div className="space-y-1">
                <span className={sapLabelStyle}>Preview</span>
                <div className="w-full h-32 border border-gray-300 bg-white flex items-center justify-center p-4">
                   <span className="text-[16px] text-gray-800">AaBbYyZz - abcd</span>
                </div>
             </div>

             <div className="grid grid-cols-[180px_200px_40px] gap-x-4 items-center">
                <span className={sapLabelStyle}>Background</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <button className="px-1.5 h-[18px] bg-gray-100 border border-gray-400 text-[10px]">...</button>
             </div>

             <div className="space-y-1">
                <span className={sapLabelStyle}>Preview</span>
                <div className="w-full h-32 border border-gray-300 bg-white p-2">
                   <div className="w-full h-full bg-gray-50 border border-dashed border-gray-200"></div>
                </div>
             </div>

             <div className="grid grid-cols-[180px_200px] gap-x-4">
                <span className={sapLabelStyle}>Image Display</span>
                <select className={sapYellowInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Ext. Image Processing</span>
                <select className={sapYellowInputStyle}><option></option></select>
             </div>

             <div className="flex justify-end pt-2">
                <button className={sapButtonStyle}>Restore Defaults</button>
             </div>
          </div>
        )}
      </div>

      <div className="px-3 pb-3">
         <div className="flex items-center gap-2">
            <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
            <span className={sapLabelStyle}>Take Control of eDoc Processing in Electronic Document Monitor</span>
         </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-2 pt-0 flex justify-between bg-[#ececec]">
        <div className="flex gap-1.5">
           <button className={sapActionButtonStyle}>Find</button>
           <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
        </div>
        <div className="flex gap-1.5">
           <button className={sapButtonStyle}>Copy Form Settings</button>
           <button className={sapButtonStyle}>Authorizations</button>
           <button className={sapButtonStyle}>Licenses</button>
        </div>
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
