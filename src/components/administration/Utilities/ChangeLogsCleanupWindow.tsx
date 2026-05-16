import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ChangeLogsCleanupWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const ChangeLogsCleanupWindow: React.FC<ChangeLogsCleanupWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const tableData = [
    { module: '', doc: 'Pick List', size: '0.06', status: '' },
    { module: '', doc: 'Inventory Counting', size: '0.27', status: '' },
    { module: 'Resources', doc: 'Resource Master Data', size: '0.18', status: '', isGroup: true },
    { module: 'Production', doc: 'Bill of Materials', size: '0.08', status: '', isGroup: true },
    { module: '', doc: 'Production Orders', size: '0.16', status: '' },
    { module: 'Service', doc: 'Service Call', size: '0.29', status: '', isGroup: true },
    { module: '', doc: 'Equipment Card', size: '0.06', status: '' },
    { module: 'Human Resources', doc: 'Employee Master Data', size: '4.16', status: '', isGroup: true, isSelected: true },
  ];

  return (
    <ResizableCriteriaWindow
      title="Change Logs Cleanup"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={850}
      minHeight={600}
    >
      <div className="flex-1 p-3 flex flex-col gap-3 bg-[#f0f0f0] overflow-hidden">
        
        {/* Introduction Box */}
        <div className="border border-gray-400 p-3 flex flex-col gap-2 bg-white/50">
           <h2 className="text-[11px] font-bold underline">Introduction</h2>
           <p className="text-[11px] leading-tight text-gray-800">
             The change logs cleanup utility allows you to delete change logs of various documents and master data. Determine the range of change logs to be deleted by setting the date in "Clean Up Logs Until".
           </p>
           <p className="text-[11px] leading-tight text-gray-800">
             Select the documents or master data to clean up their change logs. Executing the cleanup will delete change log entries that were created on, or before, the selected date.
           </p>
           <div className="flex gap-10">
              <span className="text-[11px] font-bold">Warning:</span>
              <span className="text-[11px] font-bold">Deleting the change log data is irreversible</span>
           </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-[140px_300px] gap-x-4 gap-y-1 items-center px-1">
           <span className={sapLabelStyle}>Change Logs Cleanup</span>
           <div className="relative">
              <select className={sapInputStyle}>
                <option>Start a New Cleanup</option>
              </select>
              <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                 <ChevronDown className="w-3 h-3 text-gray-600" />
              </div>
           </div>

           <span className={sapLabelStyle}>Cleanup Scenario</span>
           <input type="text" className={`${sapInputStyle} !bg-[#e8e8e8]`} defaultValue="CLC20260512n1" readOnly />

           <span className={sapLabelStyle}>Cleanup Date</span>
           <input type="text" className={`${sapInputStyle} !bg-[#e8e8e8]`} defaultValue="12.05.26" readOnly />

           <span className={sapLabelStyle}>Clean Up Logs Until</span>
           <input type="text" className={sapInputStyle} />

           <span className={sapLabelStyle}>Remarks</span>
           <input type="text" className={sapInputStyle} />
        </div>

        {/* Table Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
              <table className="w-full border-collapse text-[11px]">
                 <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                    <tr className="h-[20px]">
                       <th className="w-12 border-r border-gray-300 px-1 font-normal text-center bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Select</th>
                       <th className="w-32 border-r border-gray-300 px-1 font-normal text-left bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Module</th>
                       <th className="w-48 border-r border-gray-300 px-1 font-normal text-left bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Document Name</th>
                       <th className="w-32 border-r border-gray-300 px-1 font-normal text-left bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Current Size (MB)</th>
                       <th className="px-1 font-normal text-left bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className={`h-[18px] border-b border-gray-50 hover:bg-[#ffed99]/30 ${row.isSelected ? 'bg-[#ffed99]' : ''}`}>
                         <td className="w-12 border-r border-gray-100 text-center"><input type="checkbox" defaultChecked className="w-3 h-3" /></td>
                         <td className="w-32 border-r border-gray-100 px-1 flex items-center gap-1">
                            {row.isGroup && <ChevronDown className="w-3 h-3 text-gray-800" />}
                            <span>{row.module}</span>
                         </td>
                         <td className="w-48 border-r border-gray-100 px-1">{row.doc}</td>
                         <td className="w-32 border-r border-gray-100 px-1 text-right pr-2">{row.size}</td>
                         <td className="px-1"></td>
                      </tr>
                    ))}
                    {/* Empty padding rows */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <tr key={i} className="h-[18px] border-b border-gray-50">
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td className="border-r border-gray-100"></td>
                         <td></td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="h-[20px] bg-[#f8f8f8] font-bold sticky bottom-0 border-t border-gray-400">
                       <td className="border-r border-gray-300"></td>
                       <td className="border-r border-gray-300"></td>
                       <td className="border-r border-gray-300 px-1">Total</td>
                       <td className="border-r border-gray-300 px-1 text-right pr-2">66.16</td>
                       <td className="px-1">0 log entries deleted successfully</td>
                    </tr>
                 </tbody>
              </table>
           </div>
           
           <div className="flex justify-end gap-2 mt-2">
              <button className={sapGreyButtonStyle}>Expand</button>
              <button className={sapGreyButtonStyle}>Collapse</button>
           </div>
        </div>

        {/* Footer Area */}
        <div className="border-t border-gray-300 pt-3 flex flex-col gap-3">
           <div className="flex flex-col gap-1">
              <h3 className="text-[11px] font-bold underline">Summary:</h3>
              <div className="h-[24px] bg-white border border-gray-400" />
           </div>
           <div className="flex justify-end gap-2">
              <button className={sapButtonStyle}>Execute</button>
              <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
           </div>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
