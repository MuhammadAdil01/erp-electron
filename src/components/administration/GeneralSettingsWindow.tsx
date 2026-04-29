import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight, Folder, Lock, Key, UserCog, ChevronDown, FileEdit, ShieldAlert } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface GeneralSettingsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const GeneralSettingsWindow: React.FC<GeneralSettingsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState('BP');
  const [activeInventoryTab, setActiveInventoryTab] = useState('Items');
  const [activeSecurityTab, setActiveSecurityTab] = useState('Password Administration');
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(true);

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

        const minW = 900;
        const minH = 600;

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
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer";

  const tabs = [
    'BP', 'Budget', 'Services', 'Display', 'Font & Bkgd', 'Path', 
    'Inventory', 'Resources', 'Cash Flow', 'Cockpit', 
    'Cost Accounting', 'Pricing', 'Hide Functions', 'QR Codes',
    'Security'
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
          <span className="text-black font-medium text-[11.5px] tracking-tight">General Settings</span>
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

      {/* Multi-Tab Menu */}
      <div className="flex flex-wrap px-1.5 pt-1.5 bg-[#ececec]">
        {tabs.map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1 text-[10px] font-medium cursor-default rounded-t-[3px] border border-gray-300 relative overflow-hidden transition-all -ml-[1px]
              ${activeTab === tab 
                ? 'bg-white border-gray-400 border-b-white z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]' 
                : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5] hover:to-[#ebebeb]'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2.5 overflow-hidden bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner overflow-y-auto custom-scrollbar">
        
        {activeTab === 'BP' && (
          <div className="space-y-4">
             {/* Customer Activity Restrictions */}
             <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 pb-4">
               <div className="space-y-1">
                 <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Customer Activity Restrictions</span>
                 <div className="pl-1 space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Credit Limit</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Commitment Limit</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Consider Deliveries Balance</span>
                    </div>
                 </div>
               </div>

               <div className="pt-5 space-y-1">
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} />
                    <span className={sapLabelStyle}>A/R Invoice</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} />
                    <span className={sapLabelStyle}>Delivery</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} />
                    <span className={sapLabelStyle}>Sales Order</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} />
                    <span className={sapLabelStyle}>Pick List</span>
                 </div>
               </div>

               <div className="space-y-1">
                 <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Set Commission by</span>
                 <div className="pl-1 space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Sales Employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Items</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Customers</span>
                    </div>
                 </div>
               </div>

               <div className="space-y-1">
                 <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Approval Process</span>
                 <div className="pl-1 space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                       <span className={sapLabelStyle}>Enable Approval Process</span>
                    </div>
                    <div className="pl-5 space-y-1">
                       <div className="flex items-center gap-2">
                          <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                          <span className={sapLabelStyle}>Enable Approval Process in DI</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                          <span className={sapLabelStyle}>Enable Updating the Document Generated...</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="checkbox" className={sapCheckboxStyle} />
                          <span className={sapLabelStyle}>Enable Originator to Update the Draft...</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="checkbox" className={sapCheckboxStyle} />
                          <span className={sapLabelStyle}>Enable Authorizer to Update Document...</span>
                       </div>
                    </div>
                 </div>
               </div>
             </div>

             {/* Payment & Defaults */}
             <div className="grid grid-cols-[1.5fr_1fr] gap-8">
               <div className="space-y-1">
                  <div className="grid grid-cols-[200px_1fr] gap-x-2 gap-y-1 items-center">
                    <span className={sapLabelStyle}>Default Payment Method for Customer</span>
                    <select className={sapInputStyle}><option></option></select>
                    
                    <span className={sapLabelStyle}>Default Payment Method for Vendor</span>
                    <select className={sapInputStyle}><option></option></select>

                    <span className={sapLabelStyle}>Submit Credit Vouchers</span>
                    <select className={sapInputStyle}><option>Automatically</option></select>

                    <span className={sapLabelStyle}>Default Dunning Term for Customer</span>
                    <select className={sapInputStyle}><option></option></select>
                  </div>
               </div>

               <div className="space-y-1">
                  <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Payment Terms Preferences</span>
                  <div className="grid grid-cols-[180px_1fr] gap-x-2 gap-y-1 items-center pt-2">
                    <span className={sapLabelStyle}>Default Payment Term for Customer</span>
                    <div className="flex items-center border border-gray-400 h-[18px]">
                       <ChevronRight className="w-3.5 h-3.5 text-orange-400 rotate-0 translate-y-[1px]" />
                       <select className="flex-1 bg-transparent text-[11px] outline-none"><option>- Cash Basis -</option></select>
                    </div>

                    <span className={sapLabelStyle}>Default Payment Term for Vendor</span>
                    <div className="flex items-center border border-gray-400 h-[18px]">
                       <ChevronRight className="w-3.5 h-3.5 text-orange-400 rotate-0 translate-y-[1px]" />
                       <select className="flex-1 bg-transparent text-[11px] outline-none"><option>- Cash Basis -</option></select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-50 mt-2">
                     <input type="checkbox" className={sapCheckboxStyle} />
                     <span className={sapLabelStyle}>Apply Changes in BP Fields to New...</span>
                  </div>
               </div>
             </div>

             {/* Bottom Options */}
             <div className="space-y-1 pt-4">
               <div className="flex items-center gap-2">
                  <input type="checkbox" className={sapCheckboxStyle} />
                  <span className={sapLabelStyle}>Use Shipped Goods Account for Customer</span>
               </div>
               
               <div className="h-4"></div>

               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                    <span className={sapLabelStyle}>Display Inactive Business Partners in Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                    <span className={sapLabelStyle}>Display Inactive Business Partners in Marketing Documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                    <span className={sapLabelStyle}>Display Inactive Contact Persons in Business Partner Master Data</span>
                  </div>
               </div>

               <div className="h-4"></div>

               <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Allow Updating Address ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Enable Data Ownership</span>
                    </div>
                    <div className="grid grid-cols-[150px_1fr] gap-2 pl-5 pt-1">
                       <span className={sapLabelStyle}>Manage Data Ownership By</span>
                       <input type="text" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" defaultValue="Document Only" readOnly />
                    </div>
                 </div>
                 <div className="pt-6">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Set Default Price List in General Settings Instead of...</span>
                    </div>
                 </div>
               </div>

               <div className="pt-4 space-y-1">
                  <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Blanket Agreements</span>
                  <div className="pl-5 space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Allow Multiple Blanket Agreements for Same Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Enable Updating Unit Price/Planned Quantity/Planned Amount...</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'Budget' && (
          <div className="space-y-6 max-w-4xl">
             <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Budget Initialization</span>
             </div>

             <div className="pl-6 space-y-4">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-4">For a Document that Deviates from the Budget:</span>
                
                <div className="flex gap-16 pl-4">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="budgetDeviation" className="w-3.5 h-3.5" defaultChecked />
                      <span className={sapLabelStyle}>Block Deviation from Budget</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="budgetDeviation" className="w-3.5 h-3.5" />
                      <span className={sapLabelStyle}>Warning</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="budgetDeviation" className="w-3.5 h-3.5" />
                      <span className={sapLabelStyle}>Without Warning</span>
                   </label>
                </div>

                <div className="pl-32 space-y-4 pt-2">
                   <div className="space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <input type="radio" name="budgetFrequency" className="w-3.5 h-3.5" defaultChecked />
                         <span className={sapLabelStyle}>For Annual Budget</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                         <input type="radio" name="budgetFrequency" className="w-3.5 h-3.5" />
                         <span className={sapLabelStyle}>For Monthly Budget</span>
                      </label>
                   </div>

                   <div className="space-y-1 pt-2">
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                         <span className={sapLabelStyle}>Purchase Request</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                         <span className={sapLabelStyle}>Purchase Orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                         <span className={sapLabelStyle}>Goods Receipt POs</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                         <span className={sapLabelStyle}>Accounting</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'Services' && (
          <div className="space-y-4 max-w-full">
             <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr] gap-x-8">
                {/* Left Column */}
                <div className="space-y-1">
                   <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">At the Beginning of Each Session</span>
                   <div className="pl-1 space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Perform Data Check</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Open Exchange Rates Table</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Display Recurring Postings on Execution</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Display Recurring Transactions on Execution</span>
                      </div>
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
                        <span className={sapLabelStyle}>Open Window for Credit Voucher Ref. Update</span>
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

                   <div className="pt-4 grid grid-cols-[150px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Update Messages (Min.)</span>
                      <input type="text" className={sapInputStyle} defaultValue="5" />
                      <span className={sapLabelStyle}>Screen Locking Time (Min.)</span>
                      <input type="text" className={sapInputStyle} defaultValue="30" />
                      <span className={sapLabelStyle}>Open Postdated Credit Vouchers Window</span>
                      <select className={sapInputStyle}><option>No</option></select>
                   </div>
                </div>

                {/* Center Column */}
                <div className="space-y-4">
                   <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Internet Definitions</span>
                      <div className="pl-1 mt-1">
                         <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} />
                           <span className={sapLabelStyle}>Use Proxy Server for Web Connection</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-1 pt-4">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Default E-Mail Method</span>
                      <div className="pl-4 space-y-1 mt-1">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="emailMethod" className="w-3.5 h-3.5" defaultChecked />
                            <span className={sapLabelStyle}>SAP Business One Mailer</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="emailMethod" className="w-3.5 h-3.5" />
                            <span className={sapLabelStyle}>Outlook E-Mail</span>
                         </label>
                         <a href="#" className="inline-block text-[10px] text-blue-700 underline pl-1">SAP Business One Microsoft 365 Integration</a>
                      </div>
                   </div>

                   <div className="pt-4 grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Telephone No.</span>
                      <input type="text" className={sapInputStyle} />
                      <span className={sapLabelStyle}>Area Code</span>
                      <input type="text" className={sapInputStyle} />
                      <span className={sapLabelStyle}>For External Line</span>
                      <input type="text" className={sapInputStyle} />
                      <span className={sapLabelStyle}>Map Service</span>
                      <select className={sapInputStyle}><option>Google Map</option></select>
                      <span className={sapLabelStyle}>History / Log</span>
                      <input type="text" className={sapInputStyle} defaultValue="99" />
                   </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                        <span className={sapLabelStyle}>Enable Transaction Notification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                        <span className={sapLabelStyle}>Enable Live Collaboration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Enable Mailer Service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                        <span className={sapLabelStyle}>Enable Alert Service</span>
                      </div>
                      <div className="flex items-center gap-x-2 pt-1">
                         <span className={sapLabelStyle}>Integration Framework Connection Timeout (Seconds)</span>
                         <input type="text" className={`${sapInputStyle} !w-16`} defaultValue="30" />
                      </div>
                   </div>

                   <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Enable Company Specific Mailer Configuration</span>
                   </div>

                   <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 items-center pt-1">
                      <span className={sapLabelStyle}>SMTP Server</span>
                      <input type="text" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" readOnly />
                      <span className={sapLabelStyle}>SMTP Port</span>
                      <input type="text" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" readOnly />
                      <span className={sapLabelStyle}>Authentication</span>
                      <select className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" disabled><option>No Authentication</option></select>
                      <span className={sapLabelStyle}>User Name</span>
                      <input type="text" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" readOnly />
                      <span className={sapLabelStyle}>Password</span>
                      <input type="password" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" readOnly />
                      <span className={sapLabelStyle}>Encoding</span>
                      <select className={sapInputStyle}><option>English</option></select>
                   </div>

                   <div className="pt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Use TLS Encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>HTML Direction Right to Left</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className={sapCheckboxStyle} />
                        <span className={sapLabelStyle}>Include Subject in Message Body</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Bottom Sections */}
             <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Alternative Keyboard Usage</span>
                      <div className="pl-1 mt-1 space-y-1">
                         <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} />
                           <span className={sapLabelStyle}>Use Numeric Keypad ENTER Key as TAB Key</span>
                         </div>
                         <div className="pl-5 space-y-1 opacity-60">
                           <div className="flex items-center gap-2">
                             <input type="checkbox" className={sapCheckboxStyle} disabled />
                             <span className={sapLabelStyle}>Use Numeric Keypad Period Key as Separator on Display Tab</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <input type="checkbox" className={sapCheckboxStyle} disabled />
                             <span className={sapLabelStyle}>Enable Document Operations by Mouse Only (Such as Add, Update, OK)</span>
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Single User Connection</span>
                      <div className="pl-1 mt-1 flex items-center gap-2 font-bold p-1 bg-yellow-50/50 border border-yellow-100/50 w-fit">
                         <button className="px-2 bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10.5px]">...</button>
                      </div>
                   </div>
                </div>

                <div className="pt-10 space-y-2">
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Enable Execution Audit Log for User-Defined Query or Query Generat</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Disable Warning Messages for Link-Type User-Defined Fields in Web Client</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Display' && (
          <div className="space-y-4 max-w-full">
             <div className="grid grid-cols-2 gap-x-12">
                {/* Left Column */}
                <div className="space-y-4">
                   <div className="grid grid-cols-[180px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Language</span>
                      <select className={sapInputStyle}><option>English (United States)</option></select>
                      
                      <span className={sapLabelStyle}>Skin Style</span>
                      <select className={sapInputStyle}><option>Golden Thread</option></select>

                      <span className={sapLabelStyle}>Color</span>
                      <select className={sapInputStyle}><option>Classic</option></select>

                      <span className={sapLabelStyle}>Default Length UoM</span>
                      <select className={sapInputStyle}><option>Metre</option></select>

                      <span className={sapLabelStyle}>Default Weight UoM</span>
                      <select className={sapInputStyle}><option>Gramme</option></select>

                      <span className={sapLabelStyle}>Time Format</span>
                      <select className={sapInputStyle}><option>24H</option></select>

                      <span className={sapLabelStyle}>Date Format</span>
                      <select className={sapInputStyle}><option>DD/MM/YY</option></select>

                      <span className={sapLabelStyle}>Date Separator</span>
                      <input type="text" className={sapInputStyle} defaultValue="." />
                   </div>

                   <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Manage Company Time</span>
                   </div>

                   <div className="grid grid-cols-[180px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Ext. Image Processing</span>
                      <select className={sapInputStyle}><option>Partial</option></select>
                      
                      <span className={sapLabelStyle}>No. of Rows in 'List of Windows'</span>
                      <input type="text" className={sapInputStyle} defaultValue="0" />
                   </div>

                   <div className="pt-4 grid grid-cols-[180px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Default UI Template</span>
                      <div className="flex items-center border border-gray-400 bg-[#fffbd0] h-[18px]">
                         <select className="flex-1 bg-transparent px-1 text-[11px] outline-none"><option></option></select>
                      </div>

                      <div className="col-span-2 pt-2">
                         <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Choose from List Preferences</span>
                         <div className="pt-1 space-y-1">
                            <div className="flex items-center gap-2">
                               <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                               <span className={sapLabelStyle}>Enable SAP Business One Suggest</span>
                            </div>
                            <div className="grid grid-cols-[180px_1fr] gap-x-2 items-center">
                               <span className={sapLabelStyle}>No. of Rows in Choose From List</span>
                               <select className={sapInputStyle}><option>10000</option></select>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-4 space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Search Engine</span>
                      <div className="flex items-center gap-2">
                         <input type="text" className={sapInputStyle} defaultValue="http://www.google.com/search?q={SapName} {FormName} {MessageString} site:sap.com" />
                         <div className="flex items-center bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 h-[18px] px-2 shadow-sm rounded-[1px] cursor-default active:shadow-inner">
                            <span className="text-[10px] font-bold whitespace-nowrap">Default URL</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-800 rotate-90 scale-x-125" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                   <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Decimal Places (0..6)</span>
                   <div className="grid grid-cols-[180px_100px] gap-x-2 gap-y-1 items-center pl-1 mt-1">
                      <span className={sapLabelStyle}>Amounts</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Prices</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Rates</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Quantities</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Percent</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Units</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      <span className={sapLabelStyle}>Decimals in Query</span>
                      <input type="text" className={sapInputStyle} defaultValue="2" />
                      
                      <div className="col-span-2 h-2"></div>
                      
                      <span className={sapLabelStyle}>Decimal Separator</span>
                      <input type="text" className={sapInputStyle} defaultValue="." />
                      <span className={sapLabelStyle}>Thousands Sep.</span>
                      <input type="text" className={sapInputStyle} defaultValue="," />
                   </div>

                   <div className="pt-2 flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={sapLabelStyle}>Display Currency on the Right</span>
                   </div>

                   <div className="pt-4 space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Exchange Rate Posting</span>
                      <div className="pl-4 space-y-1 mt-1">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="exchangeRatePosting" className="w-3.5 h-3.5" defaultChecked />
                            <span className={sapLabelStyle}>Direct</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="exchangeRatePosting" className="w-3.5 h-3.5" />
                            <span className={sapLabelStyle}>Indirect</span>
                         </label>
                      </div>
                   </div>

                   <div className="pt-4 flex items-start gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} />
                      <span className={`${sapLabelStyle} leading-[13px]`}>Enable sidebar in windows to display recommendations and linked dashboards</span>
                   </div>

                   <div className="pt-4 space-y-1">
                      <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Search Preferences</span>
                      <div className="flex items-center gap-2 pl-4 mt-1">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Enable Case Sensitive Search</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Font & Bkgd' && (
          <div className="space-y-6 max-w-full">
             <div className="grid grid-cols-2 gap-x-12 h-full">
                {/* Left Column: Font */}
                <div className="space-y-4 flex flex-col">
                   <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 items-center">
                      <span className={sapLabelStyle}>Font</span>
                      <div className="flex items-center bg-[#fffbd0] border border-gray-400 h-[18px]">
                         <select className="flex-1 bg-transparent px-1 text-[11px] outline-none"><option>Tahoma</option></select>
                      </div>
                      
                      <span className={sapLabelStyle}>Font Size</span>
                      <select className={sapInputStyle}><option>10</option></select>
                   </div>

                   <div className="flex-1 flex flex-col space-y-1 pt-4">
                      <span className={sapLabelStyle}>Preview</span>
                      <div className="flex-1 min-h-[120px] bg-white border border-gray-300 shadow-inner flex items-center justify-center">
                         <span className="text-[20px] text-gray-800" style={{ fontFamily: 'Tahoma' }}>AaBbYyZz - abcd</span>
                      </div>
                   </div>

                   <div className="pt-4 flex items-center gap-2">
                       <input type="checkbox" className={sapCheckboxStyle} />
                       <span className={sapLabelStyle}>Auto Resize User Forms</span>
                   </div>
                </div>

                {/* Right Column: Background */}
                <div className="space-y-4 flex flex-col">
                   <div className="flex items-center gap-2">
                      <span className={sapLabelStyle}>Background</span>
                      <select className={`${sapInputStyle} flex-1`}><option>- Without -</option></select>
                      <button className="px-4 bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-400 text-[10.5px] whitespace-nowrap shadow-sm h-[20px]">Browse...</button>
                   </div>

                   <div className="flex-1 flex flex-col space-y-1 pt-9">
                      <span className={sapLabelStyle}>Preview</span>
                      <div className="flex-1 min-h-[120px] bg-[#f0f0f0] border border-gray-300 shadow-inner">
                      </div>
                   </div>

                   <div className="pt-4 grid grid-cols-[100px_1fr] gap-x-2 items-center">
                      <span className={sapLabelStyle}>Image Display</span>
                      <select className={sapInputStyle}><option>Centralized</option></select>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Path' && (
          <div className="space-y-6 max-w-full pr-4">
             <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Export Word and Excel File To</span>
                <div className="flex gap-12 pl-4 pt-1 mt-1 mb-2">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportTarget" className="w-3.5 h-3.5" defaultChecked />
                      <span className={sapLabelStyle}>Local Folder</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="exportTarget" className="w-3.5 h-3.5" />
                      <span className={sapLabelStyle}>OneDrive</span>
                   </label>
                </div>
             </div>

             <div className="grid grid-cols-[200px_1fr_40px] gap-x-2 gap-y-1 items-center">
                <span className={sapLabelStyle}>Microsoft Word Templates Folder</span>
                <input type="text" className="h-[18px] border border-gray-400 bg-[#fffbd0] px-1 text-[11px]" />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <span className={sapLabelStyle}>Microsoft Excel Folder</span>
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <div className="col-span-3 h-2"></div>

                <span className={sapLabelStyle}>Pictures Folder</span>
                <input type="text" className={sapInputStyle} defaultValue="C:\Users\Administrator\Videos\" />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <span className={sapLabelStyle}>Attachments Folder</span>
                <div className="flex items-center relative gap-1">
                   <input type="text" className={`${sapInputStyle} flex-1`} defaultValue="\\192.168.109.6\b1_shr\Attachments\" />
                   <div className="absolute right-[-140px] top-0">
                      <button className="px-6 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[10.5px] font-bold shadow-sm rounded-[1px] h-[20px] whitespace-nowrap active:shadow-inner">Refresh Paths in Documents</button>
                   </div>
                </div>
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <span className={sapLabelStyle}>Extensions Folder</span>
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <span className={sapLabelStyle}>Current Scanner</span>
                <input type="text" className="h-[18px] border border-gray-400 bg-gray-100 px-1 text-[11px]" defaultValue="Cannot find suitable scanner" readOnly />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>

                <div className="col-span-3 h-4"></div>

                <span className={sapLabelStyle}>XML File Folder</span>
                <input type="text" className={sapInputStyle} />
                <button className="px-1.5 h-[18px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[10px] font-bold">...</button>
             </div>

             <div className="pt-4 flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Block Executable Attachments</span>
                <button className="px-2 h-[16px] bg-gradient-to-b from-white to-gray-200 border border-gray-400 text-[9px] font-bold ml-1">...</button>
             </div>
          </div>
        )}

        {activeTab === 'Inventory' && (
          <div className="flex flex-col h-full -m-2.5 overflow-hidden">
             {/* Inventory Sub-Tabs */}
             <div className="flex px-1.5 pt-1.5 bg-[#ececec] border-b border-gray-400">
               {['Items', 'Planning', 'Reporting'].map((sub) => (
                 <div 
                   key={sub}
                   onClick={() => setActiveInventoryTab(sub)}
                   className={`px-6 py-1 text-[10.5px] font-medium cursor-default rounded-t-[3px] border border-gray-300 relative transition-all -ml-[1px]
                     ${activeInventoryTab === sub 
                       ? 'bg-white border-gray-400 border-b-white z-10' 
                       : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5] hover:to-[#ebebeb]'}`}
                 >
                   {sub}
                 </div>
               ))}
             </div>

             {/* Inventory Content Area */}
             <div className="flex-1 p-2.5 bg-white overflow-y-auto custom-scrollbar">
                
                {activeInventoryTab === 'Items' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-[1.5fr_1fr] gap-x-8">
                        {/* Left Column: Serials & Batches */}
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">nd Batches</span>
                              <div className="grid grid-cols-[200px_1fr] gap-x-2 gap-y-1 items-center pt-2">
                                 <span className={sapLabelStyle}>Management Method</span>
                                 <select className={sapInputStyle}><option>On Every Transaction</option></select>
                                 
                                 <span className={sapLabelStyle}>Unique Serial Numbers by</span>
                                 <select className={sapInputStyle}><option>Serial Number</option></select>

                                 <span className={sapLabelStyle}>Display Batch Quantities By</span>
                                 <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                       <input type="radio" name="batchQtyDisplay" className="w-3.5 h-3.5" defaultChecked />
                                       <span className={sapLabelStyle}>Document Row UoM</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                       <input type="radio" name="batchQtyDisplay" className="w-3.5 h-3.5" />
                                       <span className={sapLabelStyle}>Inventory UoM</span>
                                    </label>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <input type="checkbox" className={sapCheckboxStyle} />
                              <span className={sapLabelStyle}>Auto. Create Equipment Card</span>
                           </div>

                           <div className="grid grid-cols-[200px_1fr] gap-2 items-center">
                              <span className={sapLabelStyle}>Basic Setting for Batch Status</span>
                              <select className={sapInputStyle}><option>Released</option></select>
                           </div>

                           <div className="flex items-center gap-2">
                              <input type="checkbox" className={sapCheckboxStyle} />
                              <span className={sapLabelStyle}>Block Multiple Receipts for Same Batch with Serial/Batch Valuation Method</span>
                           </div>
                        </div>

                        {/* Right Column: Inactive Items */}
                        <div className="space-y-1">
                           <span className={sapLabelStyle}>Display Inactive Items In</span>
                           <div className="pl-1 space-y-1 mt-1">
                              <div className="flex items-center gap-2">
                                 <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                                 <span className={sapLabelStyle}>Reports</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                                 <span className={sapLabelStyle}>Marketing Documents</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div className="grid grid-cols-[200px_1fr] gap-x-2 gap-y-1 items-center max-w-[500px]">
                           <span className={sapLabelStyle}>Default Warehouse</span>
                           <select className={sapInputStyle}><option>General Warehouse</option></select>
                           
                           <span className={sapLabelStyle}>Set G/L Accounts By</span>
                           <select className={`${sapInputStyle} bg-[#fffbd0]`}><option>Item Group</option></select>
                        </div>

                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                           <span className={sapLabelStyle}>Auto. Add All Warehouses to New and Existing Items</span>
                        </div>
                     </div>

                     <div className="border-t border-gray-100 pt-4 space-y-1">
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                           <span className={sapLabelStyle}>Withholding Tax</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                           <span className={sapLabelStyle}>Auto. Add All UoM Group Definitions to New and Existing Items</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                           <span className={sapLabelStyle}>Auto. Add All Package Definitions to New and Existing Items</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} />
                           <span className={sapLabelStyle}>Open Item Master Data Instead of Bill of Materials of a BOM Item When Selecting Link Arrow</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                           <span className={sapLabelStyle}>Duplicate Bar Codes While Duplicating Items</span>
                        </div>
                     </div>
                  </div>
                )}

                {activeInventoryTab === 'Planning' && (
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 pb-2">
                        <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                        <span className={sapLabelStyle}>Consume Forecast</span>
                     </div>

                     <div className="grid grid-cols-[180px_200px] gap-x-2 gap-y-1 items-center">
                        <span className={sapLabelStyle}>Consumption Method</span>
                        <select className={sapInputStyle}><option>Backward-Forward</option></select>
                        
                        <span className={sapLabelStyle}>Days Backward</span>
                        <input type="text" className={sapInputStyle} defaultValue="7" />
                        
                        <span className={sapLabelStyle}>Days Forward</span>
                        <input type="text" className={sapInputStyle} defaultValue="7" />
                     </div>
                  </div>
                )}

                {activeInventoryTab === 'Reporting' && (
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2 tracking-tight">Inventory Valuation Simulation Report</span>
                        <div className="pl-1 space-y-1 mt-1">
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <input type="radio" name="valuationReport" className="w-3.5 h-3.5" defaultChecked />
                             <span className={sapLabelStyle}>Classic Valuation Report, Excluding Item Master Valuation</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer group">
                             <input type="radio" name="valuationReport" className="w-3.5 h-3.5" />
                             <span className={sapLabelStyle}>Enhanced Valuation Report, Including All Valuation Methods</span>
                           </label>
                        </div>
                     </div>

                     <div className="space-y-2 pt-4">
                        <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2 tracking-tight">Batches and Serials Trace Reports</span>
                        <div className="pl-1 space-y-1 mt-1">
                           <div className="flex items-center gap-2">
                              <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                              <span className={sapLabelStyle}>Omit Disassembly Transactions to Improve Performance</span>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

             </div>
          </div>
        )}

        {activeTab === 'Resources' && (
          <div className="space-y-6 max-w-full">
             <div className="grid grid-cols-[200px_300px] gap-x-2 gap-y-1 items-center">
                <span className={sapLabelStyle}>Default Warehouse</span>
                <select className={`${sapInputStyle} bg-[#fffbd0]`}><option>General Warehouse</option></select>
             </div>

             <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Auto Add All Warehouses to New Resources</span>
             </div>

             <div className="space-y-1 pt-4">
                <span className="text-[11px] text-gray-800 font-bold">Default Capacity Period:</span>
                <div className="flex items-center gap-2 pt-1">
                   <span className={sapLabelStyle}>Start From Today Until</span>
                   <select className={`${sapInputStyle} !w-32`}><option>Today</option></select>
                   <span className={sapLabelStyle}>+</span>
                   <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="1" />
                   <span className={sapLabelStyle}>Months +</span>
                   <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="0" />
                   <span className={sapLabelStyle}>Days</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Cockpit' && (
          <div className="space-y-4 max-w-full">
             <div className="grid grid-cols-[200px_1fr] gap-x-12">
                <div className="space-y-1">
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cockpitType" className="w-3.5 h-3.5" />
                     <span className={sapLabelStyle}>Fiori-Style Cockpit</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cockpitType" className="w-3.5 h-3.5" defaultChecked />
                     <span className={sapLabelStyle}>Cockpit</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cockpitType" className="w-3.5 h-3.5" />
                     <span className={sapLabelStyle}>None</span>
                   </label>
                </div>

                <div className="flex items-center gap-2 h-fit pt-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Refresh KPIs and Pervasive Dashboards</span>
                   <div className="flex items-center gap-1 ml-4">
                      <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="300" />
                      <span className={sapLabelStyle}>s</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Cash Flow' && (
          <div className="space-y-10 max-w-full">
             <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2 tracking-tight">Assignment of Cash Flow Line Item</span>
                <div className="pl-1 space-y-1 mt-1">
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cashFlowAssign" className="w-3.5 h-3.5" />
                     <span className={sapLabelStyle}>Mandatory</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cashFlowAssign" className="w-3.5 h-3.5" defaultChecked />
                     <span className={sapLabelStyle}>Optional</span>
                   </label>
                </div>
             </div>

             <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2 tracking-tight">Default Primary Form Cash Flow Line Item</span>
                <div className="pl-4 grid grid-cols-[200px_350px] gap-x-2 gap-y-1 items-center pt-1">
                   <span className={sapLabelStyle}>Incoming Payment</span>
                   <select className={`${sapInputStyle} bg-[#fffbd0]`}><option>Payments for Invoices from Customers</option></select>
                   
                   <span className={sapLabelStyle}>Outgoing Payment</span>
                   <select className={sapInputStyle}><option>Payments for Invoices to Suppliers</option></select>
                </div>
             </div>

             <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2 tracking-tight">Assignment in Transaction with All Relevant Cash Flow</span>
                <div className="pl-1 space-y-1 mt-1">
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cashFlowTrans" className="w-3.5 h-3.5" defaultChecked />
                     <span className={sapLabelStyle}>Ignore Without Warning</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="cashFlowTrans" className="w-3.5 h-3.5" />
                     <span className={sapLabelStyle}>Warning Only</span>
                   </label>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'Cost Accounting' && (
          <div className="space-y-6 max-w-full">
             <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Use Multidimensions</span>
             </div>

             <div className="space-y-1 pl-4">
                <span className={sapLabelStyle}>Display Distribution Rules</span>
                <div className="flex flex-col gap-1 pl-1 pt-1">
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="distRules" className="w-3.5 h-3.5" defaultChecked />
                     <span className={sapLabelStyle}>In a Unified Column</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="radio" name="distRules" className="w-3.5 h-3.5" />
                     <span className={sapLabelStyle}>In Separate Columns</span>
                   </label>
                </div>
             </div>

             <div className="pt-8 space-y-4">
                <span className={sapLabelStyle}>Specify how to post journal entry line without a distribution rule or project when G/L account is set up for cost accounting</span>
                <div className="grid grid-cols-[100px_40px_100px_200px] gap-x-2 items-center">
                   <span className={sapLabelStyle}>Distribution Rule</span>
                   <button className="px-1.5 h-[18px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[10px] font-bold shadow-sm">...</button>
                   <span className={sapLabelStyle + " text-right"}>Project Code</span>
                   <select className={sapInputStyle}><option>Without Warning</option></select>
                </div>
             </div>

             <div className="pt-12 space-y-2 border-b border-gray-300 pb-1 w-fit">
                <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Cost Accounting Adjustment Settings</span>
             </div>
             <div className="grid grid-cols-[150px_200px] gap-x-2 gap-y-1 items-center">
                <span className={sapLabelStyle}>Default Series</span>
                <select className={sapInputStyle}><option></option></select>
                <span className={sapLabelStyle}>Default G/L Account</span>
                <select className={sapInputStyle}><option></option></select>
             </div>
          </div>
        )}

        {activeTab === 'Pricing' && (
          <div className="space-y-6 max-w-full">
             <div className="grid grid-cols-2 gap-x-12">
                <div className="space-y-1">
                   <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Display Zero Price in Documents if Price Source is Based on Inactive Price Lists</span>
                   <div className="pl-1 space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Period and Volume Discounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Special Prices for Business Partners</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Price Lists</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-1">
                   <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Display Inactive Price Lists In</span>
                   <div className="pl-1 space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Sales, Purchasing and Inventory Documents</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <input type="checkbox" className={sapCheckboxStyle} />
                         <span className={sapLabelStyle}>Settings</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-4 flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Remove Unpriced Items from Price List in Database</span>
             </div>

             <div className="pt-2 grid grid-cols-[200px_300px] gap-x-2 items-center">
                <span className={sapLabelStyle}>When UoM Conversion Rules Change</span>
                <select className={`${sapInputStyle} bg-[#fffbd0]`}><option>Update UoM Prices Accordingly</option></select>
             </div>

             <div className="pl-4 space-y-1">
                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>Remove or Update UoM Prices Based on Last Purchase or Evaluated Price Lists</span>
                </div>
             </div>

             <div className="pt-4 flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Effective Price Considers All Price Sources</span>
             </div>
          </div>
        )}

        {activeTab === 'Hide Functions' && (
          <div className="space-y-4 max-w-full">
             <span className={sapLabelStyle}>If your company does not use one or more of the following functions, you can hide them by selecting the respective option(s):</span>
             
             <div className="pl-4 space-y-1.5 pt-2">
                {[
                  'Budget', 
                  'Payment Wizard', 
                  'Dunning Wizard', 
                  'Cost Accounting', 
                  'Serial Numbers and Batches', 
                  'Production', 
                  'MRP', 
                  'Units of Measure'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                     <input type="checkbox" className={sapCheckboxStyle} />
                     <span className={sapLabelStyle}>{item}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'QR Codes' && (
          <div className="space-y-4 max-w-full">
             <div className="grid grid-cols-[200px_40px_100px_60px] gap-x-2 gap-y-1 items-center">
                <span className={sapLabelStyle}>Version - Min. Size</span>
                <input type="text" className={`${sapInputStyle} bg-[#fffbd0] !w-12 text-center`} defaultValue="1" />
                <span className={sapLabelStyle + " text-right"}>Max. Size</span>
                <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="40" />
                
                <span className={sapLabelStyle}>Scale (pixels per module)</span>
                <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="10" />
                <div className="col-span-2"></div>

                <div className="flex items-center gap-2">
                   <input type="checkbox" className={sapCheckboxStyle} />
                   <span className={sapLabelStyle}>QR Code Expiration</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                   <span className={sapLabelStyle}>Expiration Days</span>
                   <input type="text" className={`${sapInputStyle} !w-12 text-center`} defaultValue="10" />
                </div>

                <span className={sapLabelStyle}>Correction Level</span>
                <div className="col-span-3">
                   <select className={`${sapInputStyle} !w-40`}><option>Medium</option></select>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-[40px] px-3 bg-[#ececec] flex items-center gap-2 border-t border-gray-300">
        <button className={sapButtonStyle}>OK</button>
        <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
      </div>
    </div>
  );
};
