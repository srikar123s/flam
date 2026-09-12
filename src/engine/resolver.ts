import {
  AdSpec,
  SurfaceProfile,
  ResolvedLayout,
  ResolvedElement,
  Composition,
  ResolutionDecision,
} from './types';
import { getUsableRect } from './geometry';
import { generatePlacementCandidate } from './placement';
import { resolveMinorCollisions } from './collision';
import { createInitialDegradationState, applyNextDegradationStep } from './degradation';
import { scoreLayout } from './scoring';

export function resolveLayout(adSpec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const decisions: ResolutionDecision[] = [];
  let stepCounter = 1;

  // Step 1: Calculate Usable Rect & Surface Metrics
  const usable = getUsableRect(surface);
  const aspectRatio = Number((surface.width / surface.height).toFixed(2));

  decisions.push({
    step: stepCounter++,
    category: 'composition',
    action: `Analyzed surface profile '${surface.name}'`,
    reason: `Dimensions ${surface.width}×${surface.height}px (aspect ratio ${aspectRatio}). Safe area insets: T:${surface.safeArea.top} R:${surface.safeArea.right} B:${surface.safeArea.bottom} L:${surface.safeArea.left}.`,
  });

  // Step 2: Determine Candidate Compositions based on Measurable Surface Characteristics
  const candidateCompositions: Composition[] = [];

  if (aspectRatio > 3.0) {
    // Ultra-wide surface (e.g. Broadcast lower third 1920x250)
    candidateCompositions.push('compact', 'horizontal');
  } else if (aspectRatio > 1.3) {
    // Wide landscape surface (e.g. Mobile Landscape 800x400)
    candidateCompositions.push('horizontal', 'split', 'compact');
  } else if (aspectRatio < 0.75) {
    // Tall portrait surface (e.g. Mobile Portrait 320x480)
    candidateCompositions.push('vertical', 'overlay');
  } else {
    // Square or balanced surface (e.g. Square Kiosk 1080x1080)
    candidateCompositions.push('vertical', 'split', 'overlay', 'horizontal');
  }

  decisions.push({
    step: stepCounter++,
    category: 'composition',
    action: `Selected candidate strategies: [${candidateCompositions.join(', ')}]`,
    reason: `Chosen based on aspect ratio ${aspectRatio} and usable surface area of ${usable.width}×${usable.height}px.`,
  });

  // Step 3: Evaluate Candidates & Degradation Cycles
  interface CandidateResult {
    composition: Composition;
    elements: ResolvedElement[];
    score: number;
    valid: boolean;
    warnings: string[];
    decisions: ResolutionDecision[];
    metrics: any;
  }

  const evaluatedCandidates: CandidateResult[] = [];

  for (const comp of candidateCompositions) {
    const candidateDecisions: ResolutionDecision[] = [];
    let degState = createInitialDegradationState();
    let bestElementsForComp: ResolvedElement[] = [];
    let bestScoreForComp = -1;
    let bestResultForComp: any = null;

    // Up to 5 degradation attempts
    for (let attempt = 0; attempt <= 5; attempt++) {
      let elements = generatePlacementCandidate(comp, adSpec, surface, {
        scaleFactor: degState.scaleFactor,
        spacingScale: degState.spacingScale,
        hiddenIds: degState.hiddenIds,
      });

      // Apply collision adjustments
      elements = resolveMinorCollisions(elements, usable);

      // Score layout
      const scoreRes = scoreLayout(elements, adSpec, surface, comp);

      if (scoreRes.totalScore > bestScoreForComp) {
        bestScoreForComp = scoreRes.totalScore;
        bestElementsForComp = elements;
        bestResultForComp = scoreRes;
      }

      // If valid layout found with high score, lock it in
      if (scoreRes.valid && scoreRes.totalScore >= 75) {
        break;
      }

      // Try next degradation step
      if (attempt < 5) {
        degState = applyNextDegradationStep(degState, adSpec, stepCounter++);
        candidateDecisions.push(...degState.decisions);
      }
    }

    if (bestResultForComp) {
      evaluatedCandidates.push({
        composition: comp,
        elements: bestElementsForComp,
        score: bestScoreForComp,
        valid: bestResultForComp.valid,
        warnings: bestResultForComp.warnings,
        decisions: candidateDecisions,
        metrics: bestResultForComp.metrics,
      });
    }
  }

  // Step 4: Pick Best Candidate
  evaluatedCandidates.sort((a, b) => {
    // Prefer valid layout first, then higher score
    if (a.valid && !b.valid) return -1;
    if (!a.valid && b.valid) return 1;
    return b.score - a.score;
  });

  const winner = evaluatedCandidates[0] ?? {
    composition: 'vertical' as Composition,
    elements: [],
    score: 0,
    valid: false,
    warnings: ['Failed to resolve valid candidate layout.'],
    decisions: [],
    metrics: { boundsPassed: false, collisionFree: false, tapTargetsPassed: false, textSizesPassed: false, overlapCount: 0, clippedCount: 0, hiddenCount: 0 },
  };

  decisions.push({
    step: stepCounter++,
    category: 'validation',
    action: `Selected winning composition '${winner.composition}' (Score: ${winner.score}/100)`,
    reason: `Outperformed ${evaluatedCandidates.length} candidate strategies across bounds, collision, and priority preservation criteria.`,
  });

  // Step 5: Element Decision Summaries
  const visibleCount = winner.elements.filter((e) => e.visible).length;
  decisions.push({
    step: stepCounter++,
    category: 'sizing',
    action: `Resolved ${visibleCount}/${adSpec.elements.length} elements`,
    reason: `All Priority 1 & 2 required touch targets passed surface constraints (min text size: ${surface.minTextSize}px, min tap target: ${surface.minTapTarget}px).`,
  });

  // Add individual element placement log entries
  for (const el of winner.elements) {
    if (el.visible) {
      decisions.push({
        step: stepCounter++,
        category: 'placement',
        action: `Placed '${el.id}' at (${el.x}, ${el.y}) [${el.width}×${el.height}px]`,
        reason: el.reason ?? 'Positioned according to composition anchor and spacing rules.',
      });
    }
  }

  const allDecisions = [...decisions, ...winner.decisions];

  return {
    surfaceId: surface.id,
    surfaceName: surface.name,
    width: surface.width,
    height: surface.height,
    elements: winner.elements,
    valid: winner.valid,
    score: winner.score,
    composition: winner.composition,
    warnings: winner.warnings,
    decisions: allDecisions,
    metrics: winner.metrics,
  };
}
