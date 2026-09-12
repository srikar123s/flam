import React from 'react';
import { SlidersHorizontal, Check, X, Shield } from 'lucide-react';
import { ResolvedLayout, AdSpec } from '../engine/types';

interface ElementInspectorProps {
  layout: ResolvedLayout;
  spec: AdSpec;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({ layout, spec }) => {
  const visibleCount = layout.elements.filter((e) => e.visible).length;
  const totalCount = spec.elements.length;

  return (
    <div className="inspector-panel">
      <div className="panel-header">
        <SlidersHorizontal size={16} />
        <span>Resolution Inspector</span>
      </div>

      <div className="inspector-content">
        {/* Surface Overview Card */}
        <div className="metric-card">
          <div className="card-header">
            <span className="card-title">Surface Constraints</span>
            <span className="surface-type-tag">{layout.surfaceName}</span>
          </div>

          <div className="metrics-grid">
            <div className="metric-item">
              <span className="label">Dimensions</span>
              <span className="value">{layout.width} × {layout.height}px</span>
            </div>

            <div className="metric-item">
              <span className="label">Aspect Ratio</span>
              <span className="value">{(layout.width / layout.height).toFixed(2)}</span>
            </div>

            <div className="metric-item">
              <span className="label">Composition</span>
              <span className="value accent-value">{layout.composition.toUpperCase()}</span>
            </div>

            <div className="metric-item">
              <span className="label">Resolution Score</span>
              <span className="value score-value">{layout.score}/100</span>
            </div>
          </div>
        </div>

        {/* Validation Checks Card */}
        <div className="metric-card">
          <div className="card-header">
            <span className="card-title">Validation Checks</span>
            <Shield size={14} />
          </div>

          <div className="validation-list">
            <div className="check-item">
              {layout.metrics.boundsPassed ? (
                <Check size={14} className="pass-icon" />
              ) : (
                <X size={14} className="fail-icon" />
              )}
              <span>Bounds & Safe Area</span>
            </div>

            <div className="check-item">
              {layout.metrics.collisionFree ? (
                <Check size={14} className="pass-icon" />
              ) : (
                <X size={14} className="fail-icon" />
              )}
              <span>Zero Overlaps</span>
            </div>

            <div className="check-item">
              {layout.metrics.tapTargetsPassed ? (
                <Check size={14} className="pass-icon" />
              ) : (
                <X size={14} className="fail-icon" />
              )}
              <span>Minimum Tap Targets</span>
            </div>

            <div className="check-item">
              {layout.metrics.textSizesPassed ? (
                <Check size={14} className="pass-icon" />
              ) : (
                <X size={14} className="fail-icon" />
              )}
              <span>Minimum Text Sizes</span>
            </div>
          </div>
        </div>

        {/* Element Table Card */}
        <div className="metric-card">
          <div className="card-header">
            <span className="card-title">Resolved Elements</span>
            <span className="count-pill">
              {visibleCount} / {totalCount} Visible
            </span>
          </div>

          <div className="elements-list">
            {spec.elements.map((specEl) => {
              const resEl = layout.elements.find((e) => e.id === specEl.id);

              return (
                <div
                  key={specEl.id}
                  className={`element-node ${resEl?.visible ? 'node-visible' : 'node-hidden'}`}
                >
                  <div className="node-top">
                    <div className="node-id-group">
                      <span className="node-id">{specEl.id}</span>
                      <span className={`priority-badge priority-${specEl.priority}`}>
                        P{specEl.priority}
                      </span>
                      <span className="role-tag">{specEl.role}</span>
                    </div>

                    <span className={`status-tag ${resEl?.visible ? 'vis' : 'hid'}`}>
                      {resEl?.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {resEl?.visible && (
                    <div className="node-geometry">
                      <div className="geo-cell">
                        <span className="geo-lbl">X:</span> {resEl.x}
                      </div>
                      <div className="geo-cell">
                        <span className="geo-lbl">Y:</span> {resEl.y}
                      </div>
                      <div className="geo-cell">
                        <span className="geo-lbl">W:</span> {resEl.width}
                      </div>
                      <div className="geo-cell">
                        <span className="geo-lbl">H:</span> {resEl.height}
                      </div>
                      {resEl.fontSize && (
                        <div className="geo-cell font-cell">
                          <span className="geo-lbl">Font:</span> {resEl.fontSize}px
                        </div>
                      )}
                    </div>
                  )}

                  {resEl?.reason && (
                    <p className="node-reason">{resEl.reason}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
