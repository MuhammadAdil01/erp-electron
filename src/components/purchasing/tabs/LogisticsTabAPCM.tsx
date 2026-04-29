import React from 'react';
import { ClassicSel } from '../../ui/ClassicERPUI';
import { ChevronRight } from 'lucide-react';

export const LogisticsTabAPCM: React.FC = () => (
  <div className="flex-1 flex p-2 gap-8 bg-white overflow-y-auto">
    <div className="flex flex-col gap-2 w-[450px]">
       {/* Ship To Row */}
       <div className="flex gap-2 items-start h-[100px] mb-2">
          <div className="text-[10.5px] w-[100px] shrink-0 pt-1">Ship To</div>
          <div className="flex-1 flex gap-1 h-full items-end">
            <textarea 
              className="w-full h-full border border-[#d4d0c8] outline-none p-1 text-[10.5px] resize-none shadow-inner"
              defaultValue={`Jinnah Avenue(MB-2), APE\nCanal Road\n\n63100 BAHAWALPUR\nPAKISTAN`}
            />
            <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer h-[18px]">
              <ChevronRight className="w-3 h-3 text-orange-600" />
            </div>
          </div>
       </div>
       
       {/* Pay To Row */}
       <div className="flex gap-2 items-start h-[80px] mb-2">
          <div className="text-[10.5px] w-[100px] shrink-0 pt-1">Pay To</div>
          <div className="flex-1 flex gap-1 h-full items-end">
            <div className="flex flex-col flex-1 h-full gap-1">
              <ClassicSel className="w-full h-[18px]">
                <option></option>
              </ClassicSel>
              <textarea 
                className="w-full flex-1 border border-[#d4d0c8] outline-none p-1 text-[10.5px] resize-none shadow-inner"
              />
            </div>
            <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer h-[18px]">
              <ChevronRight className="w-3 h-3 text-orange-600" />
            </div>
          </div>
       </div>

       {/* Shipping Type Row */}
       <div className="flex gap-2 items-center">
          <div className="text-[10.5px] w-[100px] shrink-0">Shipping Type</div>
          <ClassicSel className="w-[180px] h-[18px]">
             <option></option>
          </ClassicSel>
       </div>
    </div>
  </div>
);
