import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Calendar } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostAccountingSummaryWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Cost Accounting Summary Report - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={480}
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

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="w-3.5 h-3.5 rounded-full border border-gray-500 bg-white shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold w-28 shrink-0 underline">Hierarchy Template</span>
            <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
              <span className="text-[10.5px] flex-1">Branches/Directorates</span>
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-3.5 h-3.5 rounded-full border border-gray-500 bg-white" />
            <span className="text-[11px] text-[#333] w-28 shrink-0 underline">Cost Center</span>
            <button className="px-1.5 h-4 bg-gray-200 border border-gray-400 rounded-sm text-[10px] shadow-sm">...</button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Cost Center Type</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-[#333]">From</span>
              <div className="flex-1 h-5 border border-gray-400 bg-gray-100 shadow-inner" />
              <span className="text-[11px] text-[#333]">To</span>
              <div className="flex-1 h-5 border border-gray-400 bg-gray-100 shadow-inner" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Sort Code</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] text-[#333]">From</span>
              <div className="flex-1 h-5 border border-gray-400 bg-gray-100 shadow-inner" />
              <span className="text-[11px] text-[#333]">To</span>
              <div className="flex-1 h-5 border border-gray-400 bg-gray-100 shadow-inner" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <span className="text-[11px] text-[#333] w-12 shrink-0">Date</span>
          <div className="w-32 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner mr-4">
            <span className="text-[10.5px] flex-1 font-bold">Posting Date</span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#333]">From</span>
            <div className="w-24 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">01.07.25</div>
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] text-[#333]">To</span>
            <div className="w-24 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">30.06.26</div>
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-[#333] w-20 italic underline">G/L Accounts</span>
              <button className="px-1.5 h-4 bg-gray-200 border border-gray-400 rounded-sm text-[10px] shadow-sm">...</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-[#333]">Add Journal Vouchers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
              <span className="text-[11px] text-[#333]">Exclude Closing Balance JEs</span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start">
             <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
             <span className="text-[11px] text-[#333] italic underline">Project</span>
             <button className="px-1.5 h-4 bg-gray-200 border border-gray-400 rounded-sm text-[10px] shadow-sm">...</button>
          </div>
        </div>

        <div className="flex items-start justify-between pt-4">
          <div className="space-y-1.5">
            {[
              { label: 'Annual Report', checked: true },
              { label: 'Quarterly Report', checked: false },
              { label: 'Monthly Report', checked: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full border border-gray-500 bg-white flex items-center justify-center ${r.checked ? 'shadow-inner' : ''}`}>
                  {r.checked && <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />}
                </div>
                <span className={`text-[11px] text-gray-800 ${r.checked ? 'font-bold underline italic' : ''}`}>{r.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[10.5px] font-bold text-gray-800 underline italic mb-1">Display in Report:</h4>
            {[
              { label: 'Display LC', checked: true },
              { label: 'Display SC', checked: false },
              { label: 'Display LC and SC', checked: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full border border-gray-500 bg-white flex items-center justify-center ${r.checked ? 'shadow-inner' : ''}`}>
                  {r.checked && <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />}
                </div>
                <span className="text-[11px] text-gray-800">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
