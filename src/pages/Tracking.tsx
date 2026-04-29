import Card from '../components/Card';
import { MapPin, Navigation, Clock } from 'lucide-react';

const activeBookings = [
  { id: 'BK-001', nurse: 'Sarah Johnson', patient: 'John Doe', location: { lat: 40.7128, lng: -74.006 }, status: 'en-route', updatedAt: '2 min ago' },
  { id: 'BK-002', nurse: 'Michael Brown', patient: 'Emily Chen', location: { lat: 40.758, lng: -73.9855 }, status: 'in-progress', updatedAt: '5 min ago' },
];

const statusClasses: Record<string, string> = {
  'en-route': 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-green-100 text-green-700',
};

export default function Tracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tracking</h1>
        <p className="text-gray-500 mt-1">Live caregiver movement and booking locations</p>
      </div>

      <Card title="Live GPS Tracking" subtitle={`${activeBookings.length} active bookings`}>
        <div className="h-[440px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
          <div className="text-center px-6">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Map View</p>
            <p className="text-sm text-gray-500 mt-2">
              Plug your Google Maps or Mapbox component here to render real-time caregiver positions.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Active Booking Locations" subtitle="Latest movement updates">
        <div className="space-y-3">
          {activeBookings.map((booking) => (
            <div key={booking.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="font-semibold text-gray-900">{booking.nurse}</p>
                <p className="text-sm text-gray-600 mt-1">{booking.id} • Patient: {booking.patient}</p>
                <p className="text-sm text-gray-500 mt-1">Lat: {booking.location.lat}, Lng: {booking.location.lng}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                  {booking.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {booking.updatedAt}
                </span>
                <button className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  View Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}