import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface Props {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onNewCostCenter: () => void;
  onNewDistrRule: () => void;
}

export const CostCenterTableWindow: React.FC<Props> = ({
  windowState, onClose, onUpdateState, onFocus, onNewCostCenter, onNewDistrRule
}) => {
  const columns = [
    'Centr_z', 'P&E', 'Admin', 'ICT', 'MKT', 'Electric', 'Mnt & AM', 'HR', 'BC', 'Civil', 'Shtng Co', 'Security', 'Horti', 'TBA', 'Land', 'Legal', 'Fin', 'Coord', 'QTG', 'Audit Br', 'Mac Tran'
  ];

  const rows = [
    { name: 'Admin', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Audit Br', fixed: 'N', from: '03.03.25', to: '', total: '100.00' },
    { name: 'BC', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Civil', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Coord', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'Electric', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Fin', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'Horti', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'HR', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'ICT', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Innovat', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'Land', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Legal', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'Mac Tran', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'MKT', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Mnt & AM', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'P&E', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'QTG', fixed: 'N', from: '02.09.24', to: '', total: '100.00' },
    { name: 'Security', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'Shtng Co', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
    { name: 'TBA', fixed: 'N', from: '02.06.23', to: '', total: '100.00' },
  ];

  return (
    <ResizableCriteriaWindow
      title="Table of Cost Centers and Distribution Rules"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={1000}
      initialHeight={600}
      footer={
        <div className="p-3 flex items-center justify-between border-t border-gray-400 bg-[#e5e5e5] overflow-x-auto min-h-12">
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-6 py-1 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11.5px] font-bold text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2 shrink-0"
            >
              OK
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-1 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11.5px] font-bold text-gray-800 shadow-sm active:shadow-inner transition-all w-20 border-b-2 shrink-0"
            >
              Cancel
            </button>
            <div className="w-[1px] h-6 bg-gray-400 mx-1 shrink-0" />
            <button className="px-4 py-1 bg-gray-100 border border-gray-400 rounded-[3px] text-[11px] font-medium text-gray-700 hover:bg-gray-200 transition-all shrink-0">
              Cost Accounting Adjustment
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onNewCostCenter}
              className="px-4 py-1 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-bold text-gray-800 shadow-sm transition-all shrink-0 border-b-2"
            >
              New Cost Center
            </button>
            <button 
              onClick={onNewDistrRule}
              className="px-4 py-1 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-bold text-gray-800 shadow-sm transition-all shrink-0 border-b-2"
            >
              New Distr. Rule
            </button>
          </div>
        </div>
      }
    >
      <div className="p-4 flex flex-col h-full space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-[#333] w-20 shrink-0">Dimension</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#fffae6] shadow-inner flex items-center px-1">
            <span className="flex-1 text-[10.5px] text-gray-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Departments</span>
            <div className="px-0.5 border-l border-gray-400 cursor-pointer flex items-center hover:bg-gray-200 h-full">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="flex-1 border border-gray-400 bg-white overflow-auto custom-scrollbar shadow-sm">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
              <tr>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-48">Distr. Rule/Cost Center</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-32">Fixed Amount Allocation</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-24">Effective From</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-24">Effective To</th>
                <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-20">Total</th>
                {columns.map(col => (
                  <th key={col} className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-24 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-blue-50/50 cursor-pointer group">
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-gray-800 flex items-center gap-1.5 font-medium min-w-[150px]">
                    <ArrowRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                    <span className="truncate">{row.name}</span>
                  </td>
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-center text-gray-800">{row.fixed}</td>
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-gray-800">{row.from}</td>
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-gray-800">{row.to}</td>
                  <td className="text-[10.5px] px-2 py-1 border-r border-gray-400 text-gray-800 font-bold">{row.total}</td>
                  {columns.map(col => {
                    const isDiagonal = row.name === col;
                    return (
                      <td key={col} className={`text-[10.5px] px-2 py-1 border-r border-gray-400 text-right ${isDiagonal ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-gray-400'}`}>
                        {isDiagonal ? '100.00' : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
