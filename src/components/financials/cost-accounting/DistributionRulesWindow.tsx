import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const DistributionRulesWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Distribution Rules - Setup"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={700}
      initialHeight={450}
      footer={
        <div className="p-4 flex items-center justify-between border-t border-gray-400 bg-[#e5e5e5]">
          <div className="flex gap-2">
            <button className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11.5px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-24 border-b-2">
              Add
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11.5px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-24 border-b-2"
            >
              Cancel
            </button>
          </div>
          <button className="px-4 py-0.5 bg-[#f0f0f0] border border-gray-400 rounded-[3px] text-[11px] font-medium text-gray-400 cursor-not-allowed">
            Cost Accounting Adjustment
          </button>
        </div>
      }
    >
      <div className="p-4 space-y-4">
        {/* Top Fields Row 1 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-[#333] w-20 shrink-0">Code</span>
            <div className="flex-1 h-5 border border-gray-400 bg-[#fffae6] shadow-inner" />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-[#333] w-24 shrink-0 px-2">Effective From</span>
            <div className="w-24 h-5 border border-gray-400 bg-white shadow-inner flex items-center px-1 text-[10.5px]">13.04.26</div>
            <span className="text-[11px] text-[#333]">To</span>
            <div className="w-24 h-5 border border-gray-400 bg-white shadow-inner" />
          </div>
        </div>

        {/* Top Fields Row 2 */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-20 shrink-0">Description</span>
          <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
        </div>

        {/* Top Fields Row 3 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-[#333] w-20 shrink-0">Dimension</span>
            <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
              <span className="flex-1 text-[10.5px]">Departments</span>
              <div className="px-0.5 border-l border-gray-400 cursor-pointer h-full flex items-center hover:bg-gray-200">
                <ChevronDown className="w-3 h-3 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-48">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold underline">Active</span>
          </div>
        </div>

        {/* Top Fields Row 4 */}
        <div className="flex items-center gap-8 items-start">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] text-[#333] w-20 shrink-0">Total</span>
            <div className="w-32 h-5 border border-gray-400 bg-white shadow-inner" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-gray-800">Direct Allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-gray-800">Allocate by Fixed Amounts</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 border border-gray-400 bg-white overflow-y-auto custom-scrollbar min-h-[150px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
              <tr>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-32">Center Code</th>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300">Center Name</th>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-blue-50/30">
                  <td className="border-r border-gray-300 px-2 py-0.5 h-6" />
                  <td className="border-r border-gray-300 px-2 py-0.5 bg-gray-50/50" />
                  <td className="px-2 py-0.5" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Text */}
        <div className="space-y-1">
          <div className="text-[11px] text-gray-800 font-bold">Centr_z-General Centre</div>
          <div className="text-[11px] text-gray-800 font-bold">Table Total</div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
