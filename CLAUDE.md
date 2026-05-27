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

---

## Reference documents

- **`V3_CONCEPT_BRIEF.md`** — binding architecture decisions for V3,
  data model, slice plan. Read first in every session.
- **`v1-reference/CLAUDE.md`** — V1's CLAUDE.md, kept for reference.
  Contains hard-won implementation knowledge that informed many of
  the rules below.
- **`v1-reference/index.html`** — V1 source, reference for behavior,
  audio engine, IndexedDB schema, template export/import.
- **`SoS_DESIGN_25052026/`** — design system: tokens, JSX components,
  HANDOFF document.

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
5. **After every feature or fix**:
   `git add . && git commit -m "..." && git push`
6. After every push: short summary of what changed and what to test.
7. **Update this CLAUDE.md** when permanent standards change.
8. **Update `update_log.md`** after every commit (if the file exists;
   create on first commit).

### Slice completion checklist (mandatory, in order)

Before committing any slice:

1. `cd v3 && npm run build` — must exit 0 with zero TypeScript errors
2. `cd v3 && npm run dev` — must start without errors (verify briefly)
3. Update CLAUDE.md "Slice progress" table with completion date
4. Only then: `git add . && git commit -m "..." && git push`

If any check fails: **do not commit**. Report the failure, ask for direction.

---

## Build & dev commands

All commands run from the `v3/` subdirectory:

```bash
cd v3 && npm run dev      # dev server → http://localhost:5173 (HMR)
cd v3 && npm run build    # production build → v3/dist/ (tsc + vite)
cd v3 && npm run preview  # serve v3/dist/ locally for PWA testing
```

Dependencies installed with `--cache /tmp/npm-cache-v3` if the
default npm cache is root-owned (known issue on this machine).

---

## V3 audio/IDB API

(To be populated by Claude Code when the audio engine is wrapped and
the IDB layer is implemented. List of typed function signatures with
short descriptions, so future sessions know the canonical entry
points.)

---

## Slice progress

| # | Name | Status | Date | Notes |
|---|------|--------|------|-------|
| 1 | Project setup + StartScreen | ✅ Complete | 2026-05-27 | Vite + Preact + TS scaffold; tokens.css; PixelIcon; TopBarV2; StatusBarV2; StartScreen; Preact Signals store; PWA config |
| 2 | Library + LibraryItem CRUD | ⬜ Pending | — | IndexedDB (idb), add/edit/delete assets |
| 3 | Board + Scene + Pad CRUD | ⬜ Pending | — | Create board, add scene, place pads |
| 4 | Audio playback | ⬜ Pending | — | V1 engine wrapped in src/audio/ |
| 5 | Scene switching | ⬜ Pending | — | Multiple scenes, swap between them |
| 6 | Sets + Quick Access | ⬜ Pending | — | PadSet model + quick-access strip |
| 7 | Template export/import | ⬜ Pending | — | V1 compatibility |
| 8 | Settings, themes, polish | ⬜ Pending | — | Theme switcher, icons, atmosphere |

**Deviations from plan:**
- State manager chosen: Preact Signals (confirmed by user, Slice 1).
- App renamed from `app.tsx` kept as-is (Vite scaffold default); imported with lowercase `./app`.
- `--cache /tmp/npm-cache-v3` required for npm installs due to root-owned cache directory.
