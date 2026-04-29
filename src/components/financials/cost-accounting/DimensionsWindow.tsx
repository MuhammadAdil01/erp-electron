import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const DimensionsWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const dimensions = [
    { name: 'Dimension 1', active: true, description: 'Departments' },
    { name: 'Dimension 2', active: false, description: 'Dimension 2' },
    { name: 'Dimension 3', active: false, description: 'Dimension 3' },
    { name: 'Dimension 4', active: false, description: 'Dimension 4' },
    { name: 'Dimension 5', active: false, description: 'Dimension 5' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Dimensions"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={450}
      initialHeight={250}
      footer={
        <div className="p-3 flex items-center gap-2 border-t border-gray-400 bg-[#e5e5e5]">
          <button 
            onClick={onClose}
            className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2"
          >
            OK
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1 border border-gray-400 bg-white overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
              <tr>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-32">Name</th>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-12 text-center">Act.</th>
                <th className="text-[11px] font-bold text-gray-700 px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-blue-50/50 cursor-pointer">
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-gray-800">{dim.name}</td>
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-center">
                    <div className="w-3.5 h-3.5 border border-gray-400 bg-white mx-auto flex items-center justify-center shadow-inner">
                      {dim.active && <div className="w-2 h-2 bg-gray-600" />}
                    </div>
                  </td>
                  <td className="text-[10.5px] px-2 py-1 text-gray-800">{dim.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
