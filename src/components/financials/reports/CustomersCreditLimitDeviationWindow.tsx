import React from 'react';
import { GoldBtn } from '../FixedAssetShared';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const data = [
  { code: '01/OL/001957/', name: '', balance: '3,025,000.00', limit: '0.00', deviation: '-3,025,000.00' },
  { code: '01/OL2/GP1219/D', name: '', balance: '466,400.00', limit: '0.00', deviation: '-466,400.00' },
  { code: '01/OL3/BD0026/D', name: '288', balance: '1,049,900.00', limit: '0.00', deviation: '-1,049,900.00' },
  { code: '01/OL2/GP0849/D', name: '', balance: '466,400.00', limit: '0.00', deviation: '-466,400.00' },
  { code: '01/OL2/CP0006/D', name: '', balance: '933,200.00', limit: '0.00', deviation: '-933,200.00' },
  { code: '01/OL2/CP0007/D', name: '', balance: '933,400.00', limit: '0.00', deviation: '-933,400.00' },
  { code: '01/OL2/CP0015/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/CP0050/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/DE0001/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/DE0003/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/DP0022/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/DP0024/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
  { code: '01/OL2/GE0021/D', name: '', balance: '583,100.00', limit: '0.00', deviation: '-583,100.00' },
  { code: '01/OL2/GE0022/D', name: '', balance: '1,400,000.00', limit: '0.00', deviation: '-1,400,000.00' },
];

export const CustomersCreditLimitDeviationWindow: React.FC<Props> = (props) => {
  return (
    <ResizableCriteriaWindow
      title="Customers Credit Limit Deviation"
      {...props}
      initialWidth={800}
      initialHeight={450}
      minWidth={800}
      minHeight={450}
      footer={
        <div className="px-3 py-2 shrink-0 bg-[#f0f0f0] flex flex-col gap-3 border-t border-gray-300">
          {/* Query results link */}
          <div className="flex items-center gap-1 text-[11px] text-[#333] cursor-pointer hover:underline w-fit group">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#333] group-hover:border-l-black" />
            <span>Display Query Results</span>
          </div>

          <div className="flex justify-between items-end pb-1">
             <div className="flex gap-2">
               <GoldBtn className="px-8!">OK</GoldBtn>
               <GoldBtn className="px-5! bg-[#ececec] text-[#333]">Copy Data</GoldBtn>
             </div>
             
             {/* Small chart icon */}
             <div className="flex flex-col gap-[2px] items-center cursor-pointer opacity-80 hover:opacity-100">
                <div className="flex items-end gap-[1px] h-3">
                   <div className="w-[3px] h-1.5 bg-green-600" />
                   <div className="w-[3px] h-2 bg-yellow-500" />
                   <div className="w-[3px] h-3 bg-red-600" />
                </div>
                <div className="w-[12px] h-[1px] bg-gray-600" />
             </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col flex-1 bg-[#f0f0f0] min-h-0">
        {/* Table Container */}
        <div className="flex-1 overflow-auto border-b border-gray-300 relative bg-white m-3 shadow-inner custom-scrollbar">
           <table className="w-full border-collapse text-[11px]">
             <thead className="sticky top-0 bg-[#ececec] z-10">
               <tr className="border-b border-gray-300">
                 <th className="w-10 border-r border-gray-300 px-1 py-1 font-normal text-left text-[#333]">#</th>
                 <th className="w-32 border-r border-gray-300 px-2 py-1 font-normal text-left text-[#333]">BP Code</th>
                 <th className="w-24 border-r border-gray-300 px-2 py-1 font-normal text-left text-[#333]">BP Name</th>
                 <th className="w-32 border-r border-gray-300 px-2 py-1 font-normal text-left text-[#333]">Account Balance</th>
                 <th className="w-24 border-r border-gray-300 px-2 py-1 font-normal text-left text-[#333]">Credit Limit</th>
                 <th className="w-32 px-2 py-1 font-normal text-left text-[#333]">Deviation</th>
               </tr>
             </thead>
             <tbody>
               {data.map((row, i) => (
                 <tr key={i} className="border-b border-gray-200 hover:bg-[#ffed99]/30 group cursor-default">
                   <td className="border-r border-gray-200 px-1 py-0.5 text-[#333] text-center w-10">{i + 1}</td>
                   <td className="border-r border-gray-200 px-2 py-0.5 flex items-center gap-1.5 min-w-[130px]">
                      <div className="w-3 h-3 flex items-center justify-center cursor-pointer pointer-events-auto shrink-0 shadow-sm border border-yellow-600 rounded-[1px] bg-gradient-to-b from-[#ffed99] to-[#f39c12]">
                        <div className="w-0 h-0 border-t-[3px] border-t-white border-x-[2.5px] border-x-transparent rotate-[-90deg]" />
                      </div>
                      <span className="text-black leading-tight">{row.code}</span>
                   </td>
                   <td className="border-r border-gray-200 px-2 py-0.5 text-black">{row.name}</td>
                   <td className="border-r border-gray-200 px-2 py-0.5 text-right font-bold text-black">{row.balance}</td>
                   <td className="border-r border-gray-200 px-2 py-0.5 text-right font-bold text-black">{row.limit}</td>
                   <td className="px-2 py-0.5 text-right font-bold text-black">{row.deviation}</td>
                 </tr>
               ))}
             </tbody>
           </table>
           
           {/* Top Right Box Icon (Small square with arrow) */}
           <div className="absolute top-1 right-1 w-4 h-4 border border-blue-400 bg-blue-50 flex items-center justify-center cursor-pointer shadow-sm hover:bg-blue-100">
               <div className="w-2.5 h-2.5 border-t border-r border-blue-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[5px] h-[5px] bg-blue-600 rotate-45 translate-x-[2px] -translate-y-[2px]" />
               </div>
           </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
