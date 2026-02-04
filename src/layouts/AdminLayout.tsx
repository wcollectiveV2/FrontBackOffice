import { useEffect, useState, createContext, useContext } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Outlet, useNavigate } from 'react-router-dom';

// ============================================
// LAYOUT CONTEXT FOR SIDEBAR STATE
// ============================================
interface LayoutContextValue {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within AdminLayout');
  }
  return context;
};

// ============================================
// ADMIN LAYOUT COMPONENT
// ============================================
export const AdminLayout = () => {
  const navigate = useNavigate();
  
  // Sidebar state management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Persist preference in localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [navigate]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const contextValue: LayoutContextValue = {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div
          className={`
            flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}
          `}
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

