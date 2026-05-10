'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GitCompare, Building2, Satellite, TrendingUp, TrendingDown, Minus, Upload, Loader2, AlertCircle, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ImageCard from '@/components/ui/ImageCard';
import { isLoggedIn } from '@/lib/auth';
import api from '@/lib/api';
import { ImageRecord } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ComparePage() {
  const [myImages, setMyImages] = useState<ImageRecord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [compared, setCompared] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [showHighlights, setShowHighlights] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    api.get('/images/my').then((r) => setMyImages(r.data.images)).finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p);

  const handleCompare = async () => {
    if (selected.length < 2) { setError('Select at least 2 images'); return; }
    setError(''); setComparing(true);
    try {
      const res = await api.post('/images/compare', { imageIds: selected });
      setCompared(res.data.images);
      // default: show highlights for satellite images
      const defaults: Record<string, boolean> = {};
      res.data.images.forEach((img: ImageRecord) => { defaults[img._id] = !!img.highlightedImageUrl; });
      setShowHighlights(defaults);
    } catch { setError('Comparison failed'); }
    finally { setComparing(false); }
  };

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-1"><GitCompare className="w-4 h-4" />Compare</div>
          <h1 className="font-display text-2xl font-bold">Image Comparison</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Select 2–3 images to compare side by side with detection overlays</p>
        </div>

        <div className="glass-card rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selected[i] ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>{selected[i] ? i + 1 : '·'}</div>
              ))}
            </div>
            <span className="text-[var(--text-secondary)] text-sm">{selected.length}/3 selected</span>
          </div>
          <div className="flex items-center gap-3">
            {selected.length > 0 && <button onClick={() => { setSelected([]); setCompared([]); }} className="btn-ghost px-4 py-2 rounded-lg text-sm">Clear</button>}
            <button onClick={handleCompare} disabled={selected.length < 2 || comparing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold">
              {comparing ? <><Loader2 className="w-4 h-4 animate-spin" />Comparing…</> : <><GitCompare className="w-4 h-4" />Compare</>}
            </button>
          </div>
        </div>

        {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"><AlertCircle className="w-4 h-4" />{error}</div>}

        {compared.length >= 2 && (
          <div className="mb-10">
            <h2 className="font-display font-semibold text-lg mb-4">Comparison Result</h2>
            <div className={`grid gap-4 mb-6 ${compared.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {compared.map((img, idx) => {
                const hasHL = img.isSatellite && !!img.highlightedImageUrl;
                const showHL = showHighlights[img._id];
                const src = showHL && hasHL ? `${API_URL}${img.highlightedImageUrl}` : `${API_URL}${img.imageUrl}`;
                return (
                  <div key={img._id} className="glass-card rounded-2xl overflow-hidden">
                    <div className="relative">
                      <img src={src} alt={`Image ${idx + 1}`} className="w-full h-52 object-cover transition-all duration-300" />
                      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                      {hasHL && (
                        <button
                          onClick={() => setShowHighlights((p) => ({ ...p, [img._id]: !p[img._id] }))}
                          className={`absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full glass-card text-xs font-medium border transition-all ${showHL ? 'border-blue-500/50 text-blue-300' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                        >
                          <Layers className="w-3 h-3" />{showHL ? 'Original' : 'Overlay'}
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`flex items-center gap-1.5 ${img.isSatellite ? 'text-green-400' : 'text-red-400'}`}><Satellite className="w-3.5 h-3.5" />{img.isSatellite ? 'Satellite' : 'Not satellite'}</span>
                        <span className="flex items-center gap-1.5 text-blue-400 font-semibold"><Building2 className="w-3.5 h-3.5" />{img.isSatellite ? img.buildingCount : '—'}</span>
                      </div>
                      <p className="text-[var(--text-muted)] text-xs mt-1.5">{new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">Building Count Differences</h3>
              <div className="space-y-3">
                {compared.slice(1).map((img, i) => {
                  const diff = img.buildingCount - compared[0].buildingCount;
                  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
                  const color = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-[var(--text-muted)]';
                  return (
                    <div key={img._id} className="flex items-center justify-between p-3 bg-[var(--surface-overlay)] rounded-xl">
                      <span className="text-[var(--text-secondary)] text-sm">Image 1 → Image {i + 2}</span>
                      <div className={`flex items-center gap-2 font-semibold ${color}`}><Icon className="w-4 h-4" />{diff > 0 ? `+${diff}` : diff} buildings</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Your Uploads</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass-card rounded-xl h-60 animate-pulse" />)}
            </div>
          ) : myImages.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="font-semibold text-[var(--text-secondary)] mb-1">No images yet</p>
              <p className="text-[var(--text-muted)] text-sm">Upload some satellite images from the dashboard first.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {myImages.map((img) => <ImageCard key={img._id} image={img} selectable selected={selected.includes(img._id)} onSelect={() => toggleSelect(img._id)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
