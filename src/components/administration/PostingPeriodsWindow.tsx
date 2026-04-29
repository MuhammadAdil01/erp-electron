import React, { useState } from 'react';
import { X, Minus, Square, ChevronRight } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface PostingPeriodsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const PostingPeriodsWindow: React.FC<PostingPeriodsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  
  // Sample Data from screenshot
  const periods = [
    { id: 1, code: '2016-01', name: '2015-2016-01', status: 'Closing Period', postFrom: '01.07.15', postTo: '31.07.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 2, code: '2016-02', name: '2015-2016-02', status: 'Closing Period', postFrom: '01.08.15', postTo: '31.08.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 3, code: '2016-03', name: '2015-2016-03', status: 'Closing Period', postFrom: '01.09.15', postTo: '30.09.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 4, code: '2016-04', name: '2015-2016-04', status: 'Closing Period', postFrom: '01.10.15', postTo: '31.10.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 5, code: '2016-05', name: '2015-2016-05', status: 'Closing Period', postFrom: '01.11.15', postTo: '30.11.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 6, code: '2016-06', name: '2015-2016-06', status: 'Closing Period', postFrom: '01.12.15', postTo: '31.12.15', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 7, code: '2016-07', name: '2015-2016-07', status: 'Closing Period', postFrom: '01.01.16', postTo: '31.01.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 8, code: '2016-08', name: '2015-2016-08', status: 'Closing Period', postFrom: '01.02.16', postTo: '29.02.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 9, code: '2016-09', name: '2015-2016-09', status: 'Closing Period', postFrom: '01.03.16', postTo: '31.03.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 10, code: '2016-10', name: '2015-2016-10', status: 'Closing Period', postFrom: '01.04.16', postTo: '30.04.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 11, code: '2016-11', name: '2015-2016-11', status: 'Closing Period', postFrom: '01.05.16', postTo: '31.05.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 12, code: '2016-12', name: '2015-2016-12', status: 'Closing Period', postFrom: '01.06.16', postTo: '30.06.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 13, code: '2017-01', name: '2016-2017-01', status: 'Closing Period', postFrom: '01.07.16', postTo: '31.07.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 14, code: '2017-02', name: '2016-2017-02', status: 'Closing Period', postFrom: '01.08.16', postTo: '31.08.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 15, code: '2017-03', name: '2016-2017-03', status: 'Closing Period', postFrom: '01.09.16', postTo: '30.09.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 16, code: '2017-04', name: '2016-2017-04', status: 'Closing Period', postFrom: '01.10.16', postTo: '31.10.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 17, code: '2017-05', name: '2016-2017-05', status: 'Closing Period', postFrom: '01.11.16', postTo: '30.11.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 18, code: '2017-06', name: '2016-2017-06', status: 'Closing Period', postFrom: '01.12.16', postTo: '31.12.16', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 19, code: '2017-07', name: '2016-2017-07', status: 'Closing Period', postFrom: '01.01.17', postTo: '31.01.17', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
    { id: 20, code: '2017-08', name: '2016-2017-08', status: 'Closing Period', postFrom: '01.02.17', postTo: '28.02.17', dueFrom: '01.07.15', dueTo: '30.06.45', docFrom: '01.07.15', docTo: '30.06.45' },
  ];

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

        const minW = 900;
        const minH = 600;

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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer";

  const handleOpenDetail = (period: any) => {
    setSelectedPeriod(period);
    setShowDetail(true);
  };

  return (
    <div 
      style={{
        left: windowState.isMaximized ? 0 : windowState.x,
        top: windowState.isMaximized ? 0 : windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex
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
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">Posting Periods</span>
        </div>
        <div className="flex items-center gap-0.5">
           <div onClick={() => setWindowState(p => ({...p, isMinimized: true}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Minus className="w-3.5 h-3.5 text-gray-600" />
           </div>
           <div onClick={() => setWindowState(p => ({...p, isMaximized: !p.isMaximized}))} className="w-5 h-5 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Square className="w-3 h-3 text-gray-600" />
           </div>
           <div onClick={onClose} className="w-5 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors group">
              <X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
           </div>
        </div>
      </div>

      {/* Find Bar */}
      <div className="p-2 flex items-center gap-4 bg-[#ececec] border-b border-gray-300">
         <div className="flex items-center gap-2">
            <span className={sapLabelStyle}>Find</span>
            <input type="text" className={`${sapInputStyle} !w-160 bg-[#fffbd0]`} />
         </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white mx-1.5 mt-1.5 border border-gray-400">
         {/* Table Header */}
         <div className="flex bg-[#f2f2f2] border-b border-gray-300 select-none sticky top-0 z-10">
            <div className={`${sapLabelStyle} w-8 px-1 border-r border-gray-300 text-center font-bold`}>#</div>
            <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-300 font-bold`}>Period Code</div>
            <div className={`${sapLabelStyle} w-40 px-1 border-r border-gray-300 font-bold`}>Period Name</div>
            <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-300 font-bold`}>Period Status</div>
            
            <div className="flex-1 flex flex-col">
               <div className={`${sapLabelStyle} text-center border-b border-gray-300 font-bold bg-[#e8e8e8]`}>Posting Date</div>
               <div className="flex">
                  <div className={`${sapLabelStyle} flex-1 px-1 border-r border-gray-300 text-center`}>From</div>
                  <div className={`${sapLabelStyle} flex-1 px-1 border-r border-gray-300 text-center`}>To</div>
               </div>
            </div>

            <div className="flex-1 flex flex-col">
               <div className={`${sapLabelStyle} text-center border-b border-gray-300 font-bold bg-[#e8e8e8]`}>Due Date</div>
               <div className="flex">
                  <div className={`${sapLabelStyle} flex-1 px-1 border-r border-gray-300 text-center`}>From</div>
                  <div className={`${sapLabelStyle} flex-1 px-1 border-r border-gray-300 text-center`}>To</div>
               </div>
            </div>

            <div className="flex-1 flex flex-col">
               <div className={`${sapLabelStyle} text-center border-b border-gray-300 font-bold bg-[#e8e8e8]`}>Document Date</div>
               <div className="flex">
                  <div className={`${sapLabelStyle} flex-1 px-1 border-r border-gray-300 text-center`}>From</div>
                  <div className={`${sapLabelStyle} flex-1 px-1 text-center`}>To</div>
               </div>
            </div>
         </div>

         {/* Multi-Level Header (General) */}
         <div className="flex bg-[#e8e8e8] border-b border-gray-300 h-4 items-center">
            <div className="w-8 border-r border-gray-300 h-full"></div>
            <div className="flex-1 text-[10px] font-bold px-2 tracking-tight text-gray-500 uppercase">General</div>
            <div className="flex-1 text-[10px] font-bold px-2 tracking-tight text-gray-500 uppercase">Dates</div>
         </div>

         {/* Table Body */}
         <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="min-w-max">
               {periods.map((p, idx) => (
                  <div key={p.id} className={`flex border-b border-gray-100 items-center hover:bg-blue-50/50 cursor-default h-[18px] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                     <div className={`${sapLabelStyle} w-8 px-1 border-r border-gray-200 text-center text-gray-500`}>{idx + 1}</div>
                     <div className="w-32 px-1 border-r border-gray-200 flex items-center gap-1 group">
                        <ChevronRight 
                          onClick={() => handleOpenDetail(p)}
                          className="w-3.5 h-3.5 text-orange-400 rotate-0 translate-y-[0px] cursor-pointer hover:scale-110 active:scale-95 transition-transform" 
                        />
                        <span className={`${sapLabelStyle} text-black font-medium`}>{p.code}</span>
                     </div>
                     <div className={`${sapLabelStyle} w-40 px-1 border-r border-gray-200`}>{p.name}</div>
                     <div className={`${sapLabelStyle} w-32 px-1 border-r border-gray-200`}>{p.status}</div>
                     
                     <div className="w-[calc((100%-112px-28px)/3)] flex items-center border-r border-gray-200">
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center border-r border-gray-100`}>{p.postFrom}</div>
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center`}>{p.postTo}</div>
                     </div>

                     <div className="w-[calc((100%-112px-28px)/3)] flex items-center border-r border-gray-200">
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center border-r border-gray-100`}>{p.dueFrom}</div>
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center`}>{p.dueTo}</div>
                     </div>

                     <div className="w-[calc((100%-112px-28px)/3)] flex items-center">
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center border-r border-gray-100`}>{p.docFrom}</div>
                        <div className={`${sapLabelStyle} flex-1 px-1 text-center`}>{p.docTo}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Bottom Checkboxes */}
      <div className="px-3 py-2 space-y-1">
         <div className="flex items-center gap-2">
            <input type="checkbox" className={sapCheckboxStyle} />
            <span className={sapLabelStyle}>Create New Periods with 'Due Date To' in Next Financial Year</span>
         </div>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <input type="checkbox" className={sapCheckboxStyle} defaultChecked />
               <span className={sapLabelStyle}>Automatically Update Period Status to 'Closing Period' for Existing Periods</span>
            </div>
         </div>
         <div className="flex items-center gap-2 pl-5">
            <span className={sapLabelStyle}>Days After New Period Starts</span>
            <input type="text" className={`${sapInputStyle} !w-16 text-center`} defaultValue="1" />
         </div>
      </div>

      {/* Footer */}
      <div className="h-[40px] px-3 bg-[#ececec] flex items-center justify-between border-t border-gray-300">
        <div className="flex items-center gap-2">
          <button className={sapButtonStyle}>OK</button>
          <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
        </div>
        <button className={sapButtonStyle}>New Period</button>
      </div>

      {/* Detail Window Overlay */}
      {showDetail && selectedPeriod && (
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
           <div 
             className="w-[450px] bg-[#ececec] border border-[#404040]/50 rounded-[2px] shadow-2xl flex flex-col overflow-hidden"
             onMouseDown={(e) => e.stopPropagation()}
           >
              {/* Detail Title Bar */}
              <div className="h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 border-b border-gray-400">
                 <span className="text-black font-medium text-[11px]">Posting Period</span>
                 <div onClick={() => setShowDetail(false)} className="w-4 h-4 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors cursor-pointer group">
                    <X className="w-3 h-3 text-gray-600 group-hover:text-white" />
                 </div>
              </div>

              {/* Detail Content */}
              <div className="p-3 space-y-3 bg-white mx-1 mt-1 border border-gray-300 shadow-inner">
                 <div className="space-y-1.5">
                    <div className="grid grid-cols-[120px_1fr] gap-x-2 items-center">
                       <span className={sapLabelStyle}>Period Code</span>
                       <input type="text" className={`${sapInputStyle} bg-[#fffbd0]`} defaultValue={selectedPeriod.code} />
                       
                       <span className={sapLabelStyle}>Period Name</span>
                       <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.name} />
                       
                       <span className={sapLabelStyle}>Sub-Periods</span>
                       <input type="text" className={sapInputStyle} defaultValue="Months" readOnly />
                       
                       <span className={sapLabelStyle}>No. of Periods</span>
                       <input type="text" className={sapInputStyle} defaultValue="12" readOnly />
                       
                       <span className={sapLabelStyle}>Period Indicator</span>
                       <select className={sapInputStyle}><option>Default</option></select>
                       
                       <span className={sapLabelStyle}>Category</span>
                       <input type="text" className={sapInputStyle} defaultValue="2016" />
                       
                       <span className={sapLabelStyle}>Period Status</span>
                       <select className={sapInputStyle}><option>Closing Period</option></select>
                    </div>
                 </div>

                 <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-800 underline decoration-gray-400 underline-offset-2">Dates</span>
                    <div className="pl-1 mt-1 space-y-1.5">
                       <div className="grid grid-cols-[116px_100px_40px_100px] gap-x-2 items-center">
                          <span className={sapLabelStyle}>Posting Date From</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.postFrom} />
                          <span className={sapLabelStyle}>To</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.postTo} />
                          
                          <span className={sapLabelStyle}>Due Date From</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.dueFrom} />
                          <span className={sapLabelStyle}>To</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.dueTo} />
                          
                          <span className={sapLabelStyle}>Document Date From</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.docFrom} />
                          <span className={sapLabelStyle}>To</span>
                          <input type="text" className={sapInputStyle} defaultValue={selectedPeriod.docTo} />
                       </div>
                    </div>
                 </div>

                 <div className="pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-[120px_100px] gap-x-2 gap-y-1 items-center">
                       <span className={sapLabelStyle}>Start of Fiscal Year</span>
                       <input type="text" className={sapInputStyle} defaultValue="01.07.15" />
                       <span className={sapLabelStyle}>Fiscal Year</span>
                       <input type="text" className={sapInputStyle} defaultValue="2016" />
                    </div>
                 </div>
              </div>

              {/* Detail Footer */}
              <div className="h-[36px] bg-[#ececec] flex items-center gap-2 px-3 border-t border-gray-300 shrink-0">
                 <button onClick={() => setShowDetail(false)} className={sapButtonStyle}>OK</button>
                 <button onClick={() => setShowDetail(false)} className={sapButtonStyle}>Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
