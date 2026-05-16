import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Search, ArrowUpRight } from 'lucide-react';

interface AlertsManagementWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const AlertsManagementWindow: React.FC<AlertsManagementWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [selectedRow, setSelectedRow] = useState(0);

  const alerts = [
    { name: 'PR Addition', priority: 'High', query: 'PR Addition' },
    { name: 'PR Additional Director Approval', priority: 'High', query: 'PR Add. Director Approval' },
    { name: 'PR Secretary Approval', priority: 'High', query: 'PR Secretary Approval' },
    { name: 'PR Project Director Approval', priority: 'High', query: 'PR PD Approval' },
    { name: 'PR Approved', priority: 'High', query: 'PR Complete Approval' },
    { name: 'PQ Addition', priority: 'High', query: 'PQ Addition' },
    { name: 'PQ Secretary Approval', priority: 'High', query: 'PQ Secretary Approval' },
    { name: 'PQ Project Director Approval', priority: 'High', query: 'PQ PD Approval' },
    { name: 'PQ Approved', priority: 'High', query: 'PQ Approved' },
    { name: 'PQ-RT-PD', priority: 'Normal', query: 'PROJECT DIRECTOR PQ' },
    { name: 'PQ-RT-SEC', priority: 'Normal', query: 'SECRATARY PQ' },
    { name: 'PQ-RT-PROCURE', priority: 'Normal', query: 'PROCUREMENT PQ' },
    { name: 'PQ-RT-F1', priority: 'Normal', query: 'FINANACE 1 PQ' },
    { name: 'PQ-RT-F2', priority: 'Normal', query: 'FINANACE 2 PQ' },
    { name: 'PQ-RT-F3', priority: 'Normal', query: 'FINANACE 3 PQ' },
    { name: 'PQ-RT-F4', priority: 'Normal', query: 'FINANACE 4 PQ' },
    { name: 'PQ-RT-F5', priority: 'Normal', query: 'FINANACE 5 PQ' },
    { name: 'PQ-RT-FRI', priority: 'Normal', query: 'FARIYAR PQ' },
    { name: 'PQ-RT-RMS', priority: 'Normal', query: 'RIMSHA PQ' },
    { name: 'PR-PT-F1', priority: 'Normal', query: 'PR-RT-F1' },
    { name: 'PR-RT-F2', priority: 'Normal', query: 'PR-RT-F2' },
    { name: 'PR-RT-F3', priority: 'Normal', query: 'PR-RT-F3' },
    { name: 'PR-RT-F4', priority: 'Normal', query: 'PR-RT-F4' },
    { name: 'PR-RT-F5', priority: 'Normal', query: 'PR-RT-F5' },
    { name: 'PR-RT-P', priority: 'Normal', query: 'PR-RT-P' },
    { name: 'PR-RT-RMS', priority: 'Normal', query: 'PR-RT-RMS' },
    { name: 'PR-RT-FRI', priority: 'Normal', query: 'PR-RT-FRI' },
    { name: 'PR-RT-ASTD', priority: 'Normal', query: 'PR-RT-ASTD' },
    { name: 'PR-RT-ADD', priority: 'Normal', query: 'PR-RT-ADD' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Alerts Management"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={800}
      minHeight={500}
    >
      <div className="flex-1 p-3 flex flex-col gap-2 bg-[#f0f0f0] overflow-hidden">
        
        {/* Top Info Area */}
        <div className="bg-white border border-gray-300 p-2 text-[10px] text-gray-700 leading-tight space-y-1 shadow-sm">
           <p>This window gives you an overview of system and user alerts.</p>
           <p>You can filter the alerts through the "Alert Status" drop-down list or the "Filter Table" option in the context menu or menu bar.</p>
           <p>You can use the "Actions" button to create new user alerts, set alerts to active or inactive, or remove alerts. You can also remove user alerts through the context menu or by following "Data" then "Remove" in the main menu.</p>
           <p>You can view or edit details of an alert and view its associated query by choosing the arrow link next to the alert name.</p>
        </div>

        {/* Filters Area */}
        <div className="flex items-center gap-4 mt-2">
           <div className="flex items-center gap-2">
              <span className={sapLabelStyle}>Alert Status</span>
              <div className="relative w-[150px]">
                 <select className={`${sapInputStyle} appearance-none pr-6 bg-white`}>
                    <option>Active</option>
                    <option>Inactive</option>
                 </select>
                 <div className="absolute right-0 top-0 h-full w-5 border-l border-gray-400 flex items-center justify-center pointer-events-none bg-[#f0f0f0]">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2 flex-1">
              <button className={sapButtonStyle}>Find/Find Next</button>
              <div className="flex-1 max-w-[300px]">
                 <input type="text" className={sapInputStyle} />
              </div>
           </div>
        </div>

        {/* Main Grid Table */}
        <div className="flex-1 border border-gray-400 bg-white shadow-inner overflow-hidden flex flex-col mt-2">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-collapse text-[11px] table-fixed min-w-[1500px]">
                 <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-400 z-10">
                    <tr className="h-[22px]">
                       <th className="w-[30px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                       <th className="w-[50px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Select</th>
                       <th className="w-[200px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Name</th>
                       <th className="w-[100px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Priority</th>
                       <th className="w-[100px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Condition</th>
                       <th className="w-[150px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Condition: Threshold Value</th>
                       <th className="w-[60px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Active</th>
                       <th className="w-[200px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Saved Query</th>
                       <th className="w-[80px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Frequency</th>
                       <th className="w-[120px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Recurrence Period</th>
                       <th className="w-[120px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Recurrence Date</th>
                       <th className="w-[120px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Recurrence Time</th>
                       <th className="w-[80px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Save History</th>
                       <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {alerts.map((alert, i) => (
                      <tr 
                        key={i} 
                        onClick={() => setSelectedRow(i)}
                        className={`h-[18px] border-b border-gray-100 group ${selectedRow === i ? 'bg-[#ffed99]' : 'hover:bg-[#ffed99]/30'}`}
                      >
                         <td className="border-r border-gray-300 text-center bg-[#f0f0f0] text-gray-600">{i + 1}</td>
                         <td className="border-r border-gray-300 text-center"><input type="checkbox" className="w-3 h-3 mt-1" /></td>
                         <td className="border-r border-gray-300 px-1">
                            <div className="flex items-center gap-1">
                               <ArrowUpRight className="w-3 h-3 text-orange-600 shrink-0" />
                               <span className="truncate">{alert.name}</span>
                            </div>
                         </td>
                         <td className="border-r border-gray-300 px-1">{alert.priority}</td>
                         <td className="border-r border-gray-300 px-1"></td>
                         <td className="border-r border-gray-300 px-1"></td>
                         <td className="border-r border-gray-300 text-center"><input type="checkbox" defaultChecked className="w-3 h-3 mt-1" /></td>
                         <td className="border-r border-gray-300 px-1">
                            <div className="flex items-center gap-1">
                               <ArrowUpRight className="w-3 h-3 text-orange-600 shrink-0" />
                               <span className="truncate">{alert.query}</span>
                            </div>
                         </td>
                         <td className="border-r border-gray-300 px-1 text-right pr-2">1</td>
                         <td className="border-r border-gray-300 px-1">Minutes</td>
                         <td className="border-r border-gray-300 px-1"></td>
                         <td className="border-r border-gray-300 px-1"></td>
                         <td className="border-r border-gray-300 text-center"><input type="checkbox" defaultChecked={i < 5} className="w-3 h-3 mt-1" /></td>
                         <td></td>
                      </tr>
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-[18px] border-b border-gray-50">
                         <td className="border-r border-gray-300 bg-[#f0f0f0]"></td>
                         {Array.from({ length: 12 }).map((_, j) => (
                           <td key={j} className="border-r border-gray-300"></td>
                         ))}
                         <td></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {/* Bottom Scroll Helper */}
           <div className="h-[14px] bg-[#f0f0f0] border-t border-gray-400 flex items-center justify-end px-1 shrink-0">
              <div className="w-3.5 h-3.5 bg-white border border-gray-400 flex items-center justify-center">
                 <div className="w-0.5 h-0.5 bg-blue-600" />
              </div>
           </div>
        </div>

        {/* Bottom Area */}
        <div className="flex items-center justify-between mt-1 px-1 pb-1">
           <div className="flex gap-2">
              <button onClick={onClose} className={sapButtonStyle}>OK</button>
              <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
           </div>
           <button className={sapButtonStyle}>Actions</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
