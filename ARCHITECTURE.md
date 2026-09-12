# System Architecture: Adaptive Layout Engine

This document outlines the detailed system architecture, module responsibilities, scoring formulas, degradation pipeline, and extension strategies of the **Adaptive Layout Engine for Multi-Surface Ads**.

---

## 1. Architectural Blueprint & Dependency Rule

A core requirement of the assignment is the strict separation between the constraint resolution engine and the visual rendering framework.

```text
┌──────────────────────────────────────────────────────────┐
│                      src/engine/                         │
│   Pure TypeScript (No React, No DOM, No CSS Engine)       │
│                                                          │
│  types.ts → spec.ts → surfaces.ts → geometry.ts           │
│    ↓          ↓          ↓              ↓                │
│  sizing.ts → placement.ts → collision.ts                 │
│    ↓          ↓                                          │
│  degradation.ts → scoring.ts → resolver.ts               │
└────────────────────────────┬─────────────────────────────┘
                             │ Returns ResolvedLayout
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     src/rendering/                       │
│    DomRenderer.tsx (Maps x, y, w, h to CSS absolute)     │
└────────────────────────────┬─────────────────────────────┘
                             │ Render Tree
                             ▼
┌──────────────────────────────────────────────────────────┐
│                     src/components/                      │
│   AdPreview, ElementInspector, ResolutionLog, Header     │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Module Responsibilities

| Module File | Purpose & Responsibilities |
| :--- | :--- |
| `src/engine/types.ts` | Defines data schemas (`AdElement`, `AdSpec`, `SurfaceProfile`, `ResolvedElement`, `ResolvedLayout`, `ResolutionDecision`). |
| `src/engine/spec.ts` | Builder function (`defineAd`) with runtime validation and priority sorting. |
| `src/engine/surfaces.ts` | Preset profiles (Mobile, Broadcast, Kiosk) and dynamic custom surface creator. |
| `src/engine/geometry.ts` | Pure geometric primitives (`overlaps`, `contains`, `clampToBounds`, `getIntersectionArea`, anchor positioning). |
| `src/engine/sizing.ts` | Font size scaling based on viewing distance multipliers, text box wrapped height estimation, button tap target scaling (`Math.max(desired, minTapTarget)`), image aspect ratio scaling. |
| `src/engine/placement.ts` | Strategy placement algorithms (`vertical`, `horizontal`, `split`, `overlay`, `compact`). |
| `src/engine/collision.ts` | Overlap detection and vertical nudge adjustment algorithm. |
| `src/engine/degradation.ts` | Priority degradation manager (Step 1: Spacing reduction → Step 2: Scale down → Step 3: Hide P3 → Step 4: Scale further → Step 5: Hide P2). |
| `src/engine/scoring.ts` | Multi-objective scoring function (0–100) evaluating bounds, overlaps, priority preservation, text/tap minimum compliance, and whitespace balance. |
| `src/engine/resolver.ts` | Main resolution pipeline orchestrator (`resolveLayout`). |

---

## 3. Resolution Algorithm Step-by-Step

```text
1. Receive (adSpec, surfaceProfile)
2. Usable Area = Surface Rect minus Safe Area Insets (Top, Right, Bottom, Left)
3. Calculate Aspect Ratio = Width / Height
4. Generate Candidate Compositions:
   - Aspect Ratio > 3.0   → ["compact", "horizontal"]
   - Aspect Ratio > 1.3   → ["horizontal", "split", "compact"]
   - Aspect Ratio < 0.75  → ["vertical", "overlay"]
   - Balanced / Square    → ["vertical", "split", "overlay", "horizontal"]
5. Loop over Candidate Compositions:
   a. Initialize Degradation State (scaleFactor=1.0, spacingScale=1.0, hiddenIds=[])
   b. Execute Placement Strategy → Place elements according to anchor rules
   c. Resolve Minor Collisions → Clamp to safe bounds, nudge overlapping elements
   d. Score Layout Candidate (0 - 100)
   e. If Score >= 75 and Valid → Lock candidate
   f. If Invalid or Score < 75 → Apply Next Degradation Step & Repeat (max 5 attempts)
6. Select Winner Candidate with Highest Valid Score
7. Compile Step-by-Step Decision Audit Trail (`decisions: ResolutionDecision[]`)
8. Return ResolvedLayout Data Structure
```

---

## 4. Multi-Factor Scoring Formula

Layout score $S \in [0, 100]$ is computed as:

$$S = S_{\text{bounds}} + S_{\text{collision}} + S_{\text{priority}} + S_{\text{compliance}} + S_{\text{fill}} + S_{\text{aspect\_bonus}}$$

1. **Bounds Score ($S_{\text{bounds}}$)**: Max 20 pts. 20 if all visible elements are strictly contained within usable safe area; minus 10 pts per clipped element.
2. **Collision Score ($S_{\text{collision}}$)**: Max 25 pts. 25 if zero overlaps exist; minus 15 pts per overlapping pair.
3. **Priority Preservation ($S_{\text{priority}}$)**: Max 25 pts.
   * Priority 1 (Critical): +12 pts per preserved element. If hidden: -40 pts penalty.
   * Priority 2 (Important): +8 pts per preserved element.
   * Priority 3 (Optional): +5 pts per preserved element.
4. **Compliance Score ($S_{\text{compliance}}$)**: Max 15 pts.
   * Text sizes >= `minTextSize`: +8 pts.
   * Touch targets >= `minTapTarget`: +7 pts.
5. **Fill Ratio Balance ($S_{\text{fill}}$)**: Max 15 pts. Ideal occupied area ratio between 25% and 80%.
6. **Aspect Match Bonus ($S_{\text{aspect\_bonus}}$)**: Up to +10 pts for optimal strategy pairing (e.g. compact on ultra-wide surface).

---

## 5. Arbitrary 5th Surface Support

The engine resolves any arbitrary surface (e.g. dynamic 500×700 surface or smartwatch 180×180 surface) without source code modifications because layout strategies evaluate:
* `surface.width` / `surface.height`
* `surface.safeArea`
* `surface.minTapTarget`
* `surface.minTextSize`
* `surface.viewingDistance`

No surface IDs are hardcoded in `resolver.ts`.
