import React from 'react';
import { FixedAssetWindowShell, DropdownInput, GoldBtn } from './FixedAssetShared';
import { ArrowRight } from 'lucide-react';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const SimpleInput: React.FC<{ className?: string }> = ({ className='' }) => (
  <div className={`h-5 border border-gray-400 shadow-inner flex items-center px-1 bg-white ${className}`} />
);

export const BudgetScenarioDefinitionWindow: React.FC<Props> = (props) => {
  return (
    <FixedAssetWindowShell title="Budget Scenario Definition" {...props} minWidth={700} minHeight={400}>
      <div className="flex flex-col flex-1 bg-[#f0f0f0] p-4">
        
        <div className="flex flex-1 gap-6">
          
          {/* Left Column */}
          <div className="flex flex-col gap-2 w-80 shrink-0 mt-8">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#333] w-24 shrink-0">Scenario</span>
              <DropdownInput value="Main Budget-01.07.24" yellow className="w-48" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#333] w-24 shrink-0">Distr. Rule</span>
              <SimpleInput className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#333] w-24 shrink-0">Project</span>
              <SimpleInput className="w-24" />
            </div>
          </div>

          {/* Right Column (Table) */}
          <div className="flex flex-col flex-1 pb-4">
            <div className="flex items-center justify-between mb-1 text-[11px]">
               <GoldBtn className="px-4">Find</GoldBtn>
               <DropdownInput value="1" className="w-[100px]" />
            </div>

            <div className="flex-1 mt-1 border border-gray-400 bg-white shadow-sm overflow-hidden flex flex-col" style={{minHeight:0}}>
              <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
                    <tr>
                      <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8 text-left">#</th>
                      <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8 text-left">X</th>
                      <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 text-left">Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {id: 1, name: "Assets"},
                      {id: 299, name: "Liabilities"},
                      {id: 471, name: "Capital and Reserves"},
                      {id: 485, name: "Revenue"},
                      {id: 655, name: "Cost of sales"},
                      {id: 656, name: "Operating costs"},
                      {id: 840, name: "Non-operating income and expenditure"},
                      {id: 849, name: "Taxation and Extraordinary Items"}
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 h-5">
                        <td className="border-r border-gray-200 bg-white px-2 text-[10.5px]">{row.id}</td>
                        <td className="border-r border-gray-200 bg-white text-center text-[10.5px]">x</td>
                        <td className="px-2 text-[10.5px] flex items-center gap-1.5 h-5">
                           <ArrowRight className="w-3 h-3 text-yellow-500 font-bold" />
                           {row.name}
                        </td>
                      </tr>
                    ))}
                    {Array.from({length: 12}).map((_, i) => (
                      <tr key={'empty'+i} className="border-b border-gray-100 h-5">
                        <td className="border-r border-gray-200 bg-white"/>
                        <td className="border-r border-gray-200 bg-white"/>
                        <td className="bg-white"/>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-4 bg-[#e5e5e5] border-t border-gray-400 shrink-0" />
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-300 bg-[#f0f0f0] shrink-0">
        <div className="flex gap-2">
          <GoldBtn>OK</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
