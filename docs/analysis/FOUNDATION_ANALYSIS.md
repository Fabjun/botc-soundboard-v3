# Foundation Analysis — Pass 1: Codebase Map + Prioritized Problem Areas

**Date:** 2026-06-05
**Status:** Living document — Pass 1 complete. Deep-dive passes TBD.
**Scope:** Living v3 code under `v3/` and repo-wide tooling/docs machinery. `v1-reference/` and `SoS_DESIGN_25052026/` are out of scope for health assessment (read-only reference/archive).
**Context:** Analysis triggered immediately after Session 3 (CSS class discipline migration, 177 Path-D violations → 0) and after ADR-0045 (two-axis adaptive model). Slices 1–4 complete; Slices 5–8 pending.

---

## Table of Contents

1. [Prioritized Executive Summary](#1-prioritized-executive-summary)
2. [Codebase Map](#2-codebase-map)
   - [Module Overview](#21-module-overview)
   - [Dependency / Coupling Sketch](#22-dependency--coupling-sketch)
3. [Per-Area First-Pass Findings](#3-per-area-first-pass-findings)
   - [Data Layer — Types + IDB](#31-data-layer--types--idb)
   - [State Layer — Preact Signals Store](#32-state-layer--preact-signals-store)
   - [Audio Engine](#33-audio-engine)
   - [Screens](#34-screens)
   - [Components](#35-components)
   - [Styling — tokens.css + global.css](#36-styling--tokenscss--globalcss)
   - [Lib Utilities](#37-lib-utilities)
   - [Build + Tooling](#38-build--tooling)
   - [Tests](#39-tests)
   - [Docs + ADRs](#310-docs--adrs)
4. [Cross-Cutting Observations](#4-cross-cutting-observations)
5. [Recommended Deep-Dive Passes](#5-recommended-deep-dive-passes)

---

## 1. Prioritized Executive Summary

Findings tagged: **FH** = foundation health (architecture/risk) | **AR** = adaptive readiness (ADR-0045)
Severity: **CRITICAL** | **IMPORTANT** | **COSMETIC**

---

### F1 — BoardScreen 3-column layout is hard-coded desktop geometry, incompatible with narrow viewports  `FH + AR` `CRITICAL`

**What:** The board's core layout is three flex columns: SceneRail (`width: 220px; flex-shrink: 0`) + center (`flex: 1`) + right panel (`width: 280px; flex-shrink: 0`). No CSS `@media` queries override these fixed widths at any breakpoint.

**Why it matters:** At 390 px viewport width (iPhone target): SceneRail alone consumes 56 % of the viewport (~220 px / 390 px). If any right panel is also open (PadEditorPanel or LibraryPanel: 280 px), the center column (flex: 1) compresses to **negative** available width (390 − 220 − 280 = −110 px). This is acknowledged in a code comment (`BoardScreen.tsx:386`—"On 390px, SceneRail (220px) + a 280px placeholder would squeeze the grid to 0px"), which is why the empty-panel placeholder was removed. But the structural problem remains: even with only SceneRail visible, the pad grid has ~170 px → 4-column cells at ~33 px each, below the 44 px iOS touch minimum.

**Location:** `v3/src/styles/tokens.css` (`.sb-scene-rail`, `.sb-pad-editor`, `.sb-library-panel`) + `v3/src/screens/BoardScreen.tsx`.

**Distinction from planned work:** The *solution* (collapsible SceneRail, overlay panels) is deferred to Slice 8. The *problem* (incompatible fixed widths with no defensive floor) is a current foundation gap, not just unfinished work. At 390 px today, pads are reachable only because the right panel is absent; the layout breaks the instant any panel opens.

---

### F2 — Zero adaptive CSS in the living app: no `@media` breakpoints, no responsive layout pivots  `FH + AR` `CRITICAL`

**What:** The app's CSS layers (`global.css` + `tokens.css`) contain exactly **one** `@media` query: `(prefers-reduced-motion: reduce)` for the spark animation. No layout breakpoints, no viewport-width pivots, no axis-1 responsive wiring. The `is-compact` modifier for ModeToggle exists as a CSS class, but it is applied via a `compact` prop passed by the parent (`BoardTopBarV3`) — whether that parent calculates the viewport width is unverified.

**Why it matters:** ADR-0045 says Axis 1 (screen-format layout) is the responsive axis driven by CSS breakpoints. The breakpoints are explicitly "to be determined empirically." Fine — but right now there is *no* breakpoint infrastructure at all. When the adaptive work begins, every layout pivot will be a new addition, with no foundation to extend. The gap is larger than it looks: the first breakpoint also needs to define the layout semantics (bottom-bar vs. side-rail, collapsible SceneRail, overlay panels), not just a single value to tune.

**Location:** All of `v3/src/styles/`. Also: `v3/src/components/ModeToggle.tsx` (accepts `compact` prop) + `v3/src/components/BoardTopBarV3.tsx` (unread — how `compact` is determined needs verification).

---

### F3 — C10 is "resolved" as a design decision but NOT in code: overflow-hidden grid silently clips excess pads  `FH` `IMPORTANT`

**What:** BACKLOG.md C10 ("Variable grid, gap-preserving reflow") is marked "STATUS: RESOLVED" because the design decision was made. But the code has not changed: `.sb-board-main` has `overflow: hidden`, and `.sb-pad-grid` has no scroll mechanism. Any board with more than `cols × rows` pads silently clips them behind `overflow: hidden` — unreachable with no visual indication.

**Why it matters:** C10's own starting-situation text calls this "excess pads silently disappear behind `overflow: hidden`, unreachable and without any indication." That description is still true in code today. New users creating boards with > 16 pads would hit this immediately. The "RESOLVED" status in BACKLOG refers to the *design* resolution, not the *code* resolution — a doc-vs-code gap that could mislead future readers into thinking the issue is closed.

**Location:** `v3/src/styles/tokens.css` (`.sb-board-main: overflow: hidden`) + `BACKLOG.md §C10`.

---

### F4 — V3_CONCEPT_BRIEF.md §4.10 and §6 contradict ADR-0045  `FH` `IMPORTANT` (doc-vs-code drift)

**What:** `V3_CONCEPT_BRIEF.md §4.10` states "Desktop and tablet are primary targets. Mobile works but isn't specifically optimized in V3.0 (touch-first variant comes later)." §6 "Out of scope for V3.0" includes "Mobile-specific UI variant (later)." Both directly contradict ADR-0045 ("ONE adaptive application — no separate versions, no version switch") and the two-axis model now in effect.

**Why it matters:** The brief is a mandatory read per CLAUDE.md ("Read V3_CONCEPT_BRIEF.md at session start"). A reader following this instruction will encounter stated scope that conflicts with ADR-0045 and with features already being built (place-mode in Slice 3, mobile E2E tests, etc.). If the brief is the "binding architecture document" (CLAUDE.md §Workflow), but it misdescribes the current direction, plans built on it rest on sand.

**Location:** `V3_CONCEPT_BRIEF.md §4.10, §6` vs. `docs/architecture/0045-two-axis-adaptive-model.md` + `BACKLOG.md §Stable Directions`.

---

### F5 — `app.css` and `src/index.css` are vestigial Vite scaffold files, never imported  `FH` `COSMETIC`

**What:** Both `v3/src/app.css` and `v3/src/index.css` are Vite default scaffold CSS (`.counter`, `.hero`, `#root`, `@media (max-width: 1024px)`). Neither is imported anywhere in the app source (confirmed by grep). They are dead files.

**Why it matters (engineering signal):** These files contain `@media (max-width: 1024px)` queries, which appear in source searches for "responsive" patterns. A future reader searching for responsive CSS may find these and be confused into thinking adaptive CSS exists, when none actually does. The `@media` queries in these files also do not apply to the running app at all. Minor housekeeping, but worth removing to prevent confusion when adaptive CSS work begins.

---

### F6 — ModeToggle `compact` prop wiring is unverified: `is-compact` may be dead code at narrow viewports  `AR` `IMPORTANT`

**What:** ModeToggle accepts `compact?: boolean` and applies `.is-compact` (smaller font + height). The `compact` prop is passed from `BoardTopBarV3` (not yet read in depth). If `BoardTopBarV3` does not calculate viewport width and does not pass `compact=true` at ≤ 480 px, the compact variant documented in tokens.css as "mobile (< 480px)" is never applied.

**Why it matters:** This is a concrete example of a CSS class that may be orphaned — designed for narrow viewports but potentially not triggered by any runtime condition. At 390 px, the default (non-compact) ModeToggle at 36 px height still fits, but the visual density is suboptimal.

**Action for deep-dive:** Read `BoardTopBarV3.tsx` and confirm how `compact` is determined (viewport check, container query, fixed boolean, or something else).

---

### F7 — Dual playback state read paths in PadGridCell  `FH` `COSMETIC`

**What:** `PadGridCell` reads playback state two ways:
- `isHot = playingPads.value.has(p.id)` (Preact Signal, for CSS class)
- `isPlaying(p.id)` from `audio/index` (engine module state, for the toggle decision)

These should always agree, but they are two separate sources of truth — one reactive (signal), one imperative (engine). A brief window after `stopPad()` fires `onPadStopped` (which updates the signal) but before the fade-out completes (audio still playing) would show `isHot = false` while audio is audible. The same gap exists in reverse on fast-retry clicks.

**Location:** `v3/src/components/PadGridCell.tsx:75, 84`.

---

### F8 — `touch-action: none` on `.sb-pad.is-deep` blocks ALL native scrolling on pads, including planned GAME-mode scene-swipe  `AR` `IMPORTANT`

**What:** `.sb-pad.is-deep` has `touch-action: none` (required for pointer-event capture on iOS Brave — the comment says so). This applies to every occupied pad in both SETUP and GAME modes. Since the pad grid fills the entire center area, native browser swipe gestures do not work anywhere on the board canvas.

**Why it matters for ADR-0045:** BACKLOG B8 and D2 both document that GAME-mode scene-swipe will require JS-based movement-threshold disambiguation. The foundation constraint is correctly recorded. But: when C10's scrollable grid is built (more than 16 pads), scrolling WITHIN the grid will also require JS disambiguation (same `touch-action: none` blocks native scroll on pad cells). This is not an error — it matches the C10 spec (point 7: "character-based gesture disambiguation") — but the JS gesture router is a non-trivial component to build correctly, and its absence is a current gap.

---

## 2. Codebase Map

### 2.1 Module Overview

All source lives under `v3/src/`. Sizes are coarse (S = < 200 lines, M = 200–500, L = > 500).

| Area | Files | Size | Purpose |
|------|-------|------|---------|
| **Entry** | `main.tsx`, `app.tsx` | S | Boot, IDB bootstrap, signal wiring, screen routing |
| **Types** | `types.ts` | S | Shared TypeScript types; discriminated union Pad model |
| **State** | `state/store.ts` | S | Central Preact Signals store: navigation, mode, library, boards, playback |
| **DB** | `db/idb.ts` | M | IndexedDB abstraction: library (with blob), boards (JSON doc). Includes Slice 3→4 pad migration |
| **Audio** | `audio/engine.ts`, `audio/index.ts`, `audio/types.ts` | L / S / S | V1 audio engine port (LRU, combo sequencer); public facade; signal bridge |
| **Screens** | `screens/` (4 files) | M–M each | StartScreen, LibraryScreen, BoardListScreen, BoardScreen |
| **Components** | `components/` (13 files) | S–M each | AudioRow, BoardTopBarV3, LibraryPanel, ModeToggle, PadCreationPopover, PadEditorPanel, PadGrid, PadGridCell, PadTypeConfirmDialog, PixelIcon, SceneRail, UndoToast, Waveform |
| **Chrome** | `chrome/` (2 files) | S | StatusBarV2, TopBarV2 (used on non-board screens) |
| **Lib** | `lib/` (6 files) | S each | changelog, libDnd, nanoid, padDnd, padUtils, upload |
| **Styling** | `styles/tokens.css` + `styles/global.css` | L / S | Design tokens + theme variants (2593 lines) + reset + iOS safety rules |
| **Dead files** | `app.css`, `index.css` | S | Vestigial Vite scaffold; not imported — dead code |

**External dependencies (runtime):** `preact` + `@preact/signals` + `idb` + `@noble/hashes`. Extremely lean bundle (4 runtime deps, production JS ≈ sub-200 kB gzip per size-limit gate).

**Dev/build tooling:** Vite + `@preact/preset-vite` + `vite-plugin-pwa` + TypeScript strict + ESLint + Prettier + Husky (pre-commit + pre-push) + Vitest + Playwright + size-limit + custom sync scripts (3).

---

### 2.2 Dependency / Coupling Sketch

```
main.tsx
  ├── app.tsx (screen router)
  │    ├── screens/StartScreen
  │    ├── screens/LibraryScreen
  │    ├── screens/BoardListScreen
  │    └── screens/BoardScreen          ← most complex screen
  │         ├── components/BoardTopBarV3
  │         ├── components/SceneRail
  │         ├── components/PadGrid
  │         │    └── components/PadGridCell  (reads audio state directly)
  │         ├── components/LibraryPanel
  │         ├── components/PadEditorPanel
  │         └── chrome/StatusBarV2
  │
  ├── state/store.ts                ← read by almost every component
  ├── db/idb.ts                     ← called from screens + upload.ts
  ├── audio/index.ts (facade)       ← called from PadGridCell + main.tsx
  │    └── audio/engine.ts          ← module globals (ctx, srcs, gains, …)
  │         └── db/idb.ts           (libGet for lazy decode)
  └── styles/global.css
       └── styles/tokens.css
```

**Clean boundaries:**
- `db/idb.ts` ↔ app: clean typed API, no raw IDB transactions outside the layer.
- `audio/engine.ts` → `db/idb.ts`: one-directional (engine reads library blobs). Not circular.
- `lib/padDnd.ts` + `lib/libDnd.ts`: self-contained Pointer Events modules. No signal/IDB coupling.
- `lib/padUtils.ts`: pure functions, no side effects, no imports from app layers.

**Coupling to watch:**
- `audio/index.ts getPad` traverses `boards.value` (all boards + scenes) to resolve pad IDs for combo steps. Audio ↔ state store: tighter than ideal, but intentional (combo needs live pad state).
- `PadGridCell` reads both `playingPads.value` (signal) and `isPlaying()` (engine) — dual source of truth for the same fact (see F7).
- `BoardScreen.tsx` is the largest screen and does significant orchestration: handles Path A/B/C pad creation, DnD, place-mode, editor/library panel toggle, scene selection, and delete. This is unavoidable given the feature density, but it is the highest-complexity file in the codebase.

---

## 3. Per-Area First-Pass Findings

---

### 3.1 Data Layer — Types + IDB

**Files:** `src/types.ts`, `src/db/idb.ts`

**What's healthy:**
- Discriminated union `Pad` model (`SinglePad | LoopPad | PlaylistPad | ComboPad`) is clean and well-typed. Type guards (`isSinglePad`, etc.) prevent inline `type === 'x'` comparisons.
- `LibraryItemMeta` / `LibraryItem` split enforces the iOS memory safety invariant at the type level — blobs cannot accidentally end up in state.
- IDB schema migration (v1 → v2) is clean and idempotent.
- `migratePad` / `migrateBoard` handle Slice 3 → Slice 4 data format at read time. Graceful upgrade path.
- The `_resetDB()` export for test isolation is well-considered.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| Pad migration uses `raw: unknown` + type assertion (`p as Pad`) with no structural validation. If a stored board has structurally invalid data, the assertion silently succeeds and the invalid object propagates. | cosmetic | architecture |
| No board document format version tracking (only IDB schema versioned). If a future slice changes `Board` or `Scene` shape, there's no systematic migration hook — only another `migrateBoard()` accumulation. | important | risk |
| `V3_CONCEPT_BRIEF.md §4.1` uses `Set` type and `libraryItemRef: string` (required). Actual code: `PadSet`, `libraryItemRef?: string`, `files: string[]` for playlist. Documented deviations, but brief is stale. | cosmetic | doc-drift |
| `PadSet` is defined in `types.ts` and in the store's `activeSetIds` signal, but **no component, screen, or CSS** implements Sets/Quick-Access. The type is data-model scaffolding only. Not a bug — Slice 6 is planned — but the orphaned type makes the store feel inconsistently populated. | cosmetic | architecture |

---

### 3.2 State Layer — Preact Signals Store

**File:** `src/state/store.ts`

**What's healthy:**
- Clean separation: signals hold state, exported setter functions handle mutations. Components never mutate signal internals directly.
- Computed signals (`currentBoard`, `currentScene`) are derived from primaries — no redundant state.
- `playingPads` / `loopingPads` use `ReadonlySet` in type signatures, preventing accidental direct mutation.
- `AppState` interface documents the full shape alongside the actual signals.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| `playingPads`/`loopingPads` mutations clone the entire Set on each add/remove (`new globalThis.Set(playingPads.value)`). At 16 pads this is trivial. If C10's 64-pad target is reached with fast tap interactions, this creates 128 Set clones/second. Premature optimization to fix now, but worth watching. | cosmetic | performance |
| `activeTheme` signal is initialized to `'hearth'` hardcoded (line 51). Theme is also a `localStorage` candidate. The persistence path for theme choice is undefined (Slice 8 item). | cosmetic | architecture |
| `currentScreen` signal is a string literal (`'start' | 'library' | 'board-list' | 'board'`). This is a flat router. As screens grow (Slice 5+: Settings, Sets editor, Combo editor), a flat enum grows linearly. Not a problem now; flag for Slice 8 planning. | cosmetic | architecture |

---

### 3.3 Audio Engine

**Files:** `src/audio/engine.ts` (L, ~737 lines), `src/audio/index.ts` (S), `src/audio/types.ts` (S)

**What's healthy:**
- Faithful V1 port: LRU buffer cache (150 MB cap), iOS AVAudioSession hack, combo sequencer, playlist advancement — all correct and verified on iPhone (Slice 4 sign-off).
- Module structure is clean: `engine.ts` is internal, `index.ts` is the public facade. Components import only from `index.ts`.
- `configureCallbacks` decouples the engine from the signal store at the boundary — engine fires events; the facade translates them to signal mutations.
- `initAudio()` is synchronous inside the gesture handler (required for iOS WebKit); the comment explains why.
- `ensureLibBuf()` prevents parallel decodes via an in-flight promise map (`libBufLoading`).

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| `stopPad` fires `onPadStopped` (signal update) BEFORE the audio fade completes on fade-out paths (engine.ts:321). The pad disappears from `playingPads` while audio is still audible. UI: `is-hot` glow turns off mid-fade. Not a logic error, but a perceptible UX glitch on fade-out. | important | UX/behavior |
| `fadeOutAllInternal` uses `setTimeout(fn, duration * 1000 + 50)` for source cleanup. The +50 ms is a heuristic. If the AudioContext is suspended during the fade, timer fires but audio nodes may not have completed. Inherited V1 pattern; not new. | cosmetic | risk |
| Combo engine in `createPadInstance` has three separate `async` IIFE blocks (one per pad type: single, loop, playlist). Significant code duplication — `ensureLibBuf`, `stopped` guard, `active.push(s)` pattern all repeated. Hard to diff-audit. | important | architecture |
| `libBufs` (decoded buffer cache) is exported as a plain mutable `Record` (`export const libBufs = {}`). This exposes internal engine state globally; the export exists for unit testing only. An unexported-but-exposed-via-test-reset pattern (`_resetDB()` in idb.ts) would be cleaner. | cosmetic | architecture |
| Audio → store coupling: `getPad` in `audio/index.ts` traverses all boards + scenes to look up a pad by ID. O(boards × scenes × pads). Proportional to data volume; not a problem at current scale. Would become measurable at 100+ boards or 50+ scenes. | cosmetic | performance |
| Real crossfade is a stub: `stop(from) + play(to)` with no actual overlap. Documented in BACKLOG. Not a bug, but the `crossfade(from, to, _duration)` function signature lies about what it does. | cosmetic | doc-drift |

---

### 3.4 Screens

**Files:** `screens/StartScreen.tsx`, `screens/LibraryScreen.tsx`, `screens/BoardListScreen.tsx`, `screens/BoardScreen.tsx`

**What's healthy:**
- Screen routing in `app.tsx` is trivially simple (signal-based if/return chain). Zero routing library overhead.
- `app.tsx` bootstrap (IDB load) correctly uses the metadata-only cursor for library items — no blobs in the bootstrap path.
- Error handling on IDB calls uses `console.error` + graceful fall-through everywhere; no unhandled promise rejections.

**Findings for BoardScreen (most critical screen):**

| Finding | Severity | Category |
|---------|----------|----------|
| 3-column layout breakdown at narrow viewports (see F1 above for full description). | CRITICAL | AR |
| `eslint-disable-next-line react-hooks/exhaustive-deps` appears 3 times in BoardScreen (`handleAddPad` dependency omitted from keydown listener, `board?.id` intentional dep for scene auto-select, mode/scene/board for keydown). The comments explain why each is intentional. Not violations, but evidence of hook logic complexity. | cosmetic | architecture |
| Place-mode (Path B mobile library-to-grid) and the drop handler share logic but do not share a code path — `handlePlaceModeTap` calls `handleLibDrop` indirectly, but constructs `finalPos` twice with the same occupied-slot fallback logic. Minor duplication. | cosmetic | architecture |
| `handleAddPad` is defined as an async function inside the component body and called from a `useEffect` event handler. It captures `scene`, `board`, `mode` from closure, which the eslint disable comment acknowledges. Non-standard pattern; not a bug. | cosmetic | architecture |

**LibraryScreen / BoardListScreen:** Not read in detail — defer to a deep-dive. From cursory inspection (referenced in CSS inventory), these are simpler than BoardScreen.

---

### 3.5 Components

**Files:** 13 component files in `components/`, 2 in `chrome/`

**What's healthy:**
- ADR-0028 (single component per UI element type, variants via props) is generally followed. ModeToggle, PixelIcon, Waveform, PadGridCell are clean single-responsibility components.
- DnD pattern (`padDnd.ts` + `libDnd.ts`) is Pointer Events throughout — no HTML5 DnD anywhere (correct iOS practice, per CLAUDE.md).
- All interactive elements have `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers (Enter/Space). Baseline a11y is present.
- `UndoToast` and `PadTypeConfirmDialog` handle transient UI states cleanly.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| `ModeToggle`'s `compact` prop: how the parent `BoardTopBarV3` determines when to pass `compact=true` is unverified (file not read in this pass). The `is-compact` CSS class comment says "< 480px" — if `BoardTopBarV3` does NOT check viewport width, this class is never applied and the compact variant is functionally dead. | important | AR |
| `PadGridCell` inline style `{ '--pad-color': color, '--pad-glow': ..., '--pix-bg': 'var(--raised)' }`: these are CSS custom properties set at runtime — legitimate Path C per CLAUDE.md. However, `--pix-bg: 'var(--raised)'` is a static token value, not computed. This is a borderline violation: a static token reference being set inline when it could be in a class. Post-Session-3 micro-residue. | cosmetic | CSS-discipline |
| `PadGrid.tsx` calls `setPadsRef(scene.pads)` inside a `useEffect` with no dependency array (line 76-78) — fires on every render. `setPadsRef` is an imperative update to a module-level ref in `padDnd.ts`. Intentional (keeps the DnD ref current), but naked-useEffect is easy to miss in review. | cosmetic | architecture |
| `SceneRail` and `LibraryPanel` both have 220 px and 280 px widths hardcoded in CSS — no adaptive override. Already flagged in F1. | CRITICAL | AR |
| Spark elements in `ModeToggle` are appended directly to `document.body` and removed by `setTimeout`. This is intentional (clip-path on the toggle clips children — sparks must escape the DOM subtree). Correct, but this pattern means test environments need to handle body pollution. | cosmetic | architecture |

---

### 3.6 Styling — tokens.css + global.css

**Files:** `src/styles/tokens.css` (2593 lines), `src/styles/global.css` (81 lines), `src/app.css` (dead), `src/index.css` (dead)

**What's healthy:**
- Token system is comprehensive: surface hierarchy, border tints, type system, spacing scale, pad-type colors with soft + glow variants, 4 theme variations (Hearth/Verdant/Neon/Crimson).
- `--sb-*` legacy alias block with per-theme scoping is correct — aliases re-declared on each `.theme-*` so `var()` substitutions resolve at theme level, not root level.
- `global.css`: minimal and focused. iOS overscroll suppression, touch target defaults (`button, [role='button']: min-height: 44px`), flicker animation.
- `@inventory` comment system: 127 comments audited and verified accurate per BACKLOG §2 (End-of-Session-3 consolidation). `[unused-css]` tags identify pre-written classes awaiting future screens.
- The pixel-frame system (`clip-path` + gradient border) is applied consistently across all frame-family members (`.sb-pix`, `.sb-card`, `.sb-btn`, `.sb-pad`, `.sb-pill`, `.sb-menu-row`).
- Post-Session-3: zero Path-D violations (inline-style audit baseline). A clean baseline going into adaptive work.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| **Zero `@media` queries in the living app CSS** (see F2). All CSS is breakpoint-free. The `is-compact` ModeToggle variant and `is-setup` / `is-game` classes must be applied by JSX — none are auto-applied by viewport width. | CRITICAL | AR |
| `app.css` (Vite scaffold default, ~195 lines) and `src/index.css` (Vite scaffold default) are **not imported** anywhere. They are dead files but contain `@media (max-width: 1024px)` queries that appear in searches for responsive CSS, creating false positives. | cosmetic | housekeeping |
| `tokens.css` is 2593 lines. As the single living CSS file, it hosts everything: tokens, themes, layout primitives, component styles, screen-specific rules. There is no split between design tokens, layout utilities, and component styles. This is manageable now but will grow under Slice 5–8 additions. The auto-sync scripts enforce inventory hygiene but don't enforce structural bounds. | important | architecture |
| Several `[unused-css]` classes (`sb-card`, `sb-slider`, `sb-num`, `sb-toggle`, `sb-label`, `sb-caption`, `sb-inspector`, `sb-scroll`, `sb-overlay-scroll`) are pre-written design system scaffolding. These are INTENTIONAL future scaffolding, not dead code. But they add ~200 lines of CSS shipped to production that CSS tree-shaking (Vite does not do this for class-based CSS) will not remove. | cosmetic | performance |
| CLAUDE.md §4.7 states `--mode-play` as a token name. The actual token in tokens.css is `--mode-game` (and `--mode-game-soft`, `--mode-game-glow`). This is a token name drift between the concept brief and the code. Minor, but a naming inconsistency in an authoritative document. | cosmetic | doc-drift |

---

### 3.7 Lib Utilities

**Files:** `lib/changelog.ts`, `lib/libDnd.ts`, `lib/nanoid.ts`, `lib/padDnd.ts`, `lib/padUtils.ts`, `lib/upload.ts`

**What's healthy:**
- `padUtils.ts`: pure functions, zero side effects, no imports from app state. Excellent library-style design. `nextFreeSlot`, `posToIndex/indexToPos`, `typeInference`, `padMigrationMatrix`, `applyTypeChange`, `padTypeColor/Glow/Label` — all well-tested.
- `padDnd.ts` + `libDnd.ts`: Pointer Events DnD, no HTML5 DnD — correctly iOS-safe. Pattern is the canonical reference per CLAUDE.md.
- `upload.ts`: serial processing (`processFilesSerial`) correctly guards against parallel decode. `computePeaks` before nulling the decoded buffer is the correct iOS memory pattern.
- `nanoid.ts`: minimal browser-safe UUID generation.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| `padDnd.ts` uses `setPadsRef()` which stores a mutable reference to the pads array. This ref is read during drag events (not during re-render). The ref can become stale if `scene.pads` changes during a long drag. The `useEffect` in `PadGrid` that calls `setPadsRef` on every render mitigates this, but the mutation window exists between renders. At tap-drag latency levels, this is unlikely to cause observable issues. | cosmetic | risk |
| `libDnd.ts` implementation not read in this pass. A deep-dive should confirm the 350 ms long-press pattern, the 8 px cancel threshold, and the cleanup on component unmount. | — | flag for deep-dive |

---

### 3.8 Build + Tooling

**Files:** `v3/vite.config.ts`, `v3/package.json`, `.husky/`, `scripts/`

**What's healthy:**
- Pre-commit gate (6 steps: sync:docs → build → lint-staged → vitest → E2E smoke → link-check) and pre-push gate (version-bump check + size-limit + full E2E including mobile) are thorough.
- Three sync scripts (`sync:adr`, `sync:classes`, `sync:tokens`) keep auto-generated doc sections accurate.
- `size-limit` gates prevent bundle bloat (200 kB JS / 50 kB CSS gzip).
- Production dependency count is 4 (preact, @preact/signals, idb, @noble/hashes). Deliberate minimalism.
- PWA manifest `orientation: 'any'` correctly permits both orientations for the adaptive model.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| PWA manifest defines only `icon-192.png` and `icon-512.png`. Missing: `apple-touch-icon` (180 px for iOS home-screen icon). On iOS, PWA icons without explicit `apple-touch-icon` fall back to a screenshot. Cosmetic until PWA polish, but will affect "Add to Home Screen" appearance on the primary target device. | cosmetic | PWA |
| `vite.config.ts` `base: '/botc-soundboard-v3/'` is hardcoded for GitHub Pages. If deploying to a custom domain in the future, this value needs updating. Minor but not configurable via env var. | cosmetic | infra |
| `app.css` and `index.css` dead files may be included in the Vite build (Vite processes all files in `src/` if referenced by `index.html` or via an `?url` import). Given no import exists in TSX files, they should NOT be bundled. Should be verified then deleted. | cosmetic | housekeeping |

---

### 3.9 Tests

**Files:** `tests/unit/` (5 files), `tests/e2e/` (~14 files), `tests/e2e/mobile/` (7 files), `tests/e2e/visual/` (7 files)

**What's healthy:**
- Unit test coverage of pure logic is solid: `padUtils`, `padDnd` (DnD algorithms), `store` (signal mutations), `idb` (with fake-indexeddb), `audio/lru` (LRU cache).
- E2E tests cover all critical flows: board CRUD, pad creation (3 paths), DnD, scene CRUD, mode toggle, audio (smoke), game mode.
- Mobile E2E tests (7 files) run at 390×844 with `tap()` events — correctly verifying touch interactions. These already exist and run in CI.
- Visual regression baselines are macOS-only (`*-darwin.png`) — correctly excluded from Ubuntu CI.
- Playwright project matrix includes `smoke`, `smoke-webkit`, `full`, `mobile`, `mobile-chromium` — broad coverage.

**Findings:**

| Finding | Severity | Category |
|---------|----------|----------|
| No unit tests for `upload.ts` (serial processing pipeline, peak computation) or `libDnd.ts` (library drag). These are non-trivial modules with iOS-critical behavior (serial decode guards). | important | test-coverage |
| No unit tests for `audio/engine.ts` beyond the LRU cache. The combo sequencer logic (`playComboStep`, `finishCombo`, `stopCombo`, nested combo recursion) is complex and entirely untested at the unit level. The E2E audio tests are smoke-only (audio context unlock). | important | test-coverage |
| Mobile E2E tests verify navigation and tap flow at 390×844, but they do **not** verify that layout elements are visible and not clipped. A SceneRail that consumes 56% of the viewport will pass all current mobile tests because the tests use `tap()` on specific elements (which work regardless of visual overflow). The layout breakage (F1) is invisible to the test suite. | important | test-coverage |
| Visual regression baselines capture desktop layout only (no mobile/390px baselines). Post-Session-3 baselines cover: boardlist-empty, boardlist-with-board, boardscreen-game, boardscreen-setup, library-empty, modetoggle-states, scene-rail. No baselines at 390 px or with panels open. | important | AR |
| `audio.spec.ts` tests are in `FULL_TESTS` in `playwright.config.ts`. Audio tests require a running AudioContext which Playwright can provide — but iOS-specific behaviors (ringer switch, tab background, AVAudioSession upgrade) are uncoverable in E2E. `docs/MANUAL_IPHONE_CHECKLIST.md` covers this gap intentionally. | cosmetic | test-coverage |

---

### 3.10 Docs + ADRs

**Files:** `docs/architecture/` (45 ADRs + README + template), `BACKLOG.md`, `DESIGN_NOTES.md`, `DESIGN_SYSTEM.md`, `V3_CONCEPT_BRIEF.md`, `TESTING.md`, `CLAUDE.md`

**What's healthy:**
- 45 ADRs covering all major decisions: stack choices, data model, platform targets, CSS naming, DnD, audio, testing, deployment. Well-indexed via `sync:adr`.
- BACKLOG.md is comprehensive and actively maintained — deferred items are linked to source ADRs and design sessions with dates.
- TESTING.md documents the 3-layer test architecture, commands, and the manual iPhone checklist reference.
- CLAUDE.md is the single source of truth for project-specific guidelines and is updated as decisions are made.
- `docs/DOCUMENTATION_MAP.md` provides orientation to the doc corpus.

**Findings (doc-vs-code drift):**

| Finding | Severity | Category |
|---------|----------|----------|
| `V3_CONCEPT_BRIEF.md §4.10` ("Mobile works but isn't specifically optimized") and `§6` ("Mobile-specific UI variant: out of scope") contradict ADR-0045 (ONE adaptive app). Brief is mandatory session read per CLAUDE.md — stale guidance in a mandatory document. | important | doc-drift |
| BACKLOG.md `C10` is "RESOLVED" as a design decision but the code contradiction it describes (`overflow: hidden` silently clips excess pads) is still present. `RESOLVED` misrepresents the current code state. | important | doc-drift |
| `DESIGN_SYSTEM.md §1–§5` are stubs (per BACKLOG.md §2 — "Documentation Debt"). Referenced from `DESIGN_SYSTEM_CHEATSHEET.md`. No content risk, but the gap is tracked. | cosmetic | doc-debt |
| `V3_CONCEPT_BRIEF.md §4.1` uses `Set` type; code uses `PadSet`. Brief uses `libraryItemRef: string` (required); code uses `libraryItemRef?: string` + `files: string[]`. Documented deviations in CLAUDE.md, but brief is technically stale. | cosmetic | doc-drift |
| CLAUDE.md references `--mode-play` token (§Design language §Color palette). Actual token is `--mode-game`. | cosmetic | doc-drift |
| `BACKLOG.md §2` item: CLAUDE.md line 233 phrasing "these primitives are created in Session 3" should be past tense (Session 3 is complete). Minor stale text. | cosmetic | doc-drift |

---

## 4. Cross-Cutting Observations

### 4.1 The "flat" invariant from Session 3 is solid, but migration traces remain in one place

Session 3 established the "flat child-selector" CSS invariant (no nested `.parent .child` selectors — all classes are flat and composable). The `@inventory` audit confirmed all 127 comments. One trace: `sb-pad-type-label` inline `style={{ color }}` in `PadGridCell` is a legitimate Path C use (dynamic `padTypeColor()` function), not a Session 3 residue.

### 4.2 The adaptive model needs a new structural layer between current CSS and the screen components

ADR-0045 describes Axis 1 as CSS-breakpoint-driven. Currently, the CSS layer is entirely static (no breakpoints). The screen components are the only adaptive layer today (e.g., BoardScreen handles place-mode). When Slice 8's mobile layout adaptation begins, there is no CSS foundation to extend — the first breakpoint will be a "start from scratch" addition. Recommendation: the Slice 8 or pre-Slice-8 session should establish the CSS breakpoint infrastructure *before* building the layout variants on top.

### 4.3 The combo sequencer is the highest risk untested area

`playComboStep`/`finishCombo`/`stopCombo` with nested combos form a stateful recursive call graph (~200 lines). It is a faithful V1 port and was verified on iPhone in Slice 4. But it has no unit tests (only the LRU cache is unit-tested). Any future refactor of the audio layer (e.g., adding the real crossfade, or instrumenting the combo steps for visual feedback) touches this code blind. The combo sequencer is the highest complexity/lowest test coverage area in the codebase.

### 4.4 PadSet / Sets model: orphaned in types, signaled in store, not in UI

`Board.sets: PadSet[]` is in the type, `activeSetIds: string[]` is in the store — but no component or screen touches these fields. `boardGetAll()` loads boards including their (empty) `sets` arrays. The Sets domain exists as scaffolding but adds cognitive load to reading `types.ts` and `store.ts`. It's deferred to Slice 6. No action needed, but noting as a source of "why is this here?" confusion.

### 4.5 Board document write-amplification: understood but unmonitored

Every pad edit rewrites the entire Board JSON document. At 5 scenes × 16 pads ≈ 50 KB — fast. At 5 scenes × 64 pads (C10's target) ≈ 200 KB — still probably fine. The limit is documented in `idb.ts` and CLAUDE.md. No monitoring or fallback path exists. The trade-off is conscious and documented; the lack of any measurement path is the gap. Once 64-pad boards exist in testing, this should be measured.

### 4.6 Two vestigial files pose a confusion risk for future CSS work

`v3/src/app.css` and `v3/src/index.css` both contain `@media (max-width: 1024px)` queries (Vite default scaffold). They are not imported anywhere and have zero runtime effect. But when adaptive CSS work begins and an engineer searches for existing breakpoints, these files will appear in results. Strongly recommend deletion before Slice 8.

---

## 5. Recommended Deep-Dive Passes

In suggested priority order:

### Pass 2 — BoardScreen adaptive layout: anatomy + options

**Scope:** Read `BoardTopBarV3.tsx` (how `compact` prop is determined), `SceneRail.tsx`, `LibraryPanel.tsx`, `PadEditorPanel.tsx` in full. Measure the actual pixel behavior at 390 px, 480 px, 768 px with and without panels open. Identify the minimum layout pivots needed to make the board usable at 390 px (at minimum: collapsible SceneRail, overlay-style panels). Document the *specific* code changes needed.

**Why first:** This is the CRITICAL blocking issue for ADR-0045. Without a plan for the 3-column layout, the mobile prototype cannot integrate with the main app.

---

### Pass 3 — CSS adaptive infrastructure: establish Axis-1 breakpoint skeleton

**Scope:** Determine the empirical breakpoints (narrow/portrait ≤ 480 px?, wide/landscape ≥ 768 px?) from real device testing. Define the CSS custom property conventions (`--sb-layout-*` or similar). Establish the `@media` query skeleton in `tokens.css` (or a new `layout.css` split). Verify that `is-compact` in ModeToggle is wired correctly.

**Why second:** Establishing the CSS infrastructure first makes Pass 2's layout pivots implementable without reinventing the wheel per component.

---

### Pass 4 — Audio engine: combo sequencer coverage + state consistency

**Scope:** Read `engine.ts` in full (it was read at map depth here). Verify all the combo state transitions: retrigger on active combo, nested combo stop, `fgRem` counting under concurrent async resolution. Add targeted unit tests for the combo sequencer. Investigate the `onPadStopped`-before-fade-completes timing issue (F7 / F in this doc).

**Why third:** The combo sequencer is the highest complexity / lowest test coverage region. It needs coverage before any audio refactoring (real crossfade, level metering, per-pad state indicators).

---

### Pass 5 — Doc-vs-code drift: systematic sweep

**Scope:** Update `V3_CONCEPT_BRIEF.md §4.10 and §6` to reflect ADR-0045. Update `BACKLOG.md C10` to distinguish "design resolved" vs "code not yet updated." Fix CLAUDE.md `--mode-play` → `--mode-game` token name. Verify all BACKLOG "resolved" items are actually reflected in code.

**Why fourth:** This is lower risk than layout/audio, but the brief is a mandatory session read and its stale guidance is a daily friction cost.

---

### Pass 6 — Upload pipeline + libDnd: iOS robustness

**Scope:** Read `upload.ts` and `libDnd.ts` in full. Verify serial decode invariants, peak computation timing, and the 350 ms / 8 px gesture thresholds. Add unit tests for `upload.ts` (especially the serial guard). Run against the manual iPhone checklist (§Section 2).

**Why fifth:** `upload.ts` touches the iOS memory-critical path (serial decode, peak extraction, blob handling) and has zero unit tests. `libDnd.ts` has the Pointer Events pattern relied upon for Place-Mode and all future DnD variants.

---

### Pass 7 — C10 implementation planning

**Scope:** Plan the full C10 implementation: scrollable grid (remove `overflow: hidden` from `sb-board-main`, add overscroll containment to `sb-pad-grid`), the JS gesture disambiguator (tap vs. scroll vs. pick-up threshold), and the FLIP re-wrap animation. This is a large, well-specified Slice 8 item — but its complexity warrants a planning pass before implementation.

**Why sixth:** C10 is fully specified in BACKLOG but is architecturally the most complex Slice 8 component. A planning pass before the slice starts will surface questions early.

---

*End of Pass 1. Deeper passes fill in sections below their respective headings.*

<!-- PLACEHOLDER: Pass 2 — BoardScreen adaptive layout (to be added) -->
<!-- PLACEHOLDER: Pass 3 — CSS adaptive infrastructure (to be added) -->
<!-- PLACEHOLDER: Pass 4 — Audio engine deep dive (to be added) -->
<!-- PLACEHOLDER: Pass 5 — Doc-vs-code drift sweep (to be added) -->
<!-- PLACEHOLDER: Pass 6 — Upload + libDnd iOS robustness (to be added) -->
<!-- PLACEHOLDER: Pass 7 — C10 implementation planning (to be added) -->
