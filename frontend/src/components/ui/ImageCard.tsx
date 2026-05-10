'use client';
import { useState } from 'react';
import { ImageRecord } from '@/types';
import { Satellite, Building2, Calendar, Layers } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Props {
  image: ImageRecord;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export default function ImageCard({ image, selectable, selected, onSelect }: Props) {
  const [showHighlight, setShowHighlight] = useState(false);
  const hasHighlight = image.isSatellite && !!image.highlightedImageUrl;
  const date = new Date(image.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const imgSrc = showHighlight && hasHighlight
    ? `${API_URL}${image.highlightedImageUrl}`
    : `${API_URL}${image.imageUrl}`;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`glass-card rounded-xl overflow-hidden hover-lift ${selectable ? 'cursor-pointer' : ''} ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="relative h-44 bg-[var(--surface-overlay)]">
        <img src={imgSrc} alt="" className="w-full h-full object-cover transition-all duration-300" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150"><rect width="200" height="150" fill="%23111d35"/><text x="50%" y="50%" text-anchor="middle" fill="%234a5a7a" font-size="12">No image</text></svg>'; }} />

        {/* satellite badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${image.isSatellite ? 'badge-satellite' : 'badge-not-satellite'}`}>
            {image.isSatellite ? '🛰 Satellite' : '📷 Non-satellite'}
          </span>
        </div>

        {/* highlight toggle */}
        {hasHighlight && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowHighlight(!showHighlight); }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm border transition-all text-xs ${showHighlight ? 'bg-blue-500/30 border-blue-500/50 text-blue-300' : 'bg-[var(--surface)]/70 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            title={showHighlight ? 'Show original' : 'Show detection overlay'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        {selectable && selected && (
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            <Calendar className="w-3 h-3" />{date}
          </div>
          {hasHighlight && (
            <span className="text-xs text-blue-400/70 flex items-center gap-1">
              <Layers className="w-3 h-3" />overlay
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--surface-overlay)] rounded-lg p-2.5 text-center">
            <Satellite className="w-3.5 h-3.5 mx-auto mb-1 text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-muted)]">Satellite</p>
            <p className={`text-sm font-semibold ${image.isSatellite ? 'text-green-400' : 'text-red-400'}`}>{image.isSatellite ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-[var(--surface-overlay)] rounded-lg p-2.5 text-center">
            <Building2 className="w-3.5 h-3.5 mx-auto mb-1 text-[var(--text-muted)]" />
            <p className="text-xs text-[var(--text-muted)]">Buildings</p>
            <p className="text-sm font-semibold text-blue-400">{image.isSatellite ? image.buildingCount : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
