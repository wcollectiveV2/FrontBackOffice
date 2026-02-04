import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  ShoppingBag, 
  Calendar,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X
} from 'lucide-react';
import { useLayout } from '../layouts/AdminLayout';
import { cn } from './ui/index';

// ============================================
// SIDEBAR COMPONENT
// Collapsible sidebar with role-based navigation
// ============================================
export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen } = useLayout();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Get user from localStorage
  let user = null;
  try {
    const userJson = localStorage.getItem('adminUser');
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      user = JSON.parse(userJson);
    }
  } catch (e) {
    console.error('Error parsing adminUser:', e);
  }
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  
  const hasRole = (requiredRoles?: string[]) => {
    if (user?.email === 'admin@chrislo.com' || user?.email === 'team@habitpulse.com') return true;
    if (!requiredRoles) return true;
    if (userRoles.includes('admin')) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  };

  // Navigation structure with sections
  const navSections: { title: string; items: { title: string; icon: any; path: string; requiredRoles?: string[] }[] }[] = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
      ]
    },
    {
      title: 'Management',
      items: [
        { title: 'Organizations', icon: Building2, path: '/organizations', requiredRoles: ['admin', 'manager'] },
        { title: 'Users', icon: Users, path: '/users', requiredRoles: ['admin', 'manager', 'coach'] },
        { title: 'Protocols', icon: Activity, path: '/protocols', requiredRoles: ['admin', 'protocol_manager'] },
      ]
    },
    {
      title: 'Operations',
      items: [
        { title: 'Retreats', icon: Calendar, path: '/retreats', requiredRoles: ['admin', 'retreat_manager'] },
        { title: 'Shop', icon: ShoppingBag, path: '/shop', requiredRoles: ['admin', 'shop_manager'] },
      ]
    },
    {
      title: 'System',
      items: [
        { title: 'Settings', icon: Settings, path: '/settings', requiredRoles: ['admin'] },
      ]
    }
  ];

  // Filter items based on roles
  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasRole(item.requiredRoles))
    }))
    .filter(section => section.items.length > 0);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200',
          'transition-all duration-300 ease-in-out',
          // Desktop: show based on collapsed state
          'lg:translate-x-0',
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile: slide in/out
          isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
        )}
      >
        {/* Logo & Branding */}
        <div className={cn(
          'flex h-16 items-center border-b border-slate-100 px-4',
          isSidebarCollapsed ? 'lg:justify-center' : 'justify-between'
        )}>
          <Link to="/" className={cn('flex items-center gap-3', isSidebarCollapsed && 'lg:justify-center')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <span className="font-bold text-white text-lg">C</span>
            </div>
            <span className={cn(
              'text-lg font-semibold text-slate-900 transition-opacity duration-200',
              isSidebarCollapsed && 'lg:hidden'
            )}>
              ChrisLO
            </span>
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Title */}
              <div className={cn(
                'mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400',
                isSidebarCollapsed && 'lg:hidden'
              )}>
                {section.title}
              </div>
              
              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        title={isSidebarCollapsed ? item.title : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150',
                          active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                          isSidebarCollapsed && 'lg:justify-center lg:px-2'
                        )}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            'shrink-0 transition-colors',
                            active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                          )}
                        />
                        <span className={cn(
                          'text-sm font-medium truncate transition-opacity duration-200',
                          isSidebarCollapsed && 'lg:hidden'
                        )}>
                          {item.title}
                        </span>
                        {active && (
                          <div className={cn(
                            'ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600',
                            isSidebarCollapsed && 'lg:hidden'
                          )} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {/* Help Link */}
          <button className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors',
            isSidebarCollapsed && 'lg:justify-center lg:px-2'
          )}>
            <HelpCircle size={18} className="shrink-0" />
            <span className={cn('transition-opacity duration-200', isSidebarCollapsed && 'lg:hidden')}>
              Help & Support
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors',
              isSidebarCollapsed && 'lg:justify-center lg:px-2'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={cn('transition-opacity duration-200', isSidebarCollapsed && 'lg:hidden')}>
              Sign Out
            </span>
          </button>

          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex w-full items-center justify-center rounded-lg px-3 py-2 mt-2',
              'text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all'
            )}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};

