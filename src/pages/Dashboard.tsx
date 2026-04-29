import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Users, UserCheck, Calendar, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { API_URL } from '../config/api';

interface DashboardStats {
  totalUsers: { value: number; change: string };
  activeBookings: { value: number; change: string };
  pendingVerifications: { value: number; change: string };
  monthlyRevenue: { value: number; change: string };
  growthRate: { value: string; change: string };
}

interface Activity {
  type: string;
  user: string;
  action: string;
  time: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { 
      name: 'Total Users', 
      key: 'totalUsers',
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Active Bookings', 
      key: 'activeBookings',
      icon: Calendar, 
      color: 'bg-teal-500' 
    },
    { 
      name: 'Pending Verifications', 
      key: 'pendingVerifications',
      icon: UserCheck, 
      color: 'bg-orange-500' 
    },
    { 
      name: 'Monthly Revenue', 
      key: 'monthlyRevenue',
      icon: DollarSign, 
      color: 'bg-green-500',
      prefix: 'Rs. '
    },
    { 
      name: 'Growth Rate', 
      key: 'growthRate',
      icon: TrendingUp, 
      color: 'bg-purple-500',
      suffix: '%'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsConfig.map((statConfig) => {
          const Icon = statConfig.icon;
          const statData = stats?.[statConfig.key as keyof DashboardStats];
          const value = statData?.value ?? 0;
          const change = statData?.change ?? '0%';
          
          // Format the display value
          const displayValue = statConfig.prefix 
            ? `${statConfig.prefix}${typeof value === 'number' ? value.toLocaleString() : value}`
            : statConfig.suffix
            ? `${value}${statConfig.suffix}`
            : typeof value === 'number' 
            ? value.toLocaleString() 
            : value;

          return (
            <Card key={statConfig.name} hover={true} padding="lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{statConfig.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-3">{displayValue}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
                      change.startsWith('+') 
                        ? 'bg-green-100 text-green-700' 
                        : change.startsWith('-')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {change}
                    </span>
                    <span className="text-xs text-gray-500">from last month</span>
                  </div>
                </div>
                <div className={`${statConfig.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="Common tasks and shortcuts">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="group p-5 border-2 border-primary-200 rounded-xl hover:bg-gradient-to-br hover:from-[#1824b6] hover:to-[#14b8a6] hover:border-transparent transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary-100 group-hover:bg-white rounded-xl flex items-center justify-center mb-3 transition-colors">
              <UserCheck className="w-6 h-6 text-primary-600 group-hover:text-primary-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-white transition-colors">Approve Verifications</p>
            <p className="text-sm text-gray-500 group-hover:text-white/90 mt-2 transition-colors">
              Review {stats?.pendingVerifications.value || 0} pending nurses
            </p>
          </button>
          <button className="group p-5 border-2 border-green-200 rounded-xl hover:bg-gradient-to-br hover:from-[#1824b6] hover:to-[#14b8a6] hover:border-transparent transition-all duration-300 text-left hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-100 group-hover:bg-white rounded-xl flex items-center justify-center mb-3 transition-colors">
              <DollarSign className="w-6 h-6 text-green-600 group-hover:text-green-600" />
            </div>
            <p className="font-bold text-gray-900 group-hover:text-white transition-colors">Payout Requests</p>
            <p className="text-sm text-gray-500 group-hover:text-white/90 mt-2 transition-colors">5 pending payouts</p>
          </button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Latest actions on your platform">
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'verification' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'booking' ? 'bg-teal-100 text-teal-600' :
                  activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {activity.type === 'verification' && <UserCheck className="w-5 h-5" />}
                  {activity.type === 'booking' && <Calendar className="w-5 h-5" />}
                  {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                  {activity.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
