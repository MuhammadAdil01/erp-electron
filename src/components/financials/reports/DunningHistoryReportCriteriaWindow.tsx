import React from 'react';
import { DropdownInput, GoldBtn } from '../FixedAssetShared';
import { ResizableCriteriaWindow } from '../../ui/ResizableCriteriaWindow';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 bg-white px-1 text-[11px] outline-none focus:border-orange-400";
const sapCheckboxStyle = "w-3.5 h-3.5 border border-gray-400 rounded-sm bg-white shrink-0 accent-orange-500 cursor-pointer";

export const DunningHistoryReportCriteriaWindow: React.FC<Props> = (props) => {
  return (
    <ResizableCriteriaWindow
      title="Dunning History Report - Selection Criteria"
      {...props}
      initialWidth={530}
      initialHeight={400}
      minWidth={530}
      minHeight={400}
      footer={
        <div className="px-5 py-3 border-t border-gray-300 bg-[#f0f0f0] shrink-0">
          <div className="flex gap-2">
            <GoldBtn className="px-8!">OK</GoldBtn>
            <GoldBtn onClick={props.onClose} className="px-8!">Cancel</GoldBtn>
          </div>
        </div>
      }
    >
      <div className="px-5 py-4 flex flex-col gap-1.5 flex-1 bg-[#f0f0f0] overflow-y-auto custom-scrollbar">
        
        {/* BP Code Row */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`${sapLabelStyle} w-24`}>BP Code</span>
          <span className={`${sapLabelStyle} w-8`}>From</span>
          <div className="relative group flex items-center">
            <input className={`${sapInputStyle} w-24 bg-[#fffbd5] pr-5`} />
            <div className="absolute right-1 w-3.5 h-3.5 flex items-center justify-center cursor-pointer pointer-events-none opacity-60">
              <div className="w-3 h-3 border border-gray-500 rounded-full flex items-center justify-center bg-white">
                <div className="w-[1px] h-[3px] bg-gray-600 rotate-45 translate-x-[1px] translate-y-[1px]" />
              </div>
            </div>
          </div>
          <span className={`${sapLabelStyle} ml-2`}>To</span>
          <input className={`${sapInputStyle} w-24 ml-1`} />
        </div>

        {/* Customer Group Row */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`${sapLabelStyle} w-24`}>Customer Group</span>
          <DropdownInput className="w-[280px]" value="" />
        </div>

        {/* Properties Row */}
        <div className="flex items-center gap-1.5 mb-2">
           <GoldBtn className="h-4.5 px-4! text-[10px] leading-none shrink-0 min-w-[90px]">Properties</GoldBtn>
           <input className={`${sapInputStyle} w-[280px] ml-1`} />
        </div>

        {/* Range Frame */}
        <div className="border border-gray-400 p-3 pt-4 relative mt-1">
          <div className="flex flex-col gap-1">
             {/* Fields in the box */}
             {[
               { label: 'Date of Dunning Run' },
               { label: 'Due Date' },
               { label: 'Dunning Name' },
               { label: 'A/R Invoice No.' },
             ].map((f, i) => (
               <div key={i} className="flex items-center">
                  <span className={`${sapLabelStyle} w-32`}>{f.label}</span>
                  <span className={`${sapLabelStyle} w-8`}>From</span>
                  <input className={`${sapInputStyle} w-20`} />
                  <span className={`${sapLabelStyle} ml-4 w-5`}>To</span>
                  <input className={`${sapInputStyle} w-20`} />
               </div>
             ))}

             <div className="h-2" />

             {/* Down Payment No. */}
             <div className="flex items-center">
                <span className={`${sapLabelStyle} w-32`}>Down Payment No.</span>
                <span className={`${sapLabelStyle} w-8`}>From</span>
                <input className={`${sapInputStyle} w-20`} />
                <span className={`${sapLabelStyle} ml-4 w-5`}>To</span>
                <input className={`${sapInputStyle} w-20`} />
             </div>

             {/* Checkbox */}
             <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" className={sapCheckboxStyle} id="includeDeselected" />
                <label htmlFor="includeDeselected" className={sapLabelStyle}>Include Deselected Invoices</label>
             </div>
          </div>
        </div>

        {/* Dunning Level */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`${sapLabelStyle} w-24`}>Dunning Level</span>
          <DropdownInput className="w-[300px]" value="All" />
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
