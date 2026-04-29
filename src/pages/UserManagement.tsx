import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, Filter } from 'lucide-react';
import { API_URL } from '../config/api';

const tabs = ['All Users', 'Patients', 'Nurses', 'Caregivers', 'Caretakers'];

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  cnicNumber: string;
  userType: string;
  isApproved: boolean;
  isRejected: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('All Users');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [activeTab, users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by tab
    if (activeTab !== 'All Users') {
      const roleMap: { [key: string]: string } = {
        'Patients': 'patient',
        'Nurses': 'nurse',
        'Caregivers': 'caregiver',
        'Caretakers': 'caretaker'
      };
      filtered = filtered.filter(user => user.userType === roleMap[activeTab]);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const getStatusLabel = (user: User) => {
    if (user.isRejected) return { label: 'Rejected', color: 'bg-red-100 text-red-700' };
    if (!user.isApproved && user.userType !== 'patient') return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchUsers}
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all users across the platform ({users.length} total)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === tab
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try adjusting your search' : 'No users in this category yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">CNIC</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Registration</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = getStatusLabel(user);
                  return (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#1824b6] to-[#14b8a6] rounded-full flex items-center justify-center text-white font-semibold">
                            {user.fullName?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-medium text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{user.email}</td>
                      <td className="px-4 py-4 text-gray-600">{user.phone}</td>
                      <td className="px-4 py-4 text-gray-600">{user.cnicNumber || '—'}</td>
                      <td className="px-4 py-4">
                        <span className="capitalize text-gray-700 font-medium">{user.userType}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
