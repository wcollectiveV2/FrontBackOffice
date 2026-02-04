import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Bell, Search, Menu, Settings, Moon, Sun, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLayout } from '../layouts/AdminLayout';
import { Button, Avatar, SearchInput, Badge, cn } from './ui/index';

// ============================================
// HEADER COMPONENT
// Top navigation bar with search, notifications, and user menu
// ============================================
export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMobileSidebarOpen } = useLayout();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get user info
  let user = null;
  try {
    const userJson = localStorage.getItem('adminUser');
    if (userJson) user = JSON.parse(userJson);
  } catch (e) { console.error(e); }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Page title mapping
  const pageTitles: Record<string, { title: string; description?: string }> = {
    '/': { title: 'Dashboard', description: 'Overview of your platform' },
    '/organizations': { title: 'Organizations', description: 'Manage partner organizations' },
    '/users': { title: 'Users', description: 'Manage users and permissions' },
    '/protocols': { title: 'Protocols', description: 'Manage health protocols' },
    '/retreats': { title: 'Retreats', description: 'Manage retreat events' },
    '/shop': { title: 'Shop', description: 'Manage shop products' },
    '/settings': { title: 'Settings', description: 'Platform configuration' },
  };

  const currentPage = pageTitles[location.pathname] || { title: 'Page', description: '' };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New user registered', description: 'John Doe joined 5 minutes ago', time: '5m', unread: true },
    { id: 2, title: 'Protocol completed', description: '15 users completed "Morning Routine"', time: '1h', unread: true },
    { id: 3, title: 'System update', description: 'New features available', time: '2h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Page Title - Hidden on mobile */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-slate-900">{currentPage.title}</h1>
          {currentPage.description && (
            <p className="text-xs text-slate-500">{currentPage.description}</p>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="w-full relative">
          <SearchInput
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Search size={20} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors',
                      notification.unread && 'bg-indigo-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {notification.unread && (
                        <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                      <div className={cn('flex-1 min-w-0', !notification.unread && 'ml-5')}>
                        <p className="text-sm font-medium text-slate-900 truncate">{notification.title}</p>
                        <p className="text-xs text-slate-500 truncate">{notification.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{notification.time} ago</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-slate-200 mx-1" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.roles?.[0] || 'User'}</p>
            </div>
            <Avatar name={user?.name || 'Admin'} size="sm" />
            <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>
                <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

