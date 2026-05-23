import React, { useState } from 'react';
import { X, Minus, Square, ChevronDown, MoreHorizontal, Calendar, Search } from 'lucide-react';

interface JournalEntryWindowProps {
  onClose: () => void;
  onFocus: () => void;
  windowState: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
  };
  onUpdateState: (state: Partial<JournalEntryWindowProps['windowState']>) => void;
}

export const JournalEntryWindow: React.FC<JournalEntryWindowProps> = ({
  onClose,
  onFocus,
  windowState,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState('Attachments');
  const isMaximized = windowState.isMaximized;

  const sapLabelStyle = "text-[11px] text-[#333333] font-medium whitespace-nowrap";
  const sapInputStyle = "text-[11px] border border-gray-400 px-1 py-0.5 bg-white focus:border-blue-500 focus:outline-none rounded-[1px]";
  const sapCheckboxStyle = "w-3.5 h-3.5 border-gray-400 rounded-[1px] accent-blue-600 cursor-pointer";
  const sapButtonStyle = "px-4 py-0.5 text-[11px] font-medium border border-gray-500 rounded-[1px] shadow-sm hover:bg-gray-100 transition-colors bg-[#e1e1e1]";
  const sapGoldButtonStyle = "px-4 py-0.5 text-[11px] font-bold border border-gray-600 rounded-[1px] shadow-sm hover:brightness-95 transition-all bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60";

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    if (isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWindowX = windowState.x;
    const initialWindowY = windowState.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({
        x: initialWindowX + (moveEvent.clientX - startX),
        y: initialWindowY + (moveEvent.clientY - startY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = windowState.x;
    const initialY = windowState.y;
    const initialW = windowState.width;
    const initialH = windowState.height;
    const minW = 900;
    const minH = 500;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let x = initialX;
      let y = initialY;
      let w = initialW;
      let h = initialH;

      if (direction.includes('e')) w = Math.max(minW, initialW + dx);
      if (direction.includes('s')) h = Math.max(minH, initialH + dy);

      if (direction.includes('w')) {
        w = Math.max(minW, initialW - dx);
        if (w !== initialW) x = initialX + (initialW - w);
      }

      if (direction.includes('n')) {
        h = Math.max(minH, initialH - dy);
        if (h !== initialH) y = initialY + (initialH - h);
      }

      onUpdateState({ x, y, width: w, height: h });
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
      onClick={onFocus}
      style={{
        position: 'absolute',
        left: isMaximized ? 0 : windowState.x,
        top: isMaximized ? 0 : windowState.y,
        width: isMaximized ? '100%' : windowState.width,
        height: isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f0f0',
        border: '1px solid #999',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        userSelect: 'none',
        overflow: 'hidden', // ✅ FIX: prevents checkbox panel from bleeding outside window
      }}
      className="journal-entry-window"
    >
      {/* Resize Handles */}
      {!isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}

      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-7 bg-gradient-to-b from-[#fdfdfd] to-[#dcdcdc] flex items-center justify-between px-2 cursor-default border-b border-[#999] shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#444]">Journal Entry</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMinimized: true }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdateState({ isMaximized: !isMaximized }); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Square className="w-3 h-3 text-[#555]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-6 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gold accent bar */}
      <div className="h-1 bg-[#e8a01c] w-full shrink-0" />

      {/* Header Form Area */}
      <div className="p-2 space-y-2 bg-[#f0f0f0] shrink-0 overflow-hidden">
        <div className="flex justify-between items-start gap-4 w-full min-w-0">
          {/* Left: Form Fields */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Row 1 */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Series</span>
                <div className="flex items-center">
                  <select className={`${sapInputStyle} w-24 bg-[#ffffe0] border-black/30`}>
                    <option>....</option>
                  </select>
                  <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Number</span>
                <input type="text" className={`${sapInputStyle} w-20 bg-gray-100`} defaultValue="651583" readOnly />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Posting Date</span>
                <div className="flex items-center">
                  <input type="text" className={`${sapInputStyle} w-20`} defaultValue="13.03.26" />
                  <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Due Date</span>
                <div className="flex items-center">
                  <input type="text" className={`${sapInputStyle} w-20`} defaultValue="13.03.26" />
                  <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Doc. Date</span>
                <div className="flex items-center">
                  <input type="text" className={`${sapInputStyle} w-20`} defaultValue="13.03.26" />
                  <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Origin</span>
                <input type="text" className={`${sapInputStyle} w-20 bg-gray-100`} defaultValue="JE" readOnly />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Origin No.</span>
                <input type="text" className={`${sapInputStyle} w-20 bg-gray-100`} defaultValue="651583" readOnly />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Trans. No.</span>
                <input type="text" className={`${sapInputStyle} w-20 bg-gray-100`} defaultValue="651583" readOnly />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Template Type</span>
                <select className={`${sapInputStyle} w-28`}>
                  <option>Percentage</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Template</span>
                <select className={`${sapInputStyle} w-28`} />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Indicator</span>
                <select className={`${sapInputStyle} w-16`} />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Project</span>
                <div className="flex items-center">
                  <input type="text" className={sapInputStyle} />
                  <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                    <Search className="w-3 h-3 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 - Remarks */}
            <div className="flex items-start gap-1 w-full">
              <span className={sapLabelStyle}>Remarks</span>
              <textarea className={`${sapInputStyle} flex-1 h-6 resize-none`} />
            </div>

            {/* Row 4 */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Trans. Code</span>
                <select className={`${sapInputStyle} w-20`} />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Ref. 1</span>
                <input type="text" className={`${sapInputStyle} w-20`} />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Ref. 2</span>
                <input type="text" className={`${sapInputStyle} w-20`} />
              </div>
              <div className="flex items-center gap-1">
                <span className={sapLabelStyle}>Ref. 3</span>
                <input type="text" className={`${sapInputStyle} w-20`} />
              </div>
            </div>

            {/* Row 5 */}
            <div className="flex items-center gap-1 pt-2">
              <span className={sapLabelStyle}>Blanket Agreement</span>
              <div className="flex items-center">
                <input type="text" className={`${sapInputStyle} w-32 bg-gray-100`} readOnly />
                <div className="w-5 h-5 bg-[#e1e1e1] border border-l-0 border-[#ccc] flex items-center justify-center">
                  <MoreHorizontal className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checkboxes — fixed width, never shrinks below content */}
          <div className="flex flex-col gap-1 w-[230px] shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Revaluation Reporting Exch. Rate</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Reverse</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Adj. Trans. (Period 13)</span>
            </label>
            <div className="h-4" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Automatic Tax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className={sapCheckboxStyle} />
              <span className={sapLabelStyle}>Manage Deferred Tax</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50">
              <input type="checkbox" className={sapCheckboxStyle} disabled />
              <span className={sapLabelStyle}>Manage WTax</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-1 px-2">
        <div className="flex gap-[2px]">
          <button
            onClick={() => setActiveTab('Contents')}
            className={`px-6 py-0.5 text-[11px] font-medium border border-[#999] border-b-0 rounded-t-[3px] transition-all
              ${activeTab === 'Contents' ? 'bg-white z-10 -mb-[1px] font-bold' : 'bg-[#e1e1e1] hover:bg-gray-200'}
            `}
          >
            Contents
          </button>
          <button
            onClick={() => setActiveTab('Attachments')}
            className={`px-6 py-0.5 text-[11px] font-medium border border-[#999] border-b-0 rounded-t-[3px] transition-all
              ${activeTab === 'Attachments' ? 'bg-white z-10 -mb-[1px] font-bold' : 'bg-[#e1e1e1] hover:bg-gray-200'}
            `}
          >
            Attachments
          </button>
        </div>

        <div className="flex-1 border border-[#999] bg-white flex min-h-0 shadow-inner overflow-hidden mb-1">
          {activeTab === 'Attachments' ? (
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-auto border-r border-[#ccc]">
                <table className="w-full text-[10.5px] border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-[#e4e4e4] sticky top-0 z-10 border-b border-[#ccc]">
                      <th className="w-8 border-r border-[#ccc] p-0.5">#</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Target Path</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">File Name</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">File Extension</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">File Size</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Attachment Date</th>
                      <th className="border-r border-[#ccc] p-0.5 text-left font-medium">Attached By</th>
                      <th className="p-0.5 text-left font-medium">Free Text</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(15)].map((_, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'} border-b border-[#eee] hover:bg-blue-50/50`}>
                        <td className="border-r border-[#ccc] text-center text-gray-400 p-0.5">{i + 1}</td>
                        <td className="border-r border-[#ccc] p-0.5"></td>
                        <td className="border-r border-[#ccc] p-0.5"></td>
                        <td className="border-r border-[#ccc] p-0.5"></td>
                        <td className="border-r border-[#ccc] p-0.5 text-right"></td>
                        <td className="border-r border-[#ccc] p-0.5"></td>
                        <td className="border-r border-[#ccc] p-0.5"></td>
                        <td className="p-0.5"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-24 bg-[#f0f0f0] p-2 flex flex-col gap-1 shrink-0">
                <button className={sapGoldButtonStyle}>Browse</button>
                <button className={sapButtonStyle}>Display</button>
                <div className="flex-1" />
                <button className={sapButtonStyle}>Delete</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
              Contents section not active in this view
            </div>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="h-10 px-3 bg-[#f0f0f0] border-t border-[#ccc] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button className={sapGoldButtonStyle}>Add</button>
          <button onClick={onClose} className={sapGoldButtonStyle}>Cancel</button>
        </div>

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className={sapCheckboxStyle} />
            <span className={sapLabelStyle}>Display in FC</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className={sapCheckboxStyle} />
            <span className={sapLabelStyle}>Display in SC</span>
          </label>

          <div className="flex items-center gap-2 ml-4">
            <button className={sapGoldButtonStyle}>Import From Excel</button>
            <button className={sapButtonStyle}>Cancel Template</button>
          </div>
        </div>
      </div>
    </div>
  );
};