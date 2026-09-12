import {
  AdSpec,
  SurfaceProfile,
  ResolvedElement,
  Composition,
  Rect,
} from './types';
import { getUsableRect } from './geometry';
import { estimateElementDimensions } from './sizing';

export interface PlacementOptions {
  scaleFactor?: number;
  hiddenIds?: Set<string>;
  spacingScale?: number;
}

export function generatePlacementCandidate(
  composition: Composition,
  spec: AdSpec,
  surface: SurfaceProfile,
  options: PlacementOptions = {}
): ResolvedElement[] {
  const usable = getUsableRect(surface);
  const scale = options.scaleFactor ?? 1.0;
  const spacingScale = options.spacingScale ?? 1.0;
  const hiddenIds = options.hiddenIds ?? new Set<string>();

  const visibleElements = spec.elements.filter((el) => !hiddenIds.has(el.id));
  const hiddenElements = spec.elements.filter((el) => hiddenIds.has(el.id));

  let placed: ResolvedElement[] = [];

  switch (composition) {
    case 'compact':
      placed = placeCompact(visibleElements, surface, usable, scale, spacingScale);
      break;
    case 'horizontal':
    case 'split':
      placed = placeHorizontalOrSplit(
        visibleElements,
        surface,
        usable,
        composition,
        scale,
        spacingScale
      );
      break;
    case 'overlay':
      placed = placeOverlay(visibleElements, surface, usable, scale, spacingScale);
      break;
    case 'vertical':
    default:
      placed = placeVertical(visibleElements, surface, usable, scale, spacingScale);
      break;
  }

  // Include hidden elements with visible: false
  for (const hidden of hiddenElements) {
    placed.push({
      id: hidden.id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      visible: false,
      zIndex: 0,
      reason: `Hidden due to priority degradation under space constraint`,
    });
  }

  return placed;
}

function placeVertical(
  elements: AdSpec['elements'],
  surface: SurfaceProfile,
  usable: Rect,
  scale: number,
  spacingScale: number
): ResolvedElement[] {
  const result: ResolvedElement[] = [];
  const baseGap = Math.max(6, Math.round(12 * spacingScale));

  // Estimate total content height
  let currentY = usable.y;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const dims = estimateElementDimensions(el, surface, usable, scale);

    // Center horizontally within usable rect
    const width = Math.min(dims.width, usable.width);
    const x = usable.x + Math.round((usable.width - width) / 2);

    result.push({
      id: el.id,
      x,
      y: Math.round(currentY),
      width,
      height: dims.height,
      visible: true,
      zIndex: i + 1,
      fontSize: dims.fontSize,
      reason: `Placed vertically at index ${i}`,
    });

    currentY += dims.height + baseGap;
  }

  // Vertical alignment adjustments: if content height is less than usable height, center vertically
  const totalContentHeight = currentY - usable.y - baseGap;
  if (totalContentHeight < usable.height) {
    const yOffset = Math.round((usable.height - totalContentHeight) / 2);
    for (const item of result) {
      item.y += yOffset;
    }
  }

  return result;
}

function placeHorizontalOrSplit(
  elements: AdSpec['elements'],
  surface: SurfaceProfile,
  usable: Rect,
  composition: 'horizontal' | 'split',
  scale: number,
  spacingScale: number
): ResolvedElement[] {
  const result: ResolvedElement[] = [];

  const heroElement = elements.find((el) => el.role === 'hero');
  const otherElements = elements.filter((el) => el.role !== 'hero');

  const gap = Math.max(8, Math.round(16 * spacingScale));

  // Determine split ratio (e.g. 45% visual, 55% text content)
  const heroWidthRatio = composition === 'split' ? 0.48 : 0.42;
  const heroBoxWidth = Math.round(usable.width * heroWidthRatio);
  const contentBoxWidth = usable.width - heroBoxWidth - gap;

  // Hero section on Left
  let heroRect: ResolvedElement | null = null;
  if (heroElement) {
    const heroDims = estimateElementDimensions(
      heroElement,
      surface,
      { x: usable.x, y: usable.y, width: heroBoxWidth, height: usable.height },
      scale
    );

    const x = usable.x;
    const y = usable.y + Math.round((usable.height - heroDims.height) / 2);

    heroRect = {
      id: heroElement.id,
      x,
      y,
      width: Math.min(heroDims.width, heroBoxWidth),
      height: Math.min(heroDims.height, usable.height),
      visible: true,
      zIndex: 2,
      reason: 'Hero image placed on left side of horizontal layout',
    };
    result.push(heroRect);
  }

  // Content stack on Right
  const contentX = usable.x + heroBoxWidth + gap;
  const contentBounds: Rect = {
    x: contentX,
    y: usable.y,
    width: contentBoxWidth,
    height: usable.height,
  };

  let currentY = contentBounds.y;
  for (let i = 0; i < otherElements.length; i++) {
    const el = otherElements[i];
    const dims = estimateElementDimensions(el, surface, contentBounds, scale);

    const width = Math.min(dims.width, contentBounds.width);
    const x = contentBounds.x;

    result.push({
      id: el.id,
      x,
      y: Math.round(currentY),
      width,
      height: dims.height,
      visible: true,
      zIndex: i + 3,
      fontSize: dims.fontSize,
      reason: `Content element ${el.id} placed in right column`,
    });

    currentY += dims.height + Math.max(4, Math.round(8 * spacingScale));
  }

  // Center vertical stack on right if extra vertical space
  const totalStackHeight = currentY - contentBounds.y;
  if (totalStackHeight < usable.height) {
    const yOffset = Math.round((usable.height - totalStackHeight) / 2);
    for (const item of result) {
      if (item.id !== heroElement?.id) {
        item.y += yOffset;
      }
    }
  }

  return result;
}

function placeCompact(
  elements: AdSpec['elements'],
  surface: SurfaceProfile,
  usable: Rect,
  scale: number,
  spacingScale: number
): ResolvedElement[] {
  const result: ResolvedElement[] = [];

  // Ultra-wide inline horizontal bar layout (Broadcast lower third style)
  const gap = Math.max(12, Math.round(24 * spacingScale));
  let currentX = usable.x;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const dims = estimateElementDimensions(el, surface, usable, scale);

    const height = Math.min(dims.height, usable.height);
    const y = usable.y + Math.round((usable.height - height) / 2);

    result.push({
      id: el.id,
      x: Math.round(currentX),
      y,
      width: dims.width,
      height,
      visible: true,
      zIndex: i + 1,
      fontSize: dims.fontSize,
      reason: `Compact linear placement at index ${i}`,
    });

    currentX += dims.width + gap;
  }

  return result;
}

function placeOverlay(
  elements: AdSpec['elements'],
  surface: SurfaceProfile,
  usable: Rect,
  scale: number,
  spacingScale: number
): ResolvedElement[] {
  const result: ResolvedElement[] = [];

  const heroElement = elements.find((el) => el.role === 'hero');
  const otherElements = elements.filter((el) => el.role !== 'hero');

  // Background Hero Image fills full/partial container
  if (heroElement) {
    result.push({
      id: heroElement.id,
      x: usable.x,
      y: usable.y,
      width: usable.width,
      height: Math.round(usable.height * 0.55),
      visible: true,
      zIndex: 1,
      reason: 'Hero visual placed as top background card in overlay composition',
    });
  }

  // Stack foreground content below or overlapping bottom edge of hero
  const contentYStart = heroElement
    ? usable.y + Math.round(usable.height * 0.45)
    : usable.y;

  let currentY = contentYStart;
  const baseGap = Math.max(4, Math.round(10 * spacingScale));

  for (let i = 0; i < otherElements.length; i++) {
    const el = otherElements[i];
    const dims = estimateElementDimensions(el, surface, usable, scale);

    const width = Math.min(dims.width, usable.width - 24);
    const x = usable.x + Math.round((usable.width - width) / 2);

    result.push({
      id: el.id,
      x,
      y: Math.round(currentY),
      width,
      height: dims.height,
      visible: true,
      zIndex: i + 5, // Higher zIndex above hero
      fontSize: dims.fontSize,
      reason: `Overlay foreground element ${el.id} stacked over hero background`,
    });

    currentY += dims.height + baseGap;
  }

  return result;
}
