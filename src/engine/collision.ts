import { ResolvedElement, Rect } from './types';
import { overlaps, getIntersectionArea, clampToBounds, contains } from './geometry';

export interface CollisionReport {
  hasCollisions: boolean;
  overlapCount: number;
  totalOverlapArea: number;
  outOfBoundsCount: number;
  collidingPairs: Array<[string, string]>;
}

export function detectCollisions(
  elements: ResolvedElement[],
  bounds: Rect
): CollisionReport {
  const visible = elements.filter((el) => el.visible);
  let overlapCount = 0;
  let totalOverlapArea = 0;
  let outOfBoundsCount = 0;
  const collidingPairs: Array<[string, string]> = [];

  // Check out of bounds
  for (const el of visible) {
    if (!contains(bounds, el)) {
      outOfBoundsCount++;
    }
  }

  // Check element pairs for overlap (excluding hero background in overlay mode if zIndex differs significantly)
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i];
      const b = visible[j];

      if (overlaps(a, b)) {
        overlapCount++;
        const area = getIntersectionArea(a, b);
        totalOverlapArea += area;
        collidingPairs.push([a.id, b.id]);
      }
    }
  }

  return {
    hasCollisions: overlapCount > 0 || outOfBoundsCount > 0,
    overlapCount,
    totalOverlapArea,
    outOfBoundsCount,
    collidingPairs,
  };
}

/**
 * Attempts to resolve minor collisions by shifting elements vertically down or clamping to safe bounds.
 */
export function resolveMinorCollisions(
  elements: ResolvedElement[],
  bounds: Rect
): ResolvedElement[] {
  const result = elements.map((el) => ({ ...el }));
  const visible = result.filter((el) => el.visible);

  // 1. First clamp all elements to bounds
  for (const el of visible) {
    const clamped = clampToBounds(el, bounds);
    el.x = clamped.x;
    el.y = clamped.y;
    el.width = clamped.width;
    el.height = clamped.height;
  }

  // 2. Sort visible elements by Y position
  visible.sort((a, b) => a.y - b.y);

  // 3. Nudge overlapping elements downwards
  const gap = 8;
  for (let i = 0; i < visible.length - 1; i++) {
    const current = visible[i];
    const next = visible[i + 1];

    if (overlaps(current, next)) {
      const neededY = current.y + current.height + gap;
      if (neededY + next.height <= bounds.y + bounds.height) {
        next.y = neededY;
      }
    }
  }

  return result;
}
