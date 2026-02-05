import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Flame, 
  HeartPulse, 
  ArrowUpRight,
  MoreHorizontal,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Badge, 
  Skeleton, 
  Avatar,
  DropdownMenu,
  ProgressBar,
  cn 
} from '../components/ui/index';
import { adminApi, healthApi, ApiError } from '../services/api';

// ============================================
// TYPES
// ============================================
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

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency?: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}

// ============================================
// ACTIVITY CHART COMPONENT
// ============================================
const ActivityChart = ({ data }: { data: DailyActivity[] }) => {
  const maxTasks = Math.max(...data.map(d => d.tasks), 1);
  
  return (
    <div className="h-44 flex items-end gap-2">
      {data.map((day, i) => {
        const height = (day.tasks / maxTasks) * 100;
        const isToday = i === data.length - 1;
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex items-end justify-center h-36">
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {day.tasks} tasks
              </div>
              
              {/* Bar */}
              <div 
                className={cn(
                  'w-full max-w-8 rounded-t-md transition-all duration-300',
                  isToday 
                    ? 'bg-indigo-600 group-hover:bg-indigo-700' 
                    : 'bg-indigo-200 group-hover:bg-indigo-300'
                )}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
            <span className={cn(
              'text-xs font-medium',
              isToday ? 'text-indigo-600' : 'text-slate-400'
            )}>
              {day.day}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: JSX.Element;
  trend?: { value: string; isPositive: boolean };
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ title, value, icon, trend, iconBg, iconColor }: StatCardProps) => (
  <Card hoverable className="p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          )}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}
          </div>
        )}
      </div>
      <div className={cn('p-3 rounded-xl', iconBg, iconColor)}>
        {icon}
      </div>
    </div>
  </Card>
);

// ============================================
// STAT SKELETON
// ============================================
const StatSkeleton = () => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={28} />
        <Skeleton width={70} height={14} />
      </div>
      <Skeleton width={48} height={48} className="rounded-xl" />
    </div>
  </Card>
);

// ============================================
// DASHBOARD VIEW COMPONENT
// ============================================
export const DashboardView = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [statsData, setStatsData] = useState<StatsData>({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<DailyActivity[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentActivity[]>([]);
  const [topChallenges, setTopChallenges] = useState<any[]>([]);
  
  // Get admin user name
  let user = null;
  try {
    const userJson = localStorage.getItem('adminUser');
    if (userJson) user = JSON.parse(userJson);
  } catch (e) {
    console.error('Error parsing adminUser:', e);
  }
  const adminName = user?.name?.split(' ')[0] || 'Admin';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    // Health Check
    healthApi.check()
      .then(data => setHealthStatus(data.status === 'healthy' ? 'healthy' : 'warning'))
      .catch(() => setHealthStatus('error'));

    // Stats Check
    adminApi.getStats()
      .then(data => {
        setStatsData({
          totalUsers: data.totalUsers || 0,
          activeProtocols: data.totalOrganizations || 0,
          ordersToday: 0,
          activeChallenges: data.activeChallenges || 0,
          avgStreak: 0,
          weeklyActiveUsers: data.activeUsersLast7Days || 0
        });
        
        // Process Activity Data
        if (data.activityData) {
           const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
           const today = new Date();
           const populatedActivity: DailyActivity[] = [];
           
           for (let i = 6; i >= 0; i--) {
               const d = new Date(today);
               d.setDate(today.getDate() - i);
               const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
               
               // Find data for this day
               // API returns 'Dy' (e.g., 'Mon', 'Tue')
               // Note: local date might differ slightly from server time, but for last 7 days chart it's acceptable approximation
               // Better is to match by date string if API returned full date
               const dayData = data.activityData.find((a: any) => a.day === dayName);
               
               populatedActivity.push({
                   day: dayName,
                   tasks: dayData ? dayData.tasks : 0,
                   users: dayData ? dayData.users : 0
               });
           }
           setActivityData(populatedActivity);
        } else {
             setActivityData([]);
        }

        if (data.topChallenges) {
            setTopChallenges(data.topChallenges);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Stats error:', err);
        setStatsData({ totalUsers: 0, activeProtocols: 0, ordersToday: 0 });
        setActivityData([]);
        setIsLoading(false);
      });

    // Fetch Audit Logs (Recent Activity)
    adminApi.getAuditLogs(1, 10)
      .then(data => {
         const logs = Array.isArray(data) ? data : (data.logs || []);
         if (logs.length > 0) {
           setRecentLogs(logs.map((log: any) => ({
             id: log.id,
             user: log.user_name || log.admin_name || 'System',
             action: log.action,
             target: log.target_type ? `${log.target_type} ${log.target_id}` : (log.details || '-'),
             time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           })));
         } else {
             // Use empty array if no logs
             setRecentLogs([]);
         }
      })
      .catch(err => {
         console.warn('Audit logs fetch failed', err);
         setRecentLogs([]);
      });
  }, []);

  const services: ServiceStatus[] = [
    { name: 'API Gateway', status: healthStatus as 'healthy' | 'warning' | 'error', latency: '45ms' },
    { name: 'Database', status: 'healthy', latency: '12ms' },
    { name: 'Auth Service', status: 'healthy', latency: '23ms' },
    { name: 'Cache', status: 'warning', latency: '156ms' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats: StatCardProps[] = [
    { 
      title: 'Total Users', 
      value: (statsData.totalUsers || 0).toLocaleString(), 
      icon: <Users size={22} />, 
      trend: { value: '+12% vs last month', isPositive: true },
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    { 
      title: 'Active Challenges', 
      value: (statsData.activeChallenges || 0).toString(), 
      icon: <Target size={22} />, 
      trend: { value: '+5 this week', isPositive: true },
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    { 
      title: 'Avg. Streak', 
      value: `${statsData.avgStreak || 0} days`, 
      icon: <Flame size={22} />, 
      trend: { value: '+2.1 days', isPositive: true },
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50'
    },
    { 
      title: 'Weekly Active', 
      value: (statsData.weeklyActiveUsers || 0).toLocaleString(), 
      icon: <Activity size={22} />, 
      trend: { value: '+8% engagement', isPositive: true },
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {getGreeting()}, {adminName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your platform today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Calendar size={16} />}>
            Last 7 days
          </Button>
          <Button variant="primary" leftIcon={<ArrowUpRight size={16} />}>
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          stats.map((stat, i) => <StatCard key={i} {...stat} />)
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">User Activity</h3>
              <p className="text-sm text-slate-500">Tasks completed per day</p>
            </div>
            <DropdownMenu
              trigger={
                <button className="icon-btn icon-btn-sm">
                  <MoreHorizontal size={18} />
                </button>
              }
              items={[
                { label: 'Export data', onClick: () => {} },
                { label: 'View details', onClick: () => {} },
              ]}
            />
          </CardHeader>
          <CardBody>
            {activityData.length > 0 ? (
              <ActivityChart data={activityData} />
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-400">
                Loading chart...
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Challenges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Top Challenges</h3>
              <p className="text-sm text-slate-500">By participation</p>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              View all
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {topChallenges.map((challenge, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white',
                      challenge.color
                    )}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{challenge.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{challenge.users} users</span>
                </div>
                <ProgressBar value={challenge.progress} size="sm" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Completion Rate</h3>
            <p className="text-sm text-slate-500">Average protocol completion</p>
          </CardHeader>
          <CardBody>
             <div className="h-40 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed text-slate-400">
               Completion Rate Chart Visualization
             </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
             <h3 className="font-semibold text-slate-900">Points Distribution</h3>
             <p className="text-sm text-slate-500">User points breakdown</p>
          </CardHeader>
          <CardBody>
             <div className="h-40 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed text-slate-400">
               Points Distribution Chart Visualization
             </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-500">Latest user actions</p>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
              View all
            </Button>
          </CardHeader>
          <CardBody className="space-y-1 -mx-5 px-5">
            {recentLogs.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0"
              >
                <Avatar name={activity.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{activity.user}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <HeartPulse size={18} className="text-red-500" />
                System Health
              </h3>
              <p className="text-sm text-slate-500">Service status overview</p>
            </div>
            <Badge variant={healthStatus === 'healthy' ? 'success' : healthStatus === 'warning' ? 'warning' : 'error'} dot>
              {healthStatus === 'healthy' ? 'All Operational' : healthStatus === 'warning' ? 'Degraded' : 'Issues Detected'}
            </Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {services.map((service, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    service.status === 'healthy' && 'bg-emerald-500',
                    service.status === 'warning' && 'bg-amber-500',
                    service.status === 'error' && 'bg-red-500'
                  )} />
                  <span className="text-sm font-medium text-slate-700">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {service.latency && (
                    <span className="text-xs text-slate-400">{service.latency}</span>
                  )}
                  <Badge 
                    variant={service.status === 'healthy' ? 'success' : service.status === 'warning' ? 'warning' : 'error'}
                  >
                    {service.status === 'healthy' ? 'Operational' : service.status === 'warning' ? 'Degraded' : 'Down'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
