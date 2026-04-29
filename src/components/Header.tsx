
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Welcome section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1824b6] to-[#3caea8] bg-clip-text text-transparent">
            Welcome Back, Admin
          </h2>
          <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">Admin User</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-gradient-to-br from-[#1824b6] to-[#14b8a6] rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all hover:scale-105">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Logout */}
          <button
            className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
