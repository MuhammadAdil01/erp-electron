import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronRight, Folder, FileText, Search, ChevronDown, ChevronUp, MoreHorizontal, Settings, FileSearch, ArrowRightCircle } from 'lucide-react';

interface PeriodEndClosingWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenSelectionAccounts: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center gap-1";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center gap-1";

export const PeriodEndClosingWindow: React.FC<PeriodEndClosingWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenSelectionAccounts
}) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([1, 2]);

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const accountsData = [
    { id: 1, type: 'folder', name: 'Revenue', code: '', children: [
        { id: 3, type: 'account', name: 'Sales Revenue', code: '400000', balance: '1,250,000.00' },
        { id: 4, type: 'account', name: 'Service Revenue', code: '410000', balance: '450,000.00' },
    ]},
    { id: 2, type: 'folder', name: 'Cost of Sales', code: '', children: [
        { id: 5, type: 'account', name: 'Cost of Goods Sold', code: '500000', balance: '850,000.00' },
        { id: 6, type: 'account', name: 'Inventory Adjustments', code: '510000', balance: '12,500.00' },
    ]},
    { id: 7, type: 'folder', name: 'Operating Costs', code: '', children: [] },
    { id: 8, type: 'folder', name: 'Non-Operating Income & Expenditure', code: '', children: [] },
    { id: 9, type: 'folder', name: 'Taxation & Extra. Items', code: '', children: [] },
  ];

  return (
    <ResizableCriteriaWindow
      title="Period-End Closing - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={550}
      minHeight={500}
      footer={
        <div className="h-[40px] px-3 bg-[#f0f0f0] border-t border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button className={sapButtonStyle}>Execute</button>
            <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
          </div>
          <div className="flex gap-2">
            <button className={sapGreyButtonStyle}>Expanded</button>
            <button className={sapGreyButtonStyle}>Previous Report</button>
            <button className={`${sapGreyButtonStyle} min-w-[32px]! px-1!`}><Settings className="w-3.5 h-3.5 text-gray-700" /></button>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-3 flex flex-col gap-4 overflow-hidden bg-[#f0f0f0]">
        
        {/* P/L Accounts Table Section */}
        <div className="flex flex-col flex-1 min-h-[200px]">
          <span className={sapLabelStyle}>P/L Accounts</span>
          <div className="flex-1 bg-white border border-gray-400 mt-1 overflow-auto shadow-inner custom-scrollbar">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                <tr className="h-[20px]">
                  <th className="w-[100px] border-r border-gray-300 px-2 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Account</th>
                  <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Name</th>
                </tr>
              </thead>
              <tbody>
                {accountsData.map(item => (
                  <React.Fragment key={item.id}>
                    <tr className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30 group cursor-default">
                      <td className="px-1 flex items-center gap-1">
                        <div 
                          onClick={() => toggleExpand(item.id)}
                          className="w-4 h-4 flex items-center justify-center cursor-pointer hover:bg-gray-200 rounded-sm"
                        >
                          {expandedRows.includes(item.id) ? 
                            <ChevronDown className="w-3.5 h-3.5 text-orange-500" /> : 
                            <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                          }
                        </div>
                        <Folder className="w-3.5 h-3.5 text-[#ffc800]" fill="#ffc800" />
                        <span className="text-gray-800 font-medium">{item.id}</span>
                      </td>
                      <td className="px-2 text-gray-800">{item.name}</td>
                    </tr>
                    {expandedRows.includes(item.id) && item.children.map(child => (
                      <tr key={child.id} className="h-[18px] border-b border-gray-50 hover:bg-[#ffed99]/50 cursor-default">
                        <td className="pl-6 px-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#888]" />
                          <ArrowRightCircle className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-gray-600">{child.code}</span>
                        </td>
                        <td className="px-2 text-gray-600">{child.name}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Controls Section */}
        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 pb-2">
          
          <div className="flex flex-col gap-2">
            <span className={sapLabelStyle}>Period</span>
            <div className="relative">
              <select className={`${sapInputStyle} w-full pr-5 appearance-none`}>
                <option>2016-12</option>
              </select>
              <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                 <ChevronDown className="w-3 h-3 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex flex-col gap-1">
                <span className={sapLabelStyle}>From</span>
                <div className="flex items-center">
                  <input type="text" className={`${sapInputStyle} w-24`} defaultValue="01.07.16" />
                  <div className="w-5 h-[18px] bg-[#e8e8e8] border border-l-0 border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-700" />
                  </div>
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <span className={sapLabelStyle}>To</span>
                <div className="flex items-center">
                  <input type="text" className={`${sapInputStyle} w-24`} defaultValue="30.06.17" />
                  <div className="w-5 h-[18px] bg-[#e8e8e8] border border-l-0 border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                    <MoreHorizontal className="w-3.5 h-3.5 text-gray-700" />
                  </div>
                </div>
             </div>
          </div>

          <span className={sapLabelStyle}>Retained Earnings Account</span>
          <div className="flex items-center gap-1">
            <input type="text" className={`${sapInputStyle} flex-1`} defaultValue="39001" />
            <div 
              onClick={onOpenSelectionAccounts}
              className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200"
            >
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
            </div>
          </div>

          <span className={sapLabelStyle}>Period-End Closing Account</span>
          <div className="flex items-center gap-1">
            <input type="text" className={`${sapInputStyle} flex-1`} defaultValue="39002" />
            <div 
              onClick={onOpenSelectionAccounts}
              className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200"
            >
              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
            </div>
          </div>

          <div />
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3.5 h-3.5" defaultChecked />
            <span className={sapLabelStyle}>Use Primary Closing Account</span>
          </div>

        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
