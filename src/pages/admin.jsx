import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Link2, MousePointerClick, Network, Shield, Trash2, Search,
  RefreshCw, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  LayoutDashboard, Settings, Activity, Home, Eye, EyeOff, Crown,
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
    pink: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-400',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
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
    <button
      onClick={() => onChange(page - 1)}
      disabled={page <= 1}
      className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    <span className="text-xs text-slate-500 px-2">Page {page} / {pages || 1}</span>
    <button
      onClick={() => onChange(page + 1)}
      disabled={page >= pages}
      className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 transition"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// ─── Confirm Toast ────────────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <p className="text-white font-semibold mb-2">Are you sure?</p>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-300 text-sm hover:bg-white/5 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition">Delete</button>
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

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await apiFetch('/api/admin/stats')); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader />;
  if (!data) return <ErrorMsg />;
  const { stats, recentUsers, clicksChart, usersChart } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} sub={`+${stats.usersToday} today`} color="blue" />
        <StatCard icon={Link2} label="Total URLs" value={stats.totalUrls} sub={`+${stats.urlsToday} today`} color="green" />
        <StatCard icon={MousePointerClick} label="Total Clicks" value={stats.totalClicks} sub={`+${stats.clicksToday} today`} color="purple" />
        <StatCard icon={Activity} label="Active URLs" value={stats.activeUrls} color="cyan" />
        <StatCard icon={Network} label="LinkTrees" value={stats.totalLinktrees} color="pink" />
        <StatCard icon={Users} label="Teams" value={stats.totalTeams} color="amber" />
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
                <th className="pb-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-white font-medium">{u.name || 'N/A'}</td>
                  <td className="py-2 pr-4 text-slate-400">{u.email}</td>
                  <td className="py-2 pr-4">
                    {u.emailVerified
                      ? <CheckCircle className="w-4 h-4 text-green-400" />
                      : <XCircle className="w-4 h-4 text-red-400" />}
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
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      setUsers(d.users); setTotal(d.total); setPages(d.pages);
    } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleAdmin = async (id, cur) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin: !cur }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, isAdmin: !cur } : u));
      showToast(!cur ? 'Admin granted' : 'Admin revoked');
    } catch (e) { showToast(e.message); }
  };

  const deleteUser = async (id) => {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(us => us.filter(u => u.id !== id));
      showToast('User deleted');
    } catch (e) { showToast(e.message); }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      {toast && <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 text-sm text-blue-300">{toast}</div>}
      {confirm && (
        <ConfirmModal
          message={`Delete user "${confirm.email}"? This will permanently delete all their links, clicks, and data.`}
          onConfirm={() => deleteUser(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
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
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">URLs</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" width="28" height="28" loading="lazy" className="w-7 h-7 rounded-lg object-cover" />
                        : <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{(u.name || u.email)[0].toUpperCase()}</div>}
                      <span className="text-white font-medium truncate max-w-[120px]">{u.name || '—'}</span>
                      {u.isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
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
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/urls?page=${page}&search=${encodeURIComponent(search)}`);
      setUrls(d.urls); setTotal(d.total); setPages(d.pages);
    } catch (e) { showToast(e.message); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleActive = async (id, cur) => {
    try {
      await apiFetch(`/api/admin/urls/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !cur }) });
      setUrls(us => us.map(u => u.id === id ? { ...u, isActive: !cur } : u));
    } catch (e) { showToast(e.message); }
  };

  const deleteUrl = async (id) => {
    try {
      await apiFetch(`/api/admin/urls/${id}`, { method: 'DELETE' });
      setUrls(us => us.filter(u => u.id !== id));
      showToast('URL deleted');
    } catch (e) { showToast(e.message); }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      {toast && <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 text-sm text-blue-300">{toast}</div>}
      {confirm && (
        <ConfirmModal
          message={`Delete URL "${confirm.shortUrl}"? This cannot be undone.`}
          onConfirm={() => deleteUrl(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
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
      </div>
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Short URL</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
              ) : urls.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No URLs found</td></tr>
              ) : urls.map(u => (
                <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 text-white font-medium truncate max-w-[160px]">{u.title}</td>
                  <td className="px-4 py-3">
                    <a href={`https://trimlynk.com/${u.shortUrl}`} target="_blank" rel="noreferrer"
                      className="text-blue-400 hover:underline text-xs">{u.shortUrl}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[140px]">{u.user?.email}</td>
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
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch(`${endpoint}?page=${page}&search=${encodeURIComponent(search)}`);
      const key = Object.keys(d).find(k => Array.isArray(d[k]));
      setItems(d[key] || []); setTotal(d.total || 0); setPages(d.pages || 1);
    } catch (e) { setToast(e.message); }
    finally { setLoading(false); }
  }, [endpoint, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (item) => {
    try {
      await onDelete(item.id);
      setItems(it => it.filter(i => i.id !== item.id));
      setToast('Deleted successfully');
    } catch (e) { setToast(e.message); }
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      {toast && <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2 text-sm text-blue-300">{toast}</div>}
      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name || confirm.title || confirm.slug}"?`}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
const ErrorMsg = () => <p className="text-center py-20 text-slate-500">Failed to load data</p>;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'urls', label: 'URLs', icon: Link2 },
  { id: 'linktrees', label: 'LinkTrees', icon: Network },
  { id: 'teams', label: 'Teams', icon: Shield },
  { id: 'rooms', label: 'Rooms', icon: Activity },
];

export default function AdminPage() {
  const { user, loading } = UrlState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) return <Loader />;
  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500">TrimLink management console</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </button>
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'urls' && <UrlsTab />}
        {activeTab === 'linktrees' && (
          <ListTab
            endpoint="/api/admin/linktrees"
            emptyMsg="No LinkTrees"
            onDelete={id => apiFetch(`/api/admin/linktrees/${id}`, { method: 'DELETE' })}
            columns={[
              { key: 'title', label: 'Title', render: i => <span className="text-white font-medium">{i.title}</span> },
              { key: 'slug', label: 'Slug', render: i => <span className="text-blue-400">{i.slug}</span> },
              { key: 'owner', label: 'Owner', render: i => i.user?.email },
              { key: 'items', label: 'Links', render: i => i._count?.items ?? 0 },
              { key: 'isPublished', label: 'Published', render: i => i.isPublished ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" /> },
              { key: 'createdAt', label: 'Created', render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
        {activeTab === 'teams' && (
          <ListTab
            endpoint="/api/admin/teams"
            emptyMsg="No teams"
            onDelete={null}
            columns={[
              { key: 'name', label: 'Name', render: i => <span className="text-white font-medium">{i.name}</span> },
              { key: 'owner', label: 'Owner', render: i => i.owner?.email },
              { key: 'members', label: 'Members', render: i => i._count?.members ?? 0 },
              { key: 'urls', label: 'URLs', render: i => i._count?.urls ?? 0 },
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
              { key: 'name', label: 'Name', render: i => <span className="text-white font-medium">{i.name}</span> },
              { key: 'slug', label: 'Slug', render: i => <span className="text-blue-400">{i.slug}</span> },
              { key: 'owner', label: 'Owner', render: i => i.owner?.email },
              { key: 'members', label: 'Members', render: i => i._count?.members ?? 0 },
              { key: 'isPrivate', label: 'Private', render: i => i.isPrivate ? <CheckCircle className="w-4 h-4 text-amber-400" /> : <XCircle className="w-4 h-4 text-slate-500" /> },
              { key: 'createdAt', label: 'Created', render: i => new Date(i.createdAt).toLocaleDateString() },
            ]}
          />
        )}
      </div>
    </div>
  );
}
