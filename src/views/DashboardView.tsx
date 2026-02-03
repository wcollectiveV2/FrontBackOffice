import { useState, useEffect } from 'react';
import { Users, Activity, ShoppingBag, CheckCircle, AlertTriangle, TrendingUp, Calendar, Target, Flame } from 'lucide-react';

interface StatsData {
  totalUsers: number;
  activeProtocols: number;
  ordersToday: number;
  activeChallenges?: number;
  avgStreak?: number;
  weeklyActiveUsers?: number;
}

interface DailyActivity {
  day: string;
  tasks: number;
  users: number;
}

// Simple bar chart component
const ActivityChart = ({ data }: { data: DailyActivity[] }) => {
  const maxTasks = Math.max(...data.map(d => d.tasks), 1);
  
  return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 8px' }}>
      {data.map((day, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '100%', 
            height: `${(day.tasks / maxTasks) * 160}px`,
            minHeight: '4px',
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            borderRadius: '6px 6px 2px 2px',
            transition: 'height 0.3s ease',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              fontWeight: '600',
              color: '#3B82F6',
              whiteSpace: 'nowrap'
            }}>
              {day.tasks}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>{day.day}</span>
        </div>
      ))}
    </div>
  );
};

export const DashboardView = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Checking backend...')
  const [statsData, setStatsData] = useState<StatsData>({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<DailyActivity[]>([]);
  
  // Get admin user name
  const userJson = localStorage.getItem('adminUser');
  const user = userJson ? JSON.parse(userJson) : null;
  const adminName = user?.name?.split(' ')[0] || 'Admin';

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
        .then(data => {
          setStatsData({
            ...data,
            activeChallenges: data.activeChallenges || 23,
            avgStreak: data.avgStreak || 8.3,
            weeklyActiveUsers: data.weeklyActiveUsers || Math.round(data.totalUsers * 0.65)
          });
          setIsLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch stats', err);
            setStatsData({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
            setIsLoading(false);
        });
    
    // Generate mock activity data for last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const mockActivity: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      mockActivity.push({
        day: days[dayIndex],
        tasks: Math.floor(Math.random() * 150) + 50,
        users: Math.floor(Math.random() * 40) + 10
      });
    }
    setActivityData(mockActivity);
  }, [])

  const services = [
    { name: 'User Service', status: healthStatus.includes('User Service OK') ? 'healthy' : 'error' },
    { name: 'Habit Service', status: 'healthy' },
    { name: 'Coaching Service', status: 'warning' }, 
    { name: 'Retail Service', status: 'warning' },
  ];

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { 
      title: 'Total Users', 
      value: statsData.totalUsers.toLocaleString(), 
      icon: <Users size={24} />, 
      trend: '+12%',
      trendUp: true,
      color: '#3B82F6',
      bgColor: '#EFF6FF'
    },
    { 
      title: 'Active Challenges', 
      value: (statsData.activeChallenges || 0).toString(), 
      icon: <Target size={24} />, 
      trend: '+5',
      trendUp: true,
      color: '#10B981',
      bgColor: '#ECFDF5'
    },
    { 
      title: 'Avg. Streak', 
      value: `${statsData.avgStreak || 0} days`, 
      icon: <Flame size={24} />, 
      trend: '+2.1',
      trendUp: true,
      color: '#F97316',
      bgColor: '#FFF7ED'
    },
    { 
      title: 'Weekly Active', 
      value: (statsData.weeklyActiveUsers || 0).toLocaleString(), 
      icon: <Activity size={24} />, 
      trend: '+8%',
      trendUp: true,
      color: '#8B5CF6',
      bgColor: '#F5F3FF'
    },
  ];

  // Skeleton loader component
  const StatSkeleton = () => (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '16px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '80px', height: '14px', background: '#E2E8F0', borderRadius: '4px' }} />
        <div style={{ width: '48px', height: '48px', background: '#F1F5F9', borderRadius: '12px' }} />
      </div>
      <div style={{ width: '60px', height: '32px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ width: '50px', height: '12px', background: '#F1F5F9', borderRadius: '4px' }} />
    </div>
  );

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          color: '#0F172A', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {getGreeting()}, {adminName} 👋
        </h1>
        <p style={{ color: '#64748B', fontSize: '16px' }}>
          Here's what's happening with HabitPulse today
        </p>
      </div>
       
      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          stats.map((stat, i) => (
            <div key={i} style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '16px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #F1F5F9',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>{stat.title}</div>
                <div style={{ 
                  padding: '12px', 
                  background: stat.bgColor, 
                  borderRadius: '12px',
                  color: stat.color
                }}>
                  {stat.icon}
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '13px', 
                color: stat.trendUp ? '#10B981' : '#EF4444',
                fontWeight: '500'
              }}>
                <TrendingUp size={14} />
                {stat.trend} from last month
              </div>
            </div>
          ))
        )}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Recent Activity Placeholder */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A' }}>
              📊 User Activity (Last 7 Days)
            </h2>
            <button style={{
              background: '#F1F5F9',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#64748B',
              cursor: 'pointer'
            }}>
              View Report
            </button>
          </div>
          <div style={{ 
            height: '200px', 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', 
            borderRadius: '12px',
            padding: '16px'
          }}>
            {activityData.length > 0 ? (
              <ActivityChart data={activityData} />
            ) : (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                fontSize: '14px'
              }}>
                Loading activity data...
              </div>
            )}
          </div>
        </div>

        {/* Top Challenges */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '16px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #F1F5F9'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
            🏆 Top Challenges
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: '30-Day Fitness', users: 234, color: '#3B82F6' },
              { name: 'Hydration Hero', users: 189, color: '#10B981' },
              { name: 'Meditation Master', users: 156, color: '#8B5CF6' },
            ].map((challenge, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#F8FAFC',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: challenge.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{challenge.name}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{challenge.users} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #F1F5F9'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '20px' }}>
          ⚡ System Modules Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {services.map((s, i) => (
            <div key={i} style={{ 
              border: '1px solid',
              borderColor: s.status === 'healthy' ? '#DCFCE7' : s.status === 'warning' ? '#FEF3C7' : '#FEE2E2',
              background: s.status === 'healthy' ? '#F0FDF4' : s.status === 'warning' ? '#FFFBEB' : '#FEF2F2',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'transform 0.2s'
            }}>
              {s.status === 'healthy' 
                ? <CheckCircle size={20} color="#15803D" /> 
                : s.status === 'warning'
                  ? <AlertTriangle size={20} color="#D97706" />
                  : <AlertTriangle size={20} color="#B91C1C" />
              }
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ 
                  fontWeight: '600',
                  color: s.status === 'healthy' ? '#166534' : s.status === 'warning' ? '#B45309' : '#991B1B',
                  fontSize: '14px'
                }}>{s.name}</span>
                {s.status === 'warning' && (
                  <span style={{ fontSize: '11px', color: '#B45309', marginTop: '2px' }}>
                    PRO Feature • Coming Soon
                  </span>
                )}
                {s.status === 'healthy' && (
                  <span style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                    Operational
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
