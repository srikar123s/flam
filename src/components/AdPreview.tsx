import React, { useState, useMemo } from 'react';
import { Eye, ShieldAlert, Box, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { ResolvedLayout, AdSpec } from '../engine/types';
import { DomRenderer } from '../rendering/DomRenderer';
import { CanvasRenderer } from '../rendering/CanvasRenderer';

interface AdPreviewProps {
  layout: ResolvedLayout;
  spec: AdSpec;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
}

export const AdPreview: React.FC<AdPreviewProps> = ({
  layout,
  spec,
  selectedElementId,
  onSelectElement,
}) => {
  const [renderMode, setRenderMode] = useState<'dom' | 'canvas'>('canvas');
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.0);

  // Compute auto-fit scale for large surfaces (e.g. 1280x720 or 1080x1080) so they fit at 100% browser zoom
  const autoFitScale = useMemo(() => {
    const maxAvailableWidth = 720; // Available central column width at 100% zoom
    const maxAvailableHeight = 440;

    const scaleW = maxAvailableWidth / layout.width;
    const scaleH = maxAvailableHeight / layout.height;
    const fit = Math.min(1.0, scaleW, scaleH);

    return Number(fit.toFixed(2));
  }, [layout.width, layout.height]);

  const effectiveScale = zoomScale * autoFitScale;

  const handleZoomIn = () => setZoomScale((prev) => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.3, prev - 0.15));
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
          <div className="renderer-toggle">
            <button
              className={`toggle-btn ${renderMode === 'canvas' ? 'active' : ''}`}
              onClick={() => setRenderMode('canvas')}
              title="Render using HTML5 Canvas 2D"
            >
              <Layers size={14} />
              <span>Canvas</span>
            </button>
            <button
              className={`toggle-btn ${renderMode === 'dom' ? 'active' : ''}`}
              onClick={() => setRenderMode('dom')}
              title="Render using DOM CSS elements"
            >
              <Layers size={14} />
              <span>DOM</span>
            </button>
          </div>

          <button
            className={`toggle-btn ${showSafeAreas ? 'active' : ''}`}
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            title="Toggle Safe Area Overlay"
          >
            <ShieldAlert size={14} />
            <span>Safe Areas</span>
          </button>

          {renderMode === 'dom' && (
            <button
              className={`toggle-btn ${showBoundingBoxes ? 'active' : ''}`}
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              title="Toggle Bounding Boxes"
            >
              <Box size={14} />
              <span>Inspect Rects</span>
            </button>
          )}

          <div className="zoom-controls">
            <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <span className="zoom-level" onClick={handleResetZoom}>
              {Math.round(effectiveScale * 100)}%
            </span>
            <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="preview-canvas-container">
        <div
          className="canvas-stage-wrapper"
          style={{
            width: `${Math.round(layout.width * effectiveScale)}px`,
            height: `${Math.round(layout.height * effectiveScale)}px`,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            className="canvas-stage"
            style={{
              width: `${layout.width}px`,
              height: `${layout.height}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease-out',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {renderMode === 'dom' ? (
              <DomRenderer
                layout={layout}
                spec={spec}
                showSafeAreas={showSafeAreas}
                showBoundingBoxes={showBoundingBoxes}
              />
            ) : (
              <CanvasRenderer
                layout={layout}
                spec={spec}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
                showSafeAreas={showSafeAreas}
              />
            )}
          </div>
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
