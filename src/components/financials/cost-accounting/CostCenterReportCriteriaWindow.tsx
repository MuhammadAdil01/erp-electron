import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostCenterReportCriteriaWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Cost Center Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={450}
      footer={
        <div className="p-3 flex items-center gap-2 border-t border-gray-400 bg-[#e5e5e5]">
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">OK</button>
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">Cancel</button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#333] w-28 shrink-0">Dimension</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#fffae6] flex items-center px-1 shadow-inner">
            <span className="text-[10.5px] flex-1">Departments</span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-3.5 h-3.5 rounded-full border border-gray-500 bg-white" />
            <span className="text-[11px] text-[#333] w-24 shrink-0 px-2">Template</span>
            <div className="flex-1 h-5 border border-gray-400 bg-gray-100 flex items-center px-1 shadow-inner">
              <span className="text-[10.5px] text-gray-800">Branches/Directorates</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-3.5 h-3.5 rounded-full border border-gray-500 bg-white shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold w-24 shrink-0 px-2 underline">Cost Center</span>
            <div className="flex items-center gap-2 flex-1">
               <span className="text-[11px] text-[#333]">From</span>
               <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
               <span className="text-[11px] text-[#333]">To</span>
               <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-4 border-t border-gray-300">
          {[
            { label: 'Sort Code' },
            { label: 'Due Date' },
            { label: 'Posting Date' },
            { label: 'Document Date' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4 pl-7">
               <span className="text-[11px] text-[#333] w-24 shrink-0 px-2">{f.label}</span>
               <div className="flex items-center gap-2 flex-1">
                  <span className="text-[11px] text-[#333]">From</span>
                  <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
                  <span className="text-[11px] text-[#333]">To</span>
                  <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
               </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <span className="text-[11px] text-[#333] w-28 shrink-0">Summary of</span>
          <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px] flex-1">Distribution Rules</span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="space-y-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
            <span className="text-[11px] text-gray-800">Project</span>
            <button className="px-1.5 h-4 bg-gray-200 border border-gray-400 rounded-sm text-[10px] shadow-sm">...</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-gray-800">Summary by Sort Code</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-gray-800">Exclude Closing Balance JEs</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-700" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold underline italic">Hide Cost Centers with No Posting</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-700" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold underline italic">Hide Distribution Rules with No Posting</span>
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
