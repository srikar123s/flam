import {
  AdSpec,
  SurfaceProfile,
  ResolvedElement,
  Composition,
  ValidationMetrics,
} from './types';
import { getUsableRect, contains, overlaps } from './geometry';

export interface LayoutScoreResult {
  totalScore: number;
  valid: boolean;
  warnings: string[];
  metrics: ValidationMetrics;
}

export function scoreLayout(
  elements: ResolvedElement[],
  spec: AdSpec,
  surface: SurfaceProfile,
  composition: Composition
): LayoutScoreResult {
  const usable = getUsableRect(surface);
  const warnings: string[] = [];
  const visibleElements = elements.filter((el) => el.visible);

  let score = 0;

  // 1. Boundary Compliance (Max 20 pts)
  let clippedCount = 0;
  for (const el of visibleElements) {
    if (!contains(usable, el)) {
      clippedCount++;
      warnings.push(`Element '${el.id}' extends outside safe area.`);
    }
  }

  const boundsPassed = clippedCount === 0;
  if (boundsPassed) {
    score += 20;
  } else {
    score += Math.max(0, 20 - clippedCount * 10);
  }

  // 2. Collision / Overlap Compliance (Max 25 pts)
  let overlapCount = 0;
  for (let i = 0; i < visibleElements.length; i++) {
    for (let j = i + 1; j < visibleElements.length; j++) {
      const a = visibleElements[i];
      const b = visibleElements[j];

      // Exclude overlay hero image from collision check with higher zIndex content
      const isHeroOverlayPair =
        composition === 'overlay' &&
        (a.id === 'product' || b.id === 'product') &&
        Math.abs(a.zIndex - b.zIndex) >= 3;

      if (!isHeroOverlayPair && overlaps(a, b)) {
        overlapCount++;
        warnings.push(`Overlap detected between '${a.id}' and '${b.id}'.`);
      }
    }
  }

  const collisionFree = overlapCount === 0;
  if (collisionFree) {
    score += 25;
  } else {
    score -= overlapCount * 15;
  }

  // 3. Priority Preservation Score (Max 25 pts)
  let hiddenCount = 0;
  for (const specEl of spec.elements) {
    const resEl = elements.find((el) => el.id === specEl.id);
    if (!resEl || !resEl.visible) {
      hiddenCount++;
      if (specEl.priority === 1) {
        warnings.push(`CRITICAL: Priority 1 element '${specEl.id}' is hidden.`);
        score -= 40;
      } else if (specEl.priority === 2) {
        warnings.push(`Important Priority 2 element '${specEl.id}' was dropped.`);
        score += 5; // Partial preservation
      } else {
        score += 15; // P1 preserved, P3 gracefully degraded
      }
    } else {
      if (specEl.priority === 1) score += 12;
      if (specEl.priority === 2) score += 8;
      if (specEl.priority === 3) score += 5;
    }
  }

  // 4. Minimum Text Size & Tap Target Compliance (Max 15 pts)
  let textSizesPassed = true;
  let tapTargetsPassed = true;

  for (const el of visibleElements) {
    const specEl = spec.elements.find((s) => s.id === el.id);

    if (specEl?.type === 'text' && el.fontSize) {
      if (el.fontSize < surface.minTextSize) {
        textSizesPassed = false;
        warnings.push(
          `Text '${el.id}' font size (${el.fontSize}px) is below surface minimum (${surface.minTextSize}px).`
        );
      }
    }

    if (specEl?.type === 'button' && surface.touchOnly) {
      if (el.height < surface.minTapTarget) {
        tapTargetsPassed = false;
        warnings.push(
          `Button '${el.id}' height (${el.height}px) is below touch minimum (${surface.minTapTarget}px).`
        );
      }
    }
  }

  if (textSizesPassed) score += 8;
  if (tapTargetsPassed) score += 7;

  // 5. Space Utilization & Whitespace Balance (Max 15 pts)
  const totalUsableArea = usable.width * usable.height;
  const occupiedArea = visibleElements.reduce((acc, el) => acc + el.width * el.height, 0);
  const fillRatio = occupiedArea / totalUsableArea;

  // Ideal fill ratio between 30% and 75%
  if (fillRatio >= 0.25 && fillRatio <= 0.8) {
    score += 15;
  } else if (fillRatio < 0.25) {
    score += 8; // Sparse
  } else {
    score += 5; // Crowded
  }

  // 6. Composition Fit Bonus
  const aspectRatio = surface.width / surface.height;
  if (aspectRatio < 0.8 && composition === 'vertical') score += 5;
  if (aspectRatio > 1.4 && composition === 'horizontal') score += 5;
  if (aspectRatio > 3.0 && composition === 'compact') score += 10;
  if (aspectRatio >= 0.8 && aspectRatio <= 1.2 && (composition === 'split' || composition === 'vertical')) score += 5;

  const valid = boundsPassed && collisionFree && textSizesPassed && tapTargetsPassed;
  const totalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    totalScore,
    valid,
    warnings,
    metrics: {
      boundsPassed,
      collisionFree,
      tapTargetsPassed,
      textSizesPassed,
      overlapCount,
      clippedCount,
      hiddenCount,
    },
  };
}
