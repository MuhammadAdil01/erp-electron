import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface ConnectedClientsWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";

export const ConnectedClientsWindow: React.FC<ConnectedClientsWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Connected Clients"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={700}
      minHeight={400}
    >
      <div className="flex-1 p-4 bg-[#f0f0f0] flex flex-col gap-3 overflow-hidden">
        
        <div className="space-y-1">
          <p className="text-[12px] font-bold text-[#333]">Current Company (DESKTOP-BH8OQJ5)</p>
          <p className="text-[11px] text-gray-700">Select the clients that you wish to disconnect from current company.</p>
          <p className="text-[11px] text-gray-700 font-bold italic">Note, you can only send a message to SAP Business One clients.</p>
        </div>

        <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
          <table className="w-full border-collapse text-[11px]">
             <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                <tr className="h-[22px]">
                   <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                   <th className="w-32 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">
                      <div className="flex items-center justify-between">
                         <span>Client IP</span>
                         <ChevronDown className="w-3 h-3 text-gray-800" />
                      </div>
                   </th>
                   <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Client Name</th>
                   <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Process Name</th>
                   <th className="w-24 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Process ID</th>
                   <th className="w-32 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">User Name</th>
                   <th className="px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Assigned License</th>
                </tr>
             </thead>
             <tbody>
                {Array.from({ length: 25 }).map((_, i) => (
                  <tr key={i} className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30">
                     <td className="w-8 border-r border-gray-100 text-center text-gray-500">{i + 1}</td>
                     <td className="border-r border-gray-100 px-1"></td>
                     <td className="border-r border-gray-100 px-1"></td>
                     <td className="border-r border-gray-100 px-1"></td>
                     <td className="border-r border-gray-100 px-1"></td>
                     <td className="border-r border-gray-100 px-1"></td>
                     <td className="px-1"></td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
