import { Toolbar } from './components/layout/Toolbar';
import { Sidebar } from './components/layout/Sidebar';
import { WorkspaceWindows } from './components/layout/workspace/WorkspaceWindows';
import { useWindowManager } from './hooks/useWindowManager';

function App() {
  const wm = useWindowManager();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f0f0f0] overflow-hidden text-[11px] font-sans select-none">
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

export default App;
