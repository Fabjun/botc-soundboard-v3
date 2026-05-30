# Backlog — Soundboard of Storytelling

All open work items, deferred decisions, and known limitations in one place.
Items land here when they are explicitly deferred during a slice or design session.
Items that are hypothetical or undocumented are not included.

**Maintenance:** At each slice completion, before the final commit — review this file,
mark completed items `✅ Done (commit SHA)`, and add any new deferred items surfaced
during the slice. This is the only defence against backlog drift.

---

## Table of Contents

1. [Features (Slice-bound)](#1-features-slice-bound)
   - [Slice 5 — Scene Switching](#slice-5--scene-switching)
   - [Slice 6 — Sets + Quick Access](#slice-6--sets--quick-access)
   - [Slice 7 — Template Export/Import](#slice-7--template-exportimport)
   - [Slice 8 — Settings, Themes, Polish](#slice-8--settings-themes-polish)
   - [PAD Editor (Polish)](#pad-editor-polish)
   - [Audio Engine (Deferred from Slice 4)](#audio-engine-deferred-from-slice-4)
   - [Library (Deferred from Slice 2/3)](#library-deferred-from-slice-23)
2. [Documentation Debt](#2-documentation-debt)
3. [Deferred Design Decisions](#3-deferred-design-decisions)
4. [Deferred Infrastructure](#4-deferred-infrastructure)
5. [CSS Class Discipline](#5-css-class-discipline-multi-session-plan)
6. [Known Limitations](#6-known-limitations)
7. [Manual Verification Reference](#7-manual-verification-reference)

---

## 1. Features (Slice-bound)

### Slice 5 — Scene Switching

### Scene navigation
Switch between multiple scenes on a board during play. The primary GAME-time interaction
after Slice 4 audio playback is live.
**Why deferred:** Slice 5 in the plan; scene data model and CRUD are complete (Slice 3).
**When:** Slice 5.
**Source:** V3_CONCEPT_BRIEF.md §5.1, CLAUDE.md Slice Progress table.

---

### Slice 6 — Sets + Quick Access

### PadSet model + Quick-Access strip
Horizontal strip above the board for one-tap set switches at GAME time.
**Why deferred:** Requires Slice 5 (scene switching) to be in place first; cross-scene set
usage needs to be observable before the layout can be designed well.
**When:** Slice 6.
**Source:** V3_CONCEPT_BRIEF.md §5.1, ADR-0013.

### Set CRUD (create / rename / duplicate / delete)
Full management UI for sets, mirroring Slice 3's Scene CRUD work.
**Why deferred:** Same as above.
**When:** Slice 6.
**Source:** DESIGN_NOTES.md §Slice 6 — capacity questions.

### Set composition and layout
Assign pads to sets; choose set layout (tabs / stack / floating panel).
**Why deferred:** Same as above.
**When:** Slice 6.
**Source:** DESIGN_NOTES.md §Slice 6 — capacity questions.

### Set reorder DnD
Reorder sets using Pointer Events (see `src/lib/padDnd.ts` and `src/lib/libDnd.ts` as
canonical patterns; never use HTML5 DnD).
**Why deferred:** No sets in Slice 5.
**When:** Slice 6.
**Source:** DESIGN_NOTES.md §Slice 3/Lessons — DnD pattern for future slices.

### Open UX question: Quick Access strip scope
Does the strip suffice for Slice 6, or does it need dedicated Sets-management artboards
mirroring the Scene CRUD work? Revisit after Slice 5 when cross-scene set usage is visible.
**When:** Slice 6 planning.
**Source:** DESIGN_NOTES.md §Slice 6 — Sets management UI.

---

### Slice 7 — Template Export/Import

### V1-compatible template export/import
Import V1 template files; a V1 board becomes a V3 board with one default scene containing
all pads. Export in a format V1 can read (V3-specific fields are additive; V1 ignores them).
**Why deferred:** Requires a working board with audio (Slices 3+4) before export is meaningful.
**When:** Slice 7.
**Source:** V3_CONCEPT_BRIEF.md §4.6 + §5.1, ADR-0015.

### Stream-based export/import (V1 lessons warning)
Must stream one library entry at a time — never JSON-load the entire library at once (iOS
memory safety; 150–300 MB string would OOM older iPhones). **V1 had memory-related crashes
on import/export that were solved by streaming.** V3 must port the V1 streaming pattern, not
re-invent it. Read `v1-reference/index.html` export/import code before designing Slice 7 —
same discipline as reading the V1 audio engine before Slice 4.
**Why deferred:** Same as above.
**When:** Slice 7.
**Source:** CLAUDE.md §iPhone/iOS memory rules, banned pattern #4; MANUAL_IPHONE_CHECKLIST.md §Section 2.

---

### Slice 8 — Settings, Themes, Polish

> **Note:** Slice 8 currently accumulates 20+ polish items across UI, Grid/Layout, PAD Editor,
> and Audio. When Slice 8 planning starts, the first task will likely be prioritizing or
> splitting into sub-slices (8a/8b/8c) rather than building everything at once.

#### UI / Appearance

### Theme switcher (Crimson, Verdant, Neon)
CSS-class on root element (trivial per ADR-0022); legacy-alias scope bug already fixed in
Slice 1+2 audit.
**Why deferred:** Polish; base functionality comes first.
**When:** Slice 8.
**Source:** V3_CONCEPT_BRIEF.md §5.1, ADR-0022, ADR-0023.

### Per-theme pad color overrides
Crimson gets a COMBO color override (rose-magenta sits next to `--blood` red — not a hard
conflict, but a missed opportunity). Verdant COMBO holds — the fairy-tale tone fits.
**When:** Slice 8 (after themes land).
**Source:** DESIGN_NOTES.md §Theme integration.

### Theme-conditional clock variants
Verdant Mushroom Clock is designed; Crimson candle-clock + Neon CRT-burn display are design
explorations (~30 min each). Worth shipping if themes get a real release pass.
**When:** Slice 8 (after themes land).
**Source:** DESIGN_NOTES.md §Theme integration.

### `is-deep` as user-configurable setting
Settings → Display → "High quality pad visuals" toggle. Currently always-on for the DepthPad.
**When:** Slice 8.
**Source:** ADR-0025, DESIGN_NOTES.md §DepthPad/pad rendering.

### Mode-awareness cues
One of four alternatives to reinforce SETUP/GAME distinction beyond the current toggle and
is-setup pad treatment. Evaluation order: (1) Atmosphere — SETUP shows grid; GAME adds
AmbientEmbers + hearth-glow (highest impact, reuses v8 infrastructure). (2) Status chip —
bold full-fill mode badge in status-bar left slot. (3) Edge tint — 2 px inset outline in
active mode colour. (4) Spine saturation — pad type-spines dim to 45% opacity in SETUP
(lowest priority; risks conflating mode and type semantics).
Ship one, optionally two if they hit different screen regions and don't compete.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Slice 8 — Mode-awareness cues.

### Pad Appearance settings persistence
"APPLY TO ALL PADS" writes to project state system-wide, not per-pad. Per-pad override is
a separate future feature.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Settings & system polish.

### Settings search across submenus
Typing filters all rows across all submenus, jumps to first match, highlights the term.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Settings & system polish.

### Mode-toggle SFX preview
Settings → Controls "Mode toggle SFX" file slot: preview the chosen sound at current MASTER
volume. Reuse the pad PREVIEW button code path — no separate "test sound" feature.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Settings & system polish.

### View Transitions API (optional polish)
iOS 18+ only; never a hard dependency. Progressively enhance scene/screen transitions if
available.
**When:** Slice 8 (only if iOS 18+ has reached the minimum-supported threshold by then).
**Source:** ADR-0006.

#### Grid / Layout

### Grid configurability (gridConfig popover)
Expose cols × rows in a popover. Mobile hard cap: 5×4 (no 6×4 or 6×6 in the mobile popover
— avoids "tooltip warning the user not to do the thing the UI offers").
**Why deferred:** Grid is currently hardcoded 4×4. Slice 3 decision to defer.
**When:** Slice 8.
**Source:** ADR-0032, DESIGN_NOTES.md §Slice 8 — A4 Mobile preset ceiling.

### Cell-size setting
Global preference in Settings → Display (compact / normal / spacious). Per-scene cell-size
multiplies the variation space without much real benefit.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Slice 8 — A4 Cell-size.

### Default new-scene grid as user preference
Currently hardcoded 4×4 for every new scene. Expose an override in Settings → Display.
Then 4×4 becomes "default until you change it once."
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Slice 8 — A4 Default new-scene grid.

### Unplaced pads remember desired position
When shrinking a grid pushes pads off, they retain their wanted (col, row). Enlarging the
grid re-places them automatically if the slot is still free.
**When:** Slice 8.
**Source:** ADR-0009, DESIGN_NOTES.md §Slice 8 — A4 Unplaced pads.

### Mobile layout adaptation
Make SceneRail collapsible or overlay at narrow viewports (≤ 390 px). Make inspector panels
(PadEditorPanel, LibraryPanel) slide over the pad grid rather than pushing it, or use a
tab-based layout. Minimum viable target: pad grid center area ≥ 44 px in all three SETUP
states at 390 px.
**Why deferred:** Desktop-first layout; mobile adaptation is a dedicated phase.
**When:** Slice 8.
**Source:** DESIGN_NOTES.md §Known limitation: SETUP layout.

### Empty-SETUP affordance / placeholder
The empty-SETUP inspector placeholder ("Select a pad to edit or open the Library") was
removed in commit 402b4c2 as a side-effect of a test fix. What the empty SETUP state
should show — guidance text, a wider bare grid, or something else — is an open UX question.
Decide after real-use data is available, likely with Claude Design.
**When:** Slice 8, after real sessions.
**Source:** DESIGN_NOTES.md §Known limitation: SETUP layout.

---

### PAD Editor (Polish)

Items below are PAD Editor interaction details deferred from Slice 3/4. All target Slice 8
or a dedicated editor polish pass.

### Key Capture flow
KEY / MIDI / GAMEPAD fields enter a "listening" state (pulsing teal border, "press any key…")
on click. Escape cancels. Visual: reuse SETUP-mode hatch during the listening window.
**Source:** DESIGN_NOTES.md §PAD Editor — Key Capture flow.

### Inline conflict feedback
Live ✓/⚠ hint under KEY field as a binding is chosen — don't wait for save.
**Source:** DESIGN_NOTES.md §PAD Editor — Inline conflict feedback.

### Snap-to-zero-crossing on waveform drag
Trim and loop markers snap to the nearest audio zero-crossing while dragging. Without it,
hard cuts produce audible clicks.
**Source:** DESIGN_NOTES.md §PAD Editor — Snap-to-zero-crossing.

### Numeric scrubbing on M:SS labels
TRIM START / TRIM END / LOOP POINT readouts: Premiere-style click-drag to nudge ±0.1 s
per pixel; hold ⇧ for ±0.01 s.
**Source:** DESIGN_NOTES.md §PAD Editor — Numeric scrubbing.

### Live preview that respects fades + trim
PREVIEW starts at trimStart with fades + loop applied. Playhead restarts at loopPoint for
LOOP-type pads so the user can hear the loop seam.
**Source:** DESIGN_NOTES.md §PAD Editor — Live preview.

### Crossfade duration as inline control
Mini-slider (60–600 ms) or numeric scrubber. Gate visibility on loop mode = CROSSFADE.
**Source:** DESIGN_NOTES.md §PAD Editor — Crossfade duration.

### Waveform zoom for long files
Zoom level (scroll wheel or ±/0 keys) + minimap strip; only relevant if files ≥ 60 s are
common in real use.
**Source:** DESIGN_NOTES.md §PAD Editor — Waveform zoom.

### Pad-type change confirmation
Switching LOOP→SINGLE invalidates loop-point and crossfade. Show inline confirm before
discarding; don't silently wipe settings.
**Source:** DESIGN_NOTES.md §PAD Editor — Pad-type change confirmation.

### Output bus inheritance hint
Faded one-line hint below OUTPUT BUS pills showing where the level baseline comes from.
**Source:** DESIGN_NOTES.md §PAD Editor — Output bus inheritance hint.

### Hotkey conflict on duplicate
⌘D conflicts with the browser "Bookmark this page" in non-standalone PWA mode. Options:
use ⌘⇧D, or accept that duplicate is right-click / long-press only when running outside
standalone mode.
**Source:** DESIGN_NOTES.md §A3 Scene CRUD open questions.

---

### Audio Engine (Deferred from Slice 4)

### Finite Loop Count (loopCount > 0)
Currently only infinite loops are supported. Add support for a fixed repeat count when
the need surfaces in real play sessions.
**Why deferred:** Infinite loops cover all known real-game use cases so far.
**When:** When missed in real use.
**Source:** CLAUDE.md Slice 4 deviations.

### Real crossfade
Currently a stub: `stop(from)` + `play(to)`. Implement proper crossfade in Slice 8.
**When:** Slice 8.
**Source:** CLAUDE.md Slice 4 deviations.

### `is-scheduled` pad state (combo + ducking)
A third visual state for pads that will fire on the next downbeat (combo scheduling, ducking
release). Softer outline in pad-type colour, no inset fill — distinct from idle and `is-hot`.
Hold until combo timing is real in the UI.
**When:** After combo scheduling lands (Slice 8+).
**Source:** DESIGN_NOTES.md §Slice 4 — C1.

### `--pad-soft-outline` token family
Colour values for the `is-scheduled` visual. Hold until `is-scheduled` is approved — adding
tokens before the state has a use makes the §A cheat-sheet noisier without solving anything.
**When:** Same as `is-scheduled`.
**Source:** DESIGN_NOTES.md §Slice 4 — C2.

### Per-pad level metering
The audio engine has analyser node infrastructure, but per-pad metering UI is deferred.
Adds CSS animation complexity and is a polish concern, not functional.
**When:** Slice 8 (Polish).
**Source:** Slice 4 plan, scope notes ("Nicht in Slice 4").

---

### Library (Deferred from Slice 2/3)

### Multi-file playlist UX
FileRow supports multiple files for playlist pads: drag to reorder, click to select primary,
⌘-click for bulk remove. The currently-selected file's waveform shows in the big canvas.
**When:** When playlist pads are in real use (Slice 4+).
**Source:** DESIGN_NOTES.md §Audio file management.

### Per-file fade and trim for playlist pads
Each playlist entry gets its own fade-in / trim. Either per-file state or per-file JSON in
the project file. Decision deferred until playlist UX is built.
**When:** Same as multi-file playlist UX.
**Source:** DESIGN_NOTES.md §Audio file management.

### Tag autocomplete with keyboard
Typing in the tag field surfaces matching tags from the project pool (case-insensitive, fuzzy
on substring). ↵ commits, ⌫ on empty input removes last chip. Chips render in pad-type colour
family if a semantic mapping exists.
**When:** Slice 8 or library polish pass.
**Source:** DESIGN_NOTES.md §Tags & folders.

### Folder picker as a tree
The FOLDER field opens a narrow tree column inside the inspector, not a separate dialog. New
folder via a `+ NEW` row at the bottom.
**When:** Slice 8 or library polish pass.
**Source:** DESIGN_NOTES.md §Tags & folders.

---

## 2. Documentation Debt

### DESIGN_SYSTEM.md §1–§5 write out
Sections §1–§5 currently exist but are stubs or placeholder content. Need to be filled with
actual system documentation.
**When:** As design documentation catch-up, likely before Slice 8.
**Source:** Referenced in multiple sessions as "not yet written."

### `@inventory` descriptions for all sb-* classes
The `sync:classes` generator (part of `npm run sync:docs`) populates DESIGN_SYSTEM.md §6
from `/* @inventory: Description */` CSS comments. Many of the ~57 sb-* classes lack the
comment. Without it, the auto-generated inventory is incomplete.
**When:** Ongoing — add the comment whenever touching a class; do a full pass before Slice 8.
**Source:** CLAUDE.md §13 — Auto-generierte Inventuren.

---

## 3. Deferred Design Decisions

Open questions surfaced during implementation but not yet resolved. Each needs a deliberate
decision before the relevant slice ships.

### Empty-SETUP affordance
See Features → Slice 8 above. Duplicated here as a reminder that it is a design decision,
not just a feature.

### Delete-last-scene behaviour
Drop back to Empty Board state (recommended — zero scenes is a legal Board state, Empty Board
UX is already good) vs. block the action. May have been decided during Slice 3 implementation;
verify before Slice 5.
**Source:** DESIGN_NOTES.md §A3 Scene CRUD open questions.

### Scene rename: allow duplicate names?
Scenes are ID-referenced; name is display-only. Strict-unique adds friction without benefit.
Likely defaulted to "allow" during Slice 3 — verify.
**Source:** DESIGN_NOTES.md §A3 Scene CRUD.

### Scene mobile reorder: stepwise vs. handle-based
Slice 3 shipped stepwise Move up/Move down. A dedicated reorder-mode with handles on every
tab is for power users with ≥ 6 scenes. Revisit in Slice 8 based on real use.
**Source:** DESIGN_NOTES.md §A3 Scene CRUD.

### Long-press threshold (350 ms)
Fixed-with-accessibility-override is the cleanest. Or expose in Settings → Controls. Decide
in Slice 8 based on real-use feedback.
**Source:** DESIGN_NOTES.md §A3 Scene CRUD.

### `--success` green: keep teal alias or migrate to real green?
`--success: #6DB5B8` is aliased to loop teal. `--fade: #6FA85F` introduced a real green for
the first time. If the palette warms up to greens, reconsider `--success`. Hold until one or
two design sessions with `--fade` in context.
**Source:** DESIGN_NOTES.md §Open token/palette questions.

### A2 Path B: 5–10 s audio zone
Pad-type inference defaults to SINGLE in the ambiguous 5–10 s band. Re-evaluate if real audio
sets show many sub-loops in this zone.
**Source:** DESIGN_NOTES.md §Slice 3 — A2 Path B.

### ModeToggle sparks — design-implementation divergence
The CSS class `sb-mode-toggle-sparks` was designed as a contained overflow element to hold
spark particles during mode-toggle animation. However, `ModeToggle.tsx` appends spark elements
directly to `document.body` instead of using this container.

**Open question:** Is the body-direct approach deliberate (e.g., for z-index isolation above
all overlays) or an oversight?
- If **deliberate:** document the rationale (ADR or DESIGN_NOTES) and remove the unused
  `.sb-mode-toggle-sparks` CSS.
- If **oversight:** wire sparks through the contained element to match the design intent.

**When:** Slice 8 (Polish), or earlier if mode-toggle animation needs revisiting for
z-index/overlay issues.
**Source:** Truth-check commit `e207a0b`; class marked `[unused-css]` in DESIGN_SYSTEM.md §6.

---

## 4. Deferred Infrastructure

### Re-enable mobile layout tests
`mobile-touch-targets.spec.ts` and `mobile-overflow.spec.ts` have FIXME markers because the
desktop-first layout fails them at 390 px (layout geometry is broken by design until Slice 8).
Re-enable once the Slice 8 mobile adaptation is in place.
**When:** Slice 8 completion.
**Source:** CLAUDE.md commit notes a37dd26, DESIGN_NOTES.md §Known limitation.

### Re-enable DnD E2E tests
Tests 9, 14, 20, 21 in `pad-dnd.spec.ts` are `test.skip` (Scene reorder, Library drag Path B,
Pad SWAP, Pad INSERT). Need a stable Pointer Events drag sequence in Playwright.
**When:** When a reliable `dragByPointer()` helper is established in Playwright (Phase 3).
**Source:** TESTING.md §Bekannte Fallstricke #5.

### Board persistence optimisation
`boardPut()` rewrites the full ~50 KB Board document on every pad/scene edit. Acceptable at
5×16 pads; may be a bottleneck at larger board sizes. If profiling shows it's slow: split
scenes into a separate IDB store.
**When:** Only if measured as a bottleneck. Do not optimise prematurely.
**Source:** ADR-0010, idb.ts inline comment.

### Pre-commit hook runtime watch
Pre-commit hook currently runs in ~16 s (sync:docs + build + lint-staged + 102 unit tests +
10 smoke E2E + link:check). Below the 20 s pain threshold. If runtime grows uncomfortable:
smoke E2E is the first candidate to move to CI-only (it's the most expensive gate, and CI
runs it anyway; removing it from the pre-commit saves ~6 s locally with no CI coverage gap).
**When:** When the hook exceeds ~25 s in practice.
**Source:** TESTING.md §CI-Integration; empirical measure.

### I18n infrastructure
Structure code so a future i18n pass is feasible (texts in named constants, not hardcoded in
JSX). Currently English-only; no timeline.
**When:** Only if a localisation need is confirmed.
**Source:** V3_CONCEPT_BRIEF.md §4.11, ADR-0041.

### Reduced-motion fallback for ModeToggle — resolved, cleanup pending
The `sb-mode-toggle-flash` class is CSS-defined as a brightness-flash fallback for users
with `prefers-reduced-motion: reduce`, but `ModeToggle.tsx` skips the animation entirely
rather than applying the fallback class. Behavior is correct (no animation = honoring
reduced-motion), but the CSS rule for `.sb-mode-toggle-flash` is confirmed dead code.

**Action:** Remove `.sb-mode-toggle-flash` from `v3/src/styles/tokens.css` when next
touching that file (e.g., during Slice 8 polish).
**When:** Slice 8, or opportunistically when tokens.css is edited.
**Source:** Truth-check commit `e207a0b`; class marked `[unused-css]` in DESIGN_SYSTEM.md §6.

### Dead CSS: `sb-creation-popover-section`
The class was designed as a padded, bordered section divider inside the creation popover.
`PadCreationPopover.tsx` was implemented using direct inline styles for every section instead
(e.g., `padding: '8px', borderTop: '1px solid var(--border-soft)'`). The class and the
inline styles are semantically equivalent — the class was bypassed at implementation time,
not planned for later.

**Action:** Either apply the class in a Slice 8 cleanup (replacing repetitive inline styles
with the class), or remove the CSS rule if the inline-style approach is kept.
**When:** Slice 8 (Polish), when the creation popover is next touched.
**Source:** Truth-check commit `e207a0b`; class marked `[unused-css]` in DESIGN_SYSTEM.md §6.

### Verify `--pix-bg-layer` removal in `.sb-pix` / `.sb-pad.is-deep`
The token `--pix-bg-layer` was removed from `v3/src/styles/tokens.css` during V3 development.
The `.sb-pix` rule uses it with a CSS fallback:
`var(--pix-bg-layer, linear-gradient(var(--pix-bg), var(--pix-bg)) padding-box)`.
The fallback likely makes the removal transparent for most cases, but `.sb-pad.is-deep` may
reference `--pix-bg-layer` directly (without a fallback). Visually confirm that the `.is-deep`
depth treatment renders correctly, and confirm no explicit `--pix-bg-layer` references without
fallbacks remain in `tokens.css`.
**When:** When `tokens.css`, `.sb-pix`, or `.sb-pad.is-deep` CSS is next touched.
**Source:** Session 0 tokens.css diff, 2026-05-29.

### shellcheck in pre-commit hook — evaluate first

Two `set -e` bugs in the BACKLOG drift reminder (grep exit 1, git log exit 128)
reached commits before being caught. `shellcheck` is a standard linter that knows
exactly this class of bug and would have flagged both at write time — an Ebene-1
"make the error impossible" measure rather than relying on review.

**Evaluate before adopting — do NOT just add it:**
- Does it meaningfully slow the pre-commit hook? (The hook is already ~16s, near the
  ~20s comfort threshold. Measure shellcheck's runtime on `.husky/*` before adding.)
- Is the hook the right place, or should it be CI-only / an editor integration? A blocking
  shellcheck gate that fires on style-nitpicks would be annoying; configure severity so it
  catches real bugs (like the set -e traps) without noise.
- It only covers shell scripts (`.husky/*` and `scripts/*.sh` if any) — small surface, but
  the surface where the recent bugs lived.

**Why deferred:** Meta-tooling; the CSS Class Discipline migration (Sessions 2–3) takes
priority. Worth doing eventually because the set -e class bit us twice.
**Source:** Conversation 2026-05-29 — "how to prevent things being overlooked."

### Review checklist — evaluate, keep minimal

During Session 1, most overlooked issues were caught by recurring review questions, not
by a mechanism. Codifying those questions as a short checklist would make the catching
less dependent on in-the-moment attentiveness. The recurring questions that actually
caught bugs:
- Was this number/claim measured, or estimated? (caught the 60–80 miscount)
- Which file/source does this actually read? (caught sync:tokens wrong-file)
- What happens in the error / edge case? (caught the set -e traps)
- Will the thing we built actually be found/used? (caught the iPhone-checklist gap)
- Does this only sound plausible, or is it backed by evidence? (the underlying pattern)

**Evaluate before adopting — and keep it SHORT:**
- A checklist only helps if it's used. A long one gets skipped. Five questions max; if it
  grows, it has failed.
- It must NOT become "always plan / always test everything" — selective vigilance is what
  works; a reflexive checklist on every trivial edit dulls attention and defeats itself.
- Decide where it lives: a short section in CLAUDE.md, or a standalone REVIEW_CHECKLIST.md
  referenced from the slice-completion routine. (Note: it's a checklist for the human
  reviewing plans, not for Claude Code — placement should reflect that.)

**Why deferred:** Process improvement, not blocking. The questions already work informally;
this just makes them durable. Low priority but cheap.
**Source:** Conversation 2026-05-29 — "how to prevent things being overlooked."

---

## 5. CSS Class Discipline (multi-session plan)
_Plan authored: 2026-05-29_

Four sequential sessions to establish and enforce stronger discipline around CSS class usage
versus inline styles. Motivated by a pattern identified on 2026-05-29: inline styles are
used for static structural values (e.g., `sb-creation-popover-section` bypassed in favour of
`style={{ padding: '8px', borderTop: ... }}`), bypassing the design-system class system and
creating drift that the `sync:classes` audit cannot detect.

### Session 0 — Documentation organization ✅ Done (5298705)
_Purpose:_ Clarify the roles and hierarchy of all design-related documentation loci before
any new convention rules are written. Without this, new rules risk landing in the wrong file
and going unread.

**Deliverables:**
- Define the role of every design doc locus: `DESIGN_SYSTEM.md`, `DESIGN_SYSTEM_CHEATSHEET.md`,
  `SoS_DESIGN_25052026/` (jsx files + tokens.css), `Responsive_Strategy_V3.html`,
  `DESIGN_NOTES.md`. Each must have a one-sentence "this is for X, source of truth for Y"
  definition.
- Resolve the `tokens.css` duplication: `SoS_DESIGN_25052026/tokens.css` vs.
  `v3/src/styles/tokens.css`. Pick one of three options deliberately: (a) both stay with
  explicit headers explaining the split, (b) design snapshot moves to an archive location,
  (c) design snapshot is removed entirely.
- Define explicitly where workflow rules for code conventions live (so Session 1 knows where
  to write the new class-vs-inline rule).
- Expand the planned scope of `DESIGN_SYSTEM.md §1` from "Nomenclature (CSS)" to
  "Naming Conventions (project-wide)" — covering CSS classes, tokens, components/files,
  signals, ADRs, `data-testid`, etc. Include a TODO checklist of these sub-topics inside
  the §1 placeholder.
- Add a header note to `DESIGN_SYSTEM.md` at the top defining its hierarchy ("source of
  truth; cheatsheet is the short form; conflicts → this file wins").
- Add a header note to `DESIGN_SYSTEM_CHEATSHEET.md` referencing back to `DESIGN_SYSTEM.md`
  as the long form.

**When:** Next session, before any other CSS-discipline work.
**Source:** Conversation 2026-05-29 — six gaps identified during critical review of the
multi-session plan.

---

### Session 1 — Workflow rule + audit tooling + sync:classes warning ✅ Done (3b1ae06)
_Purpose:_ Establish the rule that prevents inline-style drift, build the tooling that
measures it, and tighten the existing `sync:classes` generator to warn on undocumented
new classes.

**Deliverables:**

1. **Workflow rule** (location decided in Session 0) covering three paths:
   - **Path A:** Use an existing `sb-*` class from `DESIGN_SYSTEM.md §6` whenever one fits.
     Consulting §6 before adding a new class is mandatory.
   - **Path B:** Create a new `sb-*` class if no existing one fits and the value is structural
     and reusable. New class must follow naming conventions (per §1) and use design tokens.
     Before creating: check §6 for similar function — if a similar class exists, extend it
     (e.g., with `is-*` variant) instead of duplicating. If unsure whether duplication risk
     exists, raise the question rather than silently creating.
   - **Path C:** `style={}` is legitimate only for dynamic values (computed from data,
     animations, drag positions, runtime calculations). Static values — including those using
     `var(--token)` — belong in classes, not inline. Inline-with-token is just as much a
     Path-D violation as inline-with-literal when the value is static.
   - **Forbidden (Path D):** Inline styles for static structural values, with or without tokens.

2. **Audit script** (`scripts/sync-inline-styles-audit.ts` or similar): scans
   `v3/src/**/*.tsx`, finds all `style={}` props, classifies them heuristically as
   "likely-static" (no template literals, no function calls, no variable references — just
   object literals with string/number values) vs. "likely-dynamic". Reports counts per file
   and a baseline total. Integrated into npm scripts (`audit:inline-styles`) and ideally
   into CI as informational (not blocking).

3. **`sync:classes` warning:** When `sync:classes` finds a class without `@inventory`, output
   a warning (not an error). Distinct from `[unused-css]` markers — those are intentional.
   The warning is for new classes that haven't been described yet.

4. **BACKLOG drift reminder** (non-blocking): a pre-commit or CI hint that surfaces when
   BACKLOG.md hasn't been touched in a while despite ongoing commits — e.g. "Last BACKLOG
   edit was N commits ago; consider updating." This is a reminder to reflect, NOT automatic
   item-closing (semantic completion can't be reliably automated). Same mechanism family as
   the sync:classes warning. Tune the threshold (commit count or days) during implementation.
   **Source:** Conversation 2026-05-29 — discussed alongside "should the backlog auto-update?"

5. **Fix `sync:tokens` source — read from canonical file, verify all generators consistent:**
   `sync:tokens` currently reads from `SoS_DESIGN_25052026/tokens.css` (the design handoff
   origin, now explicitly marked non-canonical). As a result, `DESIGN_SYSTEM.md §A` — which
   should be the source of truth — is generated from the wrong file: it is missing 9 tokens
   added during V3 development (`--flame-soft`, `--flame-aura`, `--grid-cols/gap/rows`,
   `--spark-duration/dx/dy`, `--undo-duration`) and still lists `--pix-bg-layer` which was
   removed. This is exactly the class of documentation drift Session 0 was designed to
   surface — one layer deeper into tooling.

   **Concrete fix:** Change `scripts/sync-tokens-inventory.ts` to read from
   `v3/src/styles/tokens.css` instead of `SoS_DESIGN_25052026/tokens.css`. Regenerate §A —
   should show 9 new tokens and correctly exclude `--pix-bg-layer`.

   **Broader verification (do at the same time):** Confirm that all `sync:*` generators read
   from the same canonical source. `sync:classes` reads from `v3/src/styles/tokens.css`
   (confirmed — `@inventory` comments live there and §6 reflects them correctly). The question
   to answer: are all three generators (`sync:adr`, `sync:classes`, `sync:tokens`) consistent
   in their canonical source, or is `sync:tokens` the only outlier? Report in the commit
   message.
   **Source:** Session 0 diff analysis, 2026-05-29.

**Alignment note (pre-work for Session 1):** Before writing the new class-vs-inline rule in
CLAUDE.md, verify that `DESIGN_SYSTEM_CHEATSHEET.md`'s decision tree (specifically the
inline-style and class-creation branches) aligns with the Path A/B/C/D logic. If the existing
tree says something different, Session 1 must resolve the conflict — not just add a
cross-reference sentence, but ensure both documents say the same thing.
**Source:** Session 0 review, 2026-05-29.

**When:** After Session 0 completes.
**Source:** Conversation 2026-05-29.

---

### Session 2 — Stage-3 plan, scoped by Session 1 baseline measurement ✅ Done (eda7458)
_Purpose:_ Decide the shape of the migration work based on actual measurement, not estimation.

**Delivered (2026-05-29):** Concrete 3a–3h migration roadmap from the verified baseline.
Per-file breakdown table (column sums exact: 177 violations, 13 pure-layout, 164 struct+mixed,
20 dynamic-with-static, 2 unclassified). Layout primitive specification (5 classes). Gap
normalization decision (6px → `var(--space-2)`). Sub-session sizing with audit-checkable DoDs.

**Source:** Conversation 2026-05-29.

---

### Session 3 — Migration of inline-styles to classes (8 sub-sessions)

_Purpose:_ Convert all 177 Path-D violations + 20 dynamic-with-static + 2 unclassified blocks
into proper class usage. New classes created per 4-path rule; explicit anti-duplication
discipline throughout.

**Baseline to beat:** `cd v3 && npm run audit:inline-styles` → 177 violations / 20 d-w-s / 2 unclassified.  
**Target:** all three reach 0. (The 4 legitimate blocks — 2 pure-dynamic, 2 custom-setter-only — remain.)

---

#### Layout Primitives (Session 3a creates these in `v3/src/styles/tokens.css`)

| Class | CSS | Purpose |
|-------|-----|---------|
| `sb-row` | `display: flex; align-items: center; gap: var(--space-2)` | horizontal flex row, 8px gap |
| `sb-row-sm` | `display: flex; align-items: center; gap: var(--space-1)` | horizontal flex row, 4px gap |
| `sb-flex-1` | `flex: 1` | flex-fill spacer |
| `sb-row-wrap` | `display: flex; flex-wrap: wrap; gap: var(--space-1)` | wrapping flex row |
| `sb-row-fill` | `display: flex; flex: 1; align-items: center; justify-content: center` | fill + centered row |

**Gap normalization:** `gap: 6` (5 blocks across the codebase) → `var(--space-2)` (8px).
The token scale is deliberately coarse; 2px difference is visually imperceptible.
If any block renders noticeably wrong after normalization, report before committing.

---

#### Sub-session Plan

Violation counts are **post-3a** (after 3a removes the 13 pure-layout blocks).  
DoD for each file session: `audit:inline-styles` → 0 violations for that file.

| Session | Files | violations (post-3a) | d-w-s | unclassified | DoD |
|---------|-------|----------------------|-------|--------------|-----|
| **3a** ✅ Done | All files — pure-layout only; create 5 primitives (+sb-hidden) | 12 of 13 fully resolved; 1 residual (see note) | 0 | 0 | audit → 1 pure-layout (BoardListScreen:237 `flexShrink:0` residual, assigned to 3f — roadmap prediction of "reclassify as d-w-s" was wrong, it stays pure-layout); 6 new classes (+5 primitives +sb-hidden); 63 total in §6 |
| **3b** ✅ Done (172c695) | `PadEditorPanel.tsx` | 23 | 4 | 0 | 0 violations, 0 d-w-s. 22 new classes (§6: 63→85). 11 flagged for 3d Path A. 3 Sorte-2 bets (see note below). sb-range-input: native `<input type="range">`, distinct from sb-slider custom div-track, 3 DOM renders — confirmed ≥2 uses. |
| **3c** | `LibraryScreen.tsx` | 20 | 3 | 0 | 0 violations, 0 d-w-s |
| **3d** | `PadCreationPopover.tsx` | 15 | 6 | 0 | 0 violations, 0 d-w-s |
| **3e** | `StartScreen.tsx` | 19 | 0 | 0 | 0 violations |
| **3f** | `BoardScreen.tsx` + `BoardListScreen.tsx` | 17 + **14** = **31** | 0 | 0 | 0 violations + 0 d-w-s + 0 pure-layout for BoardListScreen. BoardListScreen has 14 (not 13) because the 3a residual `style={{ flexShrink: 0 }}` still counts as 1 violation. The action-row semantic class (created in 3f) absorbs it — reaching 0 pure-layout for that file. |
| **3g** | `SceneRail.tsx` + `LibraryPanel.tsx` + `AudioRow.tsx` | 9 + 11 + 8 = 28 | 0+0+2 = 2 | 0 | 0 violations, 0 d-w-s |
| **3h** | `PadTypeConfirmDialog.tsx` + `TopBarV2.tsx` + `BoardTopBarV3.tsx` + `PadGridCell.tsx` + `UndoToast.tsx` + `StatusBarV2.tsx` + `Waveform.tsx` + `PixelIcon.tsx` | 13+5+4+4+2+1+0+0 = 29 | 1+1+1+0+0+0+2+0 = 5 | 1(PTD)+1(Pix) = 2 | 0 violations, 0 d-w-s, unclassified resolved |

**Arithmetic verification:** 12+23+20+15+19+31+28+29 = 177 ✓ | d-w-s: 4+3+6+0+0+2+5 = 20 ✓ | unclassified: 2 ✓
_(3a resolves 12 fully + 1 residual deferred to 3f; 3f scope is 31 = 17+14. Total closes to 177.)_

**3b Sorte-2 bets** (created on expectation of 3d/3c reuse; cleanup candidates if not used as Path A):
- `sb-type-btn` — bet: 3d (PadCreationPopover) has a type selector with xs-btn in row-wrap. Verify in 3d; if not used → merge into sb-btn-xs or drop.
- `sb-section-header-row` — bet: 3d or 3c has a space-between section header with margin-bottom. 2 uses in 3b already (minimum threshold met); still watch for 3d Path A confirmation.
- `sb-panel-title` — bet: LibraryPanel (3g) or another inspector has a flex-fill mono title span in its header. Check during 3c/3g; cleanup candidate if isolated to PadEditorPanel.

**Ordering rationale (load-bearing):**
- 3a first — layout primitives are a dependency for all subsequent sessions
- 3b (PadEditorPanel) **before** 3d (PadCreationPopover) — both have form-section patterns;
  3b establishes shared classes, 3d uses them as Path A. **Swapping this order risks duplicate classes.**
- 3c (LibraryScreen) **before** 3g (LibraryPanel) — same reason: shared list/metadata patterns
- 3e (StartScreen) anywhere in the middle — isolated, no structural sharing
- 3g and 3h last — consume patterns from screen sessions; maximizes Path-A reuse

---

#### Per-sub-session required first step (mandatory for 3b–3h)

At the start of each file session, **before touching any code:**

1. **Read §6 in full** — run `npm run sync:classes` first to ensure it reflects the previous
   session's new classes.
2. **Batch-scan the file's violations by category** — categorize each block as pure-structural,
   mixed, or dynamic-with-static. The global audit reports per-file totals, not per-file category
   breakdown; derive this split locally, because it informs the migration approach: mixed blocks
   require combining a layout primitive + structural class; pure-structural blocks need only one class.
3. **Batch Path A/B decisions for every violation at once** — do not decide one-by-one while
   editing. Context collapses when you alternate between reading and writing.
4. **For each Path B class:** grep §6 for similar function before creating. If the same structural
   need appears multiple times in the file, create ONE class used N times.

**At sub-session end:**
- Add `/* @inventory: … */` to all new classes → run `npm run sync:classes` → verify §6 updated
- Report: Path A vs Path B split, new-class count
- Commit before starting the next sub-session (so the next session inherits an up-to-date §6)

---

**When:** Per the 3a–3h ordering above.  
**Source:** Conversation 2026-05-29.

---

**Cross-references:**
- `sb-creation-popover-section` (§4 Deferred Infrastructure — canonical example of
  inline-style drift)
- `sb-mode-toggle-sparks` (§3 Deferred Design Decisions — design-implementation divergence)
- ADR-0021 (CSS naming), ADR-0022 (tokens), ADR-0027 (semantic pad-type colors)

---

### Color-literal audit — investigate Stylelint first

ADR-0022 forbids color literals (hex, rgb(), named colors) in favour of design
tokens (`var(--token)`). There is currently no automated check that this holds.
A measurement of where literals slipped in would be useful — same idea as the
inline-style audit.

**Important — check the right tool first:** Before building a custom audit script,
investigate whether Stylelint (or an existing ESLint plugin) already covers this.
There are standard rules for "no color literals / enforce custom properties." If a
lint rule exists, use that (it runs in-editor and can gate pre-commit) rather than
writing and maintaining a custom script. A custom audit is only justified if no
lint rule fits AND we specifically want a count/baseline rather than a pass/fail gate.

**Why deferred:** Not urgent; the inline-style discipline work (CSS Class Discipline
Sessions 1–3) takes priority. Color-token discipline appears largely followed already
(the tokens-inventory generator runs cleanly), so drift here is likely small.

**When:** After CSS Class Discipline Sessions 1–3 are complete. Low priority.

**Source:** Conversation 2026-05-29 — "should we use audit scripts elsewhere?"

---

## 6. Known Limitations

Documented, accepted constraints. Will not be fixed until the triggering platform or slice
changes.

### Ringer Switch (physical mute)
When the iOS physical Ringer Switch is set to silent, the app produces no sound — same
behaviour as V1. This is an iOS platform limit: the AVAudioSession silent-WAV trick cannot
override the hardware switch. The silent-WAV still serves its purpose (consistent
`AudioContext.resume()` after interruptions and tab-switches). Deliberate; not a bug.
**Source:** DESIGN_NOTES.md §iOS Plattform-Grenzen.

### Populated-SETUP layout at 390 px viewport
SceneRail (220 px fixed) + open inspector panel (280 px fixed) = 500 px combined minimum,
which exceeds a 390 px viewport. The center pad grid is pushed to 0 px. Expected for the
current desktop-first layout. Fix deferred to Slice 8 mobile adaptation.
**Source:** DESIGN_NOTES.md §Known limitation: SETUP layout.

### HTML5 DnD silently broken on iOS
`draggable` / `ondragstart` / `ondrop` are not supported on iOS Safari/Brave. All DnD must
use Pointer Events. Canonical patterns: `src/lib/padDnd.ts` (pad-to-pad) and
`src/lib/libDnd.ts` (library-to-grid). Any future DnD interaction must follow these patterns.
**Source:** CLAUDE.md §Supported Platforms, DESIGN_NOTES.md §Slice 3/Lessons.

### WebKit headless: no audio codec support
Playwright's headless WebKit build cannot decode audio (`decodeAudioData()` fails). As a
workaround, audio-dependent mobile tests run on Chromium with the iPhone 13 Pro device
profile. Audio-free mobile specs continue on WebKit.
**Source:** TESTING.md §Bekannte Fallstricke #7.

### `boardPut()` full-document rewrite
Any pad or scene edit rewrites the entire ~50 KB Board document. Acceptable at current board
sizes. See the infrastructure item above for the optimisation path.
**Source:** ADR-0010.

---

## 7. Manual Verification Reference

`docs/MANUAL_IPHONE_CHECKLIST.md` must be run before every release and after any commit
that touches audio code (`src/audio/`), the IDB layer (`src/db/`), or file-handling
(import/export). It covers items that cannot be automated in Playwright:
- File upload via iOS native picker (bypassed by `setInputFiles()`)
- Actual audio output
- Ringer Switch behaviour
- Tab-switch / backgrounding lifecycle
- Backup import/export via iOS Files app

See `TESTING.md §Mobile Testing` for the full rationale.
