import React from 'react';
import { ClassicInput, ClassicSel, FieldRow } from '../../ui/ClassicERPUI';
import { ChevronRight } from 'lucide-react';

export const AccountingTabGR: React.FC = () => (
  <div className="flex-1 flex p-2 gap-8 bg-white overflow-y-auto">
    {/* Left Column */}
    <div className="flex flex-col gap-1 w-[400px]">
       <FieldRow label="Journal Remark" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" />
       </FieldRow>
       <div className="h-4" />
       <FieldRow label="Payment Terms" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Payment Method" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Central Bank Ind." labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <div className="h-4" />
       <div className="flex items-center gap-2 mb-1">
          <div className="text-[10.5px] w-[150px] shrink-0">Manually Recalculate Due Date:</div>
          <div className="flex flex-1 items-center gap-1">
            <ClassicSel className="w-[100px] h-[18px]">
              <option></option>
            </ClassicSel>
            <ClassicInput className="w-10 text-center" defaultValue="0" />
            <span className="text-[10.5px]">Months +</span>
            <ClassicInput className="w-10 text-center" defaultValue="0" />
            <span className="text-[10.5px]">Days</span>
          </div>
       </div>
       <FieldRow label="Cash Discount Date Offset:" labelWidth="150px">
          <div className="flex flex-1 items-center gap-1">
            <ClassicInput className="w-12 h-[18px]" />
          </div>
       </FieldRow>
       <div className="h-4" />
       <FieldRow label="Consolidation Type" labelWidth="150px">
          <ClassicSel className="flex-1 h-[18px]">
             <option>Payment Consolidation</option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Consolidating BP" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" />
       </FieldRow>
    </div>

    {/* Right Column */}
    <div className="flex flex-col gap-1 flex-1 max-w-[400px]">
       <FieldRow label="Business Partner Project" labelWidth="150px">
          <div className="flex flex-1 items-center gap-1">
            <ClassicInput className="flex-1 shadow-none" />
            <div className="bg-[#ffed99] border border-[#f39c12] p-0.5 flex items-center cursor-pointer h-[18px]">
              <ChevronRight className="w-3 h-3 text-orange-600" />
            </div>
          </div>
       </FieldRow>
       <FieldRow label="Create QR Code From" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <div className="h-4" />
       <FieldRow label="Indicator" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <FieldRow label="Federal Tax ID" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" />
       </FieldRow>
       <FieldRow label="Order Number" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" />
       </FieldRow>
       <div className="h-4" />
       <div className="flex justify-start gap-4 items-center">
          <span className="text-[10.5px] w-[150px] shrink-0">Referenced Document</span>
          <div className="flex flex-1 items-center gap-1">
             <div className="flex-1 h-[18px] border border-[#d4d0c8] bg-white shadow-inner" />
             <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
               <span className="text-[10px] font-bold">...</span>
             </div>
          </div>
       </div>
    </div>
  </div>
);
