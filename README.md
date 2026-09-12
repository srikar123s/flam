# Adaptive Layout Engine for Multi-Surface Ads

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-6366f1?style=for-the-badge&logo=vercel)](https://adaptive-layout-engine-lovat.vercel.app/)

👉 **Live Demo**: [https://adaptive-layout-engine-lovat.vercel.app/](https://adaptive-layout-engine-lovat.vercel.app/)

A production-quality, framework-agnostic **TypeScript Constraint Resolution Engine** that takes a single declarative ad specification and dynamically adapts it across arbitrary display surfaces (Mobile Portrait, Mobile Landscape, Broadcast Lower Third, Square Retail Kiosk, and custom surfaces) using real geometric math, priority degradation, and candidate scoring.

![Adaptive Layout Engine](https://raw.githubusercontent.com/flam-ad-tech/adaptive-engine/main/docs/preview.png)

---

## 🌟 Key Features

* **Framework-Agnostic Engine**: Zero dependency on React or CSS primitives in `src/engine/`. All layout positioning, sizing, collision detection, and degradation are pure TypeScript.
* **No Surface-Name Branching**: Resolves layout based on measurable surface parameters (aspect ratio, usable bounds, viewing distance, safe area insets, min text size, min tap target) rather than `if (surface === 'mobile')`.
* **Zero CSS Layout Engine**: CSS is strictly used to render the resolved absolute coordinates (`x`, `y`, `width`, `height`). No CSS media queries or grid/flexbox positioning logic inside the renderer.
* **Priority Degradation Pipeline**: Priority 1 (Headline, Hero visual) and Priority 2 (CTA, Price) elements are preserved, while lower-priority Priority 3 (Logo/Branding) elements scale down or gracefully degrade under tight spatial constraints.
* **Interactive Custom Surface Support**: Supports arbitrary 5th/Custom surfaces defined at runtime without source code modifications.
* **Step-by-Step Resolution Audit Log**: Provides a detailed decision log explaining composition choice, degradation steps, tap target checks, and scoring metrics.
* **Comprehensive Vitest Suite**: Fully tested with Vitest covering rectangle collision math, boundary clamping, priority degradation, and multi-surface validation.

---

## 📐 Supported Surface Constraints

| Surface Profile | Dimensions | Safe Area (T/R/B/L) | Min Tap Target | Min Text Size | Viewing Distance | Primary Composition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile Portrait** | 320 × 480 | 16 / 16 / 16 / 16 | 44px | 14px | Near (1.0x) | Vertical / Overlay |
| **Mobile Landscape** | 800 × 400 | 16 / 24 / 16 / 24 | 44px | 14px | Near (1.0x) | Horizontal / Split |
| **Broadcast Lower Third** | 1920 × 250 | 20 / 60 / 20 / 60 | 0px (Non-touch) | 22px | Far (1.75x) | Compact Linear |
| **Square Retail Kiosk** | 1080 × 1080 | 40 / 40 / 40 / 40 | 60px | 18px | Medium (1.25x) | Split / Vertical |
| **Tiny Mobile (Demo)** | 240 × 280 | 10 / 10 / 10 / 10 | 36px | 12px | Near (1.0x) | Vertical Degraded |
| **Custom Surface** | User Specified | User Specified | User Specified | User Specified | Dynamic | Dynamically Evaluated |

---

## 🏗️ Architecture

```text
Ad Specification (Declarative content + priorities)
        ↓
Surface Profile (Dimensions, safe area, viewing distance, constraints)
        ↓
Constraint Resolver (src/engine/resolver.ts)
  ├─ 1. Surface Analysis & Safe Rect Calculation
  ├─ 2. Composition Candidate Generation (Vertical, Horizontal, Split, Overlay, Compact)
  ├─ 3. Dynamic Element Sizing & Anchor Placement
  ├─ 4. Collision Detection & Boundary Clamping
  ├─ 5. Priority-Based Degradation (P3 → P2 → P1 size reduction / hide)
  ├─ 6. Multi-Factor Candidate Scoring & Selection (0 - 100)
  └─ 7. Final Validation & Decision Audit Log
        ↓
ResolvedLayout (x, y, width, height, visible, fontSize, zIndex, opacity, decisions)
        ↓
DomRenderer / React UI (Absolute CSS positioning using left: x, top: y, width: w, height: h)
```

---

## 🛠️ Tech Stack

* **Language**: Strict TypeScript 5+ (`strict: true`)
* **UI Layer**: React 18
* **Build System**: Vite 5
* **Test Runner**: Vitest
* **Icons**: Lucide React
* **Styling**: Modern CSS (Vanilla design system)

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run engine unit tests
npm test

# Build for production
npm run build
```

---

## 🧪 Testing Summary

The test suite in `tests/` validates core constraint solver behaviors:
* `collision.test.ts`: Rectangle intersection math, containment, boundary clamping, collision pair reports.
* `degradation.test.ts`: Priority 3 logo degradation under extreme space pressure while preserving Priority 1 headline and hero visual.
* `resolver.test.ts`: Adaptation across Mobile Portrait, Mobile Landscape, Broadcast Lower Third, Square Kiosk, Tiny Mobile, and arbitrary dynamic custom surfaces.

---

## 🤖 AI Disclosure

AI assistance was utilized during architecture planning, test edge case design, and documentation generation. All core algorithm implementations, constraint scoring logic, geometric calculations, and TypeScript types were thoroughly verified and tested.

## ⏱️ Time Spent

Approximately 5.5 hours dedicated to requirement analysis, engine design, algorithm development, test suite execution, UI visualization, and technical documentation.
