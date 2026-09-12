import React from 'react';
import { RefreshCw, Wand2, ChevronDown } from 'lucide-react';
import { AdSpec, SurfaceProfile } from '../engine/types';

interface HeaderProps {
  ads: AdSpec[];
  selectedAdId: string;
  surfaces: SurfaceProfile[];
  activeSurfaceId: string;
  onSelectAd: (adId: string) => void;
  onSelectSurfaceId: (surfaceId: string) => void;
  onAdaptLayouts: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ads,
  selectedAdId,
  surfaces,
  activeSurfaceId,
  onSelectAd,
  onSelectSurfaceId,
  onAdaptLayouts,
  onReset,
}) => {
  const activeSurface = surfaces.find((s) => s.id === activeSurfaceId);

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="frameshift-brand">
          <div className="frameshift-symbol">◆</div>
          <span className="frameshift-name">FRAMESHIFT</span>
        </div>

        <div className="creative-select-badge">
          <span className="lbl">CREATIVE</span>
          <select
            value={selectedAdId}
            onChange={(e) => onSelectAd(e.target.value)}
          >
            {ads.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-middle">
        <div className="surface-dropdown-group">
          <span className="target-surface-lbl">TARGET SURFACE</span>
          <div className="dropdown-wrapper">
            <select
              value={activeSurfaceId}
              onChange={(e) => onSelectSurfaceId(e.target.value)}
            >
              {surfaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.width} × {s.height})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="dropdown-arrow" />
          </div>
          {activeSurface && (
            <span className="surface-meta-sub">
              {activeSurface.width} × {activeSurface.height} • {(activeSurface.width / activeSurface.height).toFixed(2)}:1 aspect
            </span>
          )}
        </div>
      </div>

      <div className="header-right">
        <button className="reset-demo-btn" onClick={onReset}>
          <RefreshCw size={13} />
          <span>Reset demo</span>
        </button>

        <button className="adapt-layouts-btn" onClick={onAdaptLayouts}>
          <Wand2 size={15} />
          <span>Adapt Layouts</span>
        </button>
      </div>
    </header>
  );
};
