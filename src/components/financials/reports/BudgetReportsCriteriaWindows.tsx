import React from 'react';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Search } from 'lucide-react';
import { budgetScenariosApi, budgetLinesApi } from '../../../api/financials.api';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props { windowState: WindowState; onClose: () => void; onUpdateState: (s: Partial<WindowState>) => void; onFocus: () => void; }

const ListIcon = () => (
   <div className="w-[14px] h-full flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer">
     <div className="w-[8px] h-[8px] rounded-full border border-gray-500 flex items-center justify-center">
       <div className="w-[4px] h-[1px] bg-gray-500" />
     </div>
   </div>
);

const YellowArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-sm">
    <path d="M4 12H16M16 12L10 6M16 12L10 18" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MonthGrid = ({ year = "2024" }) => (
   <div className="mt-2 flex flex-col border border-gray-400 bg-white">
      <div className="flex bg-[#ffe082] border-b border-gray-400 h-[18px] text-gray-800 font-medium">
         <div className="w-[80px] px-1 border-r border-gray-400">Date</div>
         {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
            <div key={m} className="flex-1 px-1 border-r border-gray-400 text-center">{m}</div>
         ))}
         <div className="w-[16px] flex items-center justify-center"><ChevronDown className="w-2.5 h-2.5 bg-gray-200 border border-gray-400" /></div>
      </div>
      <div className="flex h-[18px]">
         <div className="w-[80px] px-1 border-r border-gray-300 flex items-center gap-1 bg-white">
            <span className="flex-1">{year}</span>
            <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
         </div>
         {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-300 bg-[#fff9c4]"></div>
         ))}
         <div className="w-[16px] bg-[#f0f0f0]"></div>
      </div>
   </div>
);

const AccountTable = ({ accounts }: { accounts: any[] }) => (
   <div className="h-[120px] border border-gray-400 bg-white overflow-hidden flex flex-col relative w-full">
      <div className="flex items-center bg-[#f0f0f0] border-b border-gray-300 h-[20px] shrink-0 text-gray-700">
         <div className="w-[30px] px-1 border-r border-gray-300 h-full flex items-center">#</div>
         <div className="w-[20px] px-0.5 border-r border-gray-300 h-full flex items-center justify-center">x</div>
         <div className="flex-1 px-1 border-r border-gray-300 h-full flex items-center whitespace-nowrap overflow-hidden">Account</div>
         <div className="w-[16px] h-full flex items-center justify-center bg-[#f0f0f0]"><Search className="w-3 h-3 text-blue-400 rotate-90" /></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
         {accounts.map((acc, i) => (
            <div key={acc.id} className="flex items-center h-[18px] border-b border-gray-200">
               <div className="w-[30px] px-1 border-r border-gray-200 text-gray-600 h-full flex items-center bg-[#f8f8f8]">{acc.id}</div>
               <div className="w-[20px] border-r border-gray-200 h-full flex items-center justify-center bg-[#f8f8f8]"><input type="checkbox" className="w-[10px] h-[10px]" /></div>
               <div className="flex-1 px-1 h-full flex items-center gap-1 bg-white truncate"><YellowArrow />{acc.name}</div>
            </div>
         ))}
      </div>
   </div>
);

// =========================================================================
// BUDGET REPORT
// =========================================================================
export const BudgetReportWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
  const [selectedScenarioId, setSelectedScenarioId] = React.useState<string>('');
  const [reportResult, setReportResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const [scenarios, setScenarios] = React.useState<any[]>([]);

  React.useEffect(() => {
    budgetScenariosApi.getAll().then((data) => {
      setScenarios(data);
      if (data.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(data[0].id);
      }
    }).catch(() => undefined);
  }, []);

  const handleExecute = async () => {
    if (!selectedScenarioId) {
      setError('Please select a Budget Scenario.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await budgetLinesApi.versusActual(selectedScenarioId);
      setReportResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate budget report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ResizableCriteriaWindow
        title="Budget Report - Selection Criteria"
        windowState={windowState}
        onClose={onClose}
        onUpdateState={onUpdateState}
        onFocus={onFocus}
        initialWidth={800}
        initialHeight={500}
        footer={
          <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button
              className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner"
              onClick={handleExecute}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Execute'}
            </button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
          </div>
        }
      >
        <div className="flex-1 p-2 text-[10.5px] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-1.5 bg-red-100 border border-red-400 text-red-700 rounded text-[11px]">
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-col gap-1 pr-4">
                <div className="flex items-center gap-2"><input type="radio" name="br_rt" defaultChecked className="w-3 h-3" /><span className="text-gray-800">Annual Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="br_rt" className="w-3 h-3" /><span className="text-gray-800">Quarterly Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="br_rt" className="w-3 h-3" /><span className="text-gray-800">Monthly Report</span></div>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-2"><input type="radio" name="br_c" defaultChecked className="w-3 h-3" /><span className="text-gray-800 underline">Local Currency</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="br_c" className="w-3 h-3" /><span className="text-gray-800 underline">Display in SC</span></div>
                <div className="flex items-center gap-2 mt-2"><input type="checkbox" className="w-3 h-3" /><span className="text-gray-800 italic pr-1">Future Balances</span></div>
              </div>
            </div>

            <div className="flex-[1.5] flex flex-col gap-2">
              <div className="flex items-center gap-2 pr-6">
                <span className="w-[80px] text-gray-700 font-semibold">Scenario</span>
                <div className="relative flex-1">
                  <select
                    value={selectedScenarioId}
                    onChange={(e) => setSelectedScenarioId(e.target.value)}
                    className="w-full h-[22px] border border-gray-400 bg-[#fff9c4] px-1 text-[11px] font-semibold text-blue-900 outline-none"
                  >
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name} ({s.fiscalYear})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 mt-1">
                <div className="p-2 border border-gray-300 bg-gray-50 rounded text-[11px] text-gray-600">
                  Select a budget scenario above and click <strong>Execute</strong> to generate the comprehensive Budget versus Actual comparison report.
                </div>
              </div>
            </div>
          </div>

          <MonthGrid year="2026" />
        </div>
      </ResizableCriteriaWindow>

      {/* Results View Modal */}
      {reportResult && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1a3a6b] rounded shadow-2xl w-[860px] max-h-[85vh] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-bold text-[#1a3a6b] text-[13px] block">
                  Budget Report: {reportResult.scenario.code} — {reportResult.scenario.name}
                </span>
                <span className="text-[10.5px] text-gray-500">
                  Fiscal Year: {reportResult.scenario.fiscalYear} · Currency: USD
                </span>
              </div>
              <button onClick={() => setReportResult(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <div className="border border-gray-300 rounded overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full border-collapse text-[11px]">
                <thead className="bg-[#e5e5e5] border-b text-gray-700 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 border-r text-left w-24">Account Code</th>
                    <th className="px-2 py-1 border-r text-left">Account Name</th>
                    <th className="px-2 py-1 border-r text-right w-28">Budget ($)</th>
                    <th className="px-2 py-1 border-r text-right w-28">Actual ($)</th>
                    <th className="px-2 py-1 border-r text-right w-28">Variance ($)</th>
                    <th className="px-2 py-1 text-right w-24">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {reportResult.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                        No budget lines defined for this scenario.
                      </td>
                    </tr>
                  ) : (
                    reportResult.rows.map((row: any, i: number) => {
                      const varianceNum = parseFloat(row.variance) || 0;
                      return (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 h-6">
                          <td className="border-r px-2 font-mono font-bold text-gray-800">{row.account.code}</td>
                          <td className="border-r px-2 font-medium text-gray-800">{row.account.name}</td>
                          <td className="border-r px-2 text-right font-mono font-semibold">${Number(row.budget).toFixed(2)}</td>
                          <td className="border-r px-2 text-right font-mono font-semibold">${Number(row.actual).toFixed(2)}</td>
                          <td className={`border-r px-2 text-right font-mono font-bold ${varianceNum > 0 ? 'text-red-700' : 'text-green-700'}`}>
                            ${Number(row.variance).toFixed(2)}
                          </td>
                          <td className="px-2 text-right font-mono text-gray-700">
                            {row.variancePercent !== null ? `${Number(row.variancePercent).toFixed(1)}%` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-400 rounded text-[11px] font-semibold text-gray-800"
              >
                Print Report
              </button>
              <button
                onClick={() => setReportResult(null)}
                className="px-4 py-1 bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// =========================================================================
// BALANCE SHEET BUDGET REPORT
// =========================================================================
export const BalanceSheetBudgetWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Balance Sheet Budget Report - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={750}
       initialHeight={450}
       footer={
         <div className="h-[40px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-2 text-[10.5px] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <MonthGrid year="24-25" />

          <div className="flex items-center gap-2 mt-4">
             <div className="relative w-[130px]">
                <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
             </div>
             <span className="text-gray-700 ml-12">To</span>
             <div className="relative w-[100px] ml-1">
                <input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 text-right pr-4 outline-none" />
                <div className="absolute right-0 top-0 bottom-0"><ListIcon /></div>
             </div>
             <span className="text-gray-700 ml-12">Scenario</span>
             <div className="relative flex-1 max-w-[200px] ml-1">
                <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
             </div>
          </div>

          <div className="flex gap-4 mt-6">
             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="radio" name="bsb_c" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Local Currency</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="bsb_c" className="w-3.5 h-3.5" /><span className="text-gray-800">System Currency</span></div>
                <div className="flex items-center gap-2 mt-1"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">External Code</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800 text-[10px]">Ignore Adj. Trans. (Period 13)</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Accounts with Balance of Zero</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Budget-Relevant Accounts Only</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Foreign Names</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5 ml-4">
                <div className="flex items-center gap-2"><input type="radio" name="bsb_rt" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Annual Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="bsb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Quarterly Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="bsb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Monthly Report</span></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// TRIAL BALANCE BUDGET REPORT
// =========================================================================
export const TrialBalanceBudgetWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   const accounts = [
      { id: '1', name: 'Assets' }, { id: '307', name: 'Liabilities' }, { id: '485', name: 'Capital and Reserves' },
      { id: '499', name: 'Revenue' }, { id: '711', name: 'Cost of sales' }, { id: '712', name: 'Operating costs' },
      { id: '903', name: 'Non-operating income and expenditure' }, { id: '912', name: 'Taxation and Extraordinary Items' },
   ];
 
   return (
     <ResizableCriteriaWindow
       title="Trial Balance Budget Report - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={850}
       initialHeight={680}
       footer={
         <div className="h-[45px] p-2 flex items-center justify-between mb-1 shrink-0 bg-[#f0f0f0]">
            <div className="flex gap-2">
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
            </div>
            <div className="flex gap-1 pr-1">
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner underline underline-offset-1">Expanded</button>
               <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner">Select All</button>
            </div>
         </div>
       }
     >
       <div className="flex-1 p-2 text-[10.5px] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <div className="flex justify-end p-1">
             <div className="w-[300px] flex flex-col pt-1">
                <div className="flex items-center gap-1.5 mb-1 justify-end">
                   <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
                   <span className="text-gray-800 mr-12 pr-4">G/L Accounts</span>
                   <button className="px-5 h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 rounded-[2px] text-[10.5px] font-medium shadow-sm active:shadow-inner">Find</button>
                   <div className="relative w-12 ml-1"><input type="text" defaultValue="1" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none text-right pr-4" readOnly /><div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-transparent cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div></div>
                </div>
                <AccountTable accounts={accounts} />
             </div>
          </div>

          <div className="flex items-center gap-2 mt-4 px-1">
             <div className="relative w-[150px]">
                <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none text-[9.5px]" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5" /></div>
             </div>
             <span className="text-gray-700 font-bold ml-6">From</span>
             <div className="relative w-[110px] ml-1"><input type="text" defaultValue="01.07.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-right" /><div className="absolute right-[16px] top-0 bottom-0 flex items-center h-full"><div className="w-[10px] h-[10px] rounded-full border border-gray-400"></div></div></div>
             <span className="text-gray-700 font-bold ml-6">To</span>
             <div className="relative w-[110px] ml-1"><input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 text-right" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
             <span className="text-gray-700 ml-12">Scenario</span>
             <div className="relative flex-1 max-w-[200px] ml-1">
                <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
             </div>
          </div>

          <div className="flex gap-4 mt-6">
             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Local Currency</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">System Currency</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">External Code</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Ignore Adjustments</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Hide Zero Balanced Acct</span></div>
                <div className="flex items-center gap-2 ml-4"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Hide Acct with No Postings</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Budget Accounts Only</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Foreign Names</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5 ml-4">
                <div className="flex items-center gap-2"><input type="radio" name="tbb_rt" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Annual Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="tbb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Quarterly Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="tbb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Monthly Report</span></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// PROFIT AND LOSS STATEMENT BUDGET REPORT
// =========================================================================
export const ProfitLossBudgetWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Profit and Loss Statement Budget Report - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={750}
       initialHeight={450}
       footer={
         <div className="h-[45px] p-2 flex items-center justify-between mb-1 shrink-0 bg-[#f0f0f0]">
            <div className="flex gap-2">
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
              <button className="w-[85px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
            </div>
            <button className="w-[100px] h-[20px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner">Expanded</button>
         </div>
       }
     >
       <div className="flex-1 p-2 text-[10.5px] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <MonthGrid year="24-25" />

          <div className="flex items-center gap-2 mt-4 px-1">
             <div className="relative w-[130px]">
                <input type="text" defaultValue="Posting Date" className="w-full h-[18px] border border-gray-400 bg-[#fff9c4] px-1 outline-none font-medium" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-2.5 h-2.5 shadow-sm" /></div>
             </div>
             <span className="text-gray-700 ml-4 font-bold underline underline-offset-1">From</span>
             <div className="relative w-[100px] ml-1"><input type="text" defaultValue="01.07.25" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-right" /><div className="absolute right-[16px] top-0 bottom-0 flex items-center h-full"><div className="w-[10px] h-[10px] rounded-full border border-gray-400"></div></div></div>
             <span className="text-gray-700 ml-4 font-bold underline underline-offset-1">To</span>
             <div className="relative w-[100px] ml-1"><input type="text" defaultValue="30.06.26" className="w-full h-[18px] border border-gray-400 bg-white px-1 text-right pr-4 outline-none" /><div className="absolute right-0 top-0 bottom-0"><ListIcon /></div></div>
             <span className="text-gray-700 ml-12">Scenario</span>
             <div className="relative flex-1 max-w-[150px] ml-1">
                <input type="text" className="w-full h-[18px] border border-gray-400 bg-white px-1 outline-none" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[14px] flex items-center justify-center bg-gray-200 border-l border-gray-400 cursor-pointer shadow-sm"><ChevronDown className="w-2.5 h-2.5" /></div>
             </div>
          </div>

          <div className="flex gap-4 mt-6">
             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="radio" name="plb_c" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Local Currency</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="plb_c" className="w-3.5 h-3.5" /><span className="text-gray-800">System Currency</span></div>
                <div className="flex items-center gap-2 mt-1"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">External Code</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800 text-[10.5px] whitespace-nowrap">Ignore Adj. Trans. (Period 13)</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Accounts with Balance of Zero</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800 underline">Budget-Relevant Accounts Only</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" className="w-3.5 h-3.5" /><span className="text-gray-800">Foreign Names</span></div>
             </div>

             <div className="flex-1 flex flex-col gap-1.5 ml-4">
                <div className="flex items-center gap-2"><input type="radio" name="plb_rt" defaultChecked className="w-3.5 h-3.5" /><span className="text-gray-800">Annual Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="plb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Quarterly Report</span></div>
                <div className="flex items-center gap-2"><input type="radio" name="plb_rt" className="w-3.5 h-3.5" /><span className="text-gray-800">Monthly Report</span></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };

// =========================================================================
// BUDGET REPORT CATEGORIZED
// =========================================================================
export const BudgetReportCategorizedWindow: React.FC<Props> = ({ windowState, onClose, onUpdateState, onFocus }) => {
   return (
     <ResizableCriteriaWindow
       title="Budget Report Categorized - Selection Criteria"
       windowState={windowState}
       onClose={onClose}
       onUpdateState={onUpdateState}
       onFocus={onFocus}
       initialWidth={500}
       initialHeight={250}
       footer={
         <div className="h-[45px] p-2 flex items-center gap-2 mb-1 shrink-0 bg-[#f0f0f0]">
            <button className="w-[85px] h-[22px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>OK</button>
            <button className="w-[85px] h-[22px] bg-gradient-to-b from-[#ffea99] to-[#ffd000] border border-gray-500 text-[11px] font-bold rounded-[2px] shadow-sm active:shadow-inner" onClick={onClose}>Cancel</button>
         </div>
       }
     >
       <div className="flex-1 p-6 text-[11px] flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <span className="w-[120px] text-gray-700 font-bold">Enter Cost Center:</span>
             <div className="relative w-[150px]">
                <input type="text" className="w-full h-[20px] border border-gray-400 bg-[#fff9c4] px-1 outline-none shadow-inner" />
                <div className="absolute right-0 top-0 bottom-0 flex items-center px-1"><div className="w-[12px] h-[12px] rounded-full border border-gray-400"></div></div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="w-[120px] text-gray-700 font-bold">Year</span>
             <div className="relative w-[150px]">
                <input type="text" className="w-full h-[20px] border border-gray-400 bg-white px-1 outline-none shadow-inner" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-100 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-3 h-3" /></div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="w-[120px] text-gray-700 font-bold">Dev/Non--Dev:</span>
             <div className="relative w-[150px]">
                <input type="text" className="w-full h-[20px] border border-gray-400 bg-white px-1 outline-none shadow-inner" readOnly />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] flex items-center justify-center bg-gray-100 border-l border-gray-400 cursor-pointer text-gray-600"><ChevronDown className="w-3 h-3" /></div>
             </div>
          </div>
       </div>
     </ResizableCriteriaWindow>
   );
 };
