import { describe, it, expect } from 'vitest';
import { overlaps, contains, clampToBounds, getIntersectionArea } from '../src/engine/geometry';
import { detectCollisions } from '../src/engine/collision';
import { Rect, ResolvedElement } from '../src/engine/types';

describe('Geometry & Collision System', () => {
  it('detects overlapping rectangles correctly', () => {
    const a: Rect = { x: 10, y: 10, width: 50, height: 50 };
    const b: Rect = { x: 40, y: 40, width: 50, height: 50 };
    const c: Rect = { x: 100, y: 100, width: 20, height: 20 };

    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(a, c)).toBe(false);
  });

  it('calculates exact intersection area between overlapping boxes', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 50, y: 50, width: 100, height: 100 };

    // Intersection is 50x50 = 2500
    expect(getIntersectionArea(a, b)).toBe(2500);
  });

  it('verifies boundary containment logic', () => {
    const bounds: Rect = { x: 0, y: 0, width: 300, height: 500 };
    const inside: Rect = { x: 20, y: 20, width: 100, height: 100 };
    const overflow: Rect = { x: 250, y: 20, width: 100, height: 100 };

    expect(contains(bounds, inside)).toBe(true);
    expect(contains(bounds, overflow)).toBe(false);
  });

  it('clamps out-of-bounds rectangles strictly into safe bounds', () => {
    const bounds: Rect = { x: 0, y: 0, width: 300, height: 500 };
    const overflow: Rect = { x: 250, y: -20, width: 100, height: 100 };

    const clamped = clampToBounds(overflow, bounds);
    expect(clamped.x).toBeLessThanOrEqual(bounds.width - clamped.width);
    expect(clamped.y).toBeGreaterThanOrEqual(0);
    expect(contains(bounds, clamped)).toBe(true);
  });

  it('detects collisions in element lists', () => {
    const bounds: Rect = { x: 0, y: 0, width: 320, height: 480 };
    const elements: ResolvedElement[] = [
      { id: 'el1', x: 20, y: 20, width: 100, height: 50, visible: true, zIndex: 1 },
      { id: 'el2', x: 30, y: 30, width: 100, height: 50, visible: true, zIndex: 2 },
    ];

    const report = detectCollisions(elements, bounds);
    expect(report.hasCollisions).toBe(true);
    expect(report.overlapCount).toBe(1);
    expect(report.collidingPairs).toEqual([['el1', 'el2']]);
  });
});
