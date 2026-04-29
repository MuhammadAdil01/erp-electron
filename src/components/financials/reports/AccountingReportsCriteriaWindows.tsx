import React from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

const ListIcon = () => (
   <div className="w-[14px] h-full flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-500">
     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center">
       <div className="w-[4px] h-[1px] bg-gray-500" />
     </div>
   </div>
);

// =========================================================================
// TRANSACTION JOURNAL REPORT
// =========================================================================
export const TransactionJournalReportWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
  return (
    <ResizableCriteriaWindow
      title="Transaction Journal Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={400}
      initialHeight={230}
      footer={
        <div className="h-[45px] p-2 flex items-end justify-between shrink-0 bg-[#f0f0f0]">
           <div className="flex gap-2">
              <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
              <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
           </div>
           <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner underline underline-offset-2 decoration-gray-800">Series</button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-5 p-3 px-4 text-[10.5px] mt-2">
         {/* Row 1 */}
         <div className="flex items-center">
            <span className="w-[140px] text-gray-800">Original Journal</span>
            <div className="relative w-[210px] h-[18px]">
               <input type="text" defaultValue="Journal Entry" className="w-full h-full border border-gray-400 bg-[#fff9c4] px-1 outline-none cursor-default" readOnly />
               <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
                  <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
               </div>
            </div>
         </div>

         {/* Row 2 */}
         <div className="flex items-center text-[10.5px]">
            <span className="w-[140px] text-gray-800">Posting Date From</span>
            <div className="w-[85px]"><input type="text" defaultValue="01.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
            <span className="text-gray-800 px-3">To</span>
            <div className="w-[85px]"><input type="text" defaultValue="30.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
         </div>

         {/* Row 3 */}
         <div className="flex items-center text-[10.5px]">
            <span className="w-[140px] text-gray-800">Transaction No. From</span>
            <div className="w-[85px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
            <span className="text-gray-800 px-3">To</span>
            <div className="w-[85px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
         </div>
      </div>
    </ResizableCriteriaWindow>
  );
};

// =========================================================================
// TRANSACTION REPORT BY PROJECTS
// =========================================================================
export const TransactionReportByProjectsWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Transaction Report by Projects - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={380}
       initialHeight={260}
       footer={
         <div className="h-[40px] p-2 pb-3 mb-1 flex items-end shrink-0 bg-[#f0f0f0]">
            <div className="flex gap-2">
               <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>OK</button>
               <button className="w-[70px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-[#ffebaa] active:shadow-inner" onClick={onClose}>Cancel</button>
            </div>
         </div>
       }
     >
       <div className="flex-1 flex flex-col p-2 text-[10.5px]">
          {/* Section 1 */}
          <div className="flex flex-col gap-1.5 p-2">
             <div className="flex items-center">
                <span className="w-[100px] text-gray-800">Project</span>
                <span className="w-[35px] text-gray-800">From</span>
                <div className="relative w-[95px] h-[18px]">
                   <input type="text" className="w-full h-full border border-gray-400 bg-[#fff9c4] px-1 outline-none text-right pr-4" />
                   <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
                </div>
                <span className="text-gray-800 w-[25px] text-center">To</span>
                <div className="w-[95px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
             </div>
 
             <div className="flex items-center">
                <span className="w-[100px] text-gray-800">G/L Account</span>
                <span className="w-[35px] text-gray-800">From</span>
                <div className="w-[95px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
                <span className="text-gray-800 w-[25px] text-center">To</span>
                <div className="w-[95px]"><input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
             </div>
          </div>
 
          <div className="h-[1px] bg-gray-400 my-2 shadow-[0_1px_1px_white]"></div>
 
          {/* Section 2 */}
          <div className="flex flex-col gap-1.5 p-2">
             <div className="flex items-center">
                <span className="w-[100px] text-gray-800">Due Date</span>
                <span className="w-[35px] text-gray-800">From</span>
                <div className="w-[95px]"><input type="text" defaultValue="01.07.15" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
                <span className="text-gray-800 w-[25px] text-center">To</span>
                <div className="w-[95px]"><input type="text" defaultValue="30.06.45" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
             </div>
 
             <div className="flex items-center">
                <span className="w-[100px] text-gray-800">Posting Date</span>
                <span className="w-[35px] text-gray-800">From</span>
                <div className="w-[95px]"><input type="text" defaultValue="01.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
                <span className="text-gray-800 w-[25px] text-center">To</span>
                <div className="w-[95px]"><input type="text" defaultValue="30.04.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
             </div>
 
             <div className="flex items-center">
                <span className="w-[100px] text-gray-800">Document Date</span>
                <span className="w-[35px] text-gray-800">From</span>
                <div className="w-[95px]"><input type="text" defaultValue="01.07.15" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
                <span className="text-gray-800 w-[25px] text-center">To</span>
                <div className="w-[95px]"><input type="text" defaultValue="30.06.45" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-right pr-4" /></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };
