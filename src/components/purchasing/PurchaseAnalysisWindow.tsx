import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicTab, ClassicInput, ClassicSel, YellowBtn, GreyBtn, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface PurchaseAnalysisWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const PurchaseAnalysisWindow: React.FC<PurchaseAnalysisWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Vendors');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const SelectionContent = () => {
    if (activeTab === 'Vendors') {
      return (
        <div className="flex flex-col gap-1.5 border border-[#d4d0c8] p-2 mt-2">
           <div className="text-[11px] font-bold mb-1">Main Selection</div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[110px]">Vendor</span>
              <span className="text-[11px]">Code From</span>
              <ClassicInput className="w-[80px]" />
              <div className="w-[12px] h-[12px] border border-gray-400 bg-white" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[80px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[110px]">Group</span>
              <ClassicSel className="flex-1 max-w-[150px]"><option>All</option></ClassicSel>
              <div className="flex-1" />
              <YellowBtn className="w-[80px] h-[18px] text-[10.5px] items-center justify-center">Properties</YellowBtn>
              <div className="w-[100px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0] text-[10.5px] px-1">Ignore</div>
           </div>
        </div>
      );
    }
    if (activeTab === 'Items') {
       return (
        <div className="flex flex-col gap-1.5 border border-[#d4d0c8] p-2 mt-2">
           <div className="text-[11px] font-bold mb-1">Main Selection</div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[110px]">Item</span>
              <span className="text-[11px]">Code From</span>
              <ClassicInput className="w-[80px]" />
              <div className="w-[12px] h-[12px] border border-gray-400 bg-white" />
              <span className="text-[11px]">To</span>
              <ClassicInput className="w-[80px]" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[11px] w-[110px]">Group</span>
              <ClassicSel className="flex-1 max-w-[180px]"><option>All</option></ClassicSel>
              <YellowBtn className="w-[80px] h-[18px] text-[10.5px] items-center justify-center">Properties</YellowBtn>
              <div className="w-[100px] h-[18px] border border-[#d4d0c8] bg-[#f0f0f0] text-[10.5px] px-1">Ignore</div>
           </div>
           <div className="flex items-center gap-2 ml-[110px]">
              <input type="checkbox" className="w-3 h-3" />
              <span className="text-[11px]">Secondary Selection</span>
           </div>
        </div>
       );
    }
    return (
       <div className="flex flex-col gap-1.5 border border-[#d4d0c8] p-2 mt-2">
          <div className="text-[11px] font-bold mb-1">Main Selection</div>
          <div className="flex items-center gap-2">
             <span className="text-[11px] w-[110px]">Sales Employee</span>
             <span className="text-[11px]">Code From</span>
             <ClassicInput className="w-[80px]" />
             <span className="text-[11px]">To</span>
             <ClassicInput className="w-[80px]" />
          </div>
          <div className="flex items-center gap-2 ml-[110px] my-4">
             <input type="checkbox" className="w-3 h-3" />
             <span className="text-[11px]">Include Inactive Sales Employee</span>
          </div>
       </div>
    );
  };

  return (
    <div 
      className={cn("absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
        windowState.isMaximized ? "inset-0 !w-full !h-full" : ""
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: 580,
        height: 520,
        zIndex: windowState.zIndex
      }}
    >
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Purchase Analysis - Selection Criteria</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-2 bg-[#f0f0f0]">
        <div className="flex border-b border-[#808080] shrink-0">
           {['Vendors', 'Items', 'Sales Employees'].map(t => (
             <ClassicTab key={t} label={t} isActive={activeTab === t} onClick={() => setActiveTab(t)} />
           ))}
        </div>

        <div className="flex-1 bg-white border border-[#808080] border-t-0 flex flex-col p-3 overflow-y-auto custom-scrollbar">
           
           {/* Top Radio Groups */}
           <div className="grid grid-cols-4 gap-2 border-b border-[#d4d0c8] pb-3 mb-2">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2"><input type="radio" name="freq" defaultChecked /><span className="text-[11px]">Annual Report</span></div>
                 <div className="flex items-center gap-2"><input type="radio" name="freq" /><span className="text-[11px]">Monthly Report</span></div>
                 <div className="flex items-center gap-2"><input type="radio" name="freq" /><span className="text-[11px]">Quarterly Report</span></div>
              </div>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2"><input type="radio" name="doc" defaultChecked /><span className="text-[11px]">A/P Invoices</span></div>
                 <div className="flex items-center gap-2"><input type="radio" name="doc" /><span className="text-[11px]">Purchase Order</span></div>
                 <div className="flex items-center gap-2"><input type="radio" name="doc" /><span className="text-[11px]">Goods Receipt PO</span></div>
              </div>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2"><input type="radio" name="disp" defaultChecked /><span className="text-[11px]">Individual Display</span></div>
                 <div className="flex items-center gap-2"><input type="radio" name="disp" /><span className="text-[11px]">Group Display</span></div>
              </div>
              <div className="flex flex-col gap-1">
                 {activeTab === 'Vendors' ? (
                   <>
                     <div className="flex items-center gap-2"><input type="radio" name="tot" defaultChecked /><span className="text-[11px]">Total by Vendor</span></div>
                     <div className="flex items-center gap-2"><input type="radio" name="tot" /><span className="text-[11px]">Total by Blanket Agreement</span></div>
                   </>
                 ) : activeTab === 'Items' ? (
                    <>
                     <div className="flex items-center gap-2"><input type="radio" name="tot2" defaultChecked /><span className="text-[11px]">No Totals</span></div>
                     <div className="flex items-center gap-2"><input type="radio" name="tot2" /><span className="text-[11px]">Group by Vendor</span></div>
                     <div className="flex items-center gap-2"><input type="radio" name="tot2" /><span className="text-[11px]">Total by Sales Employee</span></div>
                   </>
                 ) : null}
              </div>
           </div>

           {/* Date Range Section */}
           <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5 mt-0.5" defaultChecked />
                 <span className="text-[10.5px] w-[130px]">Posting Date</span>
                 <span className="text-[10.5px]">From</span>
                 <ClassicInput value="01.07.25" className="w-[100px] text-center" />
                 <span className="text-[10.5px]">To</span>
                 <ClassicInput value="30.06.26" className="w-[100px] text-center" />
                 <div className="w-[14px] h-[14px] border border-gray-400 bg-white" />
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5 mt-0.5" />
                 <span className="text-[10.5px] w-[130px]">Due Date</span>
                 <span className="text-[10.5px]">From</span>
                 <ClassicInput value="01.07.25" className="w-[100px] text-center" />
                 <span className="text-[10.5px]">To</span>
                 <ClassicInput value="30.06.26" className="w-[100px] text-center" />
                 <div className="w-[14px] h-[14px] border border-gray-400 bg-white" />
              </div>
              <div className="flex items-center gap-2">
                 <input type="checkbox" className="w-3.5 h-3.5 mt-0.5" />
                 <span className="text-[10.5px] w-[130px]">Document Date</span>
                 <span className="text-[10.5px]">From</span>
                 <ClassicInput className="w-[100px] text-center" />
                 <span className="text-[10.5px]">To</span>
                 <ClassicInput className="w-[100px] text-center" />
                 <div className="w-[14px] h-[14px] border border-gray-400 bg-white" />
              </div>
           </div>

           {/* Dynamic Tab Content */}
           <SelectionContent />

           <div className="mt-8 flex items-center gap-2">
              <input type="checkbox" className="w-3.5 h-3.5" />
              <span className="text-[11px]">Display Amounts in System Currency</span>
           </div>
        </div>

        <div className="h-[40px] flex items-center gap-2 px-1">
           <YellowBtn className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
           <GreyBtn onClick={onClose} className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Cancel</GreyBtn>
        </div>
      </div>
    </div>
  );
};

