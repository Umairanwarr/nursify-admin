import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { API_URL } from '../config/api';

const COLORS = ['#1824b6', '#14b8a6', '#f59e0b', '#8b5cf6'];

interface Booking {
  _id: string;
  serviceType?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  _id: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MONTHS_TO_SHOW = 6;

function getLastSixMonthLabels() {
  const labels: string[] = [];
  const now = new Date();

  for (let i = MONTHS_TO_SHOW - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(date.toLocaleString('en-US', { month: 'short' }));
  }

  return labels;
}

function getMonthLabel(dateInput?: string) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-US', { month: 'short' });
}

export default function Analytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');

      const [bookingsRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_URL}/admin/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!bookingsRes.ok || !paymentsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [bookingsJson, paymentsJson] = await Promise.all([
        bookingsRes.json(),
        paymentsRes.json(),
      ]);

      setBookings(bookingsJson?.bookings || []);
      setTransactions(paymentsJson?.transactions || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bookingData = useMemo(() => {
    const monthLabels = getLastSixMonthLabels();
    const counts = monthLabels.reduce<Record<string, number>>((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    bookings.forEach((booking) => {
      const month = getMonthLabel(booking.createdAt || booking.updatedAt);
      if (month && month in counts) {
        counts[month] += 1;
      }
    });

    return monthLabels.map((month) => ({ month, bookings: counts[month] }));
  }, [bookings]);

  const revenueData = useMemo(() => {
    const monthLabels = getLastSixMonthLabels();
    const totals = monthLabels.reduce<Record<string, number>>((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    transactions.forEach((txn) => {
      if (txn.status !== 'completed_confirmed') return;
      const month = getMonthLabel(txn.updatedAt || txn.createdAt);
      if (month && month in totals) {
        totals[month] += txn.amount || 0;
      }
    });

    return monthLabels.map((month) => ({ month, revenue: totals[month] }));
  }, [transactions]);

  const serviceData = useMemo(() => {
    const distribution: Record<string, number> = {};

    bookings.forEach((booking) => {
      const service = booking.serviceType?.trim() || 'Other';
      distribution[service] = (distribution[service] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchAnalyticsData} className="mt-2 text-red-700 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Platform performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Chart */}
        <Card title="Bookings Over Time" subtitle="Monthly booking trends">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#1824b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Revenue Chart */}
        <Card title="Revenue Growth" subtitle="Monthly revenue trends">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Service Distribution */}
        <Card title="Service Distribution" subtitle="Bookings by service type">
          {serviceData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No service data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Export Options */}
        <Card title="Export Reports" subtitle="Download data in various formats">
          <div className="space-y-4">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-[#1824b6] to-[#14b8a6] text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
              Download Monthly Report (PDF)
            </button>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
              Export Data (CSV)
            </button>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5">
              Generate Custom Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
