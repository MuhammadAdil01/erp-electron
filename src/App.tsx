import { Toolbar } from './components/layout/Toolbar';
import { Sidebar } from './components/layout/Sidebar';
import { WorkspaceWindows } from './components/layout/workspace/WorkspaceWindows';
import { useWindowManager } from './hooks/useWindowManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';

function MainApp() {
  const wm = useWindowManager();
  const { user, logout, isSuperAdmin } = useAuth();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f0f0f0] overflow-hidden text-[11px] font-sans select-none">
      {/* User Info Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gradient-to-b from-[#fff6d5] to-[#ffec99] border-b border-[#d4d0c8] text-[10.5px]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800">ERP System</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-700">
            Logged in as: <span className="font-bold">{user?.name}</span>
            {isSuperAdmin && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-[#f39c12] text-white text-[9px] font-bold rounded-sm">SUPER ADMIN</span>
            )}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-0.5 bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border border-gray-500 text-[10.5px] shadow-sm rounded-[1px] hover:brightness-95 active:shadow-inner font-medium"
        >
          Log Out
        </button>
      </div>

      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpen={wm.openWindow} />
        <div className="flex-1 relative bg-white overflow-hidden">
          <WorkspaceWindows wm={wm} />
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainApp /> : <LoginScreen />;
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
