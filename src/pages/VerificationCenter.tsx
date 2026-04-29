import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, Filter, Eye, Check, X, Download, ZoomIn, Loader } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

interface PendingUser {
  _id: string;
  fullName: string;
  userType: 'nurse' | 'caretaker';
  email: string;
  phone?: string;
  cnicNumber?: string;
  specialty?: string;
  licenseNumber?: string;
  createdAt: string;
  isRejected?: boolean;
  rejectionReason?: string;
  cnicFront?: string;
  cnicBack?: string;
  licensePhoto?: string;
  experienceLetter?: string;
  experienceImage?: string;
}

export default function VerificationCenter() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Get auth token from localStorage (you'll need to implement login in admin portal)
  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      console.log('Fetching pending users with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        alert('You are not logged in. Please login first.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/admin/users/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Pending users response:', response.data);
      setPendingUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error fetching pending users:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to fetch pending users. Please ensure you are logged in as admin.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this user?')) return;

    setActionLoading(true);
    try {
      const token = getAuthToken();
      await axios.patch(
        `${API_URL}/admin/users/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('User approved successfully!');
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${API_URL}/admin/users/reject/${userId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('User rejected successfully!');
      console.log('Rejection response:', response.data);
      setSelectedUser(null);
      // Refetch to show updated rejection status
      await fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verification Center</h1>
        <p className="text-gray-500 mt-1">Review and approve nurse & caregiver registrations</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or CNIC..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </Card>

      {/* Pending List */}
      <Card title="Pending Verifications" subtitle={`${pendingUsers.length} users awaiting approval`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-gray-600">Loading pending users...</span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1824b6] to-[#14b8a6] rounded-full flex items-center justify-center text-white font-bold text-lg relative">
                  {user.fullName[0]}
                  {user.isRejected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                    {user.isRejected && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.email} • {user.phone || 'N/A'}</p>
                  {user.isRejected && user.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {user.rejectionReason}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 capitalize">{user.userType}</p>
                  <p className="text-xs text-gray-500">{user.specialty || 'N/A'}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedUser.userType} Verification</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CNIC Number</label>
                  <p className="text-gray-900 mt-1">{selectedUser.cnicNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialty</label>
                  <p className="text-gray-900 mt-1">{selectedUser.specialty || 'N/A'}</p>
                </div>
                {selectedUser.licenseNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-gray-900 mt-1">{selectedUser.licenseNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Documents</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* CNIC Front */}
                  {selectedUser.cnicFront && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">CNIC Front</label>
                      <div className="relative group">
                        <img
                          src={selectedUser.cnicFront}
                          alt="CNIC Front"
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"><p class="text-gray-500 text-sm">Failed to load image</p></div>';
                          }}
                        />
                        <button
                          onClick={() => setViewImage(selectedUser.cnicFront ?? null)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <ZoomIn className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CNIC Back */}
                  {selectedUser.cnicBack && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">CNIC Back</label>
                      <div className="relative group">
                        <img
                          src={selectedUser.cnicBack}
                          alt="CNIC Back"
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"><p class="text-gray-500 text-sm">Failed to load image</p></div>';
                          }}
                        />
                        <button
                          onClick={() => setViewImage(selectedUser.cnicBack ?? null)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <ZoomIn className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* License Photo (Nurse only) */}
                  {selectedUser.licensePhoto && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">License Photo</label>
                      <div className="relative group">
                        <img
                          src={selectedUser.licensePhoto}
                          alt="License"
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"><p class="text-gray-500 text-sm">Failed to load image</p></div>';
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewImage(selectedUser.licensePhoto!); }}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <ZoomIn className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Experience Letter/Image */}
                  {(selectedUser.experienceLetter || selectedUser.experienceImage) && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {selectedUser.userType === 'nurse' ? 'Experience Letter' : 'Experience Image'}
                      </label>
                      <div className="relative group">
                        <img
                          src={selectedUser.experienceLetter || selectedUser.experienceImage}
                          alt={selectedUser.userType === 'nurse' ? 'Experience Letter' : 'Experience Image'}
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"><p class="text-gray-500 text-sm">Failed to load image</p></div>';
                          }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewImage(selectedUser.experienceLetter || selectedUser.experienceImage || ''); }}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <ZoomIn className="w-8 h-8 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleReject(selectedUser._id)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedUser._id)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={viewImage} alt="Document" className="w-full h-auto rounded-lg" />
            <button className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-xl flex items-center gap-2 hover:bg-gray-100">
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
