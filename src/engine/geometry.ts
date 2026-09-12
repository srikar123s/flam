import { Rect, SurfaceProfile, Anchor } from './types';

export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export function clampToBounds(rect: Rect, bounds: Rect): Rect {
  const width = Math.min(rect.width, bounds.width);
  const height = Math.min(rect.height, bounds.height);

  let x = rect.x;
  let y = rect.y;

  if (x < bounds.x) x = bounds.x;
  if (y < bounds.y) y = bounds.y;
  if (x + width > bounds.x + bounds.width) x = bounds.x + bounds.width - width;
  if (y + height > bounds.y + bounds.height) y = bounds.y + bounds.height - height;

  return { x, y, width, height };
}

export function getIntersectionArea(a: Rect, b: Rect): number {
  const overlapWidth = Math.max(
    0,
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  );
  const overlapHeight = Math.max(
    0,
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  );
  return overlapWidth * overlapHeight;
}

export function getUsableRect(surface: SurfaceProfile): Rect {
  const { width, height, safeArea } = surface;
  return {
    x: safeArea.left,
    y: safeArea.top,
    width: Math.max(1, width - safeArea.left - safeArea.right),
    height: Math.max(1, height - safeArea.top - safeArea.bottom),
  };
}

export function calculateAnchorPoint(
  rectWidth: number,
  rectHeight: number,
  bounds: Rect,
  anchor: Anchor,
  margin: number = 0
): { x: number; y: number } {
  const { x: bx, y: by, width: bw, height: bh } = bounds;

  let x = bx + (bw - rectWidth) / 2;
  let y = by + (bh - rectHeight) / 2;

  switch (anchor) {
    case 'top':
      y = by + margin;
      break;
    case 'bottom':
      y = by + bh - rectHeight - margin;
      break;
    case 'left':
      x = bx + margin;
      break;
    case 'right':
      x = bx + bw - rectWidth - margin;
      break;
    case 'topLeft':
      x = bx + margin;
      y = by + margin;
      break;
    case 'topRight':
      x = bx + bw - rectWidth - margin;
      y = by + margin;
      break;
    case 'bottomLeft':
      x = bx + margin;
      y = by + bh - rectHeight - margin;
      break;
    case 'bottomRight':
      x = bx + bw - rectWidth - margin;
      y = by + bh - rectHeight - margin;
      break;
    case 'center':
    default:
      // Default is centered
      break;
  }

  return { x, y };
}
