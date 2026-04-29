import { useEffect, useState } from 'react';
import Card from '../components/Card';
import { AlertTriangle, CheckCircle, AlertCircle, Ban, Clock } from 'lucide-react';
import { API_URL } from '../config/api';

interface ComplaintItem {
  _id: string;
  complaintType: string;
  description: string;
  userRole: string;
  bookingReference: string;
  status: 'open' | 'in-review' | 'resolved';
  adminAction: 'none' | 'warning' | 'suspend' | 'ban';
  priority: 'low' | 'medium' | 'high';
  reporter: { id: string; name: string };
  against: { id: string; name: string };
  createdAt: string;
}

interface ActionModal {
  open: boolean;
  complaintId: string;
  userId: string;
  userName: string;
  action: 'warn' | 'suspend' | 'ban' | null;
}


const ACTION_CONFIG = {
  warn:    { label: 'Warn',    color: 'bg-yellow-500 hover:bg-yellow-600', icon: AlertCircle, adminAction: 'warning'  as const },
  suspend: { label: 'Suspend', color: 'bg-orange-500 hover:bg-orange-600', icon: Clock,       adminAction: 'suspend'  as const },
  ban:     { label: 'Ban',     color: 'bg-red-600    hover:bg-red-700',    icon: Ban,          adminAction: 'ban'      as const },
};

export default function SafetyMonitoring() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [allComplaints, setAllComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ActionModal>({ open: false, complaintId: '', userId: '', userName: '', action: null });
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch complaints queue');
      const data = await response.json();
      if (data.success) {
        const all: ComplaintItem[] = data.complaints || [];
        setAllComplaints(all);
        setComplaints(all.filter((c: ComplaintItem) => c.status === 'open'));
      }
    } catch (err) {
      setError('Unable to load complaints queue right now.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (complaint: ComplaintItem, action: 'warn' | 'suspend' | 'ban') => {
    setNote('');
    setActionResult(null);
    setModal({ open: true, complaintId: complaint._id, userId: complaint.against.id, userName: complaint.against.name, action });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setModal({ open: false, complaintId: '', userId: '', userName: '', action: null });
    setNote('');
    setActionResult(null);
  };

  const executeAction = async () => {
    if (!modal.action || !modal.userId) return;
    setActionLoading(true);
    setActionResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/users/${modal.userId}/${modal.action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');

      const actionMap = { warn: 'warning', suspend: 'suspend', ban: 'ban' } as const;
      const patchRes = await fetch(`${API_URL}/admin/complaints/${modal.complaintId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', adminAction: actionMap[modal.action] })
      });
      if (!patchRes.ok) throw new Error('Failed to update complaint status');

      setComplaints(prev => prev.filter(c => c._id !== modal.complaintId));
      setActionLoading(false);
      setModal({ open: false, complaintId: '', userId: '', userName: '', action: null });
      setNote('');
    } catch (err: any) {
      setActionLoading(false);
      setActionResult({ type: 'error', message: err.message || 'Something went wrong.' });
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' at ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const addToQueue = (complaint: ComplaintItem) => {
    setComplaints(prev => {
      if (prev.some(c => c._id === complaint._id)) return prev;
      return [complaint, ...prev];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Safety Monitoring</h1>
        <p className="text-gray-500 mt-1">Handle complaints and flagged incidents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Complaints Queue" subtitle="Latest complaints requiring action">
            {loading ? (
              <p className="text-sm text-gray-500">Loading complaints...</p>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={fetchComplaints} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">Retry</button>
              </div>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-gray-500">No active complaints.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className={`p-4 rounded-xl border-2 ${
                      complaint.status === 'open' ? 'border-red-300 bg-red-50'
                      : complaint.status === 'resolved' ? 'border-green-300 bg-green-50'
                      : 'border-yellow-300 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          complaint.status === 'open' ? 'bg-red-500' : complaint.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{complaint.reporter.name} vs {complaint.against.name}</p>
                          <p className="text-sm text-gray-600 mt-1">Complaint Type: {complaint.complaintType}</p>
                          <p className="text-sm text-gray-600">User Role: {complaint.userRole}</p>
                          <p className="text-sm text-gray-600">Booking Ref: {complaint.bookingReference}</p>
                          <p className="text-sm text-gray-700 mt-2">Description: {complaint.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{getRelativeTime(complaint.createdAt)}</p>

                          {/* ── Admin Action Buttons / Applied Status ── */}
                          <div className="flex gap-2 mt-3 flex-wrap items-center">
                            {complaint.adminAction.toUpperCase() === 'NONE' ? (
                              (['warn', 'suspend', 'ban'] as const).map((action) => {
                                const cfg = ACTION_CONFIG[action];
                                const Icon = cfg.icon;
                                return (
                                  <button
                                    key={action}
                                    onClick={() => openModal(complaint, action)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors ${cfg.color}`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                  </button>
                                );
                              })
                            ) : (
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                complaint.adminAction === 'warning' ? 'bg-yellow-100 text-yellow-700'
                                : complaint.adminAction === 'suspend' ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                Action Applied: {complaint.adminAction === 'warning' ? 'Warning Issued' : complaint.adminAction === 'suspend' ? 'Suspended' : 'Banned'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.priority === 'high' ? 'bg-red-100 text-red-700'
                          : complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>{complaint.priority} priority</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === 'open' ? 'bg-red-100 text-red-700'
                          : complaint.status === 'resolved' ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>{complaint.status}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                          {complaint.adminAction}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Open Complaints</p>
                  <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status === 'open').length}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resolved Incidents</p>
                  <p className="text-2xl font-bold text-gray-900">{allComplaints.filter(c => c.status === 'resolved').length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card title="Flagged Incidents" subtitle="Automated and reported safety flags">
          <div className="space-y-4">
            {allComplaints.length === 0 ? (
              <p className="text-sm text-gray-500">No flagged incidents.</p>
            ) : allComplaints.map((complaint) => (
              <div key={complaint._id} className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{complaint.complaintType}</p>
                    <p className="text-sm text-gray-600 mt-1">Booking {complaint.bookingReference}</p>
                    <p className="text-xs text-gray-500 mt-2">Reported by {complaint.reporter.name}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(complaint.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    complaint.status === 'open' ? 'bg-red-100 text-red-700'
                    : complaint.status === 'resolved' ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>{complaint.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Incident Timeline" subtitle="Recent complaint and incident events">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reported By</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date and Time</th>
              </tr>
            </thead>
            <tbody>
              {allComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No complaint history available.</td>
                </tr>
              ) : allComplaints.map((complaint) => {
                const isOpen = complaint.status === 'open';
                const displayStatus = isOpen ? 'open' : 'resolved';
                return (
                  <tr
                    key={complaint._id}
                    onClick={isOpen ? () => addToQueue(complaint) : undefined}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${isOpen ? 'cursor-pointer' : ''}`}
                    title={isOpen ? 'Click to add back to the active queue' : undefined}
                  >
                    <td className="px-4 py-4 text-gray-900 font-medium">{complaint.bookingReference}</td>
                    <td className="px-4 py-4 text-gray-600">{complaint.complaintType}</td>
                    <td className="px-4 py-4 text-gray-600 capitalize">{complaint.userRole}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isOpen ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>{displayStatus}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{formatDateTime(complaint.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Action Confirmation Modal ── */}
      {modal.open && modal.action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              {modal.action === 'warn' && <AlertCircle className="w-6 h-6 text-yellow-500" />}
              {modal.action === 'suspend' && <Clock className="w-6 h-6 text-orange-500" />}
              {modal.action === 'ban' && <Ban className="w-6 h-6 text-red-600" />}
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {modal.action === 'warn' ? 'Issue Warning' : modal.action === 'suspend' ? 'Suspend for 3 Days' : 'Permanently Ban'} — {modal.userName}
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {modal.action === 'warn' && 'A warning notification will be sent to the user. No access restrictions will be applied.'}
              {modal.action === 'suspend' && 'The user will be able to login but all services will be blocked for 3 days.'}
              {modal.action === 'ban' && 'The user will be permanently blocked from logging into Nursify. This cannot be easily undone.'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Note / Reason (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Describe the reason for this action..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {actionResult && (
              <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                actionResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {actionResult.message}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {actionResult?.type === 'success' ? 'Close' : 'Cancel'}
              </button>
              {!actionResult?.type && (
                <button
                  onClick={executeAction}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 ${
                    modal.action === 'warn' ? 'bg-yellow-500 hover:bg-yellow-600'
                    : modal.action === 'suspend' ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? 'Applying...' : `Confirm ${modal.action === 'warn' ? 'Warning' : modal.action === 'suspend' ? 'Suspension' : 'Ban'}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
