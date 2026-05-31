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

### End-of-Session-3 consolidation pass (after 3h)

> **⚠️ Timing: run ONLY after 3h is complete.** Doing any part of this mid-migration
> wastes effort — 3f–3h keep changing the class landscape, so a sweep done now goes stale
> before it finishes. End of Session 3 is when §6 reaches its final post-migration state
> and nothing large moves anymore.
>
> **Scope — hand-maintained content only.** Generated artifacts (§6, §A, ADR index,
> docs-sync output) are verified continuously by CI (the docs-sync-check gate fails a push
> on drift) — they are **explicitly out of scope**. This pass is for content CI cannot
> check: prose accuracy, bet outcomes, and @inventory description correctness.

**Five tasks:**

**1. @inventory-vs-CSS accuracy audit**
Verify that every class's `/* @inventory: … */` description matches its actual CSS
definition. `sync:classes` only checks that the comment *exists* — it cannot detect a
description that describes an old definition. By end of Session 3 the mid-migration checks
will have covered 3b–3e redefinitions; this final pass covers everything including 3f–3h
additions. Flag and fix mismatches; a stale description is misinformation in §6.
_(Ongoing rule: add the `@inventory` comment when creating a class, and update it when
redefining one. The full accuracy sweep here is the one-time end-of-migration verification.)_

**2. CLAUDE.md descriptive-vs-prescriptive audit**
Cross-reference: "Single-source design values + descriptive/prescriptive split" (§5,
Session 8 target). Review whether Sessions 3f–3h added any descriptive duplication to
CLAUDE.md or DESIGN_SYSTEM prose (class values repeated in prose instead of referenced
from the single source). Do not duplicate the Session 8 work; note what needs attention
there. Part B of that entry (classify each statement as descriptive or prescriptive)
applies — descriptive repetitions of class values → remove; prescriptive rules → keep.

**3. 1-use class consolidation review**
By end of 3h, some classes flagged as 1-use during migration will have been reused via
Path A; others remain 1-use. Go through the full list of classes created with a 1-use
flag and decide for each: **confirmed-justified** (standalone design element, no natural
partner), or **consolidation candidate** (merge, add as modifier on an existing class,
or drop). The Sorte-2 bet index feeds this directly — every LOST-cleanup bet resolves
here into a concrete merge/drop action.

**4. Final Sorte-2 bet resolution**
Close out all OPEN bets in the consolidated bet index (§5 → Sorte-2 Bet Index) per
actual outcomes after 3h. PARTIALLY-FAILED bets resolve to WON or LOST-but-justified.
SPECULATIVE bets (the 3e overlay family, Slice-8 target) carry forward unchanged — note
their status explicitly. The index is the canonical record; update it, not session entries.

**5. Inter-document consistency check**
Spot-check that session entries and the bet index are mutually consistent after 3h.
Typical drift: a session entry still says "PENDING" for a bet the index shows as WON.
Fix the lagging entry; the index is canonical. Also verify token-drift normalizations
logged during migration (e.g. 3e's 10 off-token values) are reflected correctly.

**When:** After 3h is complete, before Slice 5 starts (or at latest before Slice 8
design-system work, which relies on a clean §6 and accurate prose).
**Source:** CLAUDE.md §13 (auto-generated inventuren); consolidated bet index; Sessions 3d, 3e.
**Cross-reference:** "Single-source design values + descriptive/prescriptive split" (§5
CSS Class Discipline → Session 8 target, the architectural follow-up to this pass).

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

### ✅ Dead CSS: `sb-creation-popover-section` — Resolved (4210405)
~~The class was designed as a padded, bordered section divider inside the creation popover.
`PadCreationPopover.tsx` was implemented using direct inline styles for every section instead.~~

**Resolved in Session 3d** (commit 4210405): Class was redefined (border-top instead of
border-bottom, column layout added, padding corrected to var(--space-2)) and applied to
the name+type section. The [unused-css] marker was removed. See cross-reference in
§5 CSS Class Discipline sub-session plan.

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
| **3c** ✅ Done (24b6977) | `LibraryScreen.tsx` | 20 | 3 | 0 | 0 violations, 0 d-w-s. 19 new classes + 2 existing-class fixes (sb-tab button resets, sb-search-input 11px→var(--fs-xs) drift). §6: 85→104. Path A rate 5% (expected: LibraryScreen structurally distinct from PadEditorPanel). 0 Sorte-2 bets from 3b resolved. 8 Sorte-2 bets created for 3g/3e (see note below). sb-col added as new layout primitive. |
| **3d** ✅ Done (4210405) | `PadCreationPopover.tsx` | 15 | 6 | 0 | 0 violations, 0 d-w-s. 8 new classes (sb-source-tabs, sb-tab-sm, sb-scroll-fill, sb-creation-popover-actions, sb-btn-muted, sb-sheet-header, sb-creation-popover-backdrop, sb-source-item). §6: 104→112. Resolution: 3 delete / 1 compose / 3 path-A unchanged / 4 path-A updated / 1 modifier / 9 new-class entries = 8 unique new classes. Reuse rate 45% (5/11 of 3b's flagged classes; leaf-level classes generalize, container-structure classes are component-specific — no re-planning of 3e–3h). 3b bet sb-type-btn WON. Plan deviation: planned sb-btn-sm min-height:36px rejected at spot-check — sb-btn-sm is used across 9 files including navigation buttons; 44px iOS touch-target floor via global rule is correct there. §4 Dead CSS sb-creation-popover-section resolved. |
| **3e** ✅ Done (96ae78d) | `StartScreen.tsx` | 19 | 0 | 0 | 0 violations, 0 d-w-s. 18 new classes (sb-overlay family, sb-changelog family, sb-flame-icon, sb-start-* family, sb-btn-unlock, sb-version-link). §6: 112→130. Resolution: 1 Path A / 1 A+B / 1 0+B / 1 Primitiv+B / 15 new-class = 19. Reuse rate 10.5% — StartScreen is a centered splash with no tab bar and no empty state; all 3c bets (sb-screen, sb-screen-empty, sb-tab-bar) FAILED (inapplicable — not promoted, not cleaned up — each is still in active use on its own screen). Token normalization: 10 off-token values aligned (all ≤4px drift). New Sorte-2 bets for 3e (Verfallsbedingung: Slice 8): sb-overlay, sb-overlay-header, sb-overlay-body flagged for promotion if settings/future overlays appear. Changelog-family classes (sb-changelog-*) to demote if changelog component is removed. Opportunistic 3b-bet test: sb-panel-title evaluated against ChangelogOverlay's "CHANGELOG" heading — rejected (sb-panel-title is font-mono/fs-xs/flex:1; overlay title needs font-ui/fs-lg). Does not change sb-panel-title's bet status: its declared target is 3g (LibraryPanel), not 3e; this was a side test only — status remains PENDING. |
| **3f** ✅ Done (b46fb44) | `BoardScreen.tsx` + `BoardListScreen.tsx` | 31 (BS: 17, BLS: 14) | 1 (BLS:161 d-w-s → sb-board-row) | 0 | 0 violations, 0 d-w-s. §6: 130→145 (+15 new sb-* classes). Audit total: 88→57. Resolution breakdown: DELETE 1 / Path A §6 7 / intra-session 1 / cross-file intra-session 3 / CSS extension 1 / new modifier 3 / new class 15 = 31. Reuse rate 35% (11/31). 3a residual (BLS:238 flexShrink:0) resolved via flat sb-row-actions class applied at element level — flat model maintained throughout. sb-screen: **WON** (3 uses: BS×2 + BLS×1). sb-tab-bar: still PARTIALLY-FAILED (3g pending). sb-section-header-row: not found in 3f files, moves to 3g. New 3f bets: sb-row-rename-input, sb-row-actions, sb-btn-icon-sm (all pending 3g — AudioRow scope). Token normalizations: 13px→--fs-xs (1px drift), fontSize:22px=--fs-xl exact, 11px sb-hint-text→10px (1px drift), padding 10px/14px→8px/12px (2px drift each). Off-token literals: 6px×3 (sb-place-banner, sb-setup-toolbar, sb-btn-icon-sm), 56px×1 (sb-board-row minHeight), 60px×1 (is-loose padding) — see §5 BACKLOG note below. Architecture: flat model invariant formally stated; sb-menu-row pre-flat legacy noted and left for dedicated consolidation pass. |
| **3g** ✅ Done (12fbbc0) | `SceneRail.tsx` + `LibraryPanel.tsx` + `AudioRow.tsx` | 9 + 11 + 8 = 28 | 0+0+2 = 2 | 0 | 0 violations, 0 d-w-s. §6: 145→159 (+14 new classes). Audit total: 57→29. Resolution: 1 DELETE / 14 Path-A §6 / 2 intra-session / 13 new class = 30 resolutions for 28 violations (+2 from d-w-s dual split). Reuse rate 57% overall (73% LibraryPanel — thesis confirmed for screen→panel siblings; 50% AudioRow). 0 new literal 11px values — SR-2 and AR-9 normalized to var(--fs-xs). 4 existing class updates: sb-row (min-width:0), sb-scroll-fill (overscroll-behavior:contain), sb-count-text (flex-shrink:0), sb-hint-text (truncation triplet). Bet outcomes: #3 WON (sb-panel-title on Library span), #5 WON (sb-search-field LP-3), #6 WON (sb-btn-clear LP-5), #12 WON (sb-scroll-fill LP-7); #4 PARTIAL (sb-search-bar → sb-lib-panel-search-bar sibling); #7 FAILED (sb-item-list wrong structure), #10 FINAL-FAILED→screen-local (sb-tab-bar, LibraryPanel has no tab bar), #11 FAILED (sb-filter-rail), #21 FAILED (sb-row-rename-input: wrong font scale for filenames), #22 FAILED (sb-row-actions: AudioRow uses grid, not flex+actions), #23 FAILED (sb-btn-icon-sm: 36px fits neither 28px SceneRail nor 44px AudioRow). |
| **3h** ✅ Done (994d2eb) | `PadTypeConfirmDialog.tsx` + `TopBarV2.tsx` + `BoardTopBarV3.tsx` + `PadGridCell.tsx` + `UndoToast.tsx` + `StatusBarV2.tsx` + `Waveform.tsx` + `PixelIcon.tsx` | 13+5+4+4+2+1+0+0 = 29 | 1+1+1+0+0+0+2+0 = 5 | 1(PTD ternary)+1(Pix spread) = 2 | 0 violations, 0 d-w-s. §6: 159→186 (+27 new sb-* classes). Audit total: 29→0 (project-wide Total=0 confirmed — Session 3 migration COMPLETE). Resolution breakdown: 1 DELETE / 4 pre-flat-family extensions (.sb-pad family: is-deep height+touch-action, pad-title fs unify, new pad-type-label + pad-drag-handle descendants) / 5 d-w-s splits (TopBarV2:85 cursor, BoardTopBarV3:59 maxWidth, PadTypeConfirmDialog:117 verdict-pill bg, Waveform:23 height+opacity, Waveform:37 height+background) / 19 Path B new classes. Near-miss merge: sb-topbar-breadcrumb(V2) + sb-topbar-scene-name(V3) → sb-topbar-secondary (cross-topbar 2-use, same function, 1px size normalization, color intrinsic). Anti-utility ruling: sb-text-dim/sb-text-mute rejected as standalone utilities; colors absorbed into semantic element classes (sb-type-change-from/-arrow, sb-undo-message, sb-topbar-secondary). PixelIcon: sb-pixel-icon hardcoded as base class in component; DOM-verified all 4 SVGs hasBase=true. Visual: TopBarV2 + BoardTopBarV3 (sb-topbar-secondary font-mono/12px/text-mute confirmed), StatusBarV2, PixelIcon verified headlessly. PadGridCell/PadTypeConfirmDialog/UndoToast/Waveform: CSS audit (0 Path-D) + build confirm migration; NOT laufzeit-verifiziert headlessly (ADD PAD disabled without audio fixture — pre-existing constraint). Beim nächsten Einsatz mit geladenen Audio-Dateien bestätigen: PadTypeConfirmDialog (FROM/ARROW/TO-Farben, Verdict-Pill-Hintergrund, Field-Label-Farbe), Waveform-Balken, PadGridCell (Type-Badge/Drag-Handle), UndoToast (message dim + UNDO + Progressbar). Bet settlement: all 8 open bets closed (see §5 Sorte-2 Bet Index below); final scorecard: WON 7 / LOST-justified 8 / FINALLY-LOST-consolidation 7 / SPECULATIVE-Slice8 3. |

**Arithmetic verification:** 12+23+20+15+19+31+28+29 = 177 ✓ | d-w-s: 4+3+6+0+0+2+5 = 20 ✓ | unclassified: 2 ✓
_(3a resolves 12 fully + 1 residual deferred to 3f; 3f scope is 31 = 17+14. Total closes to 177.)_

**3b Sorte-2 bets** (created on expectation of 3d/3c reuse; cleanup candidates if not used as Path A):
- `sb-type-btn` — **WON (3d)**: PadCreationPopover type pills use it directly. Class updated (added fontFamily, textTransform, cursor, minHeight:28px).
- `sb-section-header-row` — **FINALLY LOST → screen-local (3h)**: Not found in 3d, 3f, 3g, or 3h. Stays on PadEditorPanel. Consolidation-pass candidate.
- `sb-panel-title` — **WON (3g)**: Applied to `<span>Library</span>` in LibraryPanel header. flex:1 pushes close button right without marginLeft:auto. 2 uses: PadEditorPanel "Pad Editor" + LibraryPanel "Library". Bet fully resolved.

**3c Sorte-2 bets** (1-use in 3c, created on expectation of 3g/3e reuse; cleanup candidates if not used as Path A):
High-confidence (3g is LibraryPanel — same library surface):
- `sb-search-bar` — **PARTIAL (3g)**: LibraryPanel has a search bar but the values differ (padding 6/8 vs 10/14, border-soft vs border). Created `sb-lib-panel-search-bar` as a sibling class (NOT a modifier of sb-search-bar — standalone, named for component context). The structural concept is confirmed; exact reuse was not possible.
- `sb-search-field` — **WON (3g)**: LibraryPanel uses it as Path A (LP-3). 2px gap drift (6→8) within tolerance. 2 uses: LibraryScreen + LibraryPanel. Bet fully resolved.
- `sb-btn-clear` — **WON (3g)**: LibraryPanel uses it as Path A (LP-5). 1px padding drift within tolerance. 2 uses: LibraryScreen + LibraryPanel. Bet fully resolved.
- `sb-item-list` — **FAILED (3g)**: sb-item-list uses padding + flex-column + gap (card-style list). LibraryPanel uses border-bottom separators without inner padding/gap. LibraryPanel list uses sb-scroll-fill instead. Class stays — in active use on LibraryScreen. Downgrade to screen-local.

Moderate-confidence:
- `sb-screen` — **WON (3f)**: BoardScreen root×2 + BoardListScreen root — all full-height column-layout app screen roots. 3 confirmed uses across 3 screens (LibraryScreen + BoardScreen + BoardListScreen). Bet fully resolved.
- `sb-screen-empty` — **FAILED (3e)**: StartScreen has no empty state; inapplicable. Class stays — in active use on LibraryScreen. ⚠️ Retroactively registered: this bet was implicit at 3c close (LibraryScreen empty-state class, expected that other screens might inherit the centered-empty-state pattern) but was not formally listed at the time; the omission was identified when the 3e entry referenced it as a 3c bet. Corrected here to make the 3c count accurate (7→8).
- `sb-tab-bar` — **FINAL FAILED → screen-local**: 3e failed (StartScreen no tab bar), 3f failed (BoardScreen/BLS no tab bar), 3g final test failed (LibraryPanel has no tab bar). Class stays — in active use on LibraryScreen. Downgraded from expected multi-screen to screen-local.
- `sb-filter-rail` — **FAILED (3g)**: LibraryPanel has no filter rail (it is a panel, not a 2-col screen layout). Class stays — in active use on LibraryScreen. Downgrade to screen-local.

**3d Sorte-2 bets** (created on expectation of 3e–3h reuse; cleanup candidates if not confirmed):
- `sb-scroll-fill` — **WON (3g)**: LibraryPanel item list uses it as Path A (LP-7). Updated with overscroll-behavior:contain. 2+ uses: PadCreationPopover + LibraryPanel. Bet resolved.
- `sb-sheet-header` — **FINALLY LOST → screen-local (3h)**: Structurally incompatible with PadTypeConfirmDialog (split header) + letterSpacing drift. Stays on PadCreationPopover. Consolidation-pass candidate.
- `sb-creation-popover-actions` — **FINALLY LOST → screen-local (3h)**: PadTypeConfirmDialog needs 3× larger padding + justify-content:flex-end. Stays on PadCreationPopover. Consolidation-pass candidate.
- `sb-btn-muted` — **FINALLY LOST → screen-local (3h)**: No recessive button in any 3h file. Stays on PadCreationPopover. Consolidation-pass candidate.
- `sb-tab-sm` — **FINALLY LOST → screen-local (3h)**: No tabs in any 3h file. Stays on PadCreationPopover. Consolidation-pass candidate.
- `sb-source-tabs` — **FINALLY LOST → screen-local (3h)**: No source tab row in any 3h file. Stays on PadCreationPopover. Consolidation-pass candidate.

---

### Sorte-2 Bet Index (consolidated)

> **Canonical status source.** Future sessions (3f–3h, Slice 8) update this table — not their individual session entries. Session entries remain as historical context; when a bet is won or lost, mark it here first. If a session entry says "PENDING" and this table says "OPEN-pending-3g", they mean the same thing — the table wording is authoritative. Do not create new per-session bet sections; extend this index instead.

**Six status categories:**
- **WON** — target session used the class as Path A; confirmed ≥2-use. No further action.
- **LOST — cleanup candidate** — target session did not use it; no other justification. Merge or remove the class.
- **LOST — but class justified** — cross-session bet failed; class is legitimately used on its origin screen. No cleanup; downgrade expectation from "multi-screen" to "screen-local."
- **PARTIALLY-FAILED** — tested in one target session and failed; remaining target sessions still pending. Class is active on its origin screen regardless of outcome.
- **OPEN — pending session X** — target session has not run; bet stands.
- **SPECULATIVE — far** — target is a distant or unplanned slice (e.g. Slice 8); accepted 1-use class with a vague future hope, not a near-term testable bet.

| # | Class | Origin | Remaining target | Status | Verfallsbedingung |
|---|-------|--------|------------------|--------|--------------------|
| 1 | `sb-type-btn` | 3b | — | **WON (3d)** | Confirmed ≥2-use. No action. |
| 2 | `sb-section-header-row` | 3b | 3h | **FINALLY LOST → screen-local** | No 3h file has a space-between section header row. Stays on PadEditorPanel. Consolidation-pass candidate. |
| 3 | `sb-panel-title` | 3b | — | **WON (3g)** | Applied to LibraryPanel "Library" span. 2 uses: PadEditorPanel + LibraryPanel. Bet resolved. |
| 4 | `sb-search-bar` | 3c | — | **LOST — but class justified** | LibraryPanel needs sb-lib-panel-search-bar (different padding/border for 280px panel). sb-search-bar stays in use on LibraryScreen. Concept confirmed, exact reuse not possible. |
| 5 | `sb-search-field` | 3c | — | **WON (3g)** | LibraryPanel LP-3 uses it as Path A. 2 uses: LibraryScreen + LibraryPanel. |
| 6 | `sb-btn-clear` | 3c | — | **WON (3g)** | LibraryPanel LP-5 uses it as Path A. 2 uses: LibraryScreen + LibraryPanel. |
| 7 | `sb-item-list` | 3c | — | **LOST — but class justified** | LibraryPanel uses sb-scroll-fill (row-based list, not card-style). sb-item-list stays in use on LibraryScreen. |
| 8 | `sb-screen` | 3c | 3f | **WON (3f)** | Used on BS root×2 + BLS root×1 — all full-height column-layout app screen roots. Confirmed ≥3-use. No action. |
| 9 | `sb-screen-empty` | 3c | 3e | **LOST — but class justified** | Failed in 3e (StartScreen has no empty state). In active use on LibraryScreen. No cleanup. |
| 10 | `sb-tab-bar` | 3c | — | **FINAL FAILED → screen-local** | 3e, 3f, 3g all failed (none have a tab bar). In active use on LibraryScreen — no cleanup. Downgraded to screen-local. |
| 11 | `sb-filter-rail` | 3c | — | **LOST — but class justified** | LibraryPanel has no filter rail. In active use on LibraryScreen. Downgrade to screen-local. |
| 12 | `sb-scroll-fill` | 3d | — | **WON (3g)** | LibraryPanel LP-7 uses it as Path A. Updated with overscroll-behavior:contain. ≥2 uses. |
| 13 | `sb-sheet-header` | 3d | 3h | **FINALLY LOST → screen-local** | PadTypeConfirmDialog structurally incompatible: header is split (container div + title div + arrow row); applying sb-sheet-header to the container would bleed its typography to all children. Also letterSpacing differs (0.10em vs 0.08em). Stays on PadCreationPopover. Consolidation-pass candidate. |
| 14 | `sb-creation-popover-actions` | 3d | 3h | **FINALLY LOST → screen-local** | PadTypeConfirmDialog footer needs padding 3× larger (space-3/space-4 vs space-1/space-2) + justify-content:flex-end (absent). New class sb-dialog-actions created. Stays on PadCreationPopover. Consolidation-pass candidate. |
| 15 | `sb-btn-muted` | 3d | 3h | **FINALLY LOST → screen-local** | No 3h file has a visually recessive de-emphasized button. Stays on PadCreationPopover. Consolidation-pass candidate. |
| 16 | `sb-tab-sm` | 3d | 3h | **FINALLY LOST → screen-local** | No 3h file has tabs. Stays on PadCreationPopover. Consolidation-pass candidate. |
| 17 | `sb-source-tabs` | 3d | 3h | **FINALLY LOST → screen-local** | No 3h file has a source tab row. Stays on PadCreationPopover. Consolidation-pass candidate. |
| 18 | `sb-overlay` | 3e | Slice 8 | **SPECULATIVE — far** | Promote to confirmed multi-use if settings screen or future overlays appear in Slice 8. |
| 19 | `sb-overlay-header` | 3e | Slice 8 | **SPECULATIVE — far** | Same as `sb-overlay`. |
| 20 | `sb-overlay-body` | 3e | Slice 8 | **SPECULATIVE — far** | Same as `sb-overlay`. |
| 21 | `sb-row-rename-input` | 3f | — | **LOST — but class justified** | AudioRow rename uses font-ui fs-sm/14px, no uppercase — fundamentally different typography from board names (fs-lg/18px, 0.08em, uppercase). Created sb-audio-row-rename. sb-row-rename-input stays in use on BLS BoardRow. |
| 22 | `sb-row-actions` | 3f | — | **LOST — but class justified** | AudioRow uses 5-column CSS Grid (not flex with trailing action group). No trailing action group wrapper. sb-row-actions stays in BLS BoardRow. |
| 23 | `sb-btn-icon-sm` | 3f | — | **LOST — but class justified** | SceneRail action buttons = 28px (uses sb-btn-icon). AudioRow delete = 44px (iOS touch target). 36px fits neither. sb-btn-icon-sm stays in BLS BoardRow (2-use). |
| 24 | `sb-flex-trunc` | 3g | 3h | **FINALLY LOST → screen-local** | BoardTopBarV3 board name is in a column flex context (not row fill) with a dynamic maxWidth constraint — flex:1/min-width:0 don't apply. Stays on SceneRail (1-use). Consolidation-pass candidate (1-use class). |
| 25 | `sb-panel-empty` | 3g | 3h | **WON (3g, 2-use)** | 2-use intra-session (SceneRail + LibraryPanel). No 3h file has panel empty states; WON confirmed in 3g. |

**Count check (final — all 25 closed):** WON: 7 (#1,3,5,6,8,12,25) · LOST-justified: 8 (#4,7,9,10,11,21,22,23) · FINALLY-LOST→consolidation: 7 (#2,13,14,15,16,17,24) · SPECULATIVE-Slice8: 3 (#18,19,20) = 7+8+7+3 = 25 ✓. No OPEN or PARTIALLY-FAILED bets remain. Index closed (2026-05-31, 994d2eb).

---

#### Bets 3g tested ✅ Done (12fbbc0)

3g covered `SceneRail.tsx` + `LibraryPanel.tsx` + `AudioRow.tsx`. All 13 bets resolved:

| Bet | Class | Result | Key finding |
|-----|-------|--------|-------------|
| #3 | sb-panel-title | **WON** | Library span in LibraryPanel — exact same function as PadEditorPanel "Pad Editor" |
| #4 | sb-search-bar | **PARTIAL → new sibling** | LibraryPanel has the structural role but needs sb-lib-panel-search-bar (6/8 vs 10/14 padding; panel context) |
| #5 | sb-search-field | **WON** | LP-3 Path A; 2px gap drift acceptable |
| #6 | sb-btn-clear | **WON** | LP-5 Path A; 1px padding drift acceptable |
| #7 | sb-item-list | **FAILED** | Card-style list (padding+gap) ≠ row-separator list (border-bottom) |
| #10 | sb-tab-bar | **FINAL FAILED** | LibraryPanel has no tab bar; downgraded to screen-local |
| #11 | sb-filter-rail | **FAILED** | LibraryPanel is a panel, not a 2-col screen with a filter sidebar |
| #12 | sb-scroll-fill | **WON** | LP-7 Path A; updated with overscroll-behavior:contain |
| #16 | sb-tab-sm | **NOT FOUND** | No compact tabs in 3g files; passes to 3h |
| #2 | sb-section-header-row | **NOT FOUND** | No space-between section headers in 3g files; passes to 3h |
| #21 | sb-row-rename-input | **FAILED** | AudioRow uses fs-sm/14px/normal-case; class is fs-lg/18px/uppercase — different typographic scale for filenames vs board names |
| #22 | sb-row-actions | **FAILED** | AudioRow uses 5-column CSS Grid, not flex with trailing action group |
| #23 | sb-btn-icon-sm | **FAILED** | 36px fits neither SceneRail (28px) nor AudioRow (44px iOS touch target) |

**Strategic finding:** The thesis holds for screen→panel siblings (LibraryPanel 73% reuse — 3c's classes snapped in). It fails for component→component predictions (AudioRow 50%, 3f bets all failed) when the components have structurally different layouts (grid vs. flex+actions). Honest failed bets are real results; they map the boundary of the strategy.

#### Bets 3h settled ✅ Done (994d2eb)

3h covered `PadTypeConfirmDialog.tsx` + `TopBarV2.tsx` + `BoardTopBarV3.tsx` + `PadGridCell.tsx` + `UndoToast.tsx` + `StatusBarV2.tsx` + `Waveform.tsx` + `PixelIcon.tsx`. All 8 open bets closed:

| Bet | Class | Result | Key finding |
|-----|-------|--------|-------------|
| #2 | sb-section-header-row | **FINALLY LOST → screen-local** | No 3h file has a space-between section header row. Consolidation-pass candidate. |
| #13 | sb-sheet-header | **FINALLY LOST → screen-local** | PadTypeConfirmDialog header is split into 3 nested elements (container + title + arrow-row); applying sb-sheet-header to container would inherit typography to all children. Additionally letterSpacing 0.10em vs 0.08em. |
| #14 | sb-creation-popover-actions | **FINALLY LOST → screen-local** | PadTypeConfirmDialog footer: padding 3× larger (space-3/space-4 vs space-1/space-2) + justify-content:flex-end absent. New class sb-dialog-actions created. |
| #15 | sb-btn-muted | **FINALLY LOST → screen-local** | No de-emphasized recessive button in any 3h file. |
| #16 | sb-tab-sm | **FINALLY LOST → screen-local** | No tabs in any 3h file. |
| #17 | sb-source-tabs | **FINALLY LOST → screen-local** | No source tab row in any 3h file. |
| #24 | sb-flex-trunc | **FINALLY LOST → screen-local** | BoardTopBarV3 board name is in a column flex (not row fill) with dynamic maxWidth — flex:1/min-width:0 don't apply. Column context makes the class inapplicable. |
| #25 | sb-panel-empty | **WON (3g, confirmed)** | Already WON at 2-use intra-session in 3g; no 3h file has panel empty states. Status closes as WON. |

**Near-miss finding (3h):** sb-topbar-breadcrumb (V2, mono/12px/text-mute/nowrap) and sb-topbar-scene-name (V3, mono/11px/text-mute/truncating) share the same function ("secondary muted mono text in topbar context"). Merged into sb-topbar-secondary (cross-topbar 2-use). 1px size normalization (11→12px, both off-ladder), truncation added to V2 breadcrumb (improvement — parent has min-width:0, was overflowing without it). Color is intrinsic to the class (anti-utility ruling: separate sb-text-mute class rejected).

**Anti-utility ruling (3h):** sb-text-dim and sb-text-mute as standalone color utilities were rejected — same anti-pattern as the sb-truncate rejection in 3g. Colors absorbed into semantic element classes where they belong semantically. No standalone color utility classes exist in §6.

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

#### Class-quality rules (apply in every sub-session 3d–3h)

The user's criterion (clarified during 3c): class COUNT is not a concern. §6 growing
to 150+ classes is fine **provided** every class is individual, duplication-free, and
serves a specialized function. The metric that matters is not "how many classes" but
"how many class-pairs are too similar." Two rules operationalize this:

**Rule 1 — No duplication (the near-miss test):**
When a proposed new class has similar CSS to an existing class, decide:
- Is the difference a genuine semantic role? → both classes are correct, keep both.
  (Example from 3c: sb-search-field "active search entry" vs sb-readonly-field
  "read-only display" — same structure, different function, both kept.)
- Is the difference just drift / off-token values? → it's ONE function with drift,
  not two. Unify them.
  (Example from 3c: sb-search-input 11px vs sb-search-input-lg 13px — neither value
  on the token ladder (--fs-xs=12, --fs-sm=14), so both were ±1px drift from the same
  target. Unified to var(--fs-xs); the second class eliminated.)
The decisive check: do the two classes' differences land on token-ladder values? If
not, it's drift to unify, not a distinction to preserve.

**Rule 2 — No over-splitting (modifier before full class):**
When a proposed class overlaps ~80%+ with an existing class and the rest is a variation,
check whether a modifier (`is-*` / `has-*`) on the existing class is cleaner than a new
full class. Prevents the `sb-row` / `sb-row-bordered` / `sb-row-tight` proliferation.
(Example from 3c: sb-rail-section + .has-divider, not two separate section classes.)

**Per-sub-session application:** in the anti-duplication self-check, for each new class
ask explicitly: (a) does an existing class serve a similar function — if so, semantic
role (keep both) or drift (unify)? (b) is this a variation that a modifier would express
better than a new full class? Report the answer in the self-check.

**After 3d:** brief check — did these two rules hold? 3d is the first real test of the
load-bearing strategy (it inherits 3b's 11 flagged classes). Not a count check — a
duplication check: did 3d reuse 3b's classes as Path A, or duplicate them?

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

### Sub-token font-size pattern: off-ladder sizes below `--fs-xs`

Two classes now deliberately use font-sizes below `--fs-xs` (12px):
- `sb-hint-text`: `10px` — added in Session 3b; annotated "consider --fs-xxs in Session 8"
- `sb-btn-muted`: `11px` — added in Session 3d (recessive secondary-action button)

These are **not independent drift** but a design pattern for recessive UI text.
Rule 1 check: do 10px and 11px land on a token-ladder step? No — no sub-xs token exists.
Both stay as literals for now (consistent with how sb-hint-text was handled in 3b).

**Action:** Session 8 must decide: one `--fs-xxs` token (one value for both?), two tokens
(`--fs-xxs` + `--fs-xxxs`?), or keep as named literals. Do not add further literal
sub-xs font-sizes without consulting this note first — the next literal would make
three separate values and force a decision anyway.

**Session 3g update:** SR-2 (`sb-scene-num-badge`, was 11px) and AR-9 (`sb-audio-col-size`,
was 11px) normalized to `var(--fs-xs)` — zero new literal 11px values introduced in 3g.
The deliberate 11px literals remain only in `sb-count-text` and `sb-btn-muted`.

**When:** Session 8 (typography/polish). **Source:** Session 3d, 2026-05-30; updated 3g, 2026-05-31.

---

### Sub-token padding `6px`: off-ladder size between `--space-1` (4px) and `--space-2` (8px)

Three classes from Session 3f use `6px` as a padding literal:
- `sb-place-banner`: `padding: 6px var(--space-3)` — notification banner vertical padding
- `sb-setup-toolbar`: `padding: 6px var(--space-3)` — SETUP toolbar vertical padding
- `sb-btn-icon-sm`: `padding: 0 6px` — compact icon button horizontal padding

`6px` is not on the token ladder (--space-1=4, --space-2=8). All three carry the same
value, which is not coincidence — they represent the same visual density target (tighter
than --space-2=8 but less dense than --space-1=4). **Do not add further 6px literals**
without consulting this note first; the next instance would make four total and force
a tokenization decision.

**Action:** Session 8 decides: add `--space-1-5: 6px` (or similar), or keep named literals.
**When:** Session 8. **Source:** Session 3f, 2026-05-31.

---

### Sub-token literals introduced Session 3h

Session 3h introduced several deliberate off-ladder literals in new classes. All are
retained as named literals (same rationale as 3f/3d precedents). Session 8 consolidates.

**Font sizes below --fs-xs (12px):**
- `sb-pad-type-label`: `9px` — deliberately tiny type badge inside a pad cell
- `sb-pad-drag-handle`: `10px` — small drag indicator (also: `bottom: 4px; right: 6px` pixel literals for corner positioning)
- `sb-undo-message`: `13px` — between --fs-xs (12) and --fs-sm (14); toast message context
- `sb-topbar-secondary`: `12px` — normalized from 11px (BoardTopBarV3 scene name) and 12px (TopBarV2 breadcrumb); now consistently 12px = --fs-xs but kept as literal since it's also the token value

**Sub-token padding:**
- `sb-verdict-pill`: `padding: 2px 10px` — tight pill sizing (2px top/bottom, 10px sides)
- `sb-field-chip`: `padding: 1px 6px` — compact tag chip (1px top/bottom, 6px sides — adds to the 6px note above)
- `sb-undo-btn`: `padding: 2px var(--space-3)` — tight button vertical (2px top/bottom)

**Pixel literals (absolute positioning):**
- `sb-pad-drag-handle`: `bottom: 4px; right: 6px` — no token for these corner values; same tight-corner pattern as `sb-pad-key` (top: 6px, right: 6px established in Session 3a/legacy)

**TopBarV2 fixed dimensions (no tokens):**
- `sb-topbar`: `padding: 10px 16px; height: 48px` — 10px is between space-2 (8px) and space-3 (12px); 48px topbar height matches BoardTopBarV3 but no --topbar-height token exists

**Font sizes above --fs-xs used as literals:**
- `sb-topbar-title`: `22px` — display title, no fs-* token at this size
- `sb-topbar-board-name`: `16px` — compact board title, no fs-* token at this size

All these literals are documented in the @inventory comments in tokens.css.
**Action:** Session 8 (typography/polish pass) decides which earn tokens.
**When:** Session 8. **Source:** Session 3h, 2026-05-31.

---

### ✅ Session 3 CSS Class Discipline Migration — COMPLETE (2026-05-31)

All 177 inline-style Path D violations across all app files have been migrated.
Project-wide audit Total Path D = 0 (confirmed headlessly, 994d2eb).

**Final §6 class count:** 186 sb-* classes (up from 63 at Session 3a start).

**What is unblocked:** The end-of-Session-3 consolidation pass (see §5 → "End-of-Session-3
consolidation pass" entry). Primary targets: 7 FINALLY-LOST consolidation candidates
(#2 sb-section-header-row, #13 sb-sheet-header, #14 sb-creation-popover-actions,
#15 sb-btn-muted, #16 sb-tab-sm, #17 sb-source-tabs, #24 sb-flex-trunc), plus ~19
1-use classes from Session 3h flagged for review, plus the sb-menu-row pre-flat family
restructuring.

**What remains pending (Session 8):** Sub-token literal tokenization, the sb-overlay
family (SPECULATIVE #18–20), visual regression check of PadGridCell/PadTypeConfirmDialog/
UndoToast/Waveform with real audio data (not headlessly testable without audio fixtures).

---

### Flat CSS model invariant (established Session 3f)

All sb-* classes added from Session 3a onward follow a **flat model**: one class per
element, composition via multiple classes on the same element. No new descendant
selectors inside any new class.

**Exception: sb-menu-row family (pre-flat legacy)** — `sb-menu-row` predates this
invariant and carries existing descendant rules (`.sb-menu-row .sb-icon`,
`.sb-menu-row .sb-row-title`). Sessions 3f–3h do not touch these. Flattening
sb-menu-row's descendant structure belongs in a dedicated consolidation pass
(post-3h or Slice 8), not inline in a migration sub-session.

**Rule:** When adding new classes in 3g, 3h, or beyond — no new descendant selectors.
If you want context-specific behavior, apply a flat modifier class at the element.
**When:** Ongoing. **Source:** Session 3f, 2026-05-31.

---

### AudioRow grid overflow on iPhone 13 Pro (390px viewport) — Slice 8 responsive

`sb-audio-row` (Session 3g) has `grid-template-columns: 160px 1fr 70px 90px 44px`.
Fixed widths: 160+70+90+44 = 364px. Gaps: 4 × var(--space-3) = 4 × 12px = 48px.
Minimum before the 1fr column: **412px** — 22px wider than the 390px CSS viewport.

The LibraryScreen content column at 390px (after the 220px filter rail) is ~170px.
AudioRow rows would overflow this column on every use — **tritt im Normalbetrieb auf,
sobald die Bibliothek Dateien enthält** (leere Bibliothek verdeckt es in Tests).

**Status:** PRE-EXISTING — this grid was in the original inline style before Session 3g.
Session 3g faithfully migrated the values to `sb-audio-row` without changing the layout
behavior. Not a regression from 3g; the commit that introduced the grid was in Slice 2.

**Action:** Slice 8 Responsive pass — AudioRow needs a narrow-viewport layout:
- Option A: Replace fixed columns with fractional or smaller fixed values that fit 170px
- Option B: Different layout structure on narrow viewports (stack rows instead of grid)
- Option C: The LibraryScreen 2-column layout itself may need to collapse on mobile
  (sb-screen-layout's 220px filter rail + 1fr is already a problem at 390px)
- Priority: HIGH — this is the Library's core audio-file list on the primary target device

**Verify:** Upload audio files on iPhone 13 Pro to confirm the overflow is visible in practice.
**When:** Slice 8 (responsive/polish). **Source:** Session 3g spot-check, 2026-05-31.
Measured: content column = 170px, grid minimum = 412px, deficit = 242px.

---

### UI text inconsistency: `EmptyHint` in BROWSE tab vs RECENT tab

When the audio library is empty, the BROWSE tab shows "No matches." while the RECENT tab
shows "No audio in library yet." — both correct by code logic, but inconsistent in tone.
Both use `EmptyHint` with different message strings; a user with no library sees
"No matches." in BROWSE even without typing a search query.

**Action:** Decide whether to unify ("No audio in library yet." for empty-library state
regardless of tab) or deliberately differentiate (BROWSE is always search-mode, so
"No matches." is acceptable). Small fix in `PadCreationPopover.tsx`.

**When:** Session 8+ or opportunistically. Pre-existing; not introduced by 3d.

---

### SceneRail action buttons: pre-existing Path D violation (`minHeight:28`)

✅ **Resolved in Session 3g (12fbbc0).** Migrated to `sb-btn-icon` (Path A, exact match: min-width:28px; min-height:28px; padding:0 4px). All three scene action buttons (rename/copy/delete) now use `class="sb-btn sb-btn-sm sb-btn-icon …"` without inline styles.

**Source:** Observed during 3d spot-check, 2026-05-30. Resolved 2026-05-31.

---

### Single-source design values + descriptive/prescriptive split (Session 8 — design-system consolidation)

**Background:** During Session 3d, a planned `sb-btn-sm` `min-height:36px` addition was
rejected after measurement showed it would silently push 20 buttons across 9 files from
44px to 36px — violating the 44px iOS touch-target guideline in CLAUDE.md. The change was
only recognizable as a regression because that guideline existed. This surfaced a layered
architectural question: where should design values and design rules live?

The diagnosis has three layers:

**Value layer:** `min-height: 44px` appears as a bare literal in `global.css` AND as
"44px" in CLAUDE.md's guideline — the same value for the same reason written
independently in two places. If one changes, the other silently doesn't. The token ladder
already solves this for font-sizes (`--fs-xs` instead of `12px`); heights and touch-targets
do not yet have consistent token discipline.

**Description layer:** Any prose in CLAUDE.md that repeats a class value (e.g.
"sb-btn-sm is 36px") duplicates §6 (generated from the classes). Duplication that can
drift. Prescriptive rules ("primary touch targets ≥44px because iOS; secondary may be
smaller") belong in prose — they live nowhere else. Descriptive repetitions do not.

**Rule layer:** A guideline is prescriptive — the criterion classes should meet. The
3d decision was possible only because the rule existed. Well-placed prescriptive rules
earn their place; descriptive repetition does not.

---

**Part A — token-ify recurring height/touch-target values (INVESTIGATE first):**

Check whether recurring height values already have tokens in `tokens.css`. They may simply
not be referenced consistently. Verify before tokenizing.

If values like 44px (iOS primary touch-target floor) are still scattered literals used
across multiple classes/files: lift them into a token (e.g. `--touch-target-min`, name
TBD) so the global `button { min-height }` and the CLAUDE.md guideline reference the same
single source and cannot silently diverge.

Guardrail — do not tokenize everything:
- One-offs (e.g. `sb-source-item gap: 2px` — single consumer, no general concept) stay
  as literals. The test is "does this number mean a concept used in more than one place?"
- Only values that carry a recurring concept warrant a token.

**Part B — descriptive-vs-prescriptive audit of CLAUDE.md (INVESTIGATE first):**

Classify each design-related statement: does it DESCRIBE a class value ("sb-btn-sm is
36px") or PRESCRIBE a criterion ("primary touch targets ≥44px")?
- Descriptive repetitions of class values → remove (single source of truth is the
  class/token; generated view is §6)
- Prescriptive rules → keep (they live nowhere else)

Not verified that CLAUDE.md contains descriptive duplications — check, don't assume.
If it is already cleanly prescriptive, nothing needs removing.

**Part C — evaluate making prescriptive rules checkable (open question, NOT a committed build):**

Where a rule can be operationalized, consider converting it from prose into an executable
check — e.g. a touch-target lint asserting no button class sets `min-height` below
`--touch-target-min` except those explicitly marked compact (like sb-btn-icon). Same idea
as the inline-style audit operationalizing the four-path rule.

Dependency: this only becomes clean if Part A is done first. A lint that asserts `44`
hardcoded just relocates the drift. Session 8 decides whether to build Part C; do not
build it because it is listed.

**The coherent goal of A+B+C:** each design fact lives in exactly one place, referenced
everywhere else, never repeated as a literal that can drift.

**Action:** Investigate Parts A and B during Session 8 (design-system / polish). Part C
is an open question — evaluate and decide in the same session.

**When:** Session 8 (design-system consolidation).
**Cross-reference:** sb-btn-sm touch-target question, Session 3d (the 36px addition was
rejected because of the 44px guideline; the full-radius grep revealed 20 buttons across
9 files would have been affected). 3d decision is closed; this is the architectural
follow-up.
**Source:** Session 3d, 2026-05-30.

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
