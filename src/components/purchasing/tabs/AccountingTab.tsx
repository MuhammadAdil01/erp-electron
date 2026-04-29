import React from 'react';
import { ClassicInput, ClassicSel, FieldRow } from '../../ui/ClassicERPUI';
import { ChevronRight } from 'lucide-react';

export const AccountingTab: React.FC = () => (
  <div className="flex-1 flex p-2 gap-8 bg-white overflow-y-auto">
    {/* Left Column */}
    <div className="flex flex-col gap-1 w-[350px]">
       <FieldRow label="Journal Remark" labelWidth="120px">
          <ClassicInput className="flex-1 shadow-none" defaultValue="Purchase Quotation - 632" />
       </FieldRow>
       <div className="h-4" />
       <FieldRow label="Payment Terms" labelWidth="120px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Payment Method" labelWidth="120px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Central Bank Ind." labelWidth="120px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <div className="h-4" />
       <div className="flex items-center gap-2 mb-1">
          <div className="text-[10.5px] w-[120px] shrink-0">Manually Recalculate Due Date:</div>
          <ClassicInput className="w-12 text-center" defaultValue="0" />
          <span className="text-[10.5px]">Months +</span>
          <ClassicInput className="w-12 text-center" defaultValue="0" />
          <span className="text-[10.5px]">Days</span>
       </div>
       <FieldRow label="Cash Discount Date Offset" labelWidth="120px">
          <ClassicInput className="w-12" defaultValue="0" />
       </FieldRow>
    </div>

    {/* Right Column */}
    <div className="flex flex-col gap-1 flex-1 max-w-[400px]">
       <FieldRow label="Business Partner Project" labelWidth="150px">
           <div className="flex flex-1 relative">
              <ClassicInput className="flex-1" />
              <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer ml-1">
                <ChevronRight className="w-3 h-3 text-orange-600" />
              </div>
           </div>
       </FieldRow>
       <FieldRow label="Create QR Code From" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Cancellation Date" labelWidth="150px">
          <ClassicInput className="flex-1" />
       </FieldRow>
       <div className="h-4" />
       <FieldRow label="Indicator" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Federal Tax ID" labelWidth="150px">
          <ClassicInput className="flex-1" />
       </FieldRow>
       <FieldRow label="Order Number" labelWidth="150px">
          <ClassicInput className="flex-1" />
       </FieldRow>
       <div className="flex justify-end gap-2 mt-4 pr-1">
          <span className="text-[10.5px] italic text-gray-600">Referenced Document</span>
          <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
            <span className="text-[10px] font-bold">...</span>
          </div>
       </div>
    </div>
  </div>
);
