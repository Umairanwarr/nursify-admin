import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, TrendingUp, Clock, ArrowDownCircle, Filter } from 'lucide-react';
import API_URL from '../config/api';

interface AdminWalletSummary {
  total_commission_collected: number;
  total_commission_pending: number;
  currency: string;
}

interface NurseWallet {
  nurseId: string;
  fullName: string;
  email: string;
  digital_balance: number;
  payable_commission: number;
  total_withdrawn: number;
}

interface Transaction {
  _id: string;
  type: string;
  method: string | null;
  direction: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  booking?: { serviceType: string; date: string; amount: number };
}

const TYPE_OPTIONS = ['', 'patient_payment', 'cash_record', 'withdraw', 'commission_payment', 'payment', 'withdrawal', 'refund'];
const METHOD_OPTIONS = ['', 'mastercard', 'cash', 'jazzcash', 'card'];

const fmt = (n: number) => `PKR ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;

export default function Wallet() {
  const [adminWallet, setAdminWallet] = useState<AdminWalletSummary | null>(null);
  const [nurses, setNurses] = useState<NurseWallet[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<NurseWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    if (selectedNurse) fetchTransactions(selectedNurse.nurseId, 1);
  }, [selectedNurse, filterType, filterMethod, filterFrom, filterTo]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/wallet`, { headers });
      const data = await res.json();
      if (data.success) {
        setAdminWallet(data.adminWallet);
        setNurses(data.nurses);
      } else {
        setError('Failed to load wallet data.');
      }
    } catch {
      setError('Network error loading wallet.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (nurseId: string, page: number) => {
    try {
      setTxLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterType)   params.set('type',   filterType);
      if (filterMethod) params.set('method', filterMethod);
      if (filterFrom)   params.set('from',   filterFrom);
      if (filterTo)     params.set('to',     filterTo);

      const res = await fetch(`${API_URL}/admin/wallet/nurses/${nurseId}/transactions?${params}`, { headers });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setTxTotal(data.pagination.total);
        setTxPage(page);
      }
    } catch {
      // non-critical
    } finally {
      setTxLoading(false);
    }
  };

  const typeColor: Record<string, string> = {
    patient_payment:    'bg-green-100 text-green-700',
    cash_record:        'bg-yellow-100 text-yellow-700',
    withdraw:           'bg-red-100 text-red-700',
    commission_payment: 'bg-purple-100 text-purple-700',
    payment:            'bg-blue-100 text-blue-700',
    withdrawal:         'bg-orange-100 text-orange-700',
    refund:             'bg-gray-100 text-gray-600',
  };

  const typeLabel: Record<string, string> = {
    patient_payment:    'Payment Received',
    cash_record:        'Cash Record',
    withdraw:           'Withdrawal',
    commission_payment: 'App Charges',
    payment:            'Payment',
    withdrawal:         'Withdrawal',
    refund:             'Payment Received',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-600 font-medium">{error}</div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <WalletIcon className="w-6 h-6 text-blue-600" /> Wallet Overview
      </h1>

      {/* Admin commission summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commission Collected</p>
            <p className="text-xl font-bold text-gray-800">{fmt(adminWallet?.total_commission_collected ?? 0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commission Pending</p>
            <p className="text-xl font-bold text-gray-800">{fmt(adminWallet?.total_commission_pending ?? 0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Nurse Withdrawals</p>
            <p className="text-xl font-bold text-gray-800">
              {fmt(nurses.reduce((sum, n) => sum + (n.total_withdrawn ?? 0), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Nurse wallet list */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Nurse Wallets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nurse</th>
                <th className="px-6 py-3 text-right">Digital Balance</th>
                <th className="px-6 py-3 text-right">Payable Commission</th>
                <th className="px-6 py-3 text-right">Total Withdrawn</th>
                <th className="px-6 py-3 text-center">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {nurses.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No nurse wallets found.</td></tr>
              )}
              {nurses.map(n => (
                <tr key={n.nurseId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{n.fullName}</p>
                    <p className="text-xs text-gray-400">{n.email}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-700">{fmt(n.digital_balance)}</td>
                  <td className="px-6 py-4 text-right font-medium text-yellow-700">{fmt(n.payable_commission)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{fmt(n.total_withdrawn)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => { setSelectedNurse(n); setTransactions([]); }}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nurse transaction detail */}
      {selectedNurse && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-blue-500" />
                {selectedNurse.fullName} — Transactions
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">{txTotal} total records</p>
            </div>
            <button onClick={() => setSelectedNurse(null)} className="text-xs text-gray-400 hover:text-gray-600">✕ Close</button>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-end">
            <Filter className="w-4 h-4 text-gray-400 self-center" />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type</label>
              <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All'}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Method</label>
              <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
                {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m || 'All'}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">From</label>
              <input type="date" className="border border-gray-200 rounded-lg px-2 py-1 text-sm" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">To</label>
              <input type="date" className="border border-gray-200 rounded-lg px-2 py-1 text-sm" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {txLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Method</th>
                    <th className="px-6 py-3 text-right">Gross</th>
                    <th className="px-6 py-3 text-right">App Charges</th>
                    <th className="px-6 py-3 text-right">Net</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No transactions found.</td></tr>
                  )}
                  {transactions.map(tx => (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[tx.type] || 'bg-gray-100 text-gray-600'}`}>
                          {typeLabel[tx.type] || tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 capitalize">{tx.method || '—'}</td>
                      <td className="px-6 py-3 text-right text-gray-700">{fmt(tx.grossAmount)}</td>
                      <td className="px-6 py-3 text-right text-red-500">{fmt(tx.platformFee)}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-800">{fmt(tx.netAmount)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {txTotal > 20 && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>Page {txPage} of {Math.ceil(txTotal / 20)}</span>
              <div className="flex gap-2">
                <button
                  disabled={txPage <= 1}
                  onClick={() => fetchTransactions(selectedNurse.nurseId, txPage - 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >Prev</button>
                <button
                  disabled={txPage >= Math.ceil(txTotal / 20)}
                  onClick={() => fetchTransactions(selectedNurse.nurseId, txPage + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
