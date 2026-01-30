import { useState, useEffect } from 'react';
import { Users, Activity, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';

export const DashboardView = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...')
  const [statsData, setStatsData] = useState({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
  
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Health Check
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealthStatus(data.status === 'healthy' ? 'User Service OK' : 'Issues Detected'))
      .catch(() => setHealthStatus('Not Connected'));

    // Stats Check
    fetch(`${API_URL}/api/admin/stats`)
        .then(res => res.json())
        .then(setStatsData)
        .catch(err => {
            console.error('Failed to fetch stats', err);
            // Default blank data
            setStatsData({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
        });
  }, [])

  const services = [
    { name: 'User Service', status: healthStatus.includes('User Service OK') ? 'healthy' : 'error' },
    { name: 'Habit Service', status: 'healthy' },
    { name: 'Coaching Service', status: 'warning' }, 
    { name: 'Retail Service', status: 'warning' },
  ];

  const stats = [
    { title: 'Total Users', value: statsData.totalUsers.toString(), icon: <Users size={24} color="#3B82F6"/>, trend: 'Live' },
    { title: 'Active Protocols', value: statsData.activeProtocols.toString(), icon: <Activity size={24} color="#10B981"/>, trend: 'Active' },
    { title: 'Orders Today', value: 'Coming Soon', icon: <ShoppingBag size={24} color="#F59E0B"/>, trend: '-' },
  ];

  return (
    <div>
       <h1 style={{ fontSize: '28px', marginBottom: '30px', color: '#1E293B' }}>Platform Overview</h1>
       
       {/* Stats Grid */}
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {stats.map((stat, i) => (
             <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                   <div style={{ color: '#64748B', fontSize: '14px' }}>{stat.title}</div>
                   <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '8px' }}>{stat.icon}</div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E293B' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: stat.trend.includes('+') ? '#10B981' : '#EF4444', marginTop: '5px' }}>
                  {stat.trend} from last month
                </div>
             </div>
          ))}
       </div>

       {/* System Health */}
       <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1E293B' }}>System Modules Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {services.map((s, i) => (
              <div key={i} style={{ 
                border: '1px solid',
                borderColor: s.status === 'healthy' ? '#DCFCE7' : s.status === 'warning' ? '#FEF3C7' : '#FEE2E2',
                background: s.status === 'healthy' ? '#F0FDF4' : s.status === 'warning' ? '#FFFBEB' : '#FEF2F2',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {s.status === 'healthy' 
                  ? <CheckCircle size={20} color="#15803D" /> 
                  : s.status === 'warning'
                    ? <Activity size={20} color="#D97706" />
                    : <AlertTriangle size={20} color="#B91C1C" />
                }
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ 
                    fontWeight: '600',
                    color: s.status === 'healthy' ? '#166534' : s.status === 'warning' ? '#B45309' : '#991B1B' 
                    }}>{s.name}</span>
                    {s.status === 'warning' && <span style={{ fontSize: '10px', color: '#B45309' }}>PRO (Coming Soon)</span>}
                </div>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
};
