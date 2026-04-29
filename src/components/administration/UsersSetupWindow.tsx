import React, { useState, useEffect } from 'react';
import { X, Minus, Square, RefreshCw, Save, Shield, User } from 'lucide-react';
import { useAuth, AuthUser } from '../../context/AuthContext';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface UsersSetupWindowProps {
  show: boolean;
  onClose: () => void;
  windowState: WindowState; 
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
}

// All available top-level modules that can be assigned
const ALL_MODULES = [
  'Administration',
  'Financials',
  'CRM',
  'Sales - A/R',
  'Business Partners',
  'Banking',
  'Inventory',
  'Resources',
  'Production',
  'MRP',
  'HR Payroll',
  'Service',
  'Human Resources',
  'Project Management',
  'Reports',
];

const API_BASE = 'http://localhost:3000/api/v1';

interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'user';
  modules: string[];
}

export const UsersSetupWindow: React.FC<UsersSetupWindowProps> = ({
  show,
  onClose,
  windowState,
  setWindowState
}) => {
  const { token, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('General');

  // Fetch users on mount
  useEffect(() => {
    if (show) fetchUsers();
  }, [show]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        setUsers(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user: BackendUser) => {
    setSelectedUserId(user.id);
    setSelectedModules([...(user.modules || [])]);
    setMessage('');
  };

  const toggleModule = (mod: string) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const selectAllModules = () => setSelectedModules([...ALL_MODULES]);
  const clearAllModules = () => setSelectedModules([]);

  const saveModules = async () => {
    if (!selectedUserId || !token) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/users/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modules: selectedModules }),
      });
      if (res.ok) {
        setMessage('✓ Modules updated successfully');
        fetchUsers();
      } else {
        setMessage('✗ Failed to update modules');
      }
    } catch {
      setMessage('✗ Network error');
    } finally {
      setSaving(false);
    }
  };

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
        const minH = 550;

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
  const sapButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner font-normal";
  const sapActionButtonStyle = "px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner";
  const sapCheckboxStyle = "w-3.5 h-3.5 mt-0.5 border-gray-400 border bg-white cursor-pointer accent-blue-600";

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const tabs = ['General', 'Module Access'];

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
          <span className="text-black font-medium text-[11.5px] tracking-tight">Users - Setup & Module Access</span>
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
      <div className="h-2 bg-[#f39c12] border-b border-gray-400"></div>

      {/* Main layout: User list on left, details on right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - User List */}
        <div className="w-[200px] bg-white border-r border-gray-400 flex flex-col shrink-0">
          <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] border-b border-gray-400">
            <span className="text-[11px] font-bold text-gray-700">Users</span>
            <button onClick={fetchUsers} className="p-0.5 hover:bg-black/5 rounded-sm" title="Refresh">
              <RefreshCw className={`w-3 h-3 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => selectUser(u)}
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-gray-200 transition-colors
                  ${selectedUserId === u.id ? 'bg-[#ffed99]' : 'hover:bg-[#f5f5f5]'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 
                  ${u.role === 'super_admin' ? 'bg-[#f39c12]' : 'bg-gray-400'}`}>
                  {u.role === 'super_admin' 
                    ? <Shield className="w-3 h-3 text-white" />
                    : <User className="w-3 h-3 text-white" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10.5px] font-medium text-gray-800 truncate">{u.name}</span>
                  <span className="text-[9.5px] text-gray-500 truncate">{u.email}</span>
                </div>
              </div>
            ))}
            {users.length === 0 && !loading && (
              <div className="p-3 text-[10px] text-gray-400 italic text-center">No users found</div>
            )}
          </div>
        </div>

        {/* Right panel - User Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* User header */}
              <div className="p-3 bg-white mx-1.5 mt-1.5 border border-gray-400 shadow-inner flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${selectedUser.role === 'super_admin' ? 'bg-[#f39c12]' : 'bg-gray-400'}`}>
                  {selectedUser.role === 'super_admin' 
                    ? <Shield className="w-5 h-5 text-white" />
                    : <User className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <div className="text-[12px] font-bold text-gray-800">{selectedUser.name}</div>
                  <div className="text-[10.5px] text-gray-500">{selectedUser.email}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-sm 
                      ${selectedUser.role === 'super_admin' ? 'bg-[#f39c12] text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {selectedUser.role === 'super_admin' ? 'SUPER ADMIN' : 'USER'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex px-1.5 pt-1.5 bg-[#ececec]">
                {tabs.map((tab) => (
                  <div 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border border-gray-300 relative transition-all -ml-[1px]
                      ${activeTab === tab 
                        ? 'bg-white border-gray-400 border-b-white z-10 shadow-sm' 
                        : 'bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] text-gray-600 hover:from-[#f5f5f5]'}`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex flex-col p-3 overflow-hidden bg-white mx-1.5 mb-1.5 border border-gray-400 shadow-inner overflow-y-auto custom-scrollbar">
                {activeTab === 'General' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-1.5 max-w-sm">
                      <span className={sapLabelStyle}>User ID</span>
                      <span className="text-[11px] text-gray-800 font-medium">{selectedUser.id}</span>
                      <span className={sapLabelStyle}>User Name</span>
                      <span className="text-[11px] text-gray-800 font-medium">{selectedUser.name}</span>
                      <span className={sapLabelStyle}>E-Mail</span>
                      <span className="text-[11px] text-gray-800 font-medium">{selectedUser.email}</span>
                      <span className={sapLabelStyle}>Role</span>
                      <span className="text-[11px] text-gray-800 font-medium">{selectedUser.role === 'super_admin' ? 'Super Admin' : 'Standard User'}</span>
                    </div>
                    {selectedUser.role === 'super_admin' && (
                      <div className="mt-3 px-3 py-2 bg-[#fff6d5] border border-[#f39c12]/40 text-[10.5px] text-gray-700">
                        <span className="font-bold">ℹ</span> Super Admin has full access to all modules. Module restrictions cannot be applied.
                      </div>
                    )}
                    {selectedUser.role === 'user' && (
                      <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 text-[10.5px] text-gray-700">
                        <span className="font-bold">ℹ</span> This user has access to <span className="font-bold">{selectedUser.modules?.length || 0}</span> module(s). 
                        Go to the "Module Access" tab to manage.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Module Access' && (
                  <div className="space-y-3">
                    {selectedUser.role === 'super_admin' ? (
                      <div className="px-3 py-3 bg-[#fff6d5] border border-[#f39c12]/40 text-[10.5px] text-gray-700">
                        <span className="font-bold">ℹ</span> Super Admin has unrestricted access to all modules. No configuration needed.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-800">Assign Modules</span>
                          <div className="flex gap-1">
                            <button onClick={selectAllModules} className={sapButtonStyle}>Select All</button>
                            <button onClick={clearAllModules} className={sapButtonStyle}>Clear All</button>
                          </div>
                        </div>

                        <div className="border border-gray-300 bg-white">
                          <div className="grid grid-cols-[auto_1fr] items-center px-2 py-1 bg-gradient-to-b from-[#f0f0f0] to-[#e4e4e4] border-b border-gray-300">
                            <span className="text-[10px] font-bold text-gray-600 w-8">✓</span>
                            <span className="text-[10px] font-bold text-gray-600">Module Name</span>
                          </div>
                          {ALL_MODULES.map((mod) => (
                            <div
                              key={mod}
                              onClick={() => toggleModule(mod)}
                              className={`grid grid-cols-[auto_1fr] items-center px-2 py-1 border-b border-gray-200 cursor-pointer transition-colors
                                ${selectedModules.includes(mod) ? 'bg-[#ffed99]/40' : 'hover:bg-gray-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedModules.includes(mod)}
                                onChange={() => toggleModule(mod)}
                                className={`${sapCheckboxStyle} w-8`}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-[11px] text-gray-800">{mod}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-gray-500 italic">
                          Selected: {selectedModules.length} of {ALL_MODULES.length} modules
                        </div>

                        {/* Save button */}
                        <div className="flex items-center gap-3 pt-2">
                          <button 
                            onClick={saveModules} 
                            disabled={saving}
                            className={`${sapActionButtonStyle} flex items-center gap-1.5 ${saving ? 'opacity-50' : ''}`}
                          >
                            <Save className="w-3 h-3" />
                            {saving ? 'Saving...' : 'Update'}
                          </button>
                          {message && (
                            <span className={`text-[10.5px] font-medium ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                              {message}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-[12px] italic">
              Select a user from the list to manage their settings
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-2 pt-0 flex justify-between bg-[#ececec]">
        <div className="flex gap-1.5">
           <button onClick={onClose} className={sapButtonStyle}>Close</button>
        </div>
        <div className="flex gap-1.5">
           <button onClick={fetchUsers} className={sapButtonStyle}>
             <RefreshCw className="w-3 h-3 inline mr-1" />Refresh
           </button>
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
