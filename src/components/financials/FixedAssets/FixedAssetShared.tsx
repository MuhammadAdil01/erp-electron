import React, { useState, useEffect } from 'react';
import { X, Minus, Square, ChevronDown, CornerDownRight } from 'lucide-react';

export interface WindowState { x:number; y:number; width:number; height:number; isMinimized:boolean; isMaximized:boolean; zIndex:number; }
// ─── Reusable Window Shell ────────────────────────────────────────────────────
export const FixedAssetWindowShell: React.FC<{
  title: string;
  windowState: WindowState;
  onClose: ()=>void;
  onUpdateState: (s:Partial<WindowState>)=>void;
  onFocus: ()=>void;
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}> = ({ title, windowState, onClose, onUpdateState, onFocus, children, minWidth=750, minHeight=550 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x:0,y:0});
  const [isResizing, setIsResizing] = useState<string|null>(null);

  const handleMouseDown = (e:React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-header')) {
      onFocus(); setIsDragging(true);
      setDragOffset({ x: e.clientX - windowState.x, y: e.clientY - windowState.y });
    }
  };
  const handleResizeStart = (e:React.MouseEvent, dir:string) => { e.stopPropagation(); e.preventDefault(); setIsResizing(dir); };

  useEffect(() => {
    const onMove = (e:MouseEvent) => {
      if (isDragging) { onUpdateState({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }); return; }
      if (!isResizing) return;
      
      const startWidth = windowState.width;
      const startHeight = windowState.height;
      const startXPos = windowState.x;
      const startYPos = windowState.y;

      let newWidth = windowState.width;
      let newHeight = windowState.height;
      let newX = windowState.x;
      let newY = windowState.y;

      // This logic is slightly different because it's in a useEffect tracking mousemove globally
      // but we use the same principle of delta calculation
      
      if (isResizing.includes('e')) {
        newWidth = Math.max(minWidth, e.clientX - startXPos);
      }
      if (isResizing.includes('s')) {
        newHeight = Math.max(minHeight, e.clientY - startYPos);
      }
      
      if (isResizing.includes('w')) {
        const deltaX = e.clientX - (startXPos); // This isn't quite right since we don't have startX
        // Let's stick closer to the standardized delta logic if possible, 
        // but here windowState is updated every frame.
        // For West/North, we calculate the potential new width based on the current mouse and the opposite edge.
        const oppositeEdgeX = startXPos + startWidth;
        const potentialWidth = oppositeEdgeX - e.clientX;
        if (potentialWidth > minWidth) {
          newWidth = potentialWidth;
          newX = e.clientX;
        } else {
          newWidth = minWidth;
          newX = oppositeEdgeX - minWidth;
        }
      }
      
      if (isResizing.includes('n')) {
        const oppositeEdgeY = startYPos + startHeight;
        const potentialHeight = oppositeEdgeY - e.clientY;
        if (potentialHeight > minHeight) {
          newHeight = potentialHeight;
          newY = e.clientY;
        } else {
          newHeight = minHeight;
          newY = oppositeEdgeY - minHeight;
        }
      }

      onUpdateState({ width: newWidth, height: newHeight, x: newX, y: newY });
    };
    const onUp = () => { setIsDragging(false); setIsResizing(null); };
    if (isDragging || isResizing) { window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging, dragOffset, isResizing, windowState, minWidth, minHeight]);

  if (windowState.isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      className="absolute bg-[#f0f0f0] border border-[#d4d0c8] shadow-2xl flex flex-col font-sans select-none overflow-hidden"
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top:  windowState.isMaximized ? 0 : windowState.y,
        width:  windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? 'calc(100vh - 40px)' : windowState.height,
        zIndex: windowState.zIndex,
      }}
    >
      {/* Header */}
      <div onMouseDown={handleMouseDown} className="window-header h-[26px] bg-gradient-to-r from-[#757575] to-[#c0c0c0] flex items-center justify-between px-2 cursor-default">
        <span className="text-white text-[11px] font-bold truncate tracking-wide drop-shadow-sm">{title}</span>
        <div className="flex items-center gap-[1px]">
          <button onClick={() => onUpdateState({isMinimized:true})}  className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#c1c1c1] border border-[#808080] flex items-center justify-center"><Minus className="w-3 h-3" strokeWidth={1.5}/></button>
          <button onClick={() => onUpdateState({isMaximized:!windowState.isMaximized})} className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#c1c1c1] border border-[#808080] flex items-center justify-center"><Square className="w-2.5 h-2.5" strokeWidth={1.5}/></button>
          <button onClick={onClose} className="w-[21px] h-[19px] bg-[#e1e1e1] hover:bg-[#e81123] group/x border border-[#808080] flex items-center justify-center"><X className="w-3 h-3 group-hover/x:text-white" strokeWidth={1.5}/></button>
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-[#ffed99] to-[#ffdb58] shrink-0" />

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">{children}</div>

      {/* Resize handles */}
      {!windowState.isMaximized && (
        <div className="absolute inset-0 pointer-events-none">
          <div onMouseDown={e=>handleResizeStart(e,'n')}  className="absolute top-0     left-0  right-0  h-1 cursor-ns-resize  pointer-events-auto z-[60]"/>
          <div onMouseDown={e=>handleResizeStart(e,'s')}  className="absolute bottom-0 left-0  right-0  h-1 cursor-ns-resize  pointer-events-auto z-[60]"/>
          <div onMouseDown={e=>handleResizeStart(e,'w')}  className="absolute top-0  bottom-0 left-0   w-1 cursor-ew-resize  pointer-events-auto z-[60]"/>
          <div onMouseDown={e=>handleResizeStart(e,'e')}  className="absolute top-0  bottom-0 right-0  w-1 cursor-ew-resize  pointer-events-auto z-[60]"/>
          <div onMouseDown={e=>handleResizeStart(e,'nw')} className="absolute top-0     left-0 w-2 h-2 cursor-nwse-resize pointer-events-auto z-[70]"/>
          <div onMouseDown={e=>handleResizeStart(e,'ne')} className="absolute top-0    right-0 w-2 h-2 cursor-nesw-resize pointer-events-auto z-[70]"/>
          <div onMouseDown={e=>handleResizeStart(e,'sw')} className="absolute bottom-0  left-0 w-2 h-2 cursor-nesw-resize pointer-events-auto z-[70]"/>
          <div onMouseDown={e=>handleResizeStart(e,'se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize pointer-events-auto z-[70]"/>
        </div>
      )}
    </div>
  );
};

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
export const FieldInput: React.FC<{ value?: string; yellow?: boolean; readOnly?: boolean; className?: string }> = ({ value='', yellow, readOnly, className='' }) => (
  <div className={`h-5 border border-gray-400 flex items-center px-1 shadow-inner text-[10.5px] ${yellow ? 'bg-[#fffae6]' : 'bg-white'} ${readOnly ? 'bg-[#e0e0e0]' : ''} ${className}`}>
    <span>{value}</span>
  </div>
);

export const DropdownInput: React.FC<{ value?: string; yellow?: boolean; className?: string }> = ({ value='', yellow, className='' }) => (
  <div className={`h-5 border border-gray-400 flex items-center px-1 shadow-inner ${yellow ? 'bg-[#fffae6]' : 'bg-white'} ${className}`}>
    <span className="text-[10.5px] flex-1">{value}</span>
    <div className="px-0.5 border-l border-gray-400 h-full flex items-center hover:bg-gray-200 cursor-pointer"><ChevronDown className="w-3 h-3 text-gray-600"/></div>
  </div>
);

export const GoldBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...p }) => (
  <button {...p} className={`px-6 py-0.5 bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border border-gray-600 rounded-[3px] text-[11px] font-medium text-gray-800 shadow-sm hover:shadow active:translate-y-[1px] ${p.className||''}`}>{children}</button>
);

export const TabBar: React.FC<{ tabs:string[]; active:string; onChange:(t:string)=>void }> = ({ tabs, active, onChange }) => (
  <div className="px-4 flex items-end gap-[1px] shrink-0">
    {tabs.map(t => (
      <div key={t} onClick={()=>onChange(t)} className={`px-4 py-1 text-[11px] font-medium border border-gray-400 rounded-t-sm cursor-pointer transition-all
        ${active===t ? 'bg-white border-b-white translate-y-[1px] shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'bg-[#e5e5e5] hover:bg-[#f5f5f5] text-gray-600'}`}>{t}</div>
    ))}
    <div className="flex-1 border-b border-gray-400" />
  </div>
);

export const DataTable: React.FC<{ headers: string[]; rows?: (string | React.ReactNode)[][]; emptyRows?: number; className?: string }> = ({ headers, rows = [], emptyRows = 10, className = '' }) => (
  <div className={`flex-1 border border-gray-400 bg-white shadow-sm overflow-auto custom-scrollbar ${className}`} style={{ minHeight: 0 }}>
    <table className="w-full border-collapse" style={{ minWidth: headers.length * 80 }}>
      <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 whitespace-nowrap text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-200 h-6 hover:bg-blue-50/30 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className={`text-[10px] px-2 border-r border-gray-200 ${j === 0 ? 'bg-gray-50 text-center font-medium' : 'text-gray-800'}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
        {Array.from({ length: Math.max(0, emptyRows - rows.length) }).map((_, i) => (
          <tr key={`empty-${i}`} className="border-b border-gray-100 h-6">
            {headers.map((_, j) => (
              <td key={j} className="border-r border-gray-100" />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const AccountingTab: React.FC = () => (
  <div className="flex-1 border border-gray-400 mx-4 bg-white shadow-sm overflow-auto custom-scrollbar" style={{minHeight:0}}>
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
        <tr>
          <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-8">#</th>
          <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 w-52">Depreciation Area</th>
          <th className="text-[10.5px] font-bold text-gray-700 px-2 py-1">Journal Remark</th>
        </tr>
      </thead>
      <tbody>
        {[{id:1,area:'Main Area',remark:'Posted'},{id:2,area:'Booking Area',remark:'Posted'}].map(r=>(
          <tr key={r.id} className="border-b border-gray-200 h-6 hover:bg-blue-50/30">
            <td className="text-[10px] px-2 border-r border-gray-300 bg-gray-50 text-center font-medium">{r.id}</td>
            <td className="px-2 border-r border-gray-300 flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-yellow-600 shrink-0" strokeWidth={3}/><span className="text-[10.5px]">{r.area}</span>
            </td>
            <td className="px-2 text-[10.5px]">{r.remark}</td>
          </tr>
        ))}
        {Array.from({length:12}).map((_,i)=><tr key={i} className="border-b border-gray-100 h-6"><td className="border-r border-gray-200 bg-gray-50"/><td className="border-r border-gray-200"/><td/></tr>)}
      </tbody>
    </table>
  </div>
);
