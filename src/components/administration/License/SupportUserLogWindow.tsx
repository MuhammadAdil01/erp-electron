import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface SupportUserLogWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const SupportUserLogWindow: React.FC<SupportUserLogWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const columns = [
    { name: '#', width: '40px' },
    { name: 'Login Reason', width: '150px' },
    { name: 'Login Detail', width: '200px' },
    { name: 'Real Name', width: '150px' },
    { name: 'MAC Address', width: '150px' },
    { name: 'Machine Name', width: '150px' },
    { name: 'Session Start Time', width: '150px' },
    { name: 'Session End Time', width: '150px' },
    { name: 'Hash Check Failed', width: '120px' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Support User Log"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={600}
      minHeight={400}
    >
      <div className="flex-1 p-2 flex flex-col bg-[#f0f0f0] overflow-hidden">
        
        {/* Main Grid Table */}
        <div className="flex-1 border border-gray-400 bg-white shadow-inner overflow-hidden flex flex-col">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full border-collapse text-[11px] table-fixed min-w-[1200px]">
                 <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-400 z-10">
                    <tr className="h-[22px]">
                       {columns.map((col, i) => (
                         <th 
                           key={i} 
                           style={{ width: col.width }}
                           className={`border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] truncate`}
                         >
                            {col.name}
                         </th>
                       ))}
                       <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]"></th>
                    </tr>
                 </thead>
                 <tbody>
                    {/* Empty Rows matching SAP look */}
                    {Array.from({ length: 40 }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="h-[18px] border-b border-gray-100 group hover:bg-[#ffed99]/30">
                         <td className="border-r border-gray-300 text-center bg-[#f0f0f0] text-gray-500">{rowIndex + 1}</td>
                         {columns.slice(1).map((col, colIndex) => (
                           <td key={colIndex} className="border-r border-gray-300 px-1">
                              {/* Data goes here */}
                           </td>
                         ))}
                         <td></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {/* Bottom Right Scroll Helper */}
           <div className="h-[14px] bg-[#f0f0f0] border-t border-gray-400 flex items-center justify-end px-1">
              <div className="w-3.5 h-3.5 bg-white border border-gray-400 flex items-center justify-center">
                 <div className="w-0.5 h-0.5 bg-blue-600" />
              </div>
           </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 mt-2 px-1">
           <button onClick={onClose} className={sapButtonStyle}>OK</button>
           <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
