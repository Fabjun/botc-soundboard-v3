# CLAUDE.md — BotC Soundboard V3 ("Soundboard of Storytelling")

> **Maintenance rule**: This file is the single source of truth for
> project-specific guidelines. Claude Code must keep it up to date
> autonomously — update it whenever new permanent standards emerge,
> existing rules are revised, or important architectural decisions are
> made. Do not wait to be asked. If you change something that implies
> a new rule, write it here immediately.

---

## Project identity

- **App name**: "Soundboard of Storytelling"
- **Origin repo (V1)**: https://github.com/Fabjun/botc-soundboard
- **V1 live URL**: https://fabjun.github.io/botc-soundboard/
- **V3 stack**: Preact + TypeScript + Vite, PWA
- **Primary target device**: iPhone + Brave browser + Bluetooth Numpad
  (Logilink ID0212v2)
- **Secondary**: laptop/desktop
- **App UI language**: English
- **Communication language**: German or English
- **Lizenz und Status**: V3 ist ein privates Tool unter "All Rights Reserved"-Lizenz (siehe `LICENSE`). Langfristig potentielles kommerzielles Produkt. Keine Open-Source-Beiträge geplant. Beim Ergänzen von Code sicherstellen, dass keine Open-Source-Lizenzen verletzt werden. Kontakt: soundboard_of_storytelling@pm.me

---

## Reference documents

- **`V3_CONCEPT_BRIEF.md`** — binding architecture decisions for V3,
  data model, slice plan. Read first in every session.
- **`v1-reference/CLAUDE.md`** — V1's CLAUDE.md, kept for reference.
  Contains hard-won implementation knowledge that informed many of
  the rules below.
- **`v1-reference/index.html`** — V1 source, reference for behavior,
  audio engine, IndexedDB schema, template export/import.
- **`SoS_DESIGN_25052026/`** — design system: tokens, JSX components.
- **`v1-reference/HANDOFF.md`** — design system handoff document.
  Originally written for V1 migration context (refers to "porting JSX
  to vanilla", phase plan for V1 modernization). For V3, ignore the
  porting guidance and phase plan — V3 uses JSX directly via Preact
  and follows the slice plan in V3_CONCEPT_BRIEF.md §5.1. Still
  valuable for: JSX-file index, design intent (type-color spine,
  depth stack, multi-cue mode), token-system rationale.

---

## Architecture (non-negotiable)

- **Stack**: Preact + TypeScript + Vite. No React, no other framework.
- **State**: central store — **Preact Signals** (decided Slice 1).
  Signals live in `src/state/store.ts`. Components read via `.value`
  or auto-subscribing JSX binding. Mutations via exported setter
  functions (e.g. `addPlayingPad`, `removeLoopingPad`).
- **Persistence**: IndexedDB. V1 schema preserved where overlapping,
  extended for Scenes and Sets.
- **Preferences**: `localStorage` (small UI state, theme choice, etc.)
- **PWA**: managed via `vite-plugin-pwa`. No manual `sw.js`. Auto-
  generated SHELL list, auto-bumped version on build.
- **Audio engine**: V1's engine code, copied unchanged into V3 and
  wrapped behind a typed facade in `src/audio/`. Do not redesign.

---

## Supported Platforms (Minimum)

**Primary target:** iPhone 13 Pro (iOS 17/18) with Brave browser.

**Minimum supported versions:**
- iOS Safari 15+ (iPhone 6s, 2015, and newer)
- Android Chrome 100+ (~2022 and newer)
- Desktop: current Chromium, Firefox, Safari (last 2 major versions)

**Available modern features (all supported on minimum):**
- Pointer Events API (iOS 13+)
- IndexedDB
- Web Audio API (with user-gesture unlock)
- Service Worker / PWA (Add to Home Screen)
- CSS `clamp()`, `prefers-reduced-motion`
- IntersectionObserver, ResizeObserver

**Features requiring graceful degradation:**
- Container Queries (iOS 16+) — fall back to Media Queries on iOS 15
- View Transitions API (iOS 18+) — optional polish only; never a hard dep

**Features explicitly avoided (not supported on minimum):**
- **HTML5 Drag-and-Drop on iOS — always use Pointer Events instead.**
  `draggable`, `ondragstart`, `ondragover`, `ondrop` are not supported
  on iOS Safari/Brave. Any DnD interaction (pad-to-pad, library-to-grid,
  future scene reorder etc.) MUST use Pointer Events.
  Pattern: see `src/lib/padDnd.ts` (pad DnD) and `src/lib/libDnd.ts` (library DnD).
- Anything requiring iOS 17+ as a hard dependency

**Why this section exists:**
During Slice 3, Path B (library → grid drag) was accidentally implemented
with HTML5 DnD. It worked on desktop but was silently broken on the primary
target (iPhone + Brave). The fix required a new `libDnd.ts` module.
Having explicit platform constraints prevents the same category of bug
in future slices.

---

## iPhone / iOS Safari — memory & stability rules (CRITICAL)

iOS Safari kills the tab when JS heap exceeds ~600 MB (older iPhones)
or ~1–1.5 GB (newer). This is V1's hardest-won lesson and applies
identically to V3. Every code path touching IndexedDB or audio must
respect these limits.

### Core principles (carried over from V1)

1. **Never load all audio buffers into RAM.** Library listing,
   filtering, renaming — none of these need the audio data. Use a
   metadata-only query.
2. **Never decode audio in parallel.** Decode one file at a time;
   release the previous buffer before starting the next.
3. **Never store raw audio in component state or working arrays.**
   Store only `{name, hash, size}` references; lazy-load buffers via
   the database helper on demand.
4. **Never JSON-load the entire library at once for export.** Stream
   one entry at a time into a Blob.
5. **Always release decoded buffers** after playback ends (`onended`
   handlers must null out `s.buffer`).
6. **Always null large strings** (base64, JSON) immediately after
   parsing — don't wait for GC.
7. **Cap the buffer LRU cache.** V1 used 150 MB; V3 inherits this
   limit unless deliberately reconsidered with the user.

### V3-specific implementation notes

The function names from V1 (`libGetAll`, `libGetAllMeta`,
`_ensureLibBuf`, etc.) are V1's. V3 will have differently-named
equivalents in TypeScript. The **patterns are non-negotiable** even
if the names change. When porting any V1 audio/IDB code:

- Read the V1 implementation first
- Identify which of the seven principles above it implements
- Implement the V3 equivalent preserving the principle
- Document the new function name in this file under "V3 audio/IDB API"
  (added by Claude Code when the code is written)

### Banned patterns (regardless of name)

| Pattern | Why | Replacement principle |
|---------|-----|----------------------|
| Loading all library buffers for any non-playback purpose | 150–240 MB into RAM | Metadata-only cursor |
| Parallel `decodeAudioData` over N files | N × 50–100 MB PCM = OOM at N > 10 | Serial decode, release between |
| Storing raw audio in working state arrays | Holds compressed + decoded copies | Store `{name, hash, size}`, lazy-load |
| Loading full library JSON for export | 150–300 MB string in RAM | Stream entries one at a time |
| `FileReader` loop in parallel for N files | N parallel reads + N parallel decodes | Serial file processing |

### When adding any new code that touches audio or IDB

Ask: "Does this load all audio buffers at once? Does this trigger
parallel decodes? Does this hold raw audio in working state?" If yes
to any → refactor before shipping.

---

## Design language

### Tokens

Use the design system tokens from `src/styles/tokens.css` (imported
from `SoS_DESIGN_25052026/tokens.css`). Never hardcode colors,
fonts, or spacing.

### Color palette (canonical names from design system)

```
--night, --deep, --surface, --raised, --border
--gold, --gold-dim, --gold-bright, --gold-soft
--flame, --blood, --blood-bright, --blood-soft
--text, --text-dim, --text-mute, --text-strong
--mode-setup, --mode-play
--pad-single, --pad-loop, --pad-playlist, --pad-combo
  (each with -soft and -glow variants)
```

### Color code rule (never mix)

- SETUP mode = teal/cool (`--mode-setup`)
- GAME mode = gold/warm (`--gold`)

### Typography

- `--font-display` — titles only, Press Start 2P-like
- `--font-ui` — UI labels, buttons, headings, VT323-like
- `--font-mono` — body, descriptions, filenames, Share Tech Mono-like

### UI rules

- No emojis. Use Unicode/ASCII glyphs from the design's icon system.
- Every delete button: 2-tap confirmation (first tap shows confirm
  state, second tap executes)
- All counts/labels: dynamic from data, never hardcoded
- Scroll position of overlays/list views: save and restore on re-open
- Minimum touch target on all interactive elements: 44px (iOS guideline)
- `overscroll-behavior: none` on all fixed overlay panels
- `-webkit-overflow-scrolling: touch` on all scroll containers

---

## Permanent coding standards

- **TypeScript strict mode**. No `any`. If a type is hard to express,
  ask the user before resorting to `unknown` or assertions.
- **Single Source of Truth for components**: one function per UI
  element type, variants via props. Never parallel components for
  "slightly different" needs. If tempted, ask.
- **Delete buttons**: always 2-tap confirmation.
- **JSX safety**: Preact auto-escapes children. Do not bypass this
  with `dangerouslySetInnerHTML` unless absolutely required and
  approved.
- **IndexedDB access**: through typed helpers only. Never raw
  transactions outside the `src/db/` layer.
- **Waveform data**: computed at upload time and stored alongside
  the audio entry. Use stored peaks; only re-decode as fallback for
  legacy entries.
- **Library entries**: always `{name, hash, size, peaks?}` shape in
  working memory. Never raw audio in working state.

---

## Workflow rules

1. **Read `V3_CONCEPT_BRIEF.md` at session start.** It is the binding
   architecture document.
2. **Before implementing any change**: explain the plan and design
   context, wait for confirmation.
3. **"Kannst du X?" is a question** — answer first, wait for go-ahead
   before implementing.
4. **Vertical slices**: build complete vertical features (UI + state
   + persistence), not horizontal layers. See §5.1 in the Concept
   Brief.
5. **After every feature or fix**: verify manually, then
   `git add . && git commit -m "..." && git push`
6. After every push: short summary of what changed and what was verified.
7. **Update this CLAUDE.md** when permanent standards change.
8. **Update `update_log.md`** after every commit (if the file exists;
   create on first commit).
9. **Testing**: see `TESTING.md` for full test architecture, commands, and
   conventions. Phase 2 testing infrastructure is complete:
   - Pre-commit: build + unit tests + smoke E2E (auto via Husky)
   - CI: GitHub Actions `tests.yml` runs unit + lint + size + full E2E
   - Deploy is gated on green `tests.yml` run (via `workflow_run`)
10. **Visual Regression**: Before UI-relevant commits (components, CSS,
    design-system tokens — especially Slice 8 / Polish), run:
    `cd v3 && npm run test:e2e:visual`
    Check for unexpected diffs. If change is intentional: update baselines
    with `npm run test:e2e:update-snapshots` and commit the new `.png` files.
    Visual tests are macOS-only (Ubuntu CI excluded — font rendering differs).
11. **Lint + Format**: ESLint and Prettier are configured. Before committing
    any TypeScript/TSX: `npm run lint` must exit 0. Format with
    `npm run format` if needed. CI enforces both.
12. **Architecture Decision Records**: Bei jeder substantiellen Architektur-
    Entscheidung (Datenmodell, Persistenz, Cross-Cutting-Pattern, Plattform-
    Annahmen, neue Infrastruktur) ein ADR in `docs/architecture/` anlegen.
    Format laut `docs/architecture/_template.md`. Index in
    `docs/architecture/README.md` ergänzen. Verstreute Architektur-Notizen in
    `DESIGN_NOTES.md` sind keine ADRs — `DESIGN_NOTES.md` dokumentiert
    Design-Detail-Entscheidungen; `docs/architecture/` dokumentiert
    Architektur-Entscheidungen.

### Pre-commit checklist (mandatory before ANY commit)

Applies to slices, refactors, audit passes, bugfixes — every commit
without exception:

> **Automatisch erzwungen** (Phase 2): Husky-Pre-Commit-Hook führt drei
> Gates in Folge aus und blockt bei Fehler:
> 1. `npm run build` (tsc + vite, ~4s)
> 2. `npm run test` (vitest, ~1s)
> 3. `npm run test:e2e:smoke` (Chromium + WebKit, ~6s)
>
> Das manuelle Vorgehen unten bleibt als Baseline dokumentiert.
> Nach `git clone`: `cd v3 && npm install` aktiviert den Hook automatisch.

1. `cd v3 && npm run build` — must exit 0 with zero TypeScript errors
2. `cd v3 && npm run test` — all unit tests must pass (exit 0)
3. `cd v3 && npm run test:e2e:smoke` — 10 smoke tests must pass
4. `cd v3 && npm run dev` — must start without errors (verify briefly)
5. Only then: `git add . && git commit -m "..." && git push`

If any check fails: **do not commit**. Report the failure, ask for direction.

### Manual verification before commit

After build passes, manually verify the slice's user-facing functionality:

1. Run `npm run dev` and open the app in a browser
2. Walk through the user flow the slice introduced or modified
3. Document in the commit message OR in chat: which flows were verified

**Example:** "Verified: StartScreen loads, LIBRARY button opens Library,
IMPORT loads audio file correctly, files appear in list with waveform,
rename via input works, 2-tap delete removes file from list and IDB."

**Why:** Build success means "compiles", not "works". Logic bugs, UI bugs,
and persistence bugs don't fail the build but break functionality. Manual
verification is the only way to catch them before commit.

**Scope:** Verify the flows the slice touched, not the whole app. A Slice 2
commit doesn't need to verify Slice 1 functionality unless Slice 2 modified
shared components.

**If verification fails:** Do not commit. Fix the bug, re-verify, then commit.

### Slice completion checklist (additional, on top of pre-commit)

Before committing a slice, also:

1. Manually verify the slice's user-facing flows (see section above)
2. **Unit tests must be green**: `npm run test` exit 0
3. **New logic modules need unit-test coverage**: any new function in
   `src/lib/` or `src/state/` must have corresponding tests in
   `tests/unit/`. No coverage required for UI components or event handlers.
4. Update CLAUDE.md "Slice progress" table with completion date

---

## Build & dev commands

All commands run from the `v3/` subdirectory:

```bash
cd v3 && npm run dev           # dev server → http://localhost:5173 (HMR)
cd v3 && npm run build         # production build → v3/dist/ (tsc + vite)
cd v3 && npm run preview       # serve v3/dist/ locally for PWA testing
cd v3 && npm run test          # unit tests (vitest, once) — run before commit
cd v3 && npm run test:watch    # unit tests in watch mode (while developing)
cd v3 && npm run test:e2e      # E2E smoke tests (Playwright) — run before push
```

See `TESTING.md` for the full test architecture and conventions.

---

## V3 audio/IDB API

Canonical entry points for the IDB layer (`src/db/idb.ts`).
Use only these functions — never raw IDB transactions outside `src/db/`.

```typescript
// ── Library (src/db/idb.ts) ───────────────────────────────────────────────
libGetAllMeta(): Promise<LibraryItemMeta[]>
  // Cursor-based enumeration — blob never loaded, iOS-safe for any library size.
  // Call at app boot; populates libraryItems signal.

libGet(id: string): Promise<LibraryItem | null>
  // Returns full entry including Blob. Only call for playback (Slice 4+).
  // Caller must release reference after use.

libPut(item: LibraryItem): Promise<void>
  // Upsert. Called once per file during upload (after peaks computed).

libDelete(id: string): Promise<void>
  // Delete by SHA-256 hash-id.

libRename(id: string, newName: string): Promise<void>
  // Reads full entry (Blob briefly in RAM), patches name, re-puts.
  // IDB has no partial-update; this is the correct pattern.
```

Upload pipeline (`src/lib/upload.ts`):

```typescript
processFilesSerial(files: File[]): Promise<void>
  // Serial decode (never parallel). Calls addLibraryItemMeta() per file
  // for live UI progress. Sets uploadStatus signal on completion.

computeHash(buf: ArrayBuffer): string
  // SHA-256 via @noble/hashes (no Secure Context required — works on iPhone LAN).

computePeaks(decoded: AudioBuffer, N?: number): number[]
  // N=30 peaks from channel 0. Call before nulling decoded buffer.
```

```typescript
// ── Boards (src/db/idb.ts) ───────────────────────────────────────────────
boardGetAll(): Promise<Board[]>
  // Load all boards (JSON-only documents, no blobs). Called at app boot;
  // populates boards signal. iOS-safe: boards contain no audio data.

boardGet(id: string): Promise<Board | null>
  // Load a single board by ID. Used for optimistic reads before edits.

boardPut(board: Board): Promise<void>
  // Upsert entire board document (Board + embedded Scenes + Pads).
  // TRADE-OFF: any pad/scene edit rewrites the full ~50KB document.
  // Acceptable at 5×16 pads; see DESIGN_NOTES.md "Slice 8 / Performance"
  // for optimisation path if measured to be a bottleneck.

boardDelete(id: string): Promise<void>
  // Delete board and all embedded scenes/pads in one operation.
```

---

## Slice progress

| # | Name | Status | Date | Notes |
|---|------|--------|------|-------|
| 1 | Project setup + StartScreen | ✅ Complete | 2026-05-27 | Vite + Preact + TS scaffold; tokens.css; PixelIcon; TopBarV2; StatusBarV2; StartScreen; Preact Signals store; PWA config |
| 2 | Library + LibraryItem CRUD | ✅ Complete | 2026-05-27 | idb + @noble/hashes; LibraryItemMeta/LibraryItem split; serial upload pipeline; AudioRow; Waveform; 2-tap delete; rename via <input>; 2-column layout; 4 tabs |
| 3 | Board + Scene + Pad CRUD | ✅ Complete | 2026-05-27 | Board CRUD (BoardListScreen), Scene CRUD (SceneRail, inline rename, duplicate, reorder, delete+undo), Pad CRUD (3 paths: tap-slot popover, library drag, ADD PAD), Pad DnD (SWAP+INSERT), PadTypeConfirmDialog (v23 Option C), ModeToggle with sparks, SETUP/GAME modes, empty states |
| 4 | Audio playback | ✅ Complete | 2026-05-28 | Discriminated union (ADR-0042), engine.ts/index.ts/types.ts (ADR-0044), iOS hacks + LRU 150 MB (ADR-0043), all 4 pad types, Signal bridge, TAP TO UNLOCK wired, is-hot/is-looping CSS classes |
| 5 | Scene switching | ⬜ Pending | — | Multiple scenes, swap between them |
| 6 | Sets + Quick Access | ⬜ Pending | — | PadSet model + quick-access strip |
| 7 | Template export/import | ⬜ Pending | — | V1 compatibility |
| 8 | Settings, themes, polish | ⬜ Pending | — | Theme switcher, icons, atmosphere |

**Deviations from plan:**
- State manager chosen: Preact Signals (confirmed by user, Slice 1).
- App renamed from `app.tsx` kept as-is (Vite scaffold default); imported with lowercase `./app`.
- `LibraryItem.blob` never stored in Signals: type split into `LibraryItemMeta` (in state) + `LibraryItem` (IDB only).
- SHA-256 uses `@noble/hashes/sha2.js` (not Web Crypto API) — required for iPhone LAN dev server (no Secure Context at http://IP).
- Library screen is 2-column in Slice 2; inspector panel deferred to Slice 8+.
- npm cache: `~/.npm/_cacache/` partially root-owned on this machine; use `--cache /tmp/npm-cache-sos` flag for npm installs if permission error occurs.
- Slice 3: Board persistence as full JSON document (Board + Scenes + Pads); trade-off documented in idb.ts and DESIGN_NOTES.md.
- Slice 4: `stopPad(padId, immediate, fadeOut?)` takes explicit fadeOut parameter — engine doesn't hold a Pad reference after playback starts; callers pass `pad.fadeOut`. Pad-on-stop fadeOut is effectively 0 in Slice 4 (Slice 8 refinement).
- Slice 4: Infinite loops only (no loopCount > 0 support); crossfade is a stub (`stop(from)` + `play(to)`).
- Slice 4: `audio.spec.ts` added to FULL_TESTS in playwright.config.ts.
- Slice 3: `libDragItemId` state removed from BoardScreen — PadGrid reads drag payload directly from `e.dataTransfer`, not from React state.
- Slice 3: `Waveform` component has no `width` prop (fills flex container); fixed in PadEditorPanel, LibraryPanel, PadCreationPopover.
- Phase 2 (Testing Infra): `@size-limit/preset-app` replaced with `@size-limit/file` — preset-app uses Chrome for timing (crashes on this ARM mac due to estimo/chromium issue); file plugin measures gzip size only, which is what we need.
- Phase 2: Visual regression baselines are macOS-only (`*-darwin.png`); excluded from CI (Ubuntu font rendering differs).
- Phase 2: `no-unused-vars: 'off'` in eslint.config.js — handled by `noUnusedLocals: true` in tsconfig.app.json. Re-enable if tsconfig flag is ever disabled.
- Phase 2: deploy-pages.yml uses `workflow_run` (not `needs`) for cross-workflow sequencing — `needs` only works within the same workflow file.
