import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { 
  ClassicTable, YellowBtn, GreyBtn, ClassicInput, cn 
} from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface ShippingTypesSetupWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (state: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const ShippingTypesSetupWindow: React.FC<ShippingTypesSetupWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

  const headers = ['#', 'Name', 'Web Site', 'Active'];

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

  return (
    <div 
      className={cn("absolute bg-[#f0f0f0] border border-[#808080] shadow-xl flex flex-col select-none rounded-[3px] overflow-hidden",
        windowState.isMaximized ? "inset-0 !w-full !h-full" : ""
      )}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: 450,
        height: 350,
        zIndex: windowState.zIndex
      }}
    >
      {/* Title Bar */}
      <div onMouseDown={handleDrag} className="h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0">
        <span className="text-white text-[11px] font-bold">Shipping Types - Setup</span>
        <div className="flex gap-1">
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Minus className="w-3 h-3" /></button>
          <button className="p-0.5 hover:bg-white/20 text-white rounded-[1px]"><Square className="w-3 h-3" /></button>
          <button onClick={onClose} className="p-0.5 hover:bg-red-500 text-white rounded-[1px]"><X className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white border-b border-[#808080] overflow-y-auto custom-scrollbar">
         <ClassicTable headers={headers} rowCount={10}>
            <tr className="border-b border-[#f0f0f0] h-[18px]">
               <td className="border-r border-[#f0f0f0] text-center text-[10.5px]">1</td>
               <td className="border-r border-[#f0f0f0]"><ClassicInput className="w-full border-none shadow-none focus:bg-[#ffed99]" /></td>
               <td className="border-r border-[#f0f0f0]"><ClassicInput className="w-full border-none shadow-none focus:bg-[#ffed99]" /></td>
               <td className="border-r border-[#f0f0f0] text-center px-1">
                  <input type="checkbox" className="w-3 h-3" defaultChecked />
               </td>
            </tr>
         </ClassicTable>
      </div>

      <div className="h-[40px] px-3 flex items-center gap-2 bg-[#f0f0f0] shrink-0">
         <YellowBtn className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">OK</YellowBtn>
         <GreyBtn onClick={onClose} className="min-w-[70px] h-[22px] flex items-center justify-center text-[11px]">Cancel</GreyBtn>
      </div>
    </div>
  );
};

