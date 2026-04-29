import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenTable: () => void;
}

export const CostCentersSetupWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus, onOpenTable
}) => {
  const fields = [
    { label: 'Cost Center', type: 'input' },
    { label: 'Name', type: 'input' },
    { label: 'Owner', type: 'input' },
    { label: 'Sort Code', type: 'input' },
    { label: 'Dimension', type: 'select', val: 'Departments' },
    { label: 'Cost Center Type', type: 'select', val: '' },
    { label: 'Effective From', type: 'range', from: '13.04.26', to: '' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Cost Centers - Setup"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={400}
      footer={
        <div className="p-4 flex items-center justify-between border-t border-gray-400 bg-[#e5e5e5]">
          <div className="flex gap-2">
            <button 
              className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2"
            >
              Add
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2"
            >
              Cancel
            </button>
          </div>
          <button 
            onClick={onOpenTable}
            className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm active:shadow-inner transition-all w-24 border-b-2"
          >
            Open Table
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-2">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-28 shrink-0">{f.label}</span>
            <div className="flex-1 flex items-center gap-2">
              {f.type === 'range' ? (
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner flex items-center px-1 text-[10.5px]">
                    {f.from}
                  </div>
                  <span className="text-[11px] text-gray-700">To</span>
                  <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
                </div>
              ) : (
                <div className={`flex-1 h-5 border border-gray-400 ${f.type === 'select' ? 'bg-[#fffae6]' : 'bg-white'} shadow-inner flex items-center px-1`}>
                  <span className="flex-1 text-[10.5px] text-gray-800">{f.val}</span>
                  {f.type === 'select' && (
                    <div className="px-0.5 border-l border-gray-400 cursor-pointer flex items-center hover:bg-gray-200 h-full">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="flex items-center gap-4 pt-4">
          <span className="text-[11px] text-[#333] w-28 shrink-0" />
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold">Active</span>
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
