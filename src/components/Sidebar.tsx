import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  ShoppingBag, 
  Calendar,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Get user from localStorage to check roles
  const userJson = localStorage.getItem('adminUser');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRoles = user?.roles || [];
  
  const hasRole = (requiredRoles?: string[]) => {
      if (!requiredRoles) return true;
      if (userRoles.includes('admin')) return true; // Super admin accesses everything
      return requiredRoles.some(role => userRoles.includes(role));
  };

  const allMenuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Organizations', icon: <Users size={20} />, path: '/organizations', requiredRoles: ['admin', 'manager'] },
    { title: 'Users', icon: <Users size={20} />, path: '/users', requiredRoles: ['admin', 'manager', 'coach'] },
    { title: 'Protocols', icon: <Activity size={20} />, path: '/protocols', requiredRoles: ['admin', 'protocol_manager'] },
    { title: 'Retreats', icon: <Calendar size={20} />, path: '/retreats', requiredRoles: ['admin', 'retreat_manager'] },
    { title: 'Shop', icon: <ShoppingBag size={20} />, path: '/shop', requiredRoles: ['admin', 'shop_manager'] },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings', requiredRoles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => hasRole(item.requiredRoles));

  return (
    <div className="sidebar" style={{
      width: '250px',
      height: '100vh',
      backgroundColor: '#1E293B',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>ChrisLO Admin</h1>
      </div>

      <nav style={{ flex: 1, padding: '20px 0' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive(item.path) ? '#ffffff' : '#94A3B8',
                  backgroundColor: isActive(item.path) ? '#334155' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontWeight: isActive(item.path) ? '600' : '400',
                  borderLeft: isActive(item.path) ? '4px solid #3B82F6' : '4px solid transparent'
                }}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'none',
          border: 'none',
          color: '#ef4444',
          cursor: 'pointer',
          width: '100%',
          padding: '12px 0',
          fontSize: '14px'
        }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
