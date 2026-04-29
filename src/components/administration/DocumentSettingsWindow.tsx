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

interface DocumentSettingsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const DocumentSettingsWindow: React.FC<DocumentSettingsWindowProps> = ({
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

        const minW = 800;
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

  const sapLabelStyle = "text-[11px] text-gray-800 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-white focus:border-orange-400";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-orange-500";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px] border-t-2 border-[#e8a01c]"
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
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-black font-semibold text-[11.5px] tracking-tight">Document Settings</span>
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

      {/* Tabs */}
      <div className="flex px-1.5 pt-1.5 bg-[#ececec] gap-[2px]">
        {['General', 'Per Document', 'Electronic Documents'].map((tab) => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-0.5 text-[11px] cursor-default rounded-t-[3px] border border-gray-400 relative transition-all
              ${activeTab === tab 
                ? 'bg-white border-b-white z-10 -mb-[1px] shadow-sm font-medium' 
                : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5] hover:to-[#ebebeb]'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner overflow-y-auto custom-scrollbar p-3">
        {activeTab === 'General' && (
          <div className="space-y-1.5">
            {/* Calculate Gross Profit Section */}
            <div className="flex items-start gap-2">
              <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
              <div className="space-y-1">
                <span className={sapLabelStyle}>Calculate Gross Profit</span>
                <div className="grid grid-cols-[180px_1fr] gap-x-4 items-center pl-4">
                  <span className={sapLabelStyle}>Base Price Origin</span>
                  <select className={`${sapInputStyle} w-40`}><option>Item Cost</option></select>
                  <span className={sapLabelStyle}>Default Gross Profit % for Service Documents</span>
                  <div className="flex items-center gap-1">
                    <input type="text" className={`${sapInputStyle} w-16 text-right`} defaultValue="0.00" />
                    <div className="w-4 h-[18px] bg-yellow-100 border border-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-2"></div>

            {/* Calculate % Gross Profit as */}
            <div className="flex items-center gap-8 pl-6">
              <span className={sapLabelStyle}>Calculate % Gross Profit as:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="grossProfitCalc" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Profit/Sales Price</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="grossProfitCalc" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>Profit/Base Price</span>
                </label>
              </div>
            </div>

            {/* Document Remarks Include */}
            <div className="flex items-center gap-8 pl-6">
              <span className={sapLabelStyle}>Document Remarks Include:</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="docRemarks" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>Base Document Number</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="docRemarks" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Manual Remarks Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="docRemarks" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>BP Reference Number</span>
                </label>
              </div>
            </div>

            {/* Sales BOM Display */}
            <div className="flex items-center gap-8 pl-6">
              <span className={sapLabelStyle}>For a Sales BOM in Documents, Display:</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="bomDisplay" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Price and Total for Parent Item Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="bomDisplay" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>Price for Component Items</span>
                </label>
              </div>
            </div>

            {/* G/L Account Range Response */}
            <div className="flex items-center gap-8 pl-6">
              <span className={sapLabelStyle}>Response to G/L Account Balance Outside Allowed Range:</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="glRange" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>Without Warning</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="glRange" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Warning Only</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="glRange" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Block Posting</span>
                </label>
              </div>
            </div>

            {/* Inventory Range Response */}
            <div className="flex items-center gap-8 pl-6 relative">
              <span className={sapLabelStyle}>Response to Release / Receipt of Inventory Outside Defined Range:</span>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="invRange" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>Without Warning</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="invRange" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Warning Only</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input type="radio" name="invRange" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>Block Release / Receipt</span>
                </label>
              </div>
              
              {/* Block Negative Inventory - Right Side */}
                {/* <div className="absolute right-0 flex items-center gap-3 ml-40px">
                  <div className="flex items-center gap-2">
                      <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                      <span className={sapLabelStyle}>Block Negative Inventory By</span>
                  </div>
                  <select className={`${sapInputStyle} w-32`}><option>Item Setting</option></select>
                </div> */}
            </div>

            {/* <div className="h-4"></div>  */}

            {/* Rounding Method */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">Rounding Method</span>
              <div className="pl-4 space-y-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="rounding" className="w-3.5 h-3.5" />
                  <span className={sapLabelStyle}>By Currency</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="rounding" className="w-3.5 h-3.5" defaultChecked />
                  <span className={sapLabelStyle}>By Document</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-1 items-center pt-1">
              <span className={sapLabelStyle}>Exchange Rate Base Date (A/P Documents)</span>
              <select className={`${sapInputStyle} w-44`}><option>Posting Date</option></select>
              
              <span className={sapLabelStyle}>Split Journal Entry Posting by Document Lines</span>
              <select className={`${sapInputStyle} w-60`}><option>No Split</option></select>
            </div>

            <div className="h-2"></div>

            {/* Checkboxes List */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Display Rounding Remark</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Use Warehouse Address</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                  <span className={sapLabelStyle}>Manage Freight in Documents</span>
                </div>
                <button className={`bg-[#ffd700]/70 border border-gray-500 px-3 h-[20px] text-[10.5px] font-medium shadow-sm hover:brightness-95 active:shadow-inner rotate-0`}>Freight - Setup</button>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Block documents with earlier Posting Date</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Allow Future Posting Date</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Use Document Exchange Rate When Copying to Target Document</span>
              </div>
            </div>

            <div className="h-2"></div>

            {/* Attachments Section */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">Attachments</span>
              <div className="pl-4 space-y-0.5 pt-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className={sapCheckboxStyle} />
                  <span className={sapLabelStyle}>Copy Attachments from Base Document to Target Document</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className={sapCheckboxStyle} />
                  <span className={sapLabelStyle}>Copy Attachments from BOM to Production Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className={sapCheckboxStyle} />
                  <span className={sapLabelStyle}>Do Not Overwrite Attachments with the Same File Name</span>
                </div>
              </div>
            </div>

            <div className="h-4"></div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
              <span className={sapLabelStyle}>Manage Inventory by Warehouse</span>
            </div>

            <div className="h-8"></div>

            <div className="flex items-center gap-2">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Display Canceled and Cancelation Marketing Documents in Reports</span>
            </div>
            
            <div className="flex items-center gap-2">
               <span className={sapLabelStyle}>Max. No. of Days for Canceling Marketing Documents Before or After Posting</span>
               <input type="text" className={`${sapInputStyle} w-20 text-right`} defaultValue="50000" />
            </div>
          </div>
        )}

        {activeTab === 'Per Document' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center gap-12">
              <span className={sapLabelStyle}>Document</span>
              <select className={`${sapInputStyle} w-96`}>
                <option>Journal Entry</option>
              </select>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Block <span className="underline">U</span>nbalanced FC Journal Entry</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Block Multiple Currency Transactions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Block Editing of Totals in System Currency</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Block Posting Date Editing per Row</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
                <span className={sapLabelStyle}>Block <span className="underline">U</span>pdating of Doc. Date After Posting per Row</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Use Automatic Tax</span>
              </label>
            </div>

            <div className="flex-1" />

            <div className="space-y-2">
               <label className="flex items-center gap-2 cursor-pointer opacity-40">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Block documents with earlier Posting Date</span>
              </label>
            </div>

            <div className="pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={sapCheckboxStyle} />
                <span className={sapLabelStyle}>Mandatory Remarks</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'Electronic Documents' && (
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Generic eDoc Protocol */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">Generic eDoc Protocol</span>
              <div className="border border-gray-300 relative mt-1 overflow-hidden rounded-[1px]">
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="w-[300px] bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Enable Protocol</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Default eDoc Generation Type</td>
                      <td className="px-1 py-0.5">
                        <select className={`${sapInputStyle} w-full sm:w-[500px]`}>
                          <option>Not Relevant</option>
                        </select>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Processing Target Setup</td>
                      <td className="px-2 py-0.5 text-blue-700 cursor-pointer hover:underline">Double-click to open</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Document Import Source Path</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Processed Imported Documents Path</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Documents Mapping Determination</td>
                      <td className="px-2 py-0.5 text-blue-700 cursor-pointer hover:underline">Double-click to open</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">User Query Category</td>
                      <td className="px-1 py-0.5">
                        <select className={`${sapInputStyle} w-full sm:w-[500px]`} />
                      </td>
                    </tr>
                    
                    {/* Sender Details Sub-section */}
                    <tr className="bg-gray-50/50 italic border-b border-gray-200">
                      <td colSpan={2} className="px-2 py-0.5 underline">Sender Details</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Sender Name</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Sender E-Mail</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>

                    {/* User Notifications Sub-section */}
                    <tr className="bg-gray-50/50 italic border-b border-gray-200">
                      <td colSpan={2} className="px-2 py-0.5 underline">User Notifications</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Notification by System Alert</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Notification by E-Mail</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                    <tr>
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Keep Datasource File</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PEPPOL Section */}
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">PEPPOL</span>
              <div className="border border-gray-300 relative mt-1 overflow-hidden rounded-[1px]">
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="w-[300px] bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Enable Protocol</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">PEPPOL VAT Structure</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Participant ID</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    {/* ... truncated PEPPOL fields as they match Generic eDoc layout ... */}
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Default eDoc Generation Type</td>
                      <td className="px-1 py-0.5">
                        <select className={`${sapInputStyle} w-full sm:w-[500px]`}>
                          <option>Not Relevant</option>
                        </select>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Processing Target Setup</td>
                      <td className="px-2 py-0.5 text-blue-700 cursor-pointer hover:underline">Double-click to open</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Document Import Source Path</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2">Document Information Extraction</span>
              <div className="border border-gray-300 relative mt-1 overflow-hidden rounded-[1px]">
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="w-[300px] bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Enable Protocol</td>
                      <td className="px-1 py-0.5"><div className="flex justify-center w-full sm:w-[500px]"><input type="checkbox" className={sapCheckboxStyle} /></div></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Service URL</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">UAA URL</td>
                      <td className="px-1 py-0.5">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 flex items-center justify-center text-yellow-600 font-bold">➜</div>
                          <input type="text" className={`${sapInputStyle} flex-1 sm:w-[500px]`} />
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Client ID</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">Client Secret</td>
                      <td className="px-1 py-0.5"><input type="password" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">PDF Folder for Extraction</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                    <tr>
                      <td className="bg-[#f9f9f9] px-2 py-0.5 border-r border-gray-200">PDF Folder for Extraction (Windows)</td>
                      <td className="px-1 py-0.5"><input type="text" className={`${sapInputStyle} w-full sm:w-[500px]`} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-[40px] px-3 bg-[#ececec] flex items-center gap-2 shrink-0 border-t border-gray-300">
        <button onClick={onClose} className={sapButtonStyle}>OK</button>
        <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
      </div>

       {/* Diagonal Resize Icon Placeholder */}
       <div className="absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center opacity-30 select-none pointer-events-none">
          <div className="w-1.5 h-[1px] bg-gray-600 rotate-45 translate-x-1 translate-y-1"></div>
          <div className="w-1.5 h-[1px] bg-gray-600 rotate-45 translate-x-[2px] translate-y-[2px]"></div>
       </div>
    </div>
  );
};
