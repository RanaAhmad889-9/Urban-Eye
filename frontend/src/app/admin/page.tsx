'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, ImageIcon, Trash2, Building2, Satellite, AlertCircle, Loader2, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { isLoggedIn, isAdmin } from '@/lib/auth';
import api from '@/lib/api';
import { ImageRecord, UserRecord } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const [tab, setTab] = useState<'users' | 'images'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push('/dashboard'); return; }
    Promise.all([api.get('/admin/users'), api.get('/admin/images')]).then(([u, i]) => { setUsers(u.data.users); setImages(i.data.images); }).finally(() => setLoading(false));
  }, []);

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    setDeleting(id);
    try { await api.delete(`/admin/images/${id}`); setImages((p) => p.filter((i) => i._id !== id)); }
    catch { setError('Delete failed'); } finally { setDeleting(null); }
  };
  const deleteUser = async (id: string) => {
    if (!confirm('Delete user and all their data?')) return;
    setDeleting(id);
    try { await api.delete(`/admin/users/${id}`); setUsers((p) => p.filter((u) => u._id !== id)); }
    catch { setError('Delete failed'); } finally { setDeleting(null); }
  };

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-amber-400 text-sm mb-1"><Shield className="w-4 h-4" />Admin</div>
          <h1 className="font-display text-2xl font-bold">System Management</h1>
        </div>

        {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"><AlertCircle className="w-4 h-4" />{error}<button onClick={() => setError('')} className="ml-auto text-xs underline">Dismiss</button></div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400' },
            { label: 'Total Images', value: images.length, icon: ImageIcon, color: 'text-blue-300' },
            { label: 'Satellite Images', value: images.filter((i) => i.isSatellite).length, icon: Satellite, color: 'text-green-400' },
            { label: 'With Overlay', value: images.filter((i) => i.highlightedImageUrl).length, icon: Layers, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-[var(--text-muted)] text-xs">{label}</span><Icon className={`w-4 h-4 ${color}`} /></div>
              <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 p-1 glass-card rounded-xl w-fit mb-6">
          {(['users', 'images'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-blue-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              {t === 'users' ? `Users (${users.length})` : `Images (${images.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card rounded-2xl p-16 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : tab === 'users' ? (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)]">
                  {['User', 'Role', 'Joined', ''].map((h) => <th key={h} className="text-left px-5 py-3.5 text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>{users.map((user) => (
                  <tr key={user._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-overlay)]/50">
                    <td className="px-5 py-4"><p className="font-medium text-sm">{user.name}</p><p className="text-[var(--text-muted)] text-xs">{user.email}</p></td>
                    <td className="px-5 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{user.role}</span></td>
                    <td className="px-5 py-4 text-[var(--text-muted)] text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">{user.role !== 'ADMIN' && <button onClick={() => deleteUser(user._id)} disabled={deleting === user._id} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">{deleting === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[var(--border)]">
                  {['Image', 'User', 'Satellite', 'Buildings', 'Overlay', 'Date', ''].map((h) => <th key={h} className="text-left px-5 py-3.5 text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>{images.map((img) => (
                  <tr key={img._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface-overlay)]/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <img src={`${API_URL}${img.imageUrl}`} alt="" className="w-12 h-9 object-cover rounded-lg border border-[var(--border)]" />
                        {img.highlightedImageUrl && <img src={`${API_URL}${img.highlightedImageUrl}`} alt="overlay" className="w-12 h-9 object-cover rounded-lg border border-blue-500/30" title="Detection overlay" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{(img as ImageRecord & { userId?: { name?: string } }).userId ? (img as ImageRecord & { userId?: { name?: string } }).userId?.name || 'User' : <span className="text-[var(--text-muted)] italic">Guest</span>}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${img.isSatellite ? 'badge-satellite' : 'badge-not-satellite'}`}>{img.isSatellite ? 'Yes' : 'No'}</span></td>
                    <td className="px-5 py-3 text-blue-400 font-semibold text-sm">{img.isSatellite ? img.buildingCount : '—'}</td>
                    <td className="px-5 py-3"><span className={`text-xs ${img.highlightedImageUrl ? 'text-purple-400' : 'text-[var(--text-muted)]'}`}>{img.highlightedImageUrl ? '✓ Yes' : 'No'}</span></td>
                    <td className="px-5 py-3 text-[var(--text-muted)] text-sm">{new Date(img.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right"><button onClick={() => deleteImage(img._id)} disabled={deleting === img._id} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">{deleting === img._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
