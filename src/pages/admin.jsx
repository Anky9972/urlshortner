import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Link2, MousePointerClick, Network, Shield, Trash2, Search,
  RefreshCw, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  LayoutDashboard, Activity, Home, Eye, EyeOff, Crown, Key,
  Globe, Megaphone, Download, ChevronUp, ChevronDown, UserX,
  UserCheck, X, FileText, Layers,
} from 'lucide-react';
import { UrlState } from '@/context';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001');

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const apiDownload = async (path, filename) => {
  const token = localStorage.getItem('auth_token');
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ─── Toast System ─────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const cls = toast.type === 'error'
    ? 'bg-red-600/20 border-red-500/30 text-red-300'
    : 'bg-blue-600/20 border-blue-500/30 text-blue-300';
  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur ${cls}`}>
      {toast.msg}
    </div>
  );
};

// ─── Sort Header ──────────────────────────────────────────────────────────────
const SortTh = ({ label, field, sort, order, onSort }) => (
  <th
    className="px-4 py-3 font-medium cursor-pointer select-none group"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition">
      {label}
      <span className="opacity-50 group-hover:opacity-100">
        {sort === field
          ? order === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3 opacity-30" />}
      </span>
    </div>
  </th>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue:   'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    green:  'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    amber:  'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
    pink:   'from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-400',
    cyan:   'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
    red:    'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400',
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value?.toLocaleString() ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, pages, onChange }) => (
  <div className="flex items-center justify-end gap-2 mt-4">
    <button onClick={() => onChange(page - 1)} disabled={page <= 1}
      className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition">
      <ChevronLeft className="w-4 h-4" />
    </button>
    <span className="text-xs text-slate-500 px-2">Page {page} / {pages || 1}</span>
    <button onClick={() => onChange(page + 1)} disabled={page >= pages}
      className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition">
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <p className="text-white font-semibold mb-2">Are you sure?</p>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition">Cancel</button>
        <button onClick={onConfirm}
          className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">Confirm</button>
      </div>
    </div>
  </div>
);

// ─── Mini Chart ───────────────────────────────────────────────────────────────
const MiniChart = ({ data, dataKey, color, label }) => (
  <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">{label} — last 14 days</p>
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6e7681' }} tickFormatter={v => v.slice(5)} />
        <YAxis tick={{ fontSize: 10, fill: '#6e7681' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#8b949e' }}
          itemStyle={{ color: '#f0f6fc' }}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} strokeLinecap="round" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
const BroadcastModal = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      const d = await apiFetch('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ title, message }),
      });
      setResult(d.message);
      setTitle(''); setMessage('');
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <p className="text-white font-semibold">Broadcast Notification</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title…"
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message…"
            rows={4}
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
          />
          {result && <p className="text-xs text-slate-400 bg-white/[0.03] rounded-lg px-3 py-2">{result}</p>}
          <button
            onClick={send}
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold transition"
          >
            {sending ? 'Sending…' : 'Send to All Users'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Detail Modal ────────────────────────────────────────────────────────
const UserDetailModal = ({ userId, onClose, onUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    apiFetch(`/api/admin/users/${userId}`)
      .then(d => { setData(d.user); setEditName(d.user.name || ''); })
      .catch(e => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [userId]);

  const patch = async (payload, label) => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setData(prev => ({ ...prev, ...payload }));
      onUpdated(userId, payload);
      show(label);
    } catch (e) { show(e.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <p className="text-white font-semibold">User Details</p>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition"><X className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data ? (
          <p className="text-center py-12 text-slate-500">Failed to load</p>
        ) : (
          <div className="p-5 space-y-5">
            {/* Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {(data.name || data.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{data.name || '—'}</p>
                <p className="text-slate-400 text-sm">{data.email}</p>
                <p className="text-slate-600 text-xs mt-0.5">Joined {new Date(data.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{data._count?.urls ?? 0}</p>
                <p className="text-xs text-slate-500">URLs</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{data._count?.clicks ?? 0}</p>
                <p className="text-xs text-slate-500">Clicks</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{data._count?.apiKeys ?? 0}</p>
                <p className="text-xs text-slate-500">API Keys</p>
              </div>
            </div>

            {/* Edit Name */}
            <div className="flex gap-2">
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Display name…"
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
              <button
                onClick={() => patch({ name: editName }, 'Name updated')}
                disabled={saving || editName === (data.name || '')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium transition"
              >Save</button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => patch({ isAdmin: !data.isAdmin }, data.isAdmin ? 'Admin revoked' : 'Admin granted')}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  data.isAdmin
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                {data.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
              </button>
              <button
                onClick={() => patch({ emailVerified: !data.emailVerified }, data.emailVerified ? 'Verification removed' : 'Email verified')}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  data.emailVerified
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {data.emailVerified ? 'Unverify Email' : 'Force Verify Email'}
              </button>
              <button
                onClick={() => patch({ isSuspended: !data.isSuspended }, data.isSuspended ? 'Account unsuspended' : 'Account suspended')}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                  data.isSuspended
                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {data.isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                {data.isSuspended ? 'Unsuspend' : 'Suspend Account'}
              </button>
            </div>

            {/* Recent URLs */}
            {data.urls?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Recent URLs</p>
                <div className="space-y-1.5">
                  {data.urls.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2">
                      <div>
                        <p className="text-xs text-white font-medium truncate max-w-[280px]">{u.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[280px]">{u.originalUrl}</p>
                      </div>
                      <span className="text-xs text-slate-500 ml-3">{u.currentClicks} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setData(await apiFetch('/api/admin/stats')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;
  if (error) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={load} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );
  if (!data) return null;
  const { stats, recentUsers, clicksChart, usersChart } = data;

  return (
    <div className="space-y-6">
      {/* Row 1: Core */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`+${stats.usersToday} today`} color="blue" />
        <StatCard icon={Link2} label="Total URLs" value={stats.totalUrls} sub={`+${stats.urlsToday} today`} color="green" />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={stats.totalClicks} sub={`+${stats.clicksToday} today`} color="purple" />
        <StatCard icon={Activity} label="Active URLs" value={stats.activeUrls} color="cyan" />
      </div>
      {/* Row 2: Extended */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
        <StatCard icon={Network} label="LinkTrees" value={stats.totalLinktrees} color="pink" />
        <StatCard icon={Shield} label="Teams" value={stats.totalTeams} color="amber" />
        <StatCard icon={Key} label="API Keys" value={stats.totalApiKeys} color="indigo" />
        <StatCard icon={Globe} label="Domains" value={stats.totalDomains} color="cyan" />
      </div>
      {/* Row 3: Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Layers} label="Pixels" value={stats.totalPixels} color="purple" />
        <StatCard icon={Activity} label="Rooms" value={stats.totalRooms} color="green" />
        <StatCard icon={UserX} label="Suspended" value={stats.suspendedUsers} sub="user accounts" color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MiniChart data={clicksChart} dataKey="count" color="#3b82f6" label="Clicks" />
        <MiniChart data={usersChart} dataKey="count" color="#22c55e" label="New Users" />
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Recent Signups</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                <th className="pb-2 font-medium pr-4">Name</th>
                <th className="pb-2 font-medium pr-4">Email</th>
                <th className="pb-2 font-medium pr-4">Verified</th>
                <th className="pb-2 font-medium pr-4">Status</th>
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-white font-medium">{u.name || 'N/A'}</td>
                  <td className="py-2 pr-4 text-slate-400">{u.email}</td>
                  <td className="py-2 pr-4">
                    {u.emailVerified ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  </td>
                  <td className="py-2 pr-4">
                    {u.isSuspended
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Suspended</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>}
                  </td>
                  <td className="py-2 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Users Tab ─────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}&order=${order}`);
      setUsers(d.users); setTotal(d.total); setPages(d.pages);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, search, sort, order]);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (field) => {
    if (sort === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setOrder('desc'); }
    setPage(1);
  };

  const toggleAdmin = async (id, cur) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin: !cur }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, isAdmin: !cur } : u));
      show(!cur ? 'Admin granted' : 'Admin revoked');
    } catch (e) { show(e.message, 'error'); }
  };

  const toggleSuspend = async (id, cur) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isSuspended: !cur }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, isSuspended: !cur } : u));
      show(!cur ? 'Account suspended' : 'Account unsuspended');
    } catch (e) { show(e.message, 'error'); }
  };

  const deleteUser = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(us => us.filter(u => u.id !== id));
      setTotal(t => t - 1);
      show('User deleted');
    } catch (e) { show(e.message, 'error'); }
    setConfirm(null);
  };

  const handleUserUpdated = (id, patch) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, ...patch } : u));
  };

  const exportCsv = async () => {
    try { await apiDownload('/api/admin/export/users', 'users.csv'); }
    catch (e) { show(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      {confirm && (
        <ConfirmModal
          message={`Delete user "${confirm.email}"? This will permanently delete all their links, clicks, and data.`}
          onConfirm={() => deleteUser(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      {detailId && (
        <UserDetailModal
          userId={detailId}
          onClose={() => setDetailId(null)}
          onUpdated={handleUserUpdated}
        />
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <span className="text-xs text-slate-500">{total.toLocaleString()} users</span>
        <button onClick={load} className="p-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white text-xs transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs border-b border-white/[0.06]">
                <SortTh label="User" field="name" sort={sort} order={order} onSort={toggleSort} />
                <SortTh label="Email" field="email" sort={sort} order={order} onSort={toggleSort} />
                <th className="px-4 py-3 font-medium text-slate-500">URLs</th>
                <th className="px-4 py-3 font-medium text-slate-500">Verified</th>
                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                <SortTh label="Joined" field="createdAt" sort={sort} order={order} onSort={toggleSort} />
                <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailId(u.id)} className="flex items-center gap-2 group">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" width="28" height="28" loading="lazy" className="w-7 h-7 rounded-lg object-cover" />
                        : <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{(u.name || u.email)[0].toUpperCase()}</div>}
                      <span className="text-white font-medium truncate max-w-[120px] group-hover:text-blue-400 transition">{u.name || '—'}</span>
                      {u.isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-400 truncate max-w-[180px]">{u.email}</td>
                  <td className="px-4 py-3 text-slate-400">{u._count?.urls ?? 0}</td>
                  <td className="px-4 py-3">
                    {u.emailVerified
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <XCircle className="w-4 h-4 text-red-400" />}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSuspend(u.id, u.isSuspended)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        u.isSuspended
                          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAdmin(u.id, u.isAdmin)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        u.isAdmin
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {u.isAdmin ? 'Admin' : 'User'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirm(u)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
};

// ── URLs Tab ──────────────────────────────────────────────────────────────────
const UrlsTab = () => {
  const [urls, setUrls] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/urls?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}&order=${order}`);
      setUrls(d.urls); setTotal(d.total); setPages(d.pages);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, search, sort, order]);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (field) => {
    if (sort === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setOrder('desc'); }
    setPage(1);
  };

  const toggleActive = async (id, cur) => {
    try {
      await apiFetch(`/api/admin/urls/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !cur }) });
      setUrls(us => us.map(u => u.id === id ? { ...u, isActive: !cur } : u));
      show(!cur ? 'URL activated' : 'URL deactivated');
    } catch (e) { show(e.message, 'error'); }
  };

  const deleteUrl = async (id) => {
    try {
      await apiFetch(`/api/admin/urls/${id}`, { method: 'DELETE' });
      setUrls(us => us.filter(u => u.id !== id));
      setTotal(t => t - 1);
      show('URL deleted');
    } catch (e) { show(e.message, 'error'); }
    setConfirm(null);
  };

  const exportCsv = async () => {
    try { await apiDownload('/api/admin/export/urls', 'urls.csv'); }
    catch (e) { show(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      {confirm && (
        <ConfirmModal
          message={`Delete URL "${confirm.shortUrl}"? This cannot be undone.`}
          onConfirm={() => deleteUrl(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, URL, or slug…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <span className="text-xs text-slate-500">{total.toLocaleString()} URLs</span>
        <button onClick={load} className="p-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={exportCsv} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white text-xs transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs border-b border-white/[0.06]">
                <SortTh label="Title" field="title" sort={sort} order={order} onSort={toggleSort} />
                <th className="px-4 py-3 font-medium text-slate-500">Short URL</th>
                <th className="px-4 py-3 font-medium text-slate-500">Destination</th>
                <th className="px-4 py-3 font-medium text-slate-500">Owner</th>
                <SortTh label="Clicks" field="currentClicks" sort={sort} order={order} onSort={toggleSort} />
                <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500">Expires</th>
                <SortTh label="Created" field="createdAt" sort={sort} order={order} onSort={toggleSort} />
                <th className="px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : urls.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">No URLs found</td></tr>
              ) : urls.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 text-white font-medium truncate max-w-[140px]" title={u.title}>{u.title}</td>
                  <td className="px-4 py-3">
                    <a href={`https://trimlynk.com/${u.shortUrl}`} target="_blank" rel="noreferrer"
                      className="text-blue-400 hover:underline text-xs">{u.shortUrl}</a>
                  </td>
                  <td className="px-4 py-3">
                    <a href={u.originalUrl} target="_blank" rel="noreferrer"
                      className="text-slate-400 hover:text-slate-200 text-xs truncate block max-w-[160px]" title={u.originalUrl}>
                      {u.originalUrl.replace(/^https?:\/\//, '').slice(0, 35)}{u.originalUrl.length > 40 ? '…' : ''}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[120px]">{u.user?.email}</td>
                  <td className="px-4 py-3 text-slate-400">{u.currentClicks.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        u.isActive
                          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {u.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirm(u)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
};

// ── Generic List Tab ───────────────────────────────────────────────────────────
const ListTab = ({ endpoint, columns, onDelete, emptyMsg }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`${endpoint}?page=${page}&search=${encodeURIComponent(search)}`);
      const key = Object.keys(d).find(k => Array.isArray(d[k]));
      setItems(d[key] || []); setTotal(d.total || 0); setPages(d.pages || 1);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  }, [endpoint, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (item) => {
    try {
      await onDelete(item.id);
      setItems(it => it.filter(i => i.id !== item.id));
      setTotal(t => t - 1);
      show('Deleted successfully');
    } catch (e) { show(e.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name || confirm.title || confirm.slug || confirm.domain}"?`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <span className="text-xs text-slate-500">{total.toLocaleString()} records</span>
        <button onClick={load} className="p-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                {columns.map(c => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}
                {onDelete && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">{emptyMsg}</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-3 text-slate-400 truncate max-w-[200px]">
                      {c.render ? c.render(item) : String(item[c.key] ?? '—')}
                    </td>
                  ))}
                  {onDelete && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setConfirm(item)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
};

// ── Audit Log Tab ─────────────────────────────────────────────────────────────
const AuditLogTab = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/audit-logs?page=${page}&limit=30`);
      setLogs(d.logs); setTotal(d.total); setPages(d.pages);
    } catch (e) { show(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const actionColor = (action = '') => {
    if (action.includes('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (action.includes('UPDATE') || action.includes('PATCH')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{total.toLocaleString()} log entries</span>
        <button onClick={load} className="p-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No audit logs</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${actionColor(l.action)}`}>{l.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white text-xs font-medium">{l.resource}</span>
                    {l.resourceId && <span className="text-slate-600 text-xs ml-1">#{l.resourceId.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[160px]">
                    {l.user?.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const tabs = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'users',      label: 'Users',      icon: Users },
  { id: 'urls',       label: 'URLs',       icon: Link2 },
  { id: 'linktrees',  label: 'LinkTrees',  icon: Network },
  { id: 'teams',      label: 'Teams',      icon: Shield },
  { id: 'rooms',      label: 'Rooms',      icon: Activity },
  { id: 'domains',    label: 'Domains',    icon: Globe },
  { id: 'audit',      label: 'Audit Logs', icon: FileText },
];

export default function AdminPage() {
  const { user, loading } = UrlState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBroadcast, setShowBroadcast] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return <Loader />;
  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500">TrimLink management console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm hover:bg-amber-500/20 transition"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to App</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'text-white bg-blue-600/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview'  && <OverviewTab />}
        {activeTab === 'users'     && <UsersTab />}
        {activeTab === 'urls'      && <UrlsTab />}
        {activeTab === 'audit'     && <AuditLogTab />}
        {activeTab === 'linktrees' && (
          <ListTab
            endpoint="/api/admin/linktrees"
            emptyMsg="No LinkTrees"
            onDelete={id => apiFetch(`/api/admin/linktrees/${id}`, { method: 'DELETE' })}
            columns={[
              { key: 'title',       label: 'Title',     render: i => <span className="text-white font-medium">{i.title}</span> },
              { key: 'slug',        label: 'Slug',      render: i => <span className="text-blue-400">{i.slug}</span> },
              { key: 'owner',       label: 'Owner',     render: i => i.user?.email },
              { key: 'items',       label: 'Links',     render: i => i._count?.items ?? 0 },
              { key: 'isPublished', label: 'Published', render: i => i.isPublished ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
              { key: 'createdAt',   label: 'Created',   render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
        {activeTab === 'teams' && (
          <ListTab
            endpoint="/api/admin/teams"
            emptyMsg="No teams"
            onDelete={id => apiFetch(`/api/admin/teams/${id}`, { method: 'DELETE' })}
            columns={[
              { key: 'name',    label: 'Name',    render: i => <span className="text-white font-medium">{i.name}</span> },
              { key: 'owner',   label: 'Owner',   render: i => i.owner?.email },
              { key: 'members', label: 'Members', render: i => i._count?.members ?? 0 },
              { key: 'urls',    label: 'URLs',    render: i => i._count?.urls ?? 0 },
              { key: 'createdAt', label: 'Created', render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
        {activeTab === 'rooms' && (
          <ListTab
            endpoint="/api/admin/rooms"
            emptyMsg="No rooms"
            onDelete={id => apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })}
            columns={[
              { key: 'name',      label: 'Name',    render: i => <span className="text-white font-medium">{i.name}</span> },
              { key: 'slug',      label: 'Slug',    render: i => <span className="text-blue-400">{i.slug}</span> },
              { key: 'owner',     label: 'Owner',   render: i => i.owner?.email },
              { key: 'members',   label: 'Members', render: i => i._count?.members ?? 0 },
              { key: 'isPrivate', label: 'Private', render: i => i.isPrivate ? <CheckCircle className="w-4 h-4 text-amber-400" /> : <XCircle className="w-4 h-4 text-slate-500" /> },
              { key: 'createdAt', label: 'Created', render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
        {activeTab === 'domains' && (
          <ListTab
            endpoint="/api/admin/domains"
            emptyMsg="No custom domains"
            onDelete={id => apiFetch(`/api/admin/domains/${id}`, { method: 'DELETE' })}
            columns={[
              { key: 'domain',     label: 'Domain',   render: i => <span className="text-white font-medium">{i.domain}</span> },
              { key: 'owner',      label: 'Owner',    render: i => i.user?.email },
              { key: 'isVerified', label: 'Verified', render: i => i.isVerified ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
              { key: 'createdAt',  label: 'Created',  render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
      </div>
    </div>
  );
}
