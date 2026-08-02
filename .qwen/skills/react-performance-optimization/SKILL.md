---
name: react-performance-optimization
description: Performance optimization patterns for React/TypeScript apps including lazy loading, code splitting, and build error resolution
source: auto-skill
extracted_at: '2026-08-02T14:17:09.435Z'
---

# React Performance Optimization Patterns

This skill documents the approach used to optimize a React + TypeScript application with Vite, focusing on lazy loading, code splitting, and resolving build-time issues.

## Problem Context

The application had:
- All page components imported eagerly at startup (LandingPage, DraftPage, ResultsPage, AnimeFeudGame, GuessWhoGame, PartyGame)
- No code splitting — large initial bundle size causing slow first paint
- Missing exports in utility modules causing build failures
- Inconsistent UI across pages

## Solution Approach

### 1. Route-Level Code Splitting with React.lazy() + Suspense

**Pattern:** Replace direct imports with dynamic `import()` wrapped in `React.lazy()`, then render inside `<Suspense>` with a loading fallback.

```tsx
// Before: eager imports
import { LandingPage } from './pages/LandingPage';
import { DraftPage } from './pages/DraftPage';
// ... all pages loaded at startup

// After: lazy imports
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DraftPage = lazy(() => import('./pages/DraftPage').then(m => ({ default: m.DraftPage })));
// ... other pages

// Wrapper with loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center nexus-card px-8 py-6">
      <div className="text-2xl font-bold text-white mb-2 animate-pulse">Loading…</div>
      <div className="h-1 w-40 mx-auto overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 bg-white/40 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

// In render:
<Suspense fallback={<PageLoader />}>
  {renderView()}
</Suspense>
```

**Key points:**
- Use `.then(m => ({ default: m.ComponentName }))` for named exports
- Use default import directly for default exports: `lazy(() => import('./Component'))`
- Wrap the entire view switch or individual routes in `<Suspense>`

### 2. Fixing Missing Module Exports

When build fails with "X is not exported by module Y", check the source file and add explicit exports:

```ts
// In audio.ts — add missing functions consumed by AudioContext
export function playSound(name: string) { /* ... */ }
export function stopMusic() { /* ... */ }
export function toggleMute(muted: boolean) { /* ... */ }
```

**Pattern:** Match the import signature exactly (name + arity). If the consumer calls `audioToggleMute(newValue)`, export `toggleMute(muted: boolean)`.

### 3. Consistent UI Across Pages

Create a reusable layout component (`StandardLayout`) that provides:
- Consistent gradient backgrounds using theme colors (nexus-blue, nexus-purple, nexus-cyan)
- Glass card styling (`.nexus-card` class from Tailwind config)
- Standard header/exit navigation pattern
- Hover animations and transforms on interactive elements

### 4. Rendering Optimizations

For heavy components (DraftPage with large character grids):
- Wrap expensive computations in `useMemo`
- Memoize event handlers with `useCallback`
- Use `React.memo` on child components that receive stable props

## When to Apply

- **Initial load is slow** → Add route-level `React.lazy()`
- **Bundle size warnings** → Code split by route or feature
- **Build fails on missing exports** → Audit utility modules for all consumed functions
- **UI inconsistency across pages** → Extract shared layout/component primitives

## Validation

Always run the full build after changes:
```bash
npm run build    # or npm run lint for TypeScript-only check
```

Verify:
- No TypeScript errors (`tsc --noEmit`)
- Vite produces separate chunks for each lazy route
- Loading fallback appears briefly on navigation
- All pages render correctly after lazy load