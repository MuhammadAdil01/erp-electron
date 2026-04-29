import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const PaymentTermsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-x-12 h-full">
      {/* Left Column */}
      <div className="flex flex-col gap-1.5 h-full overflow-y-auto custom-scrollbar pr-2">
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Payment Terms</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Interest on Arrears %</label>
          <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
        </div>
        
        <div className="flex items-center mt-4">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Price List</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Total Discount %</label>
          <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Credit Limit</label>
          <input type="text" defaultValue="0.00" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-right pr-2 font-mono text-[10px]" />
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Commitment Limit</label>
          <input type="text" defaultValue="0.00" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none text-right pr-2 font-mono text-[10px]" />
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Dunning Term</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-[140px] text-gray-700 text-[10.5px]">Automatic Posting</label>
          <div className="flex-1 relative pr-[20px]">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none" />
            <div className="absolute right-[20px] top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
            <button className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 h-[18px] flex items-center justify-center text-[10px] rounded-[1px] hover:from-white active:shadow-inner">...</button>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4">
           <div className="flex items-center">
              <label className="w-[140px] text-gray-700 text-[10.5px]">Effective Discount Groups</label>
              <div className="flex-1 relative">
                <input type="text" defaultValue="Lowest Discount" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none font-bold" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
           </div>
           <div className="flex items-center">
              <label className="w-[140px] text-gray-700 text-[10.5px]">Effective Price</label>
              <div className="flex-1 relative">
                 <input type="text" defaultValue="Default Priority" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)] outline-none font-bold" />
                 <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>
           </div>
           <span className="ml-[140px] text-gray-500 text-[9.5px] italic leading-tight">Effective Price Considers All Price Sources</span>
        </div>

        {/* Business Partner Bank Group */}
        <div className="mt-8 border border-gray-300 p-2 relative pt-4 shrink-0 shadow-[1px_1px_2px_rgba(0,0,0,0.05)] bg-[#f9f9f9]/50">
           <span className="absolute -top-2 left-2 bg-white px-1 text-gray-700 font-bold underline text-[10.5px]">Business Partner Bank</span>
           <div className="flex flex-col gap-0.5">
              {[
                'Bank Country/Region', 'Bank Name', 'Bank Code', 'Account', 'BIC/SWIFT Code', 
                'Bank Account Name', 'Branch', 'Ctrl Int. ID', 'IBAN', 'Mandate ID', 'Date of Signature'
              ].map(label => (
                <div key={label} className="flex items-center">
                   <label className="w-[125px] text-gray-600 text-[9.5px]">{label}</label>
                   <div className="flex-1 relative">
                      <input type="text" disabled className="w-full bg-[#e1e1e1] border border-gray-300 h-[16px] px-1 shadow-inner text-[9.5px]" />
                      {label === 'Bank Name' && (
                        <div className="absolute -left-5 top-0 bottom-0 flex items-center">
                           <button className="text-orange-600 hover:scale-110 transition-transform">
                              <Search className="w-3 h-3 fill-current" />
                           </button>
                        </div>
                      )}
                      {label === 'Bank Country/Region' && (
                        <div className="absolute -right-5 top-0 bottom-0 flex items-center">
                          <button className="w-[14px] h-[14px] bg-[#eeeeee] border border-gray-400 flex items-center justify-center rounded-[1px] text-[10px] leading-0 shadow-sm font-serif">ⓘ</button>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-1.5 h-full overflow-y-auto custom-scrollbar pr-4">
        <div className="flex items-center">
          <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">Credit Card Type</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        {[
          'Credit Card No.', 'Expiration Date', 'ID Number', 'Average Delay'
        ].map(label => (
          <div key={label} className="flex items-center">
            <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">{label}</label>
            <input type="text" className="flex-1 bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
          </div>
        ))}
        <div className="flex items-center">
          <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">Priority</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">Default IBAN</label>
          <div className="flex-1 relative">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
            <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">Holidays</label>
          <div className="flex-1 relative pr-[20px]">
            <input type="text" className="w-full bg-[#fff9c4] border border-gray-400 h-[18px] px-1 outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.05)]" />
            <div className="absolute right-[20px] top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer">
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
            <button className="absolute right-0 top-0 bottom-0 w-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 h-[18px] flex items-center justify-center text-[10px] rounded-[1px] hover:from-white active:shadow-inner">...</button>
          </div>
        </div>

        <div className="flex items-center mt-1">
          <label className="w-[125px] text-gray-700 text-right pr-3 text-[10.5px]">Payment Dates</label>
          <button className="w-6 h-[18px] bg-gradient-to-b from-[#ffffff] to-[#cccccc] border border-gray-500 flex items-center justify-center text-[10px] rounded-[1px] shadow-sm">...</button>
        </div>

        <div className="mt-12 flex flex-col gap-2">
           {[
             { label: 'Allow Partial Delivery of Sales Order', checked: true },
             { label: 'Allow Partial Delivery per Row', checked: true },
             { label: 'Do Not Apply Discount Groups', checked: false },
             { label: 'Endorsable Checks from This BP', checked: true },
             { label: 'This BP Accepts Endorsed Checks', checked: false }
           ].map(cb => (
             <label key={cb.label} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked={cb.checked} className="w-[13px] h-[13px] rounded-[1px] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] cursor-pointer accent-blue-600" />
                <span className="text-gray-700 text-[10.5px] leading-tight group-hover:text-black">{cb.label}</span>
             </label>
           ))}
        </div>
      </div>
    </div>
  );
};
