import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { API_URL } from '../config/api';

interface Booking {
  _id: string;
  bookingId: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  caregiver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
  };
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
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
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-blue-100 text-blue-700',
      'confirmed': 'bg-cyan-100 text-cyan-700',
      'on_the_way': 'bg-indigo-100 text-indigo-700',
      'arrived': 'bg-purple-100 text-purple-700',
      'service_started': 'bg-orange-100 text-orange-700',
      'service_completed': 'bg-teal-100 text-teal-700',
      'completed_confirmed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-2 text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-500 mt-1">View and manage all bookings ({bookings.length} total)</p>
      </div>

      {/* Status Filter */}
      <Card>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({bookings.length})
          </button>
          {['pending', 'confirmed', 'on_the_way', 'service_started', 'completed_confirmed', 'cancelled'].map(status => {
            const count = bookings.filter(b => b.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatStatus(status)} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm mt-2">
                {statusFilter === 'all' ? 'No bookings have been created yet' : `No bookings with status "${formatStatus(statusFilter)}"`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nurse/Caregiver</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-4 font-medium text-primary-600">{booking.bookingId}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-gray-900 font-medium">{booking.patient.name}</p>
                        <p className="text-xs text-gray-500">{booking.patient.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-gray-900 font-medium">{booking.caregiver.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{booking.caregiver.type}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{booking.serviceType}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <p className="text-sm">{formatDate(booking.date)}</p>
                          <p className="text-xs text-gray-500">{booking.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-1 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">{booking.location}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      Rs. {booking.amount.toLocaleString()}
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
