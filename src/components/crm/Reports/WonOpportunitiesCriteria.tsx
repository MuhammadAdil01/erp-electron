import React from 'react';
import { Calendar } from 'lucide-react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface WonOpportunitiesCriteriaProps {
  title: string;
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const WonOpportunitiesCriteria: React.FC<WonOpportunitiesCriteriaProps> = ({
  title,
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  if (windowState.isMinimized) return null;

  return (
    <ResizableCriteriaWindow
      title={`${title} - Selection Criteria`}
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={450}
      initialHeight={400}
      footer={
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-200 p-3 flex gap-2 items-center shrink-0">
           <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">OK</button>
           <button onClick={onClose} className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:shadow-inner">Cancel</button>

           <div className="ml-auto flex items-center gap-2">
              <input type="text" defaultValue="10" className="w-[30px] h-[18px] border border-gray-400 bg-white text-center text-[10.5px] outline-none" />
              <span className="text-[10.5px] text-gray-600 font-medium">Range in Days</span>
           </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col bg-[#f0f0f0]">
        {/* SAP Style Gold Border Bar */}
        <div className="h-[4px] bg-[#ffa500] w-full shrink-0" />

        <div className="flex-1 p-6 flex flex-col gap-3 bg-[#f0f0f0]">
           {/* Date Section */}
           <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-sm bg-white/30">
              <div className="flex items-center text-[10.5px]">
                 <label className="w-[120px] text-gray-700">Start Date From</label>
                 <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                       <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none" />
                       <Calendar className="absolute right-1 top-0.5 w-3 h-3 text-blue-800" />
                    </div>
                    <span className="text-gray-500 w-[20px] ml-2">To</span>
                    <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                 </div>
              </div>

              <div className="flex items-center text-[10.5px]">
                 <label className="w-[120px] text-gray-700">Closing Date From</label>
                 <div className="flex items-center gap-2 flex-1">
                    <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                    <span className="text-gray-500 w-[20px] ml-2">To</span>
                    <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                 </div>
              </div>
           </div>

           {/* Checkboxes Section */}
           <div className="flex flex-col gap-2 mt-4 ml-2">
              <div className="flex items-center gap-3">
                 <input type="checkbox" className="w-3.5 h-3.5" />
                 <span className="text-[10.5px] text-gray-700 w-[120px]">Sales Employee</span>
                 <button className="w-6 h-[18px] bg-[#e0e0e0] border border-gray-400 rounded-[1px] text-[12px] flex items-center justify-center text-gray-600 shadow-sm hover:bg-white active:bg-gray-300">...</button>
              </div>
              <div className="flex items-center gap-3">
                 <input type="checkbox" className="w-3.5 h-3.5" />
                 <span className="text-[10.5px] text-gray-700 w-[120px]">BP Code</span>
                 <button className="w-6 h-[18px] bg-[#e0e0e0] border border-gray-400 rounded-[1px] text-[12px] flex items-center justify-center text-gray-600 shadow-sm hover:bg-white active:bg-gray-300">...</button>
              </div>
           </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
