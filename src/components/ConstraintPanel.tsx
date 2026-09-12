import React from 'react';
import { Sliders } from 'lucide-react';
import { SurfaceProfile } from '../engine/types';

interface ConstraintPanelProps {
  customSurface: SurfaceProfile;
  onChangeCustomSurface: (updated: SurfaceProfile) => void;
}

export const ConstraintPanel: React.FC<ConstraintPanelProps> = ({
  customSurface,
  onChangeCustomSurface,
}) => {
  const handleChangeNumber = (field: keyof SurfaceProfile, value: number) => {
    onChangeCustomSurface({
      ...customSurface,
      [field]: Math.max(1, value),
    });
  };

  const handleChangeSafeArea = (side: keyof SurfaceProfile['safeArea'], value: number) => {
    onChangeCustomSurface({
      ...customSurface,
      safeArea: {
        ...customSurface.safeArea,
        [side]: Math.max(0, value),
      },
    });
  };

  return (
    <div className="constraint-panel">
      <div className="panel-header">
        <Sliders size={16} />
        <span>Custom Surface Constraint Editor</span>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="custom-width">Width (px):</label>
          <input
            id="custom-width"
            type="number"
            value={customSurface.width}
            onChange={(e) => handleChangeNumber('width', parseInt(e.target.value) || 300)}
            step="10"
            min="150"
            max="3840"
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-height">Height (px):</label>
          <input
            id="custom-height"
            type="number"
            value={customSurface.height}
            onChange={(e) => handleChangeNumber('height', parseInt(e.target.value) || 300)}
            step="10"
            min="150"
            max="2160"
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-min-tap">Min Tap Target (px):</label>
          <input
            id="custom-min-tap"
            type="number"
            value={customSurface.minTapTarget}
            onChange={(e) => handleChangeNumber('minTapTarget', parseInt(e.target.value) || 0)}
            min="0"
            max="120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-min-text">Min Text Size (px):</label>
          <input
            id="custom-min-text"
            type="number"
            value={customSurface.minTextSize}
            onChange={(e) => handleChangeNumber('minTextSize', parseInt(e.target.value) || 10)}
            min="8"
            max="48"
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-viewing-distance">Viewing Distance:</label>
          <select
            id="custom-viewing-distance"
            value={customSurface.viewingDistance}
            onChange={(e) =>
              onChangeCustomSurface({
                ...customSurface,
                viewingDistance: e.target.value as any,
              })
            }
          >
            <option value="near">Near (Personal Mobile / Watch)</option>
            <option value="medium">Medium (Desktop / Retail Kiosk)</option>
            <option value="far">Far (TV / Broadcast Billboard)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="custom-safe-top">Safe Area Top (px):</label>
          <input
            id="custom-safe-top"
            type="number"
            value={customSurface.safeArea.top}
            onChange={(e) => handleChangeSafeArea('top', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-safe-right">Safe Area Right (px):</label>
          <input
            id="custom-safe-right"
            type="number"
            value={customSurface.safeArea.right}
            onChange={(e) => handleChangeSafeArea('right', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-safe-bottom">Safe Area Bottom (px):</label>
          <input
            id="custom-safe-bottom"
            type="number"
            value={customSurface.safeArea.bottom}
            onChange={(e) => handleChangeSafeArea('bottom', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="custom-safe-left">Safe Area Left (px):</label>
          <input
            id="custom-safe-left"
            type="number"
            value={customSurface.safeArea.left}
            onChange={(e) => handleChangeSafeArea('left', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};
