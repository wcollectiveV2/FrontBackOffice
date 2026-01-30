import { useState, useEffect } from 'react';
import { Users, Activity, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';

export const DashboardView = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...')
  
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealthStatus(data.status === 'healthy' ? 'User Service OK' : 'Issues Detected'))
      .catch(() => setHealthStatus('Not Connected'))
  }, [])

  const services = [
    { name: 'User Service', status: healthStatus.includes('User Service OK') ? 'healthy' : 'error' },
    // { name: 'Coaching Service', status: 'healthy' }, // AI Service disabled
    { name: 'Habit Service', status: 'healthy' },
    { name: 'Retail Service', status: 'healthy' },
  ];

  const stats = [
    { title: 'Total Users', value: '128', icon: <Users size={24} color="#3B82F6"/>, trend: '+12%' },
    { title: 'Active Protocols', value: '42', icon: <Activity size={24} color="#10B981"/>, trend: '+5%' },
    { title: 'Orders Today', value: '18', icon: <ShoppingBag size={24} color="#F59E0B"/>, trend: '-2%' },
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
                borderColor: s.status === 'healthy' ? '#DCFCE7' : '#FEE2E2',
                background: s.status === 'healthy' ? '#F0FDF4' : '#FEF2F2',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {s.status === 'healthy' 
                  ? <CheckCircle size={20} color="#15803D" /> 
                  : <AlertTriangle size={20} color="#B91C1C" />
                }
                <span style={{ 
                  fontWeight: '600',
                  color: s.status === 'healthy' ? '#166534' : '#991B1B' 
                }}>{s.name}</span>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
};
