import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Calendar } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostAccountingAdjustmentCriteriaWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Journal Entry for Cost Accounting Adjustment - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={400}
      footer={
        <div className="p-3 flex items-center gap-2 border-t border-gray-400 bg-[#e5e5e5]">
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">OK</button>
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">Cancel</button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#333] w-24 shrink-0">Dimension</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#fffae6] flex items-center px-1 shadow-inner">
            <span className="text-[10.5px] flex-1">Departments</span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-24 shrink-0 font-bold underline italic">Posting Date</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-[#333]">From</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">01.07.25</div>
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] text-[#333]">To</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">30.06.26</div>
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-24 shrink-0">Cost Center</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-[#333]">From</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-[#333]">To</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-300">
           <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-gray-800">Include Pre-existing Adjustments</span>
           </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
