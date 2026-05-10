'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, ImageIcon, Loader2, X, Satellite, Building2, AlertCircle, Eye, Layers } from 'lucide-react';
import api from '@/lib/api';
import { ImageRecord } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Props { onResult?: (image: ImageRecord) => void; }

export default function UploadZone({ onResult }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f); setResult(null); setError(null);
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/images/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.image);
      onResult?.(res.data.image);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Analysis failed. Is the ML service running?');
    } finally { setLoading(false); }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {!file ? (
        <div
          className={`drop-zone rounded-2xl p-12 text-center cursor-pointer ${dragging ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Upload className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-[var(--text-primary)] font-semibold text-lg">Drop your satellite image here</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">or click to browse · JPEG, PNG, WEBP, TIFF · max 20MB</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><Satellite className="w-3.5 h-3.5" />Auto-classification</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Building detection</span>
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />Visual overlay</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Preview / result image area */}
          {result ? (
            <HighlightViewer image={result} />
          ) : (
            <div className="relative">
              {preview && <img src={preview} alt="Preview" className="w-full h-64 object-cover" />}
              {loading && (
                <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] border-t-blue-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Analyzing with AI models…</p>
                </div>
              )}
              <button onClick={reset} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-5">
            {!result && (
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-secondary)] truncate">{file.name}</span>
                <span className="text-xs text-[var(--text-muted)] shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {!result ? (
              <button onClick={handleAnalyze} disabled={loading} className="w-full py-3 rounded-xl btn-primary font-semibold flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</> : <><Satellite className="w-4 h-4" />Analyze Image</>}
              </button>
            ) : (
              <div className="flex gap-3 mt-3">
                <div className={`flex-1 rounded-xl p-3 text-center ${result.isSatellite ? 'badge-satellite' : 'badge-not-satellite'}`}>
                  <p className="text-xs font-medium opacity-70 uppercase tracking-wider">Satellite</p>
                  <p className="text-xl font-bold font-display">{result.isSatellite ? 'Yes ✓' : 'No ✗'}</p>
                </div>
                <div className="flex-1 rounded-xl p-3 text-center bg-blue-500/10 border border-blue-500/25 text-blue-400">
                  <p className="text-xs font-medium opacity-70 uppercase tracking-wider">Buildings</p>
                  <p className="text-xl font-bold font-display">{result.isSatellite ? result.buildingCount : '—'}</p>
                </div>
                <button onClick={reset} className="px-4 rounded-xl btn-ghost text-sm">New</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Highlighted image viewer with before/after toggle ────────────────────────

function HighlightViewer({ image }: { image: ImageRecord }) {
  const [showHighlight, setShowHighlight] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const hasHighlight = image.isSatellite && !!image.highlightedImageUrl;

  return (
    <div className="relative">
      <div className="relative h-72 bg-[var(--surface-overlay)]">
        <img
          src={showHighlight && hasHighlight
            ? `${API_URL}${image.highlightedImageUrl}`
            : `${API_URL}${image.imageUrl}`}
          alt={showHighlight ? 'Highlighted buildings' : 'Original image'}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Legend overlay */}
        {showHighlight && hasHighlight && (
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 glass-card rounded-xl p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-400/60 border border-green-400 inline-block" />
              <span className="text-[var(--text-secondary)]">Building area</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500/80 border border-red-400 inline-block" />
              <span className="text-[var(--text-secondary)]">Building outline</span>
            </div>
          </div>
        )}

        {/* Building count badge */}
        {image.isSatellite && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-semibold text-blue-400 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            {image.buildingCount} buildings detected
          </div>
        )}

        {/* Toggle button */}
        {hasHighlight && (
          <button
            onClick={() => setShowHighlight(!showHighlight)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            {showHighlight ? 'Show original' : 'Show detection'}
          </button>
        )}

        {!hasHighlight && !image.isSatellite && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full glass-card text-xs badge-not-satellite">
            Not a satellite image
          </div>
        )}
      </div>

      {/* Tiny image strip toggle if both exist */}
      {hasHighlight && (
        <div className="flex border-t border-[var(--border)]">
          <button
            onClick={() => setShowHighlight(false)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${!showHighlight ? 'bg-[var(--accent-muted)] text-blue-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            Original
          </button>
          <div className="w-px bg-[var(--border)]" />
          <button
            onClick={() => setShowHighlight(true)}
            className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${showHighlight ? 'bg-[var(--accent-muted)] text-blue-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            <Layers className="w-3 h-3" />Detection overlay
          </button>
        </div>
      )}
    </div>
  );
}
