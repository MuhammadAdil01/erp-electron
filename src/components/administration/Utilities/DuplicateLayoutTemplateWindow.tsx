import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

interface DuplicateLayoutTemplateWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap font-bold mb-0.5";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const DuplicateLayoutTemplateWindow: React.FC<DuplicateLayoutTemplateWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Duplicate Layout Template"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={900}
      minHeight={500}
    >
      <div className="flex-1 p-3 flex flex-col bg-[#f0f0f0] overflow-hidden">
        
        <div className="flex flex-1 gap-3 overflow-hidden">
          
          {/* Left Panel: Source and Destination */}
          <div className="w-[280px] flex flex-col gap-3 shrink-0">
            
            <div className="flex flex-col">
              <span className={sapLabelStyle}>Source Document Type</span>
              <div className="relative">
                <select className={`${sapInputStyle} !bg-[#fffbd0] pr-5 appearance-none`}>
                  <option>Sales Order</option>
                </select>
                <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Source Templates Table */}
            <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                  <tr className="h-[20px]">
                    <th className="w-16 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Code</th>
                    <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] flex items-center justify-between">
                      <span>Template Name</span>
                      <ArrowUpRight className="w-3 h-3 text-blue-600 cursor-pointer" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 25 }).map((_, i) => (
                    <tr key={i} className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30 cursor-default">
                      <td className="px-1 border-r border-gray-100"></td>
                      <td className="px-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-gray-300">
               <div className="flex flex-col">
                  <span className={sapLabelStyle}>Destination Document Type</span>
                  <div className="relative">
                    <select className={`${sapInputStyle} pr-5 appearance-none`}>
                      <option></option>
                    </select>
                    <div className="absolute right-0 top-0 h-full w-4 bg-[#e8e8e8] border-l border-gray-400 flex items-center justify-center pointer-events-none">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className={sapLabelStyle}>Destination Template Name</span>
                  <input type="text" className={sapInputStyle} />
               </div>
            </div>

          </div>

          {/* Right Panel: Converted Fields */}
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            <span className={sapLabelStyle}>Converted Fields</span>
            <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
              <table className="w-full border-collapse text-[11px]">
                <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
                  <tr className="h-[20px]">
                    <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Unique ID</th>
                    <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Source Type</th>
                    <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">From</th>
                    <th className="w-24 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Field</th>
                    <th className="w-40 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">To</th>
                    <th className="w-24 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] flex items-center justify-between">
                      <span>Field</span>
                      <ArrowUpRight className="w-3 h-3 text-blue-600 cursor-pointer" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <tr key={i} className={`h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30 cursor-default ${i % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
                      <td className="px-1 border-r border-gray-100"></td>
                      <td className="px-1 border-r border-gray-100"></td>
                      <td className="px-1 border-r border-gray-100 bg-[#ececec]"></td>
                      <td className="px-1 border-r border-gray-100 bg-[#ececec]"></td>
                      <td className="px-1 border-r border-gray-100"></td>
                      <td className="px-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Area */}
        <div className="mt-3 flex items-start justify-between">
          <div className="flex gap-2">
            <button className={`${sapGreyButtonStyle} opacity-50 cursor-not-allowed`} disabled>Add</button>
            <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
          </div>
          <div className="max-w-[500px]">
             <p className="text-[10.5px] leading-relaxed text-gray-800">
               <span className="font-bold">Note:</span> Fields that have not been automatically mapped are highlighted in <span className="text-red-600">red</span>. You must change the mapping of these fields (in this screen or in the Print Layout Designer) or remove them from the layout to be able to print the layout.
             </p>
          </div>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
