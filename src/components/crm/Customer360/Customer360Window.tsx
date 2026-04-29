import React, { useState } from 'react';
import { Home, RotateCcw, Pencil, Filter, MessageSquare, ChevronDown } from 'lucide-react';
import { WindowControls } from '../../ui/WindowControls';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface Customer360WindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const Customer360Window: React.FC<Customer360WindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState('Sales');

  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const startWidth = windowState.width;
    const startHeight = windowState.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startXPos = windowState.x;
    const startYPos = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = windowState.x;
      let newY = windowState.y;
      let newWidth = windowState.width;
      let newHeight = windowState.height;

      if (direction.includes('e')) newWidth = Math.max(1000, startWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(600, startHeight + deltaY);
      
      if (direction.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= 1000) newX = startXPos + deltaX;
        else newWidth = 1000;
      }
      
      if (direction.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= 600) newY = startYPos + deltaY;
        else newHeight = 600;
      }

      onUpdateState({ x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const tabs = ['General', 'Sales', 'Order Fulfillment', 'Receivables'];

  return (
    <div
      className="absolute flex flex-col overflow-hidden select-none bg-[#4a637d]"
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}
      onClick={onFocus}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50" />
        </>
      )}

      {/* Main Title Bar (SAP Style) */}
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-[#f0f0f0] border-b border-gray-400 flex items-center justify-between px-2 cursor-default shrink-0"
      >
        <span className="text-[11px] text-gray-700 font-medium">Pervasive Analytics</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      {/* Breadcrumb Sub-Header */}
      <div className="h-[55px] bg-[#2c3e50] flex items-center px-4 shrink-0 shadow-lg justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
           <button className="text-white opacity-80 hover:opacity-100 p-1">
              <Home className="w-6 h-6" />
           </button>
           <div className="relative flex items-center h-full">
              <div className="h-[35px] px-8 bg-white/10 flex items-center relative after:content-[''] after:absolute after:right-[-17px] after:top-0 after:bottom-0 after:w-[18px] after:bg-[#2c3e50] after:[clip-path:polygon(0_0,0_100%,100%_50%)] before:content-[''] before:absolute before:right-[-18px] before:top-0 before:bottom-0 before:w-[18px] before:bg-white/20 before:[clip-path:polygon(0_0,0_100%,100%_50%)]">
                 <span className="text-white text-[16px] font-medium tracking-wide">Customer 360</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-4 text-white/80 pr-2">
           <RotateCcw className="w-5 h-5 cursor-pointer hover:text-white" />
           <Pencil className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Tab Navigation & Toolbar */}
      <div className="h-[45px] bg-[#34495e] flex items-center justify-between px-6 shrink-0 border-b border-black/20">
         <div className="flex gap-12 h-full items-center">
            {tabs.map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[15px] font-medium transition-all relative h-full flex items-center px-2 ${
                    activeTab === tab 
                      ? 'text-white border-b-2 border-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>
         <Filter className="w-5 h-5 text-white/70 cursor-pointer hover:text-white" />
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-[260px_repeat(4,1fr)] grid-rows-[repeat(3,180px)] gap-4 h-full min-w-[1200px]">
            
            {/* Left Profile Card (Span 2 rows) */}
            <div className="row-span-2 bg-white rounded-md shadow-lg p-5 flex flex-col gap-1 border border-black/5">
                <span className="text-[#3498db] font-bold text-[13px] mb-4">0/1OL/000849/</span>
                <span className="text-gray-700 font-bold text-[14px] mb-6">...</span>
                
                <div className="flex flex-col gap-2.5 text-gray-500 text-[11px]">
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">Contact Person:</span>
                      <span className="truncate">MR WALEED ...</span>
                   </div>
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">T:</span>
                      <span></span>
                   </div>
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">M:</span>
                      <span></span>
                   </div>
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">F:</span>
                      <span></span>
                   </div>
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">E-Mail:</span>
                      <span></span>
                   </div>
                   <div className="flex gap-2">
                      <span className="font-bold shrink-0">Sales EE:</span>
                      <span className="text-gray-400 italic">-No Sales Employee-</span>
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-200">
                   <div className="flex items-center justify-between group cursor-pointer">
                      <span className="text-gray-700 font-bold text-[11px]">Default Address</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                   </div>
                </div>
            </div>

            {/* Metric Tiles Row 1 */}
            <MetricTile title="Total Sales Amount (LTD)" value="---" subValue="PKR" />
            <MetricTile title="Gross Profit (LTD)" value="---" subValue="PKR" />
            <MetricTile 
              title="Number of Open Service Calls" 
              value="0" 
              valueStyle="text-[48px] text-red-600 font-medium" 
            />
            <MetricTile title="Potential Amt of Open Opportunities" value="---" subValue="PKR" />

            {/* Metric Tiles Row 2 */}
            <div className="col-span-2 bg-white/5 rounded-md border border-white/10 flex items-center justify-center">
               <MessageSquare className="w-12 h-12 text-white/5 opacity-20" />
            </div>
            <MetricTile title="Churn Probability" value="---" subValue="%" />
            <MetricTile title="Opportunity Win Rate (LTD)" value="---" subValue="%" />

            {/* Metric Tiles Row 3 */}
            <div className="col-start-2 col-span-1">
               <MetricTile title="Weighted Amount of All Open Opportunities (LC)" value="---" subValue="PKR" />
            </div>
            
         </div>
      </div>
    </div>
  );
};

interface MetricTileProps {
  title: string;
  value: string;
  subValue?: string;
  valueStyle?: string;
}

const MetricTile: React.FC<MetricTileProps> = ({ title, value, subValue, valueStyle }) => (
  <div className="bg-white rounded-md shadow-lg p-5 px-6 flex flex-col border border-black/5 hover:bg-gray-50 transition-colors cursor-pointer group relative">
    <div className="text-gray-700 font-bold text-[11px] leading-[1.2] mb-1 pr-6 tracking-tight">{title}</div>
    <div className="flex-1 flex flex-col justify-center py-4">
       <div className={valueStyle || "text-[36px] text-[#e0e0e0] font-light leading-none"}>{value}</div>
       {subValue && <div className="text-gray-400 text-[9px] font-bold mt-1 tracking-wider uppercase">{subValue}</div>}
    </div>
    
    {/* Bottom Right decoration lines from image */}
    <div className="absolute bottom-2.5 right-3 flex flex-col items-end gap-[2px] opacity-40">
       <div className="w-6 h-[1px] bg-gray-300" />
       <div className="w-3 h-[1px] bg-gray-300" />
    </div>
  </div>
);
