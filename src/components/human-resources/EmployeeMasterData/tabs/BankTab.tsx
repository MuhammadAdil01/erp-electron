import React from 'react';
import { ChevronDown } from 'lucide-react';

export const BankTab: React.FC = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 min-w-[900px]">
      <div className="grid grid-cols-[1.1fr_1fr] gap-x-12">
        {/* Left Column */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Employee Type</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Grade</label>
             <div className="relative w-[180px]">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Stage</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Employee Costs</label>
             <div className="flex items-center gap-4">
               <input type="text" className="w-[100px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
               <div className="relative w-[120px] flex items-center gap-3">
                  <span className="text-gray-700 text-[10.5px]">Month</span>
                  <div className="relative flex-1">
                    <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                    <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                      <ChevronDown className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Gratuity</label>
             <div className="relative w-[140px]">
                <input type="text" defaultValue="No" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Provident Fund</label>
             <div className="relative w-[140px]">
                <input type="text" defaultValue="No" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">EOBI</label>
             <div className="relative w-[140px]">
                <input type="text" defaultValue="No" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Opening Taxable Amount</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Tax Paid</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2">Fuel Liters</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="mt-4 flex flex-col gap-0.5">
            {[
              "Entertainment Allowance",
              "Education Allowance",
              "Big City Allowance",
              "Health Insurance Allocated Amount",
              "Health Insurance Deduction",
              "Mess Deduction"
            ].map(label => (
              <div key={label} className="flex items-center gap-4">
                <label className="text-gray-700 text-[10.5px] w-[180px] text-right pr-3">{label}</label>
                <div className="flex items-center gap-3">
                   <span className="text-[10.5px] text-gray-800 w-[40px] text-right">0.00</span>
                   <input type="text" className="w-[110px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-1 border-l border-gray-200 pl-8">
          <div className="flex items-center gap-4">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">Bank</label>
             <div className="relative w-[140px]">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">Account No.</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">Branch</label>
             <input type="text" className="w-[140px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
          </div>

          <div className="flex items-center gap-4 mt-2">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">OverTime</label>
             <div className="relative w-[140px]">
                <input type="text" defaultValue="No" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">OT Limit Start</label>
             <div className="flex items-center gap-3">
                <span className="text-[10.5px] text-gray-800 w-[50px] text-right pr-2">60</span>
                <input type="text" className="w-[110px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2">Overtime Limit</label>
             <div className="flex items-center gap-3">
                <span className="text-[10.5px] text-gray-800 w-[50px] text-right pr-2">120</span>
                <input type="text" className="w-[110px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
             </div>
          </div>

          <div className="flex items-center gap-4 mt-0.5">
             <label className="text-gray-700 text-[10.5px] w-[120px] text-right pr-2 font-bold italic">Shift</label>
             <div className="relative w-[140px]">
                <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          {[
            { label: "Time In Relaxation", value: "15" },
            { label: "Time Out Relaxation", value: "15" },
            { label: "Time In Relax", value: "3" },
            { label: "Time Out Relax", value: "3" }
          ].map(field => (
            <div key={field.label} className="flex items-center gap-4 mt-0.5">
              <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2 overflow-hidden whitespace-nowrap">{field.label}</label>
              <div className="flex items-center gap-3">
                 <span className="text-[10.5px] text-gray-800 w-[30px] text-right">{field.value}</span>
                 <input type="text" className="w-[110px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4 mt-2">
             <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2 whitespace-nowrap">Absent Application</label>
             <div className="relative w-[110px] ml-[30px]">
                <input type="text" defaultValue="Yes" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:bg-white active:bg-gray-400">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
          </div>

          {[
            { label: "Late In Application", value: ".25" },
            { label: "Late Out Application", value: ".25" }
          ].map(field => (
            <div key={field.label} className="flex items-center gap-4 mt-0.5">
              <label className="text-gray-700 text-[10.5px] w-[140px] text-right pr-2 whitespace-nowrap">{field.label}</label>
              <div className="flex items-center gap-3">
                 <span className="text-[10.5px] text-gray-800 w-[30px] text-right">{field.value}</span>
                 <input type="text" className="w-[110px] bg-[#fff9c4] border border-gray-400 h-[18px] outline-none px-2 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] text-[10.5px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
