import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, MoreHorizontal, Calendar } from 'lucide-react';

interface CheckDocumentNumberingWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const CheckDocumentNumberingWindow: React.FC<CheckDocumentNumberingWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState<'Documents' | 'FixedAssetDocuments'>('Documents');

  const documentsCol1 = ['Sales Quotation', 'Sales Order', 'Delivery', 'Return Request', 'Return', 'A/R Invoice', 'A/R Credit Memo', 'A/R Down Payment'];
  const documentsCol2 = ['Purchase Quotation', 'Purchase Order', 'Goods Receipt PO', 'Goods Return Request', 'Goods Return', 'A/P Credit Memo', 'A/P Invoice', 'A/P Down Payment', 'Purchase Request'];
  const documentsCol3 = ['Goods Receipt', 'Goods Issue', 'Inventory Transfer Request', 'Inventory Transfer', 'Landed Costs', 'Service Call', 'Inventory Counting', 'Inventory Posting', 'Inventory Opening Balance', 'Blanket Agreement - Customer', 'Blanket Agreement - Vendor'];
  const documentsCol4 = ['Incoming Payment', 'Outgoing Payment', 'Deposit', 'Checks for Payment'];

  const fixedAssetDocuments = ['Fixed Asset Capitalization', 'Fixed Asset Capitalization Credit Memo', 'Fixed Asset Retirement', 'Fixed Asset Transfer', 'Fixed Asset Manual Depreciation', 'Fixed Asset Revaluation'];

  return (
    <ResizableCriteriaWindow
      title="Check Document Numbering - Selection Criteria"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={600}
      minHeight={500}
      footer={
        <div className="h-[40px] px-3 bg-[#f0f0f0] border-t border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button className={sapButtonStyle}>OK</button>
            <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
          </div>
          <div className="flex gap-2">
            <button className={sapGreyButtonStyle}>Select All</button>
            <button className={sapGreyButtonStyle}>Clear Selection</button>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-3 flex flex-col gap-4 bg-[#f0f0f0] overflow-y-auto custom-scrollbar">
        
        {/* Section 1: Choose Documents to Review */}
        <div className="flex flex-col border border-gray-400 p-2 relative pt-3">
          <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[11px] font-bold text-[#333] underline">Choose Documents to Review</span>
          
          <div className="flex flex-col mt-2">
            {/* Tabs */}
            <div className="flex pl-4">
              <button 
                onClick={() => setActiveTab('Documents')}
                className={`px-4 h-[22px] border border-gray-400 border-b-0 rounded-t-[4px] text-[11px] transition-colors ${activeTab === 'Documents' ? 'bg-white z-10 -mb-[1px]' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
              >
                Documents
              </button>
              <button 
                onClick={() => setActiveTab('FixedAssetDocuments')}
                className={`px-4 h-[22px] border border-gray-400 border-b-0 rounded-t-[4px] text-[11px] -ml-[1px] transition-colors ${activeTab === 'FixedAssetDocuments' ? 'bg-white z-10 -mb-[1px]' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
              >
                Fixed Asset Documents
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-gray-400 p-4 min-h-[300px]">
              {activeTab === 'Documents' ? (
                <div className="grid grid-cols-4 gap-x-6">
                  <div className="flex flex-col gap-1">
                    {documentsCol1.map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span className={sapLabelStyle}>{doc}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {documentsCol2.map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span className={sapLabelStyle}>{doc}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {documentsCol3.map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span className={sapLabelStyle}>{doc}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {documentsCol4.map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span className={sapLabelStyle}>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {fixedAssetDocuments.map(doc => (
                    <label key={doc} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
                      <input type="checkbox" className="w-3.5 h-3.5" />
                      <span className={sapLabelStyle}>{doc}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Numbers and Dates */}
        <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2">
          <span className={sapLabelStyle}>Number From</span>
          <div className="flex items-center gap-4">
             <input type="text" className={`${sapInputStyle} w-32`} />
             <span className={sapLabelStyle}>To</span>
             <input type="text" className={`${sapInputStyle} w-32`} />
          </div>

          <span className={sapLabelStyle}>Date From</span>
          <div className="flex items-center gap-4">
             <div className="relative">
                <input type="text" className={`${sapInputStyle} w-32`} defaultValue="01.07.25" />
                <div className="absolute right-0 top-0 h-full w-4 flex items-center justify-center bg-[#e8e8e8] border-l border-gray-400">
                   <Calendar className="w-3 h-3 text-gray-700" />
                </div>
             </div>
             <span className={sapLabelStyle}>To</span>
             <div className="relative">
                <input type="text" className={`${sapInputStyle} w-32`} defaultValue="30.06.26" />
                <div className="absolute right-0 top-0 h-full w-4 flex items-center justify-center bg-[#e8e8e8] border-l border-gray-400">
                   <Calendar className="w-3 h-3 text-[#333] fill-yellow-400/30" />
                </div>
             </div>
          </div>
        </div>

        {/* Section 2: Choose Master Data to Review */}
        <div className="flex flex-col border border-gray-400 p-3 relative pt-3">
          <span className="absolute -top-2 left-2 bg-[#f0f0f0] px-1 text-[11px] font-bold text-[#333] underline">Choose Master Data to Review</span>
          <div className="flex flex-col gap-1 mt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
              <input type="checkbox" className="w-3.5 h-3.5" />
              <span className={sapLabelStyle}>Business Partner</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 group">
              <input type="checkbox" className="w-3.5 h-3.5" />
              <span className={sapLabelStyle}>Item</span>
            </label>
          </div>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
