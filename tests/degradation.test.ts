import { describe, it, expect } from 'vitest';
import { resolveLayout } from '../src/engine/resolver';
import { FLAM_SMART_GLASSES_AD } from '../src/data/adSpec';
import { TINY_MOBILE, MOBILE_PORTRAIT } from '../src/engine/surfaces';

describe('Priority Degradation Engine', () => {
  it('preserves all 5 elements on ample mobile portrait surface', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, MOBILE_PORTRAIT);
    expect(layout.valid).toBe(true);

    const visibleElements = layout.elements.filter((e) => e.visible);
    expect(visibleElements.length).toBe(5);

    const logo = layout.elements.find((e) => e.id === 'logo');
    expect(logo?.visible).toBe(true);
  });

  it('degrades optional Priority 3 logo first on tiny constrained surface (240x280)', () => {
    const layout = resolveLayout(FLAM_SMART_GLASSES_AD, TINY_MOBILE);

    // Critical Priority 1 elements MUST remain visible
    const headline = layout.elements.find((e) => e.id === 'headline');
    const product = layout.elements.find((e) => e.id === 'product');
    const cta = layout.elements.find((e) => e.id === 'cta');

    expect(headline?.visible).toBe(true);
    expect(product?.visible).toBe(true);
    expect(cta?.visible).toBe(true);

    // Optional Priority 3 logo should degrade / be hidden
    const logo = layout.elements.find((e) => e.id === 'logo');
    expect(logo?.visible).toBe(false);

    // Log decisions must record degradation action
    const degradationLog = layout.decisions.filter((d) => d.category === 'degradation');
    expect(degradationLog.length).toBeGreaterThan(0);
  });
});
