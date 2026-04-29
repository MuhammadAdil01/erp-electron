import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostCenterHierarchyWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Cost Center Hierarchy"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={800}
      initialHeight={600}
      footer={
        <div className="p-3 flex items-center gap-2 border-t border-gray-400 bg-[#e5e5e5]">
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">OK</button>
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">Cancel</button>
        </div>
      }
    >
      <div className="flex h-full min-h-0">
        {/* Left Side: Details */}
        <div className="w-[300px] border-r border-gray-400 p-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-800 underline italic">Hierarchy Details</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-700 w-24">Dimension</span>
                <div className="flex-1 h-5 border border-gray-400 bg-[#fffae6] flex items-center px-1 shadow-inner">
                  <span className="text-[10.5px] flex-1">Departments</span>
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-700 w-24">Template</span>
                <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
                  <div className="flex-1" />
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-800 underline italic">Item Details</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-700 w-24">Item Name</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-800 underline italic">Item Location</h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-700 w-24">Parent Article</span>
                <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
                  <div className="flex-1" />
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-700 w-24">Loc. on Tree</span>
                <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
                  <div className="flex-1" />
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-800 underline italic">Financial KPI Factors</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-700 w-24">Factor</span>
              <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
            </div>
          </div>
        </div>

        {/* Right Side: Tree Placeholder */}
        <div className="flex-1 flex flex-col min-w-0 bg-white p-2">
           <div className="flex-1 border border-gray-300 overflow-y-auto custom-scrollbar relative">
             <div className="absolute top-0 right-0 bottom-0 w-4 border-l border-gray-200 bg-gray-50 flex flex-col">
                <div className="h-4 border-b border-gray-300 bg-gray-200 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3 rotate-180" />
                </div>
                <div className="flex-1" />
                <div className="h-4 border-t border-gray-300 bg-gray-200 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3" />
                </div>
             </div>
           </div>
           <div className="p-2 flex justify-end gap-2">
              <button className="px-4 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[10.5px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all border-b-2 whitespace-nowrap">
                Add Same-Level Cost Center
              </button>
              <button className="px-4 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[10.5px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all border-b-2 whitespace-nowrap">
                Add Child Cost Center
              </button>
           </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
