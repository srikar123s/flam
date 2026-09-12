import React, { useState } from 'react';
import { Eye, ShieldAlert, Box, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ResolvedLayout, AdSpec } from '../engine/types';
import { DomRenderer } from '../rendering/DomRenderer';

interface AdPreviewProps {
  layout: ResolvedLayout;
  spec: AdSpec;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ layout, spec }) => {
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(2.0, prev + 0.15));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.4, prev - 0.15));
  const handleResetZoom = () => setZoomScale(1.0);

  return (
    <div className="ad-preview-panel">
      <div className="panel-toolbar">
        <div className="toolbar-title">
          <Eye size={16} />
          <span>Live Preview</span>
          <span className="surface-chip">
            {layout.surfaceName} ({layout.width}×{layout.height})
          </span>
        </div>

        <div className="toolbar-controls">
          <button
            className={`toggle-btn ${showSafeAreas ? 'active' : ''}`}
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            title="Toggle Safe Area Overlay"
          >
            <ShieldAlert size={14} />
            <span>Safe Areas</span>
          </button>

          <button
            className={`toggle-btn ${showBoundingBoxes ? 'active' : ''}`}
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            title="Toggle Bounding Boxes"
          >
            <Box size={14} />
            <span>Inspect Rects</span>
          </button>

          <div className="zoom-controls">
            <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <span className="zoom-level" onClick={handleResetZoom}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="preview-canvas-container">
        <div
          className="canvas-stage"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <DomRenderer
            layout={layout}
            spec={spec}
            showSafeAreas={showSafeAreas}
            showBoundingBoxes={showBoundingBoxes}
          />
        </div>
      </div>

      <div className="preview-footer-metrics">
        <div className="status-badge-group">
          <div className={`status-badge ${layout.valid ? 'valid' : 'invalid'}`}>
            {layout.valid ? (
              <>
                <CheckCircle2 size={14} />
                <span>Layout Valid</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Validation Failed</span>
              </>
            )}
          </div>

          <div className="score-pill">
            Score: <strong>{layout.score}</strong>/100
          </div>
        </div>

        <div className="summary-stats">
          <span>Strategy: <strong>{layout.composition.toUpperCase()}</strong></span>
          <span className="dot">•</span>
          <span>Visible: <strong>{layout.elements.filter((e) => e.visible).length}</strong>/{layout.elements.length}</span>
          <span className="dot">•</span>
          <span>Overlaps: <strong>{layout.metrics.overlapCount}</strong></span>
          <span className="dot">•</span>
          <span>Clipped: <strong>{layout.metrics.clippedCount}</strong></span>
        </div>
      </div>
    </div>
  );
};
