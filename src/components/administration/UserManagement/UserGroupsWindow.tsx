import React, { useState } from 'react';
import { X, Minus, Square, ExternalLink } from 'lucide-react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface UserGroupsWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

export const UserGroupsWindow: React.FC<UserGroupsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupType: 'Authorization',
    activeFrom: '',
    activeTo: ''
  });

  const [groupTypeFilter, setGroupTypeFilter] = useState('Authorization');

  const groupData = [
    { id: 1, name: 'Finance' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Purchase' },
    { id: 4, name: 'Inventory' },
  ];

  const userData = Array(15).fill(null).map((_, i) => ({
    id: i + 1,
    code: '',
    name: '',
    dept: '',
    from: '',
    to: ''
  }));

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

        const minW = 600;
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

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapDisabledInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-[#e1e1e1] text-gray-600";
  const sapSelectStyle = "w-full h-[18px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white appearance-none";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

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
      {/* Title Bar */}
      <div 
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-black font-medium text-[11.5px] tracking-tight">User Groups</span>
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

      {/* Ribbon */}
      <div className="h-2 bg-[#f39c12] border-b border-gray-400 shrink-0"></div>

      {/* Main Container */}
      <div className="flex-1 p-3 flex flex-col gap-4 overflow-hidden">
        
        {/* Top Header Box */}
        <div className="p-3 border border-gray-400 bg-[#f5f5f5]/50 flex flex-col gap-1.5 max-w-md shadow-sm">
          <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Name</span>
            <input type="text" className={sapDisabledInputStyle} />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Description</span>
            <input type="text" className={sapDisabledInputStyle} />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Group Type</span>
            <input type="text" className={sapDisabledInputStyle} />
          </div>
          <div className="grid grid-cols-[100px_1fr_20px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Active From</span>
            <input type="text" className={sapDisabledInputStyle} />
            <span className={sapLabelStyle}>To</span>
            <input type="text" className={sapDisabledInputStyle} />
          </div>
        </div>

        {/* Mid Filter Bar */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className={sapLabelStyle}>Group Type</span>
              <div className="relative w-[150px]">
                 <select 
                    className={sapSelectStyle}
                    value={groupTypeFilter}
                    onChange={(e) => setGroupTypeFilter(e.target.value)}
                 >
                    <option value="Authorization">Authorization</option>
                    <option value="Alert">Alert</option>
                    <option value="Workflow">Workflow</option>
                 </select>
                 <div className="absolute right-0 top-0 bottom-0 px-1 flex items-center pointer-events-none bg-gradient-to-b from-white to-gray-200 border-l border-gray-400">
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-700"></div>
                 </div>
              </div>
           </div>
           <span className={`${sapLabelStyle} font-bold ml-12`}>Users</span>
        </div>

        {/* Tables Section */}
        <div className="flex-1 flex gap-4 min-h-0">
          
          {/* Left Table: Group Name */}
          <div className="w-[220px] flex flex-col border border-gray-400 bg-white overflow-hidden shadow-inner">
             <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400">
                <div className="w-10 px-1 py-0.5 text-center text-gray-600 font-medium">#</div>
                <div className="flex-1 px-2 py-0.5 text-gray-700 font-medium flex items-center justify-between">
                   Group Name
                   <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_21px,#f5f5f5_21px,#f5f5f5_22px)]">
                {groupData.map((group, i) => (
                   <div key={group.id} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center hover:bg-blue-50 cursor-default group/row">
                      <div className="w-10 px-1 text-center text-gray-500">{i + 1}</div>
                      <div className="flex-1 px-2 text-black">{group.name}</div>
                   </div>
                ))}
                {Array(20).fill(null).map((_, i) => (
                   <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center">
                      <div className="w-10 px-1 text-center opacity-0">{i + 5}</div>
                      <div className="flex-1 px-2"></div>
                   </div>
                ))}
             </div>
          </div>

          {/* Right Table: Users */}
          <div className="flex-1 flex flex-col border border-gray-400 bg-white overflow-hidden shadow-inner">
             <div className="flex bg-[#e4e4e4] border-b border-gray-400 divide-x divide-gray-400 text-[10.5px]">
                <div className="w-8 px-1 py-0.5 text-center text-gray-600 font-medium">#</div>
                <div className="w-24 px-2 py-0.5 text-gray-700 font-medium">User Code</div>
                <div className="w-32 px-2 py-0.5 text-gray-700 font-medium">User Name</div>
                <div className="w-24 px-2 py-0.5 text-gray-700 font-medium">Department</div>
                <div className="w-20 px-2 py-0.5 text-gray-700 font-medium">From</div>
                <div className="flex-1 px-2 py-0.5 text-gray-700 font-medium flex items-center justify-between">
                   To
                   <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_21px,#f5f5f5_21px,#f5f5f5_22px)]">
                {userData.map((user, i) => (
                   <div key={i} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center hover:bg-blue-50 cursor-default">
                      <div className="w-8 px-1 text-center text-gray-500">{i + 1}</div>
                      <div className="w-24 px-2"></div>
                      <div className="w-32 px-2"></div>
                      <div className="w-24 px-2"></div>
                      <div className="w-20 px-2"></div>
                      <div className="flex-1 px-2"></div>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center mt-auto pt-2">
           <div className="flex gap-1.5">
              <button onClick={onClose} className={sapActionButtonStyle}>OK</button>
              <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
           </div>
           <button className={sapButtonStyle}>Create Group</button>
        </div>

      </div>

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
    </div>
  );
};
