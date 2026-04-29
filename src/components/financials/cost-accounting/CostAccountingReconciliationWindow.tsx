import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Calendar } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CostAccountingReconciliationWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const accounts = [
    { id: 1, name: 'Assets' },
    { id: 86, name: 'Liabilities' },
    { id: 125, name: 'Capital and Reserves' },
    { id: 134, name: 'Revenue' },
    { id: 251, name: 'Cost of sales' },
    { id: 252, name: 'Operating costs' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Cost Accounting Reconciliation - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={600}
      initialHeight={550}
      footer={
        <div className="p-3 flex items-center gap-2 border-t border-gray-400 bg-[#e5e5e5]">
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">OK</button>
          <button onClick={onClose} className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">Cancel</button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#333] w-24 shrink-0">Dimension</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#fffae6] flex items-center px-1 shadow-inner">
            <span className="text-[10.5px] flex-1">Departments</span>
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#333] w-24 shrink-0">G/L Accounts</span>
            <button className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all w-20 border-b-2">Find</button>
            <div className="w-24 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
               <span className="text-[11px] flex-1">1</span>
               <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
          
          <div className="border border-gray-400 bg-white min-h-[150px] overflow-y-auto custom-scrollbar shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                <tr>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-10">#</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8">x</th>
                  <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1">Account</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id} className="border-b border-gray-200 hover:bg-blue-50/50">
                    <td className="text-[10.5px] px-2 py-0.5 border-r border-gray-300 text-gray-800 font-medium">{acc.id}</td>
                    <td className="text-[10.5px] px-2 py-0.5 border-r border-gray-300 text-gray-800 text-center">x</td>
                    <td className="text-[10.5px] px-2 py-0.5 text-gray-800 flex items-center gap-1.5">
                       <div className="w-3 h-3 text-yellow-600 font-bold flex items-center">⇒</div>
                       {acc.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          {[
            { label: 'Posting Date', checked: true, from: '01.07.25', to: '30.06.26' },
            { label: 'Due Date', checked: false, from: '', to: '' },
            { label: 'Document Date', checked: false, from: '', to: '' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32 shrink-0">
                <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
                   {f.checked && <div className="w-2 h-2 bg-gray-700" />}
                </div>
                <span className={`text-[11px] ${f.checked ? 'text-gray-800 font-bold underline italic' : 'text-gray-700'}`}>{f.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[11px] text-[#333]">From</span>
                <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">{f.from}</div>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[11px] text-[#333]">To</span>
                <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 text-[10px] shadow-inner">{f.to}</div>
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner" />
            <span className="text-[11px] text-[#333]">Exclude Closing Balance JEs</span>
          </div>
          {[
            { label: 'Display LC', checked: true },
            { label: 'Display SC', checked: false },
            { label: 'Display LC and SC', checked: false },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full border border-gray-500 bg-white flex items-center justify-center ${r.checked ? 'shadow-inner' : ''}`}>
                {r.checked && <div className="w-1.5 h-1.5 bg-gray-700 rounded-full" />}
              </div>
              <span className={`text-[11px] text-gray-800 ${r.checked ? 'font-bold underline italic' : ''}`}>{r.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-3.5 h-3.5 border border-gray-400 bg-white shadow-inner flex items-center justify-center">
               <div className="w-2 h-2 bg-gray-700" />
            </div>
            <span className="text-[11px] text-gray-800 font-bold underline italic">Hide Accounts with No Postings</span>
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
