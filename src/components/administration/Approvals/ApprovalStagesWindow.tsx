import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

interface ApprovalStagesWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const ApprovalStagesWindow: React.FC<ApprovalStagesWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Approval Stages - Setup"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={550}
      minHeight={400}
    >
      <div className="flex-1 p-3 flex flex-col gap-4 bg-[#f0f0f0] overflow-hidden">
        
        {/* Header Form */}
        <div className="grid grid-cols-[160px_1fr] gap-x-2 gap-y-1">
           <span className={sapLabelStyle}>Stage Name</span>
           <input type="text" className={`${sapInputStyle} !bg-[#fffbd0]`} />

           <span className={sapLabelStyle}>Stage Description</span>
           <input type="text" className={sapInputStyle} />

           <span className={sapLabelStyle}>No. of Approvals Required</span>
           <div className="w-32">
              <input type="text" className={sapInputStyle} defaultValue="1" />
           </div>

           <span className={sapLabelStyle}>No. of Rejections Required</span>
           <div className="w-32">
              <input type="text" className={sapInputStyle} defaultValue="1" />
           </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar mt-2">
           <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                 <tr className="h-[22px]">
                    <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                    <th className="w-1/2 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Authorizer</th>
                    <th className="px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] flex items-center justify-between">
                       <span>Department</span>
                       <ArrowUpRight className="w-3 h-3 text-blue-600 cursor-pointer" />
                    </th>
                 </tr>
              </thead>
              <tbody>
                 <tr className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30">
                    <td className="w-8 border-r border-gray-100 text-center text-gray-500">1</td>
                    <td className="border-r border-gray-100 px-1 flex items-center justify-end">
                       <ChevronDown className="w-3 h-3 text-gray-800" />
                    </td>
                    <td className="px-1"></td>
                 </tr>
                 {Array.from({ length: 15 }).map((_, i) => (
                   <tr key={i} className="h-[18px] border-b border-gray-50 hover:bg-gray-50">
                      <td className="w-8 border-r border-gray-100"></td>
                      <td className="border-r border-gray-100 px-1"></td>
                      <td className="px-1"></td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 mt-auto">
           <button className={sapButtonStyle}>Add</button>
           <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
