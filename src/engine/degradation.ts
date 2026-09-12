import { AdSpec, ResolutionDecision } from './types';

export interface DegradationState {
  scaleFactor: number;
  spacingScale: number;
  hiddenIds: Set<string>;
  decisions: ResolutionDecision[];
  level: number;
}

export function createInitialDegradationState(): DegradationState {
  return {
    scaleFactor: 1.0,
    spacingScale: 1.0,
    hiddenIds: new Set<string>(),
    decisions: [],
    level: 0,
  };
}

export function applyNextDegradationStep(
  state: DegradationState,
  spec: AdSpec,
  stepNumber: number
): DegradationState {
  const nextHidden = new Set(state.hiddenIds);
  const decisions = [...state.decisions];
  let scaleFactor = state.scaleFactor;
  let spacingScale = state.spacingScale;
  const level = state.level + 1;

  switch (level) {
    case 1:
      // Step 1: Reduce spacing and margins slightly
      spacingScale = 0.75;
      decisions.push({
        step: stepNumber,
        category: 'degradation',
        action: 'Reduced element spacing',
        reason: 'Initial space constraint detected: reduced vertical gap padding to 75%.',
      });
      break;

    case 2:
      // Step 2: Scale element dimensions down to 85%
      scaleFactor = 0.85;
      spacingScale = 0.6;
      decisions.push({
        step: stepNumber,
        category: 'degradation',
        action: 'Scaled elements down to 85%',
        reason: 'Viewport constrained: reduced element dimensions and text font sizes.',
      });
      break;

    case 3:
      // Step 3: Hide lowest priority elements (Priority 3 - Logo/Branding)
      const p3Elements = spec.elements.filter((el) => el.priority === 3);
      for (const el of p3Elements) {
        if (!nextHidden.has(el.id)) {
          nextHidden.add(el.id);
          decisions.push({
            step: stepNumber,
            category: 'degradation',
            action: `Hidden optional element '${el.id}'`,
            reason: `Space pressure: hid Priority 3 optional element (${el.role}) to preserve core ad readability.`,
          });
        }
      }
      break;

    case 4:
      // Step 4: Scale down further to 70%
      scaleFactor = 0.7;
      spacingScale = 0.5;
      decisions.push({
        step: stepNumber,
        category: 'degradation',
        action: 'Scaled elements down to 70%',
        reason: 'Severe space constraint: scaled down visible elements to minimum sizing threshold.',
      });
      break;

    case 5:
      // Step 5: Hide Priority 2 secondary elements if necessary (e.g. secondary disclaimers/price)
      const p2Secondary = spec.elements.filter(
        (el) => el.priority === 2 && el.role === 'secondary'
      );
      for (const el of p2Secondary) {
        if (!nextHidden.has(el.id)) {
          nextHidden.add(el.id);
          decisions.push({
            step: stepNumber,
            category: 'degradation',
            action: `Hidden secondary element '${el.id}'`,
            reason: `Extreme constraint: hid Priority 2 secondary element to preserve critical headline and CTA.`,
          });
        }
      }
      break;

    default:
      // Maximum degradation reached
      decisions.push({
        step: stepNumber,
        category: 'degradation',
        action: 'Maximum degradation level reached',
        reason: 'Attempted all degradation steps; maintaining Priority 1 critical content.',
      });
      break;
  }

  return {
    scaleFactor,
    spacingScale,
    hiddenIds: nextHidden,
    decisions,
    level,
  };
}
