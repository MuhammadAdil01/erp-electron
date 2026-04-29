import React from 'react';
import { ClassicInput, ClassicSel, FieldRow } from '../../ui/ClassicERPUI';

export const AccountingTabAPCM: React.FC = () => (
  <div className="flex-1 flex p-2 gap-8 bg-white overflow-y-auto">
    {/* Left Column */}
    <div className="flex flex-col gap-1 w-[400px]">
       <FieldRow label="Journal Remark" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" />
       </FieldRow>
       <FieldRow label="Control Account" labelWidth="150px">
          <ClassicSel className="flex-1">
             <option></option>
          </ClassicSel>
       </FieldRow>
       <div className="flex items-center gap-2 mb-1">
          <div className="w-[150px] shrink-0" />
          <div className="flex items-center gap-1">
             <input type="checkbox" className="w-3 h-3" />
             <span className="text-[10.5px]">Payment Block</span>
          </div>
       </div>
       <div className="flex items-center gap-2 mb-1">
          <div className="w-[150px] shrink-0" />
          <div className="flex items-center gap-1">
             <input type="checkbox" className="w-3 h-3" />
             <span className="text-[10.5px]">Max. Cash Discount</span>
          </div>
       </div>
       <div className="h-2" />
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
       <div className="h-2" />
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
       <div className="flex items-center gap-2 mb-1">
          <div className="w-[150px] shrink-0" />
          <div className="flex items-center gap-1">
             <input type="checkbox" className="w-3 h-3" />
             <span className="text-[10.5px]">Deferred Tax</span>
          </div>
       </div>
       <div className="h-4" />
       <FieldRow label="Consolidation Type" labelWidth="150px">
          <ClassicSel className="flex-1">
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
          <div className="flex flex-1 items-center border border-[#d4d0c8] bg-white h-[18px]">
            <ClassicInput className="flex-1 border-none shadow-none" />
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
       <div className="flex justify-start gap-4 items-center mb-1">
          <span className="text-[10.5px] w-[150px] shrink-0">Referenced Document</span>
          <div className="flex flex-1 items-center gap-1">
             <div className="flex-1 h-[18px] border border-[#d4d0c8] bg-white shadow-inner" />
             <div className="bg-[#ffed99] border border-[#f39c12] px-1 h-[18px] flex items-center cursor-pointer">
               <span className="text-[10px] font-bold">...</span>
             </div>
          </div>
       </div>
       <FieldRow label="Asset Value Date" labelWidth="150px">
          <ClassicInput className="flex-1 shadow-none" defaultValue="19.03.26" />
       </FieldRow>
    </div>
  </div>
);
