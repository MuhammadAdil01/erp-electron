import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const AccountingTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('General');

  return (
    <div className="flex flex-col h-full overflow-hidden">
       {/* Inner Sub-Tabs */}
       <div className="flex px-1 mb-[-1px] relative z-20">
          {['General', 'Tax'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-0.5 text-[10.5px] cursor-pointer border border-gray-400 border-b-0 rounded-t-[3px] mr-[2px] transition-all relative ${activeSubTab === tab ? 'bg-white font-bold h-[22px] z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]' : 'bg-[#e0e0e0] h-[20px] mt-[2px] hover:bg-white text-gray-600 hover:text-black'}`}
            >
              {tab}
            </div>
          ))}
       </div>

       {/* Sub-Tab content box */}
       <div className="flex-1 border border-gray-400 bg-white p-6 pt-10 flex flex-col gap-6 relative shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar">
          {activeSubTab === 'General' && (
            <>
               <div className="flex gap-x-20 shrink-0">
                  <div className="flex flex-col gap-1.5 flex-1 max-w-[420px]">
                     <div className="flex items-center">
                        <label className="w-[150px] text-gray-700 text-[10.5px] pr-2">Consolidating Business Partner</label>
                        <div className="flex-1 relative pr-[22px]">
                           <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                           <button className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[10px] hover:from-white active:shadow-inner rounded-[1px] shadow-sm">
                              <Search className="w-3 h-3 text-orange-600 fill-current" />
                           </button>
                        </div>
                     </div>
                     <div className="flex gap-x-8 ml-[150px] mt-1.5">
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <div className="w-[13px] h-[13px] rounded-full border border-gray-500 bg-[#f0f0f0] group-hover:bg-white flex items-center justify-center shadow-inner transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-black/80 shadow-[0_0_1px_black]" />
                           </div>
                           <span className="text-[10.5px] text-gray-700 font-bold">Payment Consolidation</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <div className="w-[13px] h-[13px] rounded-full border border-gray-500 bg-[#f0f0f0] group-hover:bg-white flex items-center justify-center shadow-inner transition-colors"></div>
                           <span className="text-[10.5px] text-gray-600 group-hover:text-black">Delivery Consolidation</span>
                        </label>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-1.5 max-w-[420px] mt-8 shrink-0">
                  {[
                    'Accounts Receivable', 'Down Payment Clearing Account', 'Down Payment Interim Account'
                  ].map(label => (
                    <div key={label} className="flex items-center">
                       <label className="w-[150px] text-gray-700 text-[10.5px] shrink-0 leading-tight pr-2">{label}</label>
                       <div className="flex-1 relative pr-[22px]">
                          <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none font-mono text-[10px]" />
                          <button className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[10px] hover:from-white active:shadow-inner rounded-[1px] shadow-sm">
                             <Search className="w-3 h-3 text-orange-600 fill-current" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-auto mb-10 flex flex-col gap-10 shrink-0">
                  <div className="flex items-center max-w-[420px]">
                     <label className="w-[150px] text-gray-700 text-[10.5px] pr-2">Planning Group</label>
                     <div className="w-[120px] relative pr-[22px]">
                        <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
                        <button className="absolute right-0 top-0 bottom-0 w-[20px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-400 flex items-center justify-center text-[10px] hover:from-white active:shadow-inner rounded-[1px] shadow-sm">
                           <Search className="w-3 h-3 text-orange-600 fill-current" />
                        </button>
                     </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group w-fit">
                     <input type="checkbox" defaultChecked className="w-[14px] h-[14px] rounded-[1px] border border-gray-500 shadow-sm cursor-pointer accent-blue-600" />
                     <span className="text-gray-700 text-[11px] font-bold group-hover:text-black">Affiliate</span>
                  </label>
               </div>
            </>
          )}
       </div>
    </div>
  );
};
