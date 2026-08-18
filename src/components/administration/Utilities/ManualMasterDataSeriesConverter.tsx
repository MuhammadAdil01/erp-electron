import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface ManualMasterDataSeriesConverterProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  onOpenSelectionItems: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const ManualMasterDataSeriesConverter: React.FC<ManualMasterDataSeriesConverterProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  onOpenSelectionItems
}) => {
  const [activeTab, setActiveTab] = useState<'Items' | 'BPs'>('Items');

  return (
    <ResizableCriteriaWindow
      title="Manual Master Data Series Converter - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={500}
      minHeight={350}
    >
      <div className="flex-1 p-3 flex flex-col gap-4 bg-[#f0f0f0] overflow-hidden">
        
        <div className="flex flex-col border border-gray-400 p-2 pt-0 bg-[#f0f0f0]">
           {/* Tabs */}
           <div className="flex -mx-2 bg-[#f0f0f0] border-b border-gray-400">
              <button 
                onClick={() => setActiveTab('Items')}
                className={`px-6 h-[20px] text-[11px] border-r border-gray-400 transition-colors ${activeTab === 'Items' ? 'bg-white font-bold' : 'bg-transparent hover:bg-gray-200'}`}
              >
                Items
              </button>
              <button 
                onClick={() => setActiveTab('BPs')}
                className={`px-6 h-[20px] text-[11px] border-r border-gray-400 transition-colors ${activeTab === 'BPs' ? 'bg-white font-bold' : 'bg-transparent hover:bg-gray-200'}`}
              >
                BPs
              </button>
           </div>

           {/* Tab Content */}
           <div className="py-4 space-y-2">
              {activeTab === 'Items' ? (
                <>
                  <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                    <span className={sapLabelStyle}>Code</span>
                    <div className="flex items-center gap-2">
                       <span className={sapLabelStyle}>From</span>
                       <div className="flex-1 flex items-center gap-1">
                          <input type="text" className={`${sapInputStyle} !bg-[#fffbd0]`} />
                          <div onClick={onOpenSelectionItems} className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                          </div>
                       </div>
                       <span className={sapLabelStyle}>To</span>
                       <div className="flex-1 flex items-center gap-1">
                          <input type="text" className={sapInputStyle} />
                          <div onClick={onOpenSelectionItems} className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                          </div>
                       </div>
                    </div>

                    <span className={sapLabelStyle}>Item Group</span>
                    <div className="relative">
                      <select className={`${sapInputStyle} pr-5 appearance-none`}>
                        <option>All</option>
                      </select>
                      <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center pt-2">
                    <button className={sapGreyButtonStyle}>Properties</button>
                    <input type="text" className={`${sapInputStyle} !bg-[#e8e8e8]`} defaultValue="Ignore" readOnly />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center">
                    <span className={sapLabelStyle}>Code</span>
                    <div className="flex items-center gap-2">
                       <span className={sapLabelStyle}>From</span>
                       <div className="flex-1 flex items-center gap-1">
                          <input type="text" className={sapInputStyle} />
                          <div className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                          </div>
                       </div>
                       <span className={sapLabelStyle}>To</span>
                       <div className="flex-1 flex items-center gap-1">
                          <input type="text" className={sapInputStyle} />
                          <div className="w-5 h-[18px] bg-[#e8e8e8] border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                             <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                          </div>
                       </div>
                    </div>

                    <span className={sapLabelStyle}>BP Type</span>
                    <div className="relative">
                      <select className={`${sapInputStyle} !bg-[#fffbd0] pr-5 appearance-none`}>
                        <option>Customer</option>
                      </select>
                      <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>

                    <span className={sapLabelStyle}>BP Group</span>
                    <div className="relative">
                      <select className={`${sapInputStyle} pr-5 appearance-none`}>
                        <option>All</option>
                      </select>
                      <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] gap-x-2 items-center pt-2">
                    <button className={sapGreyButtonStyle}>Properties</button>
                    <input type="text" className={`${sapInputStyle} !bg-[#e8e8e8]`} defaultValue="Ignore" readOnly />
                  </div>
                </>
              )}
           </div>
        </div>

        <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
          <span className={sapLabelStyle}>Convert to Series</span>
          <div className="relative">
            <select className={`${sapInputStyle} pr-5 appearance-none`}>
              <option></option>
            </select>
            <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button className={sapButtonStyle}>OK</button>
          <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
