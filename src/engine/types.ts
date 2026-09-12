export type ElementType = 'text' | 'image' | 'button';

export type ElementRole = 'primary' | 'hero' | 'action' | 'secondary' | 'branding';

/**
 * Priority levels:
 * 1 = Critical (must remain visible, e.g. headline, product hero image)
 * 2 = Important (e.g. CTA button, price badge)
 * 3 = Optional (e.g. brand logo, secondary disclaimer)
 */
export type Priority = 1 | 2 | 3;

export type ViewingDistance = 'near' | 'medium' | 'far';

export interface BaseAdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: Priority;
  /** Optional custom aspect ratio for images/buttons (width / height) */
  aspectRatio?: number;
  /** Minimum desired width if scaled down */
  minWidth?: number;
  /** Minimum desired height if scaled down */
  minHeight?: number;
}

export interface TextAdElement extends BaseAdElement {
  type: 'text';
  content: string;
  /** Suggested base font size in px at standard 1x scale */
  baseFontSize?: number;
  fontWeight?: 'normal' | 'bold' | '500' | '600' | '700';
  color?: string;
}

export interface ImageAdElement extends BaseAdElement {
  type: 'image';
  src: string;
  alt: string;
  aspectRatio: number;
}

export interface ButtonAdElement extends BaseAdElement {
  type: 'button';
  label: string;
  baseFontSize?: number;
  backgroundColor?: string;
  textColor?: string;
}

export type AdElement = TextAdElement | ImageAdElement | ButtonAdElement;

export interface AdSpec {
  id: string;
  title: string;
  elements: AdElement[];
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  safeArea: SafeAreaInsets;
  minTapTarget: number;
  minTextSize: number;
  viewingDistance: ViewingDistance;
  touchOnly?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Anchor =
  | 'top'
  | 'center'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export type Composition =
  | 'vertical'
  | 'horizontal'
  | 'split'
  | 'overlay'
  | 'compact';

export interface ResolvedElement extends Rect {
  id: string;
  visible: boolean;
  zIndex: number;
  fontSize?: number;
  opacity?: number;
  reason?: string;
  truncated?: boolean;
}

export interface DecisionLogEntry {
  step: number;
  category: 'composition' | 'sizing' | 'placement' | 'degradation' | 'validation';
  action: string;
  reason: string;
}

export interface ResolutionDecision {
  step: number;
  category: 'composition' | 'sizing' | 'placement' | 'degradation' | 'validation';
  action: string;
  reason: string;
}

export interface ValidationMetrics {
  boundsPassed: boolean;
  collisionFree: boolean;
  tapTargetsPassed: boolean;
  textSizesPassed: boolean;
  overlapCount: number;
  clippedCount: number;
  hiddenCount: number;
}

export interface ResolvedLayout {
  surfaceId: string;
  surfaceName: string;
  width: number;
  height: number;
  elements: ResolvedElement[];
  valid: boolean;
  score: number;
  composition: Composition;
  warnings: string[];
  decisions: ResolutionDecision[];
  metrics: ValidationMetrics;
}
