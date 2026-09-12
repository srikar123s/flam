import React, { useEffect, useRef } from 'react';
import { ResolvedLayout, AdSpec } from '../engine/types';

interface CanvasRendererProps {
  layout: ResolvedLayout;
  spec: AdSpec;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
  showSafeAreas?: boolean;
}

// Image cache to prevent flickering re-loads
const imageCache: Map<string, HTMLImageElement> = new Map();

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  layout,
  spec,
  selectedElementId,
  onSelectElement,
  showSafeAreas = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preload images into cache
  useEffect(() => {
    spec.elements.forEach((el) => {
      if (el.type === 'image' && el.src && !imageCache.has(el.src)) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = el.src;
        img.onload = () => {
          imageCache.set(el.src, img);
          // Re-render canvas once image is loaded
          triggerCanvasRender();
        };
      }
    });
  }, [spec]);

  const triggerCanvasRender = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      ctx.fillRect(0, 0, layout.width, 16);
      ctx.strokeRect(0, 0, layout.width, 16);

      ctx.fillRect(0, layout.height - 16, layout.width, 16);
      ctx.strokeRect(0, layout.height - 16, layout.width, 16);

      ctx.fillRect(0, 16, 16, layout.height - 32);
      ctx.strokeRect(0, 16, 16, layout.height - 32);

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

      const isSelected = selectedElementId === resEl.id;

      ctx.save();
      ctx.globalAlpha = resEl.opacity ?? 1;

      if (specEl.type === 'text') {
        ctx.fillStyle = specEl.color ?? '#f8fafc';
        const fontSize = resEl.fontSize ?? 14;
        ctx.font = `${specEl.fontWeight ?? 'normal'} ${fontSize}px Inter, sans-serif`;
        ctx.textBaseline = 'middle';

        if (specEl.role === 'primary') {
          ctx.textAlign = 'center';
          ctx.fillText(
            specEl.content,
            resEl.x + resEl.width / 2,
            resEl.y + resEl.height / 2,
            resEl.width
          );
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(
            specEl.content,
            resEl.x + 4,
            resEl.y + resEl.height / 2,
            resEl.width
          );
        }
      }

      if (specEl.type === 'button') {
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
        ctx.fillText(
          specEl.label,
          resEl.x + resEl.width / 2,
          resEl.y + resEl.height / 2
        );
      }

      if (specEl.type === 'image') {
        const cachedImg = imageCache.get(specEl.src);
        if (cachedImg && cachedImg.complete) {
          ctx.save();
          const radius = specEl.role === 'branding' ? Math.min(resEl.width, resEl.height) / 2 : 8;
          ctx.beginPath();
          if (specEl.role === 'branding') {
            ctx.arc(
              resEl.x + resEl.width / 2,
              resEl.y + resEl.height / 2,
              radius,
              0,
              2 * Math.PI
            );
          } else {
            ctx.roundRect(resEl.x, resEl.y, resEl.width, resEl.height, radius);
          }
          ctx.clip();
          ctx.drawImage(cachedImg, resEl.x, resEl.y, resEl.width, resEl.height);
          ctx.restore();
        } else {
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
            ctx.fillText(
              'FLAM',
              resEl.x + resEl.width / 2,
              resEl.y + resEl.height / 2
            );
          } else {
            const radius = 8;
            ctx.beginPath();
            ctx.roundRect(resEl.x, resEl.y, resEl.width, resEl.height, radius);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              '[Hero Visual Card]',
              resEl.x + resEl.width / 2,
              resEl.y + resEl.height / 2
            );
          }
        }
      }

      // 4. Draw Selection Highlights, Handles, and Badge if Selected
      if (isSelected) {
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(129, 140, 248, 0.5)';
        ctx.shadowBlur = 12;

        ctx.strokeRect(resEl.x - 1, resEl.y - 1, resEl.width + 2, resEl.height + 2);
        ctx.shadowColor = 'transparent';

        // Selection Tag Badge on Top-Left
        const badgeLabel = specEl.id.toUpperCase();
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const textMetrics = ctx.measureText(badgeLabel);
        const badgeW = textMetrics.width + 10;
        const badgeH = 16;

        ctx.fillStyle = '#6366f1';
        ctx.fillRect(resEl.x - 1, resEl.y - 17, badgeW, badgeH);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeLabel, resEl.x + 4, resEl.y - 9);

        // Corner Handles
        ctx.fillStyle = '#818cf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        const handleSize = 6;
        const corners = [
          { x: resEl.x - 3, y: resEl.y - 3 },
          { x: resEl.x + resEl.width - 3, y: resEl.y - 3 },
          { x: resEl.x - 3, y: resEl.y + resEl.height - 3 },
          { x: resEl.x + resEl.width - 3, y: resEl.y + resEl.height - 3 },
        ];

        corners.forEach((c) => {
          ctx.fillRect(c.x, c.y, handleSize, handleSize);
          ctx.strokeRect(c.x, c.y, handleSize, handleSize);
        });
      }

      ctx.restore();
    }
  };

  useEffect(() => {
    triggerCanvasRender();
  }, [layout, spec, selectedElementId, showSafeAreas]);

  // Click listener on canvas for interactive element selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * layout.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * layout.height;

    // Find clicked visible element (highest zIndex first)
    const visibleSorted = layout.elements
      .filter((e) => e.visible)
      .sort((a, b) => b.zIndex - a.zIndex);

    const hit = visibleSorted.find(
      (el) =>
        clickX >= el.x &&
        clickX <= el.x + el.width &&
        clickY >= el.y &&
        clickY <= el.y + el.height
    );

    if (hit) {
      onSelectElement?.(hit.id);
    }
  };

  return (
    <div
      style={{
        width: `${layout.width}px`,
        height: `${layout.height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          display: 'block',
        }}
      />
    </div>
  );
};
