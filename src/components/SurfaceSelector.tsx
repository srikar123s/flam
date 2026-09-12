import React from 'react';
import { Smartphone, Monitor, Tv, Grid, Sliders, Minimize2 } from 'lucide-react';
import { SurfaceProfile } from '../engine/types';

interface SurfaceSelectorProps {
  surfaces: SurfaceProfile[];
  activeSurfaceId: string;
  isCustomActive: boolean;
  onSelectSurface: (surface: SurfaceProfile) => void;
  onToggleCustom: () => void;
}

export const SurfaceSelector: React.FC<SurfaceSelectorProps> = ({
  surfaces,
  activeSurfaceId,
  isCustomActive,
  onSelectSurface,
  onToggleCustom,
}) => {
  const getSurfaceIcon = (id: string) => {
    switch (id) {
      case 'mobile-portrait':
        return <Smartphone size={16} />;
      case 'mobile-landscape':
        return <Smartphone size={16} style={{ transform: 'rotate(90deg)' }} />;
      case 'broadcast-lower-third':
        return <Tv size={16} />;
      case 'square-kiosk':
        return <Grid size={16} />;
      case 'tiny-mobile':
        return <Minimize2 size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  return (
    <div className="surface-selector-bar">
      <div className="selector-label">Surfaces:</div>
      <div className="surface-tabs">
        {surfaces.map((surface) => {
          const isActive = !isCustomActive && activeSurfaceId === surface.id;
          return (
            <button
              key={surface.id}
              className={`surface-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSurface(surface)}
            >
              <span className="tab-icon">{getSurfaceIcon(surface.id)}</span>
              <span className="tab-name">{surface.name}</span>
              <span className="tab-dim">
                {surface.width}×{surface.height}
              </span>
            </button>
          );
        })}

        <button
          className={`surface-tab custom-tab ${isCustomActive ? 'active' : ''}`}
          onClick={onToggleCustom}
        >
          <Sliders size={16} />
          <span>+ Custom Surface</span>
        </button>
      </div>
    </div>
  );
};
