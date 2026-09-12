import {
  AdElement,
  SurfaceProfile,
  TextAdElement,
  ButtonAdElement,
  ImageAdElement,
  Rect,
} from './types';

export function calculateBaseFontSize(
  element: TextAdElement | ButtonAdElement,
  surface: SurfaceProfile,
  scaleFactor: number = 1.0
): number {
  const base = element.baseFontSize ?? (element.role === 'primary' ? 24 : element.role === 'action' ? 16 : 14);
  
  // Viewing distance multipliers
  let distanceMultiplier = 1.0;
  if (surface.viewingDistance === 'medium') distanceMultiplier = 1.25;
  if (surface.viewingDistance === 'far') distanceMultiplier = 1.75;

  const rawSize = Math.round(base * distanceMultiplier * scaleFactor);
  return Math.max(rawSize, surface.minTextSize);
}

import { measureTextReal } from './textMeasurement';

/**
 * Measures text element dimensions using HTML5 Canvas text measurement with line wrapping logic.
 */
export function estimateTextDimensions(
  element: TextAdElement,
  fontSize: number,
  availableWidth: number
): { width: number; height: number; fontSize: number } {
  const measured = measureTextReal(element, fontSize, availableWidth);
  return {
    width: measured.width,
    height: measured.height,
    fontSize,
  };
}

/**
 * Estimates button dimensions respecting surface minTapTarget.
 */
export function estimateButtonDimensions(
  element: ButtonAdElement,
  fontSize: number,
  surface: SurfaceProfile,
  availableWidth: number
): { width: number; height: number; fontSize: number } {
  const labelLength = element.label.length;
  const charWidth = fontSize * 0.6;
  const horizontalPadding = 32;

  const desiredWidth = Math.max(100, Math.ceil(labelLength * charWidth + horizontalPadding));
  const actualWidth = Math.min(availableWidth, desiredWidth);

  // Height must respect surface.minTapTarget if touch surface
  const desiredHeight = Math.round(fontSize * 1.6 + 12);
  const actualHeight = surface.touchOnly
    ? Math.max(desiredHeight, surface.minTapTarget)
    : desiredHeight;

  return {
    width: actualWidth,
    height: actualHeight,
    fontSize,
  };
}

/**
 * Calculates optimal image dimensions preserving aspect ratio within an available bounding box.
 */
export function estimateImageDimensions(
  element: ImageAdElement,
  availableBox: { width: number; height: number },
  scaleFactor: number = 1.0
): { width: number; height: number } {
  const targetAspect = element.aspectRatio > 0 ? element.aspectRatio : 1.0;
  
  let maxW = availableBox.width * scaleFactor;
  let maxH = availableBox.height * scaleFactor;

  if (element.role === 'branding') {
    maxW = Math.min(maxW, Math.round(48 * scaleFactor));
    maxH = Math.min(maxH, Math.round(48 * scaleFactor));
  } else {
    // Hero image capped to reasonable proportion of usable height (e.g. 40% of height)
    maxH = Math.min(maxH, availableBox.height * 0.4 * scaleFactor);
  }

  let targetWidth = maxW;
  let targetHeight = targetWidth / targetAspect;

  if (targetHeight > maxH) {
    targetHeight = maxH;
    targetWidth = targetHeight * targetAspect;
  }

  const finalWidth = Math.max(element.minWidth ?? 24, Math.round(targetWidth));
  const finalHeight = Math.max(element.minHeight ?? 24, Math.round(targetHeight));

  return {
    width: finalWidth,
    height: finalHeight,
  };
}

export function estimateElementDimensions(
  element: AdElement,
  surface: SurfaceProfile,
  availableBounds: Rect,
  scaleFactor: number = 1.0
): { width: number; height: number; fontSize?: number } {
  if (element.type === 'text') {
    const fontSize = calculateBaseFontSize(element, surface, scaleFactor);
    return estimateTextDimensions(element, fontSize, availableBounds.width);
  }

  if (element.type === 'button') {
    const fontSize = calculateBaseFontSize(element, surface, scaleFactor);
    return estimateButtonDimensions(element, fontSize, surface, availableBounds.width);
  }

  if (element.type === 'image') {
    return estimateImageDimensions(element, availableBounds, scaleFactor);
  }

  return { width: 100, height: 100 };
}
