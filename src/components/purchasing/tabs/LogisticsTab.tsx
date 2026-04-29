import React from 'react';
import { ClassicSel, FieldRow } from '../../ui/ClassicERPUI';
import { ChevronRight } from 'lucide-react';

export const LogisticsTab: React.FC = () => (
  <div className="flex-1 flex p-2 gap-8 bg-white overflow-y-auto">
    {/* Left Column */}
    <div className="flex flex-col gap-2 w-[400px]">
       <div className="flex gap-2 items-start h-[100px]">
          <div className="text-[10.5px] w-[100px] shrink-0 pt-1">Ship To</div>
          <div className="flex flex-1 relative h-full">
            <textarea 
              className="w-full h-full border border-[#d4d0c8] outline-none p-1 text-[10.5px] resize-none shadow-inner"
              defaultValue={`Jinnah Avenue(MB-2), APE\nCanal Road\n\n63100 BAHAWALPUR\nPAKISTAN`}
            />
            <div className="absolute right-[-24px] top-4 bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
              <ChevronRight className="w-3 h-3 text-orange-600" />
            </div>
          </div>
       </div>
       
       <div className="flex gap-2 items-start h-[80px]">
          <div className="text-[10.5px] w-[100px] shrink-0 pt-1">Pay To</div>
          <div className="flex flex-1 relative h-full">
            <ClassicSel className="w-full">
              <option></option>
            </ClassicSel>
            <div className="absolute right-[-24px] top-0 bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer">
              <ChevronRight className="w-3 h-3 text-orange-600" />
            </div>
          </div>
       </div>

       <FieldRow label="Shipping Type" labelWidth="100px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
    </div>

    {/* Right Column (Checkboxes) */}
    <div className="flex-1 flex flex-col items-end gap-2 pr-4 pt-10">
       <div className="flex items-center gap-2">
          <input type="checkbox" className="w-3 h-3" />
          <span className="text-[10.5px]">Create Online Quotation</span>
       </div>
       <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="w-3 h-3" />
          <span className="text-[10.5px] font-bold">Confirmed</span>
       </div>
    </div>
  </div>
);
