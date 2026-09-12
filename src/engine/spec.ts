import { AdSpec, AdElement } from './types';

export function defineAd(config: { id?: string; title?: string; elements: AdElement[] }): AdSpec {
  // Validate that elements have unique IDs
  const ids = new Set<string>();
  for (const el of config.elements) {
    if (ids.has(el.id)) {
      throw new Error(`Duplicate element ID '${el.id}' in AdSpec`);
    }
    ids.add(el.id);
  }

  // Sort elements by priority ascending (Priority 1 first, then 2, then 3)
  const sortedElements = [...config.elements].sort((a, b) => a.priority - b.priority);

  return {
    id: config.id ?? 'default-ad-spec',
    title: config.title ?? 'Adaptive Ad Campaign',
    elements: sortedElements,
  };
}

export function getElementByRole(spec: AdSpec, role: AdElement['role']): AdElement | undefined {
  return spec.elements.find((el) => el.role === role);
}

export function getElementsByPriority(spec: AdSpec, priority: AdElement['priority']): AdElement[] {
  return spec.elements.filter((el) => el.priority === priority);
}
