import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Get user from localStorage to check roles
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
      // Fallback: Always allow admin users by email
      if (user?.email === 'admin@chrislo.com' || user?.email === 'team@habitpulse.com') return true;

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
    <div className="fixed left-0 top-0 h-screen w-[250px] flex flex-col bg-[#1E293B] text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">ChrisLO Admin</h1>
      </div>

      <nav className="flex-1 py-5">
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 border-l-4 ${
                    active 
                      ? 'text-white bg-slate-700 font-semibold border-primary' 
                      : 'text-slate-400 font-normal border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full bg-transparent border-none text-red-500 cursor-pointer text-sm hover:text-red-400"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
