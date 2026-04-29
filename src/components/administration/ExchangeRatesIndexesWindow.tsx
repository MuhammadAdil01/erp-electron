import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface ExchangeRatesIndexesWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const ExchangeRatesIndexesWindow: React.FC<ExchangeRatesIndexesWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [activeTab, setActiveTab] = useState<'rates' | 'indexes'>('rates');

  if (!show || windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setWindowState(prev => ({
        ...prev,
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      }));
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

      setWindowState(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newWidth = prev.width;
        let newHeight = prev.height;

        const minW = 800;
        const minH = 500;

        if (direction.includes('e')) {
          newWidth = Math.max(minW, startWidth + deltaX);
        }
        if (direction.includes('s')) {
          newHeight = Math.max(minH, startHeight + deltaY);
        }
        
        if (direction.includes('w')) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth > minW) {
            newWidth = possibleWidth;
            newX = startXPos + deltaX;
          } else {
            newWidth = minW;
            newX = startXPos + (startWidth - minW);
          }
        }
        
        if (direction.includes('n')) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight > minH) {
            newHeight = possibleHeight;
            newY = startYPos + deltaY;
          } else {
            newHeight = minH;
            newY = startYPos + (startHeight - minH);
          }
        }

        return { ...prev, x: newX, y: newY, width: newWidth, height: newHeight };
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const sapButtonStyle =
    'px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[100px] hover:brightness-95 active:shadow-inner';

  const tabs: { key: 'rates' | 'indexes'; label: string; shortcut: string }[] = [
    { key: 'rates', label: 'Exchange Rates', shortcut: 'E' },
    { key: 'indexes', label: 'Indexes', shortcut: 'I' },
  ];

  return (
    <div
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
      className="absolute bg-[#ececec] flex flex-col shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden group/window select-none text-[11px]"
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div
        onMouseDown={handleDrag}
        className="h-[28px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[12px] tracking-tight">
            Exchange Rates and Indexes
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <div
            onClick={() => setWindowState(p => ({ ...p, isMinimized: true }))}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </div>
          <div
            onClick={() => setWindowState(p => ({ ...p, isMaximized: !p.isMaximized }))}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group"
          >
            <X className="w-4 h-4 text-gray-600 group-hover:text-white" />
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex px-1.5 pt-1.5 bg-[#ececec] border-b border-gray-400">
        {tabs.map(({ key, label, shortcut }) => {
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              style={{ marginBottom: isActive ? '-1px' : '0' }}
              className={`relative px-6 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r
                ${isActive
                  ? 'bg-white border-gray-400 text-black z-10'
                  : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600 hover:from-[#f5f5f5] hover:to-[#e8e8e8]'
                }`}
            >
              {/* Gold top indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />
              )}
              {/* Label */}
              <span>
                <span className="underline">{shortcut}</span>
                {label.slice(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden bg-white mx-1.5 mb-1.5 border-l border-r border-b border-gray-400 shadow-inner">
        <div className="flex-1 flex flex-col overflow-hidden space-y-2">

          {/* Exchange Rates Tab */}
          {activeTab === 'rates' ? (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex justify-end gap-2 items-center">
                <select className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd0] min-w-[100px]">
                  <option value="March">March</option>
                </select>
                <select className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd0] min-w-[80px]">
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="flex-1 border border-gray-400 overflow-auto custom-scrollbar bg-white">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                    <tr className="border-b border-gray-400 text-left">
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[50px]">March</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[80px]">AUD</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">EUR</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">GBP</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">JPY</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[100px]">NZD</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 py-1 min-w-[50px]">S</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(31)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100 h-6 hover:bg-orange-50 cursor-default">
                        <td className="border-r border-gray-100 px-1 font-bold bg-[#f0f0f0]">{i + 1}</td>
                        <td className="border-r border-gray-100 px-1"></td>
                        <td className="border-r border-gray-100 px-1"></td>
                        <td className="border-r border-gray-100 px-1"></td>
                        <td className="border-r border-gray-100 px-1"></td>
                        <td className="border-r border-gray-100 px-1"></td>
                        <td className="border-r border-gray-100 px-1"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Indexes Tab */
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex justify-end gap-2 items-center">
                <select className="h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd0] min-w-[80px]">
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="flex-1 border border-gray-400 overflow-auto custom-scrollbar bg-white">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                    <tr className="border-b border-gray-400 text-left h-7">
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 min-w-[100px]">2026</th>
                      <th className="border-r border-gray-300 text-[10px] font-medium px-1 min-w-[400px]">CP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                      <tr key={i} className="border-b border-gray-100 h-6 hover:bg-orange-50 cursor-default">
                        <td className="border-r border-gray-100 px-1 font-bold bg-[#f0f0f0]">{m}</td>
                        <td className="border-r border-gray-100 px-1"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="grid grid-cols-[1fr_200px] items-end gap-4 pt-1 shrink-0">
            <div className="flex gap-2">
              <button className={sapButtonStyle}>OK</button>
              <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
            </div>
            <div className="flex flex-col gap-1 items-end pr-2">
              <button className={sapButtonStyle}>Auto. Export</button>
              {activeTab === 'rates' && (
                <button className={`${sapButtonStyle} whitespace-nowrap`}>
                  <span className="underline">S</span>et Rate for Selection Criteria
                </button>
              )}
              <button className={sapButtonStyle}>Auto. Import</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};