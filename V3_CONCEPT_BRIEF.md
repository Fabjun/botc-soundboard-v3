# V3.0 Concept Brief — Soundboard of Storytelling

> **Orientation for Claude Code:**
>
> This is a **fresh implementation** in a new tech stack. It is not a
> migration of V1 and not a continuation of the V1.5 plan. Both
> `MIGRATION_PLAN.md` and `V1_5_CONCEPT_BRIEF.md` are **obsolete** for
> this work. Read them only as background on what V1 does and what
> was learned about it.
>
> V3.0 lives in a new project directory. V1 (`index.html`) remains
> untouched and stays usable for real gaming sessions until V3.0
> reaches feature parity.

---

## 1 · Stack

- **Preact** (not React) — smaller bundle, same JSX
- **TypeScript** — native to Vite, expected by the ecosystem
- **Vite** — dev server and build tool
- **IndexedDB** — local persistence, same as V1
- **PWA** — manifest + service worker, offline-capable
- **No backend** — local-first

## 2 · What V3.0 is

A re-implementation of Soundboard of Storytelling with:

- The design system (`tokens.css`, JSX components) as the visual and
  structural foundation, used **directly** (no porting to vanilla)
- A clean data model resolving V1's conceptual issues
  (Library/SETUP conflation)
- Working logic ported from V1 where appropriate (audio engine,
  IndexedDB schema, template export/import)
- A component-based architecture from the start

V1 keeps running. V3.0 is built in parallel until ready.

## 3 · Relationship to existing artifacts

**V1 (`v1-reference/index.html`, `v1-reference/sw.js`):**
- Reference for behavior — read when porting features
- Source of the audio engine (copy into V3.0, wrap behind clean API)
- Source of IndexedDB schema and template export/import format
- Not to be modified

**Design system (`SoS_DESIGN_25052026/`):**
- `tokens.css` — canonical tokens, used directly
- JSX files (`v2-screens.jsx`, `foundations.jsx`, etc.) — **used as
  starting code**, not as reference. Lift them into V3.0, adapt to
  TypeScript and the V3.0 state model.
- `HANDOFF.md` — design intent
- `dist/` — partial vanilla ports, ignore in V3.0 (we use JSX directly)

**V1.5 prototypes (`prototype/*.html`):**
- Obsolete. Not used in V3.0.

## 4 · Architectural decisions (binding)

### 4.1 · Data model

```typescript
type Board = {
  id: string;
  name: string;
  themeId: string;
  settings: {
    quickAccessLayout: 'tabs' | 'stack' | 'hidden';
    quickAccessSetCount: number;  // default 1
  };
  scenes: Scene[];
  sets: Set[];
};

type Scene = {
  id: string;
  name: string;
  order: number;
  gridConfig: { cols: number; rows: number; gap: number; padSize: string };
  pads: Pad[];
};

type Set = {
  id: string;
  name: string;
  order: number;
  pads: Pad[];
};

type Pad = {
  id: string;
  type: 'single' | 'loop' | 'playlist' | 'combo';
  name: string;
  hotkey?: string;
  libraryItemRef: string;
  iconRef?: string;
  color?: string;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  // type-specific fields applied as needed
};

type LibraryItem = {
  id: string;
  type: 'audio' | 'icon' | 'image';
  name: string;
  blob: Blob;
  tags: string[];
  addedAt: number;
};
```

**Key concepts:**

- **Board** — top-level user grouping (e.g. "Medieval Campaign")
- **Scene** — a planned pad arrangement for a story moment (Tavern,
  Combat). User switches between scenes during play.
- **Set** — a freely-composed quick-access collection. Board-scoped.
  Multiple sets per board allowed (General, Horror, Tavern Classics).
- **Pad** — lives in one Scene or one Set (no cross-references yet).
- **Library** — asset management, separate from board organization.

### 4.2 · Component architecture

Every UI element has **one** component. Variants via props.

```tsx
function Pad({ pad, mode, isHot }: PadProps) { ... }
function Button({ label, variant, icon, onClick }: ButtonProps) { ... }
function PixelIcon({ name, size, color }: PixelIconProps) { ... }
function SceneCard({ scene, active, onClick }: SceneCardProps) { ... }
```

When a new variant is needed: **extend the existing component with a
new prop**. Never create a parallel component for "slightly different"
needs. If tempted, ask the user.

### 4.3 · State management

A central store holds all UI state. Components read via hooks,
mutations via setters. IndexedDB is the persistence layer, not the
truth layer.

Recommended approach: **Zustand** (small, ~1 KB, works with Preact)
or **Preact Signals** (~1 KB, native to Preact). Either is fine —
Claude Code chooses based on fit, with rationale.

```typescript
type AppState = {
  currentBoardId: string | null;
  currentSceneId: string | null;
  currentMode: 'play' | 'edit';
  activeTheme: string;
  activeSetIds: string[];
  playingPads: Set<string>;
  loopingPads: Set<string>;
  masterVolume: number;
};
```

### 4.4 · Audio engine

V1's audio engine is **copied unchanged** into V3.0 behind a clean
TypeScript-typed facade:

```typescript
// audio.ts
export function play(padId: string): void;
export function stop(padId: string): void;
export function crossfade(from: string, to: string, duration: number): void;
// internal: V1's audio code, kept as-is
```

Do not redesign audio behavior. Do not improve the engine. Copy,
wrap, move on.

### 4.5 · IndexedDB

V1's schema is preserved where it overlaps. Extended with new stores
for Scenes and Sets. Existing field names and types compatible.

**Compatibility goal:** V1 boards (exported as templates) import
cleanly into V3.0. A V1 board becomes a V3.0 board with one default
Scene containing all pads.

Suggested library: **idb** (small TypeScript wrapper around
IndexedDB, ~1 KB). Or raw IndexedDB. Either works.

### 4.6 · Template export/import

V1's single-file export/import format is **preserved**. V3.0 imports
V1 templates and exports in a format V1 can read (V3.0-specific fields
are additive; V1 ignores unknown fields).

### 4.7 · Tokens

Token language follows the design system canonically:
- Fonts: `--font-display`, `--font-ui`, `--font-mono`
- Mode colors: `--mode-setup`, `--mode-play`
- Spacing: `--space-1` through `--space-16`
- Colors, borders, shadows, glows per `tokens.css`

`tokens.css` is imported directly into V3.0. No renames, no aliases
to V1 names.

### 4.8 · Project structure

Standard Vite + Preact + TypeScript layout. Approximate:

```
v3/
├── public/
│   ├── manifest.json
│   └── sw.js (or auto-generated by Vite plugin)
├── src/
│   ├── main.tsx           (entry)
│   ├── App.tsx            (root component)
│   ├── components/        (Pad, Button, PixelIcon, etc.)
│   ├── screens/           (Home, Board, Library, Settings, etc.)
│   ├── state/             (store, hooks)
│   ├── audio/             (V1 engine + facade)
│   ├── db/                (IndexedDB wrapper)
│   ├── styles/
│   │   ├── tokens.css
│   │   └── components.css
│   └── types.ts           (shared TypeScript types)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Claude Code adjusts structure as needed during development.

### 4.9 · PWA / Service Worker

Use **`vite-plugin-pwa`** for service-worker generation. Auto-handles
cache invalidation, asset listing, version bumps. Configure for:
- Cache-first for app shell
- Network-first for dynamic content (none yet, but ready)
- Skip-waiting + clients-claim on update

Why a plugin: V1's manual `sw.js` worked but required discipline
(SHELL list, VERSION bumps). The plugin removes that failure mode.

### 4.10 · Responsive

Desktop and tablet are primary targets. Mobile works but isn't
specifically optimized in V3.0 (touch-first variant comes later).

### 4.11 · Language

English only. No i18n infrastructure yet, but structure code so a
future i18n pass is feasible (texts in named constants, not hardcoded
in JSX).

### 4.12 · Accessibility

Baseline (semantic HTML, design-system contrasts) but no dedicated
a11y pass.

## 5 · Working method

### 5.1 · Vertical slices

Build in working slices, not horizontal layers. Each slice ends with
a committable, testable, screenshot-verifiable result.

Suggested order (adjust as preferences emerge):

1. **Project setup + Home screen** — Vite + Preact running, design
   tokens loaded, Home rendered from `v2-screens.jsx`
2. **Library + LibraryItem CRUD** — IndexedDB, add/edit/delete assets
3. **Board + Scene + Pad CRUD** — create board, add scene, place pads
4. **Audio playback** — pads play, loop, stop (V1 engine wrapped)
5. **Scene switching** — multiple scenes, swap between them
6. **Sets + Quick Access** — set model and quick-access strip
7. **Template export/import** — V1 compatibility
8. **Settings, themes, polish**

### 5.2 · Using design-system JSX

The JSX files in `SoS_DESIGN_25052026/` are starting material. Approach:

1. Read the relevant JSX file
2. Copy the structure into a new TypeScript component
3. Add typed props
4. Connect to V3.0 state via hooks
5. Adapt where the design assumed React (mostly no changes needed —
   Preact is API-compatible)

Do not duplicate components. If two screens use the same component,
both import it from the same file.

### 5.3 · When V1 is needed

For any feature whose behavior isn't obvious from the design, read
V1's code. V1 is the reference for:
- Audio engine internals
- Drag-and-drop behavior
- Hotkey wiring
- Crossfade timing
- Playlist semantics
- Combo-pad chain logic
- Export/import format details
- Edge cases (deleting a pad during playback, etc.)

Before porting V1 behavior: summarize what V1 does, confirm with user,
then implement.

### 5.4 · When to ask

Ask the user — don't assume — when:
- A V1 behavior is ambiguous
- The data model needs extension beyond §4.1
- A component variant tempts parallel implementation
- A V1↔V3 incompatibility appears
- A new third-party library is being considered

### 5.5 · Discipline points

- Never silent file deletions
- Never schema changes without confirmation
- Never audio-engine modifications
- Always announce new dependencies before adding them
- Always typed props, no `any`

## 6 · Out of scope for V3.0

- Real-time multi-user sync
- Cloud storage
- Live audio sharing during play
- Plugin system
- Mobile-specific UI variant (later)
- Multi-language (English only)
- Comprehensive accessibility (baseline only)
- Test suite (deferred)

## 7 · How to start

1. Read this brief in full.
2. Read `SoS_DESIGN_25052026/HANDOFF.md`.
3. Skim V1 (`v1-reference/index.html`) for orientation.
4. Look at `SoS_DESIGN_25052026/v2-screens.jsx` to see what Home
   should look like.
5. Ask the user which slice from §5.1 to start with. Default: Slice 1.
6. Before writing code, summarize back:
   - Scope of the slice
   - Files to create
   - Dependencies to add (with rationale)
   - V1 code to read first (if any)
7. Wait for confirmation. Then build.

## 8 · Style

The user works with engineering discipline: explicit assumptions,
honest uncertainty, measurement over guessing, deliberate trade-offs.

Match that. Flag uncertainty. Name trade-offs. Don't perform false
confidence. Don't over-explain when action is asked. Don't
under-explain when understanding is asked.

---

*End of brief. Begin with §7 step 5.*
