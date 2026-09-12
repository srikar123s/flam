import React, { useEffect, useRef } from 'react';
import { ResolvedLayout, AdSpec } from '../engine/types';

interface CanvasRendererProps {
  layout: ResolvedLayout;
  spec: AdSpec;
  showSafeAreas?: boolean;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  layout,
  spec,
  showSafeAreas = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI Retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = layout.width * dpr;
    canvas.height = layout.height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, layout.height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, layout.width, layout.height);

    // Subtle Radial Glow
    const radial = ctx.createRadialGradient(
      layout.width / 2,
      0,
      0,
      layout.width / 2,
      0,
      layout.height * 0.7
    );
    radial.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, layout.width, layout.height);

    // 2. Draw Safe Areas if toggled
    if (showSafeAreas) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([4, 4]);

      // Top safe bar
      ctx.fillRect(0, 0, layout.width, 16);
      ctx.strokeRect(0, 0, layout.width, 16);

      // Bottom safe bar
      ctx.fillRect(0, layout.height - 16, layout.width, 16);
      ctx.strokeRect(0, layout.height - 16, layout.width, 16);

      // Left safe bar
      ctx.fillRect(0, 16, 16, layout.height - 32);
      ctx.strokeRect(0, 16, 16, layout.height - 32);

      // Right safe bar
      ctx.fillRect(layout.width - 16, 16, 16, layout.height - 32);
      ctx.strokeRect(layout.width - 16, 16, 16, layout.height - 32);

      ctx.setLineDash([]);
    }

    // Sort visible elements by zIndex ascending
    const sortedVisible = layout.elements
      .filter((e) => e.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // 3. Render Each Resolved Element
    for (const resEl of sortedVisible) {
      const specEl = spec.elements.find((e) => e.id === resEl.id);
      if (!specEl) continue;

      ctx.save();
      ctx.globalAlpha = resEl.opacity ?? 1;

      if (specEl.type === 'text') {
        ctx.fillStyle = specEl.color ?? '#f8fafc';
        const fontSize = resEl.fontSize ?? 14;
        ctx.font = `${specEl.fontWeight ?? 'normal'} ${fontSize}px Inter, sans-serif`;
        ctx.textBaseline = 'middle';

        if (specEl.role === 'primary') {
          ctx.textAlign = 'center';
          ctx.fillText(specEl.content, resEl.x + resEl.width / 2, resEl.y + resEl.height / 2, resEl.width);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(specEl.content, resEl.x + 4, resEl.y + resEl.height / 2, resEl.width);
        }
      }

      if (specEl.type === 'button') {
        // Draw Button Background
        ctx.fillStyle = specEl.backgroundColor ?? '#6366f1';
        ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const radius = 6;
        ctx.beginPath();
        ctx.roundRect(resEl.x, resEl.y, resEl.width, resEl.height, radius);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = specEl.textColor ?? '#ffffff';
        const fontSize = resEl.fontSize ?? 14;
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(specEl.label, resEl.x + resEl.width / 2, resEl.y + resEl.height / 2);
      }

      if (specEl.type === 'image') {
        // Draw Image Placeholder / Loaded Frame on Canvas
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;

        if (specEl.role === 'branding') {
          ctx.beginPath();
          ctx.arc(
            resEl.x + resEl.width / 2,
            resEl.y + resEl.height / 2,
            Math.min(resEl.width, resEl.height) / 2,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('FLAM', resEl.x + resEl.width / 2, resEl.y + resEl.height / 2);
        } else {
          const radius = 8;
          ctx.beginPath();
          ctx.roundRect(resEl.x, resEl.y, resEl.width, resEl.height, radius);
          ctx.fill();
          ctx.stroke();

          // Visual image label placeholder in canvas
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('[Hero Visual Card]', resEl.x + resEl.width / 2, resEl.y + resEl.height / 2);
        }
      }

      ctx.restore();
    }
  }, [layout, spec, showSafeAreas]);

  return (
    <div
      style={{
        width: `${layout.width}px`,
        height: `${layout.height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          display: 'block',
        }}
      />
    </div>
  );
};
