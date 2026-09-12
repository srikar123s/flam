import { SurfaceProfile } from './types';

export const MOBILE_PORTRAIT: SurfaceProfile = {
  id: 'mobile-portrait',
  name: 'Mobile Portrait',
  width: 320,
  height: 480,
  safeArea: { top: 16, right: 16, bottom: 16, left: 16 },
  minTapTarget: 44,
  minTextSize: 14,
  viewingDistance: 'near',
  touchOnly: true,
};

export const MOBILE_LANDSCAPE: SurfaceProfile = {
  id: 'mobile-landscape',
  name: 'Mobile Landscape',
  width: 800,
  height: 400,
  safeArea: { top: 16, right: 24, bottom: 16, left: 24 },
  minTapTarget: 44,
  minTextSize: 14,
  viewingDistance: 'near',
  touchOnly: true,
};

export const BROADCAST_LOWER_THIRD: SurfaceProfile = {
  id: 'broadcast-lower-third',
  name: 'Broadcast Lower Third',
  width: 1920,
  height: 250,
  safeArea: { top: 20, right: 60, bottom: 20, left: 60 },
  minTapTarget: 0, // TV broadcast non-touch display
  minTextSize: 22, // Viewed from 8+ feet
  viewingDistance: 'far',
  touchOnly: false,
};

export const SQUARE_KIOSK: SurfaceProfile = {
  id: 'square-kiosk',
  name: 'Square Retail Kiosk',
  width: 1080,
  height: 1080,
  safeArea: { top: 40, right: 40, bottom: 40, left: 40 },
  minTapTarget: 60, // Kiosk touch target larger for standing users
  minTextSize: 18,
  viewingDistance: 'medium',
  touchOnly: true,
};

export const TINY_MOBILE: SurfaceProfile = {
  id: 'tiny-mobile',
  name: 'Tiny Mobile (Constraint Demo)',
  width: 240,
  height: 280,
  safeArea: { top: 10, right: 10, bottom: 10, left: 10 },
  minTapTarget: 36,
  minTextSize: 12,
  viewingDistance: 'near',
  touchOnly: true,
};

export const PRESET_SURFACES: SurfaceProfile[] = [
  MOBILE_PORTRAIT,
  MOBILE_LANDSCAPE,
  BROADCAST_LOWER_THIRD,
  SQUARE_KIOSK,
  TINY_MOBILE,
];

export function createCustomSurface(
  params: Partial<SurfaceProfile> & { width: number; height: number }
): SurfaceProfile {
  return {
    id: params.id ?? `custom-${Date.now()}`,
    name: params.name ?? `Custom (${params.width}×${params.height})`,
    width: params.width,
    height: params.height,
    safeArea: params.safeArea ?? { top: 16, right: 16, bottom: 16, left: 16 },
    minTapTarget: params.minTapTarget ?? 44,
    minTextSize: params.minTextSize ?? 14,
    viewingDistance: params.viewingDistance ?? 'near',
    touchOnly: params.touchOnly ?? true,
  };
}
