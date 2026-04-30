import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Square, ExternalLink, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  onFocus?: () => void;
}

interface UserGroup {
  id: number;
  name: string;
  description: string;
  groupType: string;
  activeFrom: string;
  activeTo: string;
}

interface BackendUser {
  id: number;
  name: string;
  email: string;
  dept?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const UserGroupsWindow: React.FC<UserGroupsWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState,
  onFocus
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<Omit<UserGroup, 'id'>>({
    name: '',
    description: '',
    groupType: 'Authorization',
    activeFrom: '',
    activeTo: ''
  });

  const [groups, setGroups] = useState<UserGroup[]>([
    { id: 1, name: 'Finance', description: 'Financial department users', groupType: 'Authorization', activeFrom: '', activeTo: '' },
    { id: 2, name: 'Sales', description: 'Sales team members', groupType: 'Authorization', activeFrom: '', activeTo: '' },
    { id: 3, name: 'Purchase', description: 'Procurement department', groupType: 'Authorization', activeFrom: '', activeTo: '' },
    { id: 4, name: 'Inventory', description: 'Warehouse and stock management', groupType: 'Authorization', activeFrom: '', activeTo: '' },
  ]);

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupTypeFilter, setGroupTypeFilter] = useState('Authorization');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cleanupListeners = useRef<(() => void) | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        setUsers(Array.isArray(list) ? list : []);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (show && token) fetchUsers();
  }, [show, token, fetchUsers]);

  useEffect(() => {
    return () => {
      if (cleanupListeners.current) cleanupListeners.current();
    };
  }, []);

  if (!show || windowState.isMinimized) return null;

  const handleGroupClick = (group: UserGroup) => {
    setSelectedGroupId(group.id);
    setFormData({
      name: group.name,
      description: group.description,
      groupType: group.groupType,
      activeFrom: group.activeFrom,
      activeTo: group.activeTo
    });
  };

  const handleCreateGroup = () => {
    if (!formData.name) return;
    const newGroup: UserGroup = {
      ...formData,
      id: Math.max(0, ...groups.map(g => g.id)) + 1
    };
    setGroups([...groups, newGroup]);
    setSelectedGroupId(newGroup.id);
  };

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
      cleanupListeners.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    cleanupListeners.current = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
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
      cleanupListeners.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    cleanupListeners.current = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  };

  const sapLabelStyle = "text-[11px] text-gray-700 whitespace-nowrap leading-[18px]";
  const sapInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white";
  const sapDisabledInputStyle = "w-full h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-[#e1e1e1] text-gray-600";
  const sapSelectStyle = "w-full h-[18px] border border-gray-400 px-0.5 text-[11px] outline-none focus:border-orange-400 bg-white appearance-none";
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal flex items-center justify-center gap-1";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";

  return (
    <div 
      onMouseDown={onFocus}
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
            <input 
              type="text" 
              className={sapInputStyle} 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Description</span>
            <input 
              type="text" 
              className={sapInputStyle} 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-[100px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Group Type</span>
            <input 
              type="text" 
              className={sapDisabledInputStyle} 
              value={formData.groupType}
              disabled
            />
          </div>
          <div className="grid grid-cols-[100px_1fr_20px_1fr] gap-x-2 items-center">
            <span className={sapLabelStyle}>Active From</span>
            <input 
              type="date" 
              className={sapInputStyle} 
              value={formData.activeFrom}
              onChange={(e) => setFormData({...formData, activeFrom: e.target.value})}
            />
            <span className={sapLabelStyle}>To</span>
            <input 
              type="date" 
              className={sapInputStyle} 
              value={formData.activeTo}
              onChange={(e) => setFormData({...formData, activeTo: e.target.value})}
            />
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
                {groups.map((group, i) => (
                   <div 
                    key={group.id} 
                    onClick={() => handleGroupClick(group)}
                    className={`flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center cursor-default group/row
                      ${selectedGroupId === group.id ? 'bg-[#ffed99]' : 'hover:bg-blue-50'}`}
                   >
                      <div className="w-10 px-1 text-center text-gray-500">{i + 1}</div>
                      <div className="flex-1 px-2 text-black truncate">{group.name}</div>
                   </div>
                ))}
                {Array(Math.max(0, 20 - groups.length)).fill(null).map((_, i) => (
                   <div key={`empty-g-${i}`} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center">
                      <div className="w-10 px-1 text-center opacity-0">{groups.length + i + 1}</div>
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
                <div className="flex-1 px-2 py-0.5 text-gray-700 font-medium flex items-center justify-between">
                   Status
                   <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-[repeating-linear-gradient(white,white_21px,#f5f5f5_21px,#f5f5f5_22px)]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500 italic">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading users...
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-500 italic">
                    {error}
                  </div>
                ) : (
                  <>
                    {users.map((user, i) => (
                      <div key={user.id} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center hover:bg-blue-50 cursor-default">
                          <div className="w-8 px-1 text-center text-gray-500">{i + 1}</div>
                          <div className="w-24 px-2 truncate text-gray-700">{user.id}</div>
                          <div className="w-32 px-2 truncate font-medium">{user.name}</div>
                          <div className="w-24 px-2 truncate text-gray-600">{user.dept || 'N/A'}</div>
                          <div className="flex-1 px-2 text-green-600 font-medium">Active</div>
                      </div>
                    ))}
                    {Array(Math.max(0, 15 - users.length)).fill(null).map((_, i) => (
                      <div key={`empty-u-${i}`} className="flex border-b border-gray-200 divide-x divide-gray-200 h-[22px] items-center">
                          <div className="w-8 px-1 text-center opacity-0">{users.length + i + 1}</div>
                          <div className="w-24 px-2"></div>
                          <div className="w-32 px-2"></div>
                          <div className="w-24 px-2"></div>
                          <div className="flex-1 px-2"></div>
                      </div>
                    ))}
                  </>
                )}
             </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center mt-auto pt-2">
           <div className="flex gap-1.5">
              <button onClick={onClose} className={sapActionButtonStyle}>OK</button>
              <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
           </div>
           <div className="flex gap-1.5">
            <button onClick={fetchUsers} className={sapButtonStyle} title="Refresh User List">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleCreateGroup} 
              className={sapButtonStyle}
              disabled={!formData.name}
            >
              <Plus className="w-3.5 h-3.5" />
              Create Group
            </button>
           </div>
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

