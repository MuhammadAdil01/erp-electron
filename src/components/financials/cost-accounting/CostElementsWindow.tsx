import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostElementsWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Cost Elements - Setup"
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
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1 border border-gray-400 bg-white overflow-auto custom-scrollbar shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
              <tr>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-10">#</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-44">Cost Element Code</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300">Cost Element Description</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 w-16">Active</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="text-[10.5px] px-2 py-0.5 border-r border-gray-300 text-gray-800 font-medium bg-gray-50/50">1</td>
                <td className="text-[10.5px] px-2 py-0.5 border-r border-gray-300 text-gray-800 bg-[#fffae6]"></td>
                <td className="text-[10.5px] px-2 py-0.5 border-r border-gray-300 text-gray-800 shadow-inner"></td>
                <td className="text-[10.5px] px-2 py-0.5 text-gray-800 text-center">
                   <div className="w-4 h-4 border border-gray-400 bg-white shadow-inner flex items-center justify-center mx-auto">
                      <div className="w-2.5 h-2.5 bg-gray-600" />
                   </div>
                </td>
              </tr>
              {Array.from({ length: 15 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 h-6">
                  <td className="border-r border-gray-200 bg-gray-50/30" />
                  <td className="border-r border-gray-200" />
                  <td className="border-r border-gray-200" />
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
