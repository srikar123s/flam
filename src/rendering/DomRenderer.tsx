import React from 'react';
import { ResolvedLayout, AdSpec } from '../engine/types';

interface DomRendererProps {
  layout: ResolvedLayout;
  spec: AdSpec;
  showSafeAreas?: boolean;
  showBoundingBoxes?: boolean;
}

export const DomRenderer: React.FC<DomRendererProps> = ({
  layout,
  spec,
  showSafeAreas = false,
  showBoundingBoxes = false,
}) => {
  return (
    <div
      aria-label="Ad Layout Render Box"
      style={{
        position: 'relative',
        width: `${layout.width}px`,
        height: `${layout.height}px`,
        backgroundColor: '#090d16',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
      }}
    >
      {/* Visual background gradient grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 70%), linear-gradient(to bottom, rgba(15, 23, 42, 0.9), #090d16)',
          zIndex: 0,
        }}
      />

      {/* Optional Safe Area Overlay Guide */}
      {showSafeAreas && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99,
          }}
        >
          {/* Safe Area Outer Shading */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px dashed rgba(239, 68, 68, 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderTop: '1px dashed rgba(239, 68, 68, 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              bottom: '16px',
              left: 0,
              width: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderRight: '1px dashed rgba(239, 68, 68, 0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              bottom: '16px',
              right: 0,
              width: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderLeft: '1px dashed rgba(239, 68, 68, 0.5)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              left: '20px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#f87171',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Safe Area Margin
          </span>
        </div>
      )}

      {/* Render elements consuming exact layout coordinates calculated by resolver engine */}
      {layout.elements.map((resolvedEl) => {
        if (!resolvedEl.visible) return null;

        const specEl = spec.elements.find((el) => el.id === resolvedEl.id);
        if (!specEl) return null;

        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${resolvedEl.x}px`,
          top: `${resolvedEl.y}px`,
          width: `${resolvedEl.width}px`,
          height: `${resolvedEl.height}px`,
          zIndex: resolvedEl.zIndex,
          opacity: resolvedEl.opacity ?? 1,
          boxSizing: 'border-box',
          outline: showBoundingBoxes
            ? '1.5px solid rgba(56, 189, 248, 0.8)'
            : 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        };

        if (specEl.type === 'text') {
          return (
            <div
              key={specEl.id}
              style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  specEl.role === 'secondary' ? 'flex-start' : 'center',
                color: specEl.color ?? '#f8fafc',
                fontSize: `${resolvedEl.fontSize ?? 14}px`,
                fontWeight: specEl.fontWeight ?? 'normal',
                lineHeight: 1.25,
                textAlign: specEl.role === 'primary' ? 'center' : 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                padding: '2px 4px',
              }}
            >
              {specEl.content}
            </div>
          );
        }

        if (specEl.type === 'button') {
          return (
            <div
              key={specEl.id}
              style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <button
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: specEl.backgroundColor ?? '#6366f1',
                  color: specEl.textColor ?? '#ffffff',
                  fontSize: `${resolvedEl.fontSize ?? 14}px`,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {specEl.label}
              </button>
            </div>
          );
        }

        if (specEl.type === 'image') {
          return (
            <div
              key={specEl.id}
              style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: specEl.role === 'branding' ? '50%' : '8px',
                overflow: 'hidden',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
              }}
            >
              <img
                src={specEl.src}
                alt={specEl.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: specEl.role === 'branding' ? '50%' : '8px',
                }}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
