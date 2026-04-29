import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Search, ChevronDown, CornerDownRight } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface CapitalizationProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const CapitalizationWindow: React.FC<CapitalizationProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Contents');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // ─── Dragging ───────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-header')) {
      onFocus();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - windowState.x,
        y: e.clientY - windowState.y
      });
    }
  };

  // ─── Resizing ───────────────────────────────────────────────────────────────
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(direction);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onUpdateState({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        const startWidth = windowState.width;
        const startHeight = windowState.height;
        const startXPos = windowState.x;
        const startYPos = windowState.y;

        let newWidth = windowState.width;
        let newHeight = windowState.height;
        let newX = windowState.x;
        let newY = windowState.y;

        const minW = 800;
        const minH = 600;

        if (isResizing.includes('e')) {
          newWidth = Math.max(minW, e.clientX - startXPos);
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(minH, e.clientY - startYPos);
        }
        
        if (isResizing.includes('w')) {
          const oppositeEdgeX = startXPos + startWidth;
          const potentialWidth = oppositeEdgeX - e.clientX;
          if (potentialWidth > minW) {
            newWidth = potentialWidth;
            newX = e.clientX;
          } else {
            newWidth = minW;
            newX = oppositeEdgeX - minW;
          }
        }
        
        if (isResizing.includes('n')) {
          const oppositeEdgeY = startYPos + startHeight;
          const potentialHeight = oppositeEdgeY - e.clientY;
          if (potentialHeight > minH) {
            newHeight = potentialHeight;
            newY = e.clientY;
          } else {
            newHeight = minH;
            newY = oppositeEdgeY - minH;
          }
        }

        onUpdateState({ width: newWidth, height: newHeight, x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isResizing, windowState]);

  if (windowState.isMinimized) return null;

  const renderHeader = () => (
    <div className="grid grid-cols-2 gap-x-12 px-4 py-3 bg-[#f0f0f0]">
      {/* Left Column */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-28 shrink-0">Origin</span>
          <div className="flex-1 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner group">
            <div className="ml-auto px-0.5 border-l border-gray-400 cursor-pointer h-full flex items-center hover:bg-gray-200">
               <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
          <span className="text-[11px] text-[#333] ml-4">Origin No.</span>
          <div className="w-20 h-5 border border-gray-400 bg-white shadow-inner" />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <span className="text-[11px] text-[#333] w-28 shrink-0">Depreciation Area</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#fffae6] flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">*</span>
            <div className="ml-auto px-0.5 border-l border-gray-400 cursor-pointer h-full flex items-center hover:bg-gray-200">
               <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-28 shrink-0">Reference</span>
          <div className="flex-1 h-5 border border-gray-400 bg-white shadow-inner" />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-[11px] text-[#333] w-12 shrink-0">No.</span>
          <div className="w-24 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">Primary</span>
            <div className="ml-auto px-0.5 border-l border-gray-400 cursor-pointer h-full flex items-center hover:bg-gray-200">
               <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
          <div className="w-24 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">18</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-[11px] text-[#333] w-12 shrink-0">Status</span>
          <div className="w-48 h-5 border border-gray-400 bg-[#e0e0e0] flex items-center px-2">
            <span className="text-[10.5px] font-medium">Posted</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-[11px] text-[#333] w-32 shrink-0">Posting Date</span>
          <div className="w-32 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">08.04.26</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-[11px] text-[#333] w-32 shrink-0">Document Date</span>
          <div className="w-32 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">08.04.26</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <span className="text-[11px] text-[#333] w-32 shrink-0 text-right">Asset Value Date</span>
          <div className="w-32 h-5 border border-gray-400 bg-white flex items-center px-1 shadow-inner">
            <span className="text-[10.5px]">08.04.26</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentsTable = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-400 mx-4 mt-2 mb-4 shadow-sm overflow-hidden">
      <div className="overflow-auto custom-scrollbar h-full">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
            <tr>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8">#</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-32">Asset No.</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300">Asset Description</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-32">Total (LC)</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-24">Quantity</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 w-48">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="text-[10px] px-2 py-1 border-r border-gray-300 bg-gray-50 text-center font-medium">1</td>
              <td className="px-1 py-0.5 border-r border-gray-300">
                <div className="h-4 border border-gray-400 bg-[#fffae6] flex items-center px-1 group">
                  <div className="ml-auto cursor-pointer hover:bg-gray-200 p-0.5">
                    <div className="w-3 h-3 border border-gray-600 rounded-[2px] flex items-center justify-center">
                       <div className="w-1.5 h-1.5 bg-gray-600" />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-1 py-0.5 border-r border-gray-300"><div className="h-4 border border-gray-300 bg-white" /></td>
              <td className="px-1 py-0.5 border-r border-gray-300"><div className="h-4 border border-gray-300 bg-white" /></td>
              <td className="px-1 py-0.5 border-r border-gray-300"><div className="h-4 border border-gray-300 bg-white" /></td>
              <td className="px-1 py-0.5"><div className="h-4 border border-gray-300 bg-white" /></td>
            </tr>
            {Array.from({ length: 14 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 h-6">
                <td className="text-[10px] px-2 py-1 border-r border-gray-200 bg-gray-50 text-center" />
                <td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-5 bg-[#e5e5e5] border-t border-gray-400 flex items-center justify-end px-2">
         <div className="w-4 h-4 border border-gray-500 rounded-sm bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50">
           <Search className="w-3 h-3 text-gray-600" />
         </div>
      </div>
    </div>
  );

  const renderAccountingTable = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-400 mx-4 mt-2 mb-4 shadow-sm overflow-hidden">
      <div className="overflow-auto custom-scrollbar h-full">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
            <tr>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8">#</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-64">Depreciation Area</th>
              <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1">Journal Remark</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, area: 'Main Area', remark: 'Capitalization' },
              { id: 2, area: 'Booking Area', remark: 'Capitalization' }
            ].map((row) => (
              <tr key={row.id} className="border-b border-gray-200 h-6 transition-colors hover:bg-blue-50/30">
                <td className="text-[10px] px-2 py-1 border-r border-gray-300 bg-gray-50 text-center font-medium">{row.id}</td>
                <td className="px-2 py-0.5 border-r border-gray-300 flex items-center gap-2">
                  <div className="text-yellow-600 translate-y-[1px]"><CornerDownRight className="w-3 h-3" strokeWidth={3} /></div>
                  <span className="text-[10.5px]">{row.area}</span>
                </td>
                <td className="px-2 py-0.5 text-[10.5px]">{row.remark}</td>
              </tr>
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 h-6">
                <td className="text-[10px] px-2 py-1 border-r border-gray-200 bg-gray-50 text-center" />
                <td className="border-r border-gray-200" />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="px-4 pb-4 space-y-4">
      <div className="flex justify-between items-start gap-12">
        <div className="flex flex-col gap-1 w-64">
           <span className="text-[11px] text-[#333]">Remarks</span>
           <textarea 
             className="h-16 border border-gray-400 bg-white shadow-inner resize-none p-1 text-[10.5px] outline-none hover:border-blue-400 transition-colors"
           />
        </div>
        <div className="flex items-center gap-2 pt-8">
           <span className="text-[11px] text-[#333] font-bold">Total</span>
           <div className="w-32 h-5 border border-gray-400 bg-[#e0e0e0] flex items-center justify-end px-2 shadow-inner">
             <span className="text-[10.5px] font-bold text-gray-700">0.00</span>
           </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all hover:shadow active:translate-y-[1px]">
          Add
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm transition-all hover:shadow active:translate-y-[1px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      className={`absolute bg-[#f0f0f0] border border-[#d4d0c8] shadow-2xl flex flex-col font-sans select-none overflow-hidden`}
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? 'calc(100vh - 40px)' : windowState.height,
        zIndex: windowState.zIndex,
      }}
    >
      {/* ── Window Header ── */}
      <div
        onMouseDown={handleMouseDown}
        className="window-header h-[26px] bg-gradient-to-r from-[#757575] to-[#c0c0c0] flex items-center justify-between px-2 cursor-default group"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="w-4 h-4 rounded-sm bg-blue-500/20 flex items-center justify-center shrink-0 border border-white/20">
             <div className="w-2.5 h-2.5 bg-blue-100 rounded-[1px]" />
          </div>
          <span className="text-white text-[11px] font-bold truncate tracking-wide drop-shadow-sm">Capitalization</span>
        </div>
        <div className="flex items-center gap-[1px]">
          <button 
            onClick={() => onUpdateState({ isMinimized: true })}
            className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#c1c1c1] border border-[#808080] flex items-center justify-center transition-colors"
          >
            <Minus className="w-3 h-3 text-black" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
            className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#c1c1c1] border border-[#808080] flex items-center justify-center transition-colors"
          >
            <Square className="w-2.5 h-2.5 text-black" strokeWidth={1.5} />
          </button>
          <button 
            onClick={onClose}
            className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#e81123] hover:text-white border border-[#808080] flex items-center justify-center transition-colors group/close"
          >
            <X className="w-3 h-3 text-black group-hover/close:text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="h-[3px] bg-gradient-to-r from-[#ffed99] to-[#ffdb58] w-full shrink-0" />

      {/* ── Window Content ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {renderHeader()}

        {/* Tabs */}
        <div className="px-4 flex items-center gap-[1px] mt-2 relative z-10 shrink-0">
          {['Contents', 'Accounting'].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-1 text-[11px] font-medium border border-gray-400 rounded-t-sm cursor-pointer transition-all
                ${activeTab === tab 
                  ? 'bg-white border-b-white translate-y-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' 
                  : 'bg-[#e5e5e5] hover:bg-[#f5f5f5] text-gray-600 border-b-gray-400'}
              `}
            >
              {tab}
            </div>
          ))}
          <div className="flex-1 h-[1px] bg-gray-400 mt-[26px]" />
        </div>

        {activeTab === 'Contents' ? renderContentsTable() : renderAccountingTable()}

        {renderFooter()}
      </div>

      {/* ── Resizing Handles ── */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={(e) => handleResizeStart(e, 'n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={(e) => handleResizeStart(e, 's')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};
