import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/api';

interface PaymentStats {
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  thisMonthRevenue: number;
}

interface Transaction {
  _id: string;
  transactionId: string;
  bookingId: string;
  patient: string;
  caregiver: string;
  serviceType: string;
  amount: number;
  paymentMethod: string;
  status: string;
  isCompleted: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function Payments() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'completed_confirmed': 'bg-green-100 text-green-700',
      'service_completed': 'bg-teal-100 text-teal-700',
      'service_started': 'bg-orange-100 text-orange-700',
      'on_the_way': 'bg-indigo-100 text-indigo-700',
      'arrived': 'bg-purple-100 text-purple-700',
      'confirmed': 'bg-cyan-100 text-cyan-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchPayments}
          className="mt-2 text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const statsConfig = [
    { name: 'Total Revenue', value: stats?.totalRevenue || 0, icon: DollarSign, color: 'bg-green-500' },
    { name: 'Pending Payouts', value: stats?.pendingPayouts || 0, icon: Clock, color: 'bg-yellow-500' },
    { name: 'Completed Payouts', value: stats?.completedPayouts || 0, icon: CheckCircle, color: 'bg-blue-500' },
    { name: 'This Month', value: stats?.thisMonthRevenue || 0, icon: TrendingUp, color: 'bg-teal-500' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
        <p className="text-gray-500 mt-1">Manage platform payments and payouts ({transactions.length} transactions)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} hover={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    Rs. {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Recent Transactions" subtitle="Latest payment activities">
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No transactions found</p>
              <p className="text-gray-400 text-sm mt-2">Transactions will appear here once bookings are created</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Caregiver</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-primary-600">{txn.transactionId}</td>
                    <td className="px-4 py-4 font-medium text-gray-600">{txn.bookingId}</td>
                    <td className="px-4 py-4 text-gray-900">{txn.patient}</td>
                    <td className="px-4 py-4 text-gray-900">{txn.caregiver}</td>
                    <td className="px-4 py-4 text-gray-600">{txn.serviceType}</td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-gray-600">{txn.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      Rs. {txn.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(txn.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(txn.status)}`}>
                        {formatStatus(txn.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
