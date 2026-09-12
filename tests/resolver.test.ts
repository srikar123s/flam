import { describe, it, expect } from 'vitest';
import { resolveLayout } from '../src/engine/resolver';
import { FLAM_SMART_GLASSES_AD } from '../src/data/adSpec';
import {
  MOBILE_PORTRAIT,
  MOBILE_LANDSCAPE,
  BROADCAST_LOWER_THIRD,
  SQUARE_KIOSK,
  createCustomSurface,
} from '../src/engine/surfaces';

describe('Adaptive Constraint Resolver', () => {
  it('resolves valid layout for Mobile Portrait surface (320x480)', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, MOBILE_PORTRAIT);
    expect(layout.valid).toBe(true);
    expect(layout.score).toBeGreaterThanOrEqual(75);
    expect(layout.composition).toBe('vertical');
    expect(layout.metrics.overlapCount).toBe(0);
    expect(layout.metrics.clippedCount).toBe(0);
  });

  it('resolves horizontal/split composition for Mobile Landscape surface (800x400)', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, MOBILE_LANDSCAPE);
    expect(layout.valid).toBe(true);
    expect(layout.score).toBeGreaterThanOrEqual(75);
    expect(['horizontal', 'split', 'compact']).toContain(layout.composition);
    expect(layout.metrics.overlapCount).toBe(0);
  });

  it('resolves compact linear layout for Broadcast Lower Third (1920x250)', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, BROADCAST_LOWER_THIRD);
    expect(layout.valid).toBe(true);
    expect(layout.composition).toBe('compact');
    expect(layout.metrics.overlapCount).toBe(0);

    // Far viewing distance minimum text size (22px) must be enforced
    const headline = layout.elements.find((e) => e.id === 'headline');
    expect(headline?.fontSize).toBeGreaterThanOrEqual(BROADCAST_LOWER_THIRD.minTextSize);
  });

  it('resolves balanced layout for Square Retail Kiosk (1080x1080)', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, SQUARE_KIOSK);
    expect(layout.valid).toBe(true);
    expect(layout.score).toBeGreaterThanOrEqual(80);

    // Touch target minimum (60px) must be respected for CTA button
    const cta = layout.elements.find((e) => e.id === 'cta');
    expect(cta?.height).toBeGreaterThanOrEqual(SQUARE_KIOSK.minTapTarget);
  });

  it('resolves arbitrary unknown 5th Custom Surface (500x700) without engine code changes', () => {
    const customSurface = createCustomSurface({
      width: 500,
      height: 700,
      minTapTarget: 48,
      minTextSize: 16,
    });

    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, customSurface);
    expect(layout.valid).toBe(true);
    expect(layout.score).toBeGreaterThan(70);
    expect(layout.elements.length).toBe(FLAM_SMART_GLASSES_AD.elements.length);
    expect(layout.metrics.overlapCount).toBe(0);
  });

  it('ensures zero invalid layout outputs across all preset surfaces', () => {
    const surfaces = [MOBILE_PORTRAIT, MOBILE_LANDSCAPE, BROADCAST_LOWER_THIRD, SQUARE_KIOSK];
    for (const s of surfaces) {
      const layout = resolveLayout(FLAM_SMART_GLASSES_AD, s);
      expect(layout.valid).toBe(true);
    }
  });
});
