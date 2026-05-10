'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, Satellite, Building2, Filter, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ImageCard from '@/components/ui/ImageCard';
import { isLoggedIn } from '@/lib/auth';
import api from '@/lib/api';
import { ImageRecord } from '@/types';

type FilterType = 'all' | 'satellite' | 'non-satellite';

export default function HistoryPage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    api.get('/images/my').then((r) => setImages(r.data.images)).finally(() => setLoading(false));
  }, []);

  const filtered = images.filter((img) => {
    const matchFilter = filter === 'all' || (filter === 'satellite' && img.isSatellite) || (filter === 'non-satellite' && !img.isSatellite);
    const matchSearch = !search || new Date(img.createdAt).toLocaleDateString().includes(search) || img.buildingCount.toString().includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-1"><History className="w-4 h-4" />History</div>
          <h1 className="font-display text-2xl font-bold">Upload History</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{images.length} total analyses · click the <Layers className="inline w-3.5 h-3.5" /> icon on any card to toggle detection overlay</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="text" placeholder="Search by date or building count…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            {(['all', 'satellite', 'non-satellite'] as FilterType[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-blue-500 text-white' : 'btn-ghost'}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1.5 text-green-400"><Satellite className="w-3.5 h-3.5" />{images.filter((i) => i.isSatellite).length} satellite</span>
          <span className="flex items-center gap-1.5 text-blue-400"><Building2 className="w-3.5 h-3.5" />{images.reduce((s, i) => s + (i.isSatellite ? i.buildingCount : 0), 0).toLocaleString()} buildings</span>
          <span className="flex items-center gap-1.5 text-purple-400"><Layers className="w-3.5 h-3.5" />{images.filter((i) => i.highlightedImageUrl).length} with overlay</span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass-card rounded-xl h-60 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <History className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="font-semibold text-[var(--text-secondary)] mb-1">No results found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((img) => <ImageCard key={img._id} image={img} />)}
          </div>
        )}
      </div>
    </div>
  );
}
