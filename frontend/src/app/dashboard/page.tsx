'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Satellite, TrendingUp, Plus, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import UploadZone from '@/components/ui/UploadZone';
import ImageCard from '@/components/ui/ImageCard';
import { isLoggedIn, getUser } from '@/lib/auth';
import api from '@/lib/api';
import { ImageRecord } from '@/types';

export default function DashboardPage() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    api.get('/images/my').then((r) => setImages(r.data.images)).finally(() => setLoading(false));
  }, []);

  const satImages = images.filter((i) => i.isSatellite);
  const totalBuildings = satImages.reduce((s, i) => s + i.buildingCount, 0);
  const withOverlay = images.filter((i) => i.highlightedImageUrl).length;

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm mb-1"><LayoutDashboard className="w-4 h-4" />Dashboard</div>
            <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          </div>
          <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary font-medium text-sm">
            <Plus className="w-4 h-4" />Analyze Image
          </button>
        </div>

        {showUpload && (
          <div className="mb-8">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold mb-5 text-[var(--text-secondary)] text-sm uppercase tracking-wider">New Analysis</h2>
              <UploadZone onResult={(img) => { setImages((p) => [img, ...p]); setShowUpload(false); }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Uploads', value: images.length, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Satellite Images', value: satImages.length, icon: Satellite, color: 'text-green-400' },
            { label: 'Buildings Found', value: totalBuildings.toLocaleString(), icon: Building2, color: 'text-blue-300' },
            { label: 'With Overlay', value: withOverlay, icon: Layers, color: 'text-purple-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3"><span className="text-[var(--text-muted)] text-xs">{label}</span><Icon className={`w-4 h-4 ${color}`} /></div>
              <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Recent Analyses</h2>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card rounded-xl h-60 animate-pulse" />)}
            </div>
          ) : images.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <Satellite className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="font-semibold text-[var(--text-secondary)] mb-2">No analyses yet</p>
              <p className="text-[var(--text-muted)] text-sm mb-6">Upload your first satellite image to get started.</p>
              <button onClick={() => setShowUpload(true)} className="px-6 py-2.5 rounded-xl btn-primary text-sm font-medium">Upload Image</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.slice(0, 8).map((img) => <ImageCard key={img._id} image={img} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
