import React from 'react';
import { ChevronDown } from 'lucide-react';
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

interface InactiveCustomersCriteriaProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
  wm: any;
}

export const InactiveCustomersCriteria: React.FC<InactiveCustomersCriteriaProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  wm
}) => {
  if (windowState.isMinimized) return null;

  const ow = wm.openWindow;

  return (
    <ResizableCriteriaWindow
      title="Inactive Customers - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={500}
      initialHeight={300}
      footer={
        <div className="h-[45px] bg-[#f0f0f0] border-t border-gray-300 p-3 flex gap-2 shrink-0">
           <button className="px-8 h-[22px] bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:translate-y-[1px]">OK</button>
           <button onClick={onClose} className="px-8 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:translate-y-[1px]">Cancel</button>
           <button className="ml-auto px-6 h-[22px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm hover:from-white active:translate-y-[1px]">Select All</button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col bg-[#f0f0f0]">
        {/* SAP Yellow Strip */}
        <div className="h-[4px] bg-gradient-to-r from-[#ffed99] to-[#ffdb58] w-full shrink-0" />

        <div className="flex-1 p-6 flex flex-col gap-1.5 bg-[#f0f0f0]">
           <div className="flex items-center text-[10.5px]">
              <label className="w-[100px] text-gray-700">Code</label>
              <div className="flex items-center gap-2 flex-1">
                 <span className="text-gray-500 w-[40px]">From</span>
                 <div className="relative flex items-center">
                    <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-[#fffbd5] px-1 outline-none font-mono" />
                    <button 
                      onClick={() => ow('selectionBusinessPartners')}
                      className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer hover:bg-gray-300 active:bg-gray-400"
                    >
                       <div className="w-2.5 h-2.5 rounded-full border border-gray-500" />
                    </button>
                 </div>
                 <span className="text-gray-500 w-[20px] ml-4">To</span>
                 <input type="text" className="w-[110px] h-[18px] border border-gray-400 bg-white px-1 outline-none font-mono" />
              </div>
           </div>

           <div className="flex items-center text-[10.5px] mt-2">
              <label className="w-[100px] text-gray-700">Date From</label>
              <input type="text" defaultValue="30.03.26" className="w-[300px] h-[18px] border border-gray-400 bg-white px-1 outline-none" />
           </div>

           <div className="flex items-center text-[10.5px] mt-2">
              <label className="w-[100px] text-gray-700">Customer Group</label>
              <div className="flex-1 relative">
                 <input type="text" defaultValue="All" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" />
                 <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-200 border-l border-gray-400 pointer-events-none">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                 </div>
              </div>
           </div>

           <button 
            onClick={() => ow('selectionProperties')}
            className="w-[100px] h-[20px] mt-4 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[2px] text-[10.5px] font-bold shadow-sm active:shadow-inner mb-4 hover:from-white active:translate-y-[1px]"
           >
              Properties
           </button>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};