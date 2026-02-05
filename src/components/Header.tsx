import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Bell, Search, Menu, Settings, Moon, Sun, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLayout } from '../layouts/AdminLayout';
import { Button, Avatar, SearchInput, Badge, cn } from './ui/index';
import { adminApi, AdminNotification } from '../services/api';

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
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    // Load read notification IDs from localStorage
    try {
      const stored = localStorage.getItem('adminReadNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const data = await adminApi.getNotifications(20);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Keep existing notifications on error
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  // Save read notification IDs to localStorage
  useEffect(() => {
    localStorage.setItem('adminReadNotifications', JSON.stringify([...readNotificationIds]));
  }, [readNotificationIds]);

  // Mark notification as read locally
  const markAsRead = (notificationId: string) => {
    setReadNotificationIds(prev => new Set([...prev, notificationId]));
    adminApi.markNotificationRead(notificationId).catch(console.error);
  };

  // Mark all as read locally
  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(prev => new Set([...prev, ...allIds]));
    adminApi.markAllNotificationsRead().catch(console.error);
  };

  // Check if notification is unread (considering local read state)
  const isUnread = (notification: AdminNotification) => {
    return notification.unread && !readNotificationIds.has(notification.id);
  };

  const unreadCount = notifications.filter(isUnread).length;

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
    '/profile': { title: 'Your Profile', description: 'Manage account settings' },
  };

  const currentPage = pageTitles[location.pathname] || { title: 'Page', description: '' };

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
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationsLoading && notifications.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const notifUnread = isUnread(notification);
                    return (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors',
                          notifUnread && 'bg-indigo-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {notifUnread && (
                            <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                          <div className={cn('flex-1 min-w-0', !notifUnread && 'ml-5')}>
                            <p className="text-sm font-medium text-slate-900 truncate">{notification.title}</p>
                            <p className="text-xs text-slate-500 truncate">{notification.description}</p>
                            <p className="text-xs text-slate-400 mt-1">{notification.time} ago</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-100">
                  <button 
                    onClick={() => { setShowNotifications(false); navigate('/activity'); }}
                    className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    View all activity
                  </button>
                </div>
              )}
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
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
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

