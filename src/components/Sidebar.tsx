import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Shield,
  BarChart3,
  Settings,
  Wallet,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Verification Center', href: '/verification', icon: UserCheck },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare },
  { name: 'Complaint Management', href: '/safety', icon: Shield },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-[#1824b6] via-[#2563eb] to-[#14b8a6] text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1.5">
            <img src="/nursify-logo.jpg" alt="Nursify Logo" className="w-full h-full object-cover rounded-md" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Nursify</h1>
            <p className="text-xs text-blue-100">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              style={isActive ? { color: '#1824b6' } : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white shadow-lg font-semibold'
                  : 'text-white hover:bg-white/15 hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <p className="text-xs text-white/90 font-medium">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/80">All systems operational</span>
          </div>
        </div>
        <p className="text-xs text-white/60 text-center">
          © 2025 Nursify. All rights reserved.
        </p>
      </div>
    </div>
  );
}
