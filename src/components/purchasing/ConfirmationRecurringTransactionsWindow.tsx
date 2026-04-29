import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicTable, YellowBtn, GreyBtn, ClassicInput, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface ConfirmationRecurringTransactionsWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const ConfirmationRecurringTransactionsWindow: React.FC<ConfirmationRecurringTransactionsWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

  const headers = [
    '#', 'Template', 'Transact. Type', 'Instance', 'Next Execution', 'Recurrence Period', 'Recurrence Date', 'BP', 'BP Name', 'Doc Total (LC)'
  ];

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div 
      className={cn("absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
        windowState.isMaximized ? "inset-0 !w-full !h-full" : ""
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: 1100,
        height: 600,
        zIndex: windowState.zIndex
      }}
    >
      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Confirmation of Recurring Transactions</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        <p className="text-[11px] text-gray-800">
          The transactions below are scheduled for today.<br/>
          Select the rows you want to execute.
        </p>

        <div className="flex-1 border border-[#808080] bg-[#f0f0f0]/30 min-h-[150px] overflow-auto custom-scrollbar">
           <ClassicTable headers={headers} rowCount={15} />
        </div>

        {/* Footer Area */}
        <div className="flex justify-between items-start">
           {/* Messages and Alerts Box */}
           <div className="border border-[#808080] p-2 w-[220px] bg-white flex flex-col gap-1.5 shadow-sm">
              <span className="text-[11px] font-bold underline">Messages and Alerts</span>
              <span className="text-[10px]">Specify the system's response to missing data:</span>
              <div className="flex flex-col gap-1 mt-1">
                 <div className="flex items-center gap-1.5">
                    <input type="radio" name="missingData" className="w-3 h-3" />
                    <span className="text-[11px]">Continue</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <input type="radio" name="missingData" className="w-3 h-3" defaultChecked />
                    <span className="text-[11px]">Skip to Next Transaction</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <input type="radio" name="missingData" className="w-3 h-3" />
                    <span className="text-[11px]">Request User Confirmation</span>
                 </div>
              </div>
           </div>

           {/* Summary Fields */}
           <div className="flex flex-col gap-1 min-w-[300px]">
              <div className="flex items-center gap-3">
                 <span className="text-[11px] flex-1 text-right">Transaction Total</span>
                 <ClassicInput className="w-[120px] bg-white text-right" />
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[11px] flex-1 text-right">Number of Transactions to Be Executed</span>
                 <ClassicInput className="w-[120px] bg-white text-right" />
              </div>
           </div>
        </div>

        {/* Action Buttons Area */}
        <div className="flex justify-between items-center mt-auto border-t border-gray-300 pt-2 shrink-0">
           <div className="flex gap-2">
              <GreyBtn disabled className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px] opacity-60">Execute</GreyBtn>
              <YellowBtn onClick={onClose} className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Cancel</YellowBtn>
              <GreyBtn disabled className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px] opacity-60">Remove</GreyBtn>
           </div>
           
           <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                 <span className="text-[11px]">Documents</span>
                 <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
                    <span className="text-[10px] font-bold">...</span>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-[11px]">Templates</span>
                 <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
                    <span className="text-[10px] font-bold">...</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

