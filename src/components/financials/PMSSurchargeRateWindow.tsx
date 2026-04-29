import React from 'react';
import { FixedAssetWindowShell, GoldBtn } from './FixedAssetShared';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const MOCK_DATA = [
  { id: 1,  code: '1', kibor: '17', addition: '1', total: '18', from: '01.01.16', to: '31.12.20', status: 'Active' },
  { id: 2,  code: '2', kibor: '11', addition: '1', total: '12', from: '31.12.20', to: '31.12.21', status: 'Active' },
  { id: 3,  code: '3', kibor: '13.75', addition: '1', total: '14.75', from: '31.12.21', to: '30.06.22', status: 'Active' },
  { id: 4,  code: '4', kibor: '17.75', addition: '1', total: '18.75', from: '30.06.22', to: '31.12.26', status: 'Active' },
];

export const PMSSurchargeRateWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="PMS Surcharge Rate" {...props} minWidth={600} minHeight={300}>
      <div className="flex flex-col flex-1 bg-[#f0f0f0] p-1 h-full">
        <div className="flex-1 border border-gray-400 bg-white shadow-inner flex flex-col relative overflow-hidden">
          {/* Arrow top right icon just like in the screenshot */}
          <div className="absolute top-0.5 right-0.5 z-20 w-4 h-4 text-blue-500 rounded bg-[#e8e8e8] border border-gray-300 flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-200">
             <ArrowUpRight className="w-3 h-3 text-blue-600" />
          </div>

          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                <tr>
                  <th className="text-[10.5px] font-normal text-gray-700 px-1 py-[3px] border-r border-gray-300 text-left w-8">#</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-16">Code</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-20">Kibor</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-20">Addition</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-28">Total Surcharge</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-24">From Date</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left w-24">To Date</th>
                  <th className="text-[10.5px] font-normal text-gray-700 px-2 py-[3px] border-r border-gray-300 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 h-[22px]">
                    <td className="px-1 py-[2px] bg-[#f0f0f0] border-r border-gray-200 text-right text-[10.5px]">{row.id}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.code}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.kibor}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.addition}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.total}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.from}</td>
                    <td className="px-2 py-[2px] border-r border-gray-200 text-[10.5px]">{row.to}</td>
                    <td className="px-2 border-r border-gray-200 relative p-0 w-full group h-full">
                       <div className="flex items-center justify-between w-full h-full px-1 py-[2px] bg-white text-[10.5px]">
                         <span>{row.status}</span>
                         <ChevronDown className="w-3 h-3 text-black/80" />
                       </div>
                    </td>
                  </tr>
                ))}
                
                {/* Editing Row */}
                <tr className="border-b border-gray-200 h-[22px]">
                  <td className="px-1 py-[2px] bg-[#f0f0f0] border-r border-gray-200 text-right text-[10.5px]">5</td>
                  <td className="border-r border-gray-200 p-0 relative">
                    <div className="absolute inset-0 border-[1.5px] border-blue-400 bg-[#fffae6] flex items-center z-10 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]">
                       <div className="w-[1px] h-3.5 bg-black ml-1 animate-pulse" />
                    </div>
                  </td>
                  <td className="border-r border-gray-200"></td>
                  <td className="border-r border-gray-200"></td>
                  <td className="border-r border-gray-200"></td>
                  <td className="border-r border-gray-200"></td>
                  <td className="border-r border-gray-200"></td>
                  <td className="border-r border-gray-200 relative p-0 group">
                      {/* Open dropdown overlay */}
                      <div className="absolute top-0 left-0 w-full z-30">
                        <div className="flex items-center justify-between px-1 py-[1.5px] bg-white border border-gray-300 text-[10.5px] shadow-sm">
                            <span>Active</span>
                            <ChevronDown className="w-3 h-3 text-black" />
                        </div>
                        <div className="absolute top-[100%] left-0 w-[calc(100%+2px)] -ml-[1px] bg-white border border-gray-400 shadow-md flex flex-col z-40 text-[10.5px]">
                           <div className="px-2 py-[2.5px] bg-[#ffcc66] text-black">Active</div>
                           <div className="px-2 py-[2.5px] hover:bg-gray-100">In-Active</div>
                        </div>
                      </div>
                  </td>
                </tr>

                {/* Empty Rows */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-200 h-[22px]">
                    <td className="px-1 py-[2px] bg-[#f0f0f0] border-r border-gray-200 text-right text-[10.5px]"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                    <td className="border-r border-gray-200"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center pt-2 pb-1 px-1 gap-2 shrink-0">
          <GoldBtn>OK</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
