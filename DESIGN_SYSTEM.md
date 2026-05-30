# Soundboard of Storytelling — Design System

> **Source of truth.** `DESIGN_SYSTEM_CHEATSHEET.md` is the single-page quick reference
> for daily use. When the cheatsheet and this document conflict, this document wins.
> Documentation roles and relationships across all project docs: see `docs/DOCUMENTATION_MAP.md`.

---

## §1 Naming Conventions (project-wide)

<!-- TODO: Write out each sub-topic below. Short form in DESIGN_SYSTEM_CHEATSHEET.md. -->

### CSS class naming
<!-- TODO: Write up fully. Conventions already followed:
     Block: sb-<block> (e.g. sb-pad, sb-btn)
     Part:  sb-<block>-<part> (e.g. sb-pad-title, sb-btn-sm)
     State: is-<state> (e.g. is-hot, is-setup) — never block-scoped
     Per ADR-0021. Short form in DESIGN_SYSTEM_CHEATSHEET.md §60-second contract. -->

### Token naming
<!-- TODO: Write up fully. --<name> conventions; grouping by section; when to use
     --sb-* legacy aliases vs. canonical names. Per ADR-0022. Already followed
     — needs writing up. -->

### Component & file naming
<!-- TODO: Write up fully. PascalCase components (e.g. AudioRow, ModeToggle,
     PadCreationPopover). File name matches component name (AudioRow.tsx = AudioRow
     component). Already followed — needs writing up. -->

### Signal & state naming
<!-- TODO: Write up fully. camelCase signals, no prefix/suffix (e.g. audioContextState,
     currentScreen, libraryItems). Exported from src/state/store.ts. Already followed
     — needs writing up. -->

### Lib & helper function naming
<!-- TODO: Write up fully. camelCase functions in camelCase files (padDnd.ts, libDnd.ts,
     padUtils.ts, upload.ts, nanoid.ts). Already followed — needs writing up. -->

### ADR file naming
<!-- TODO: Write up fully. NNNN-kebab-slug.md in docs/architecture/; template at
     docs/architecture/_template.md; index in docs/architecture/README.md.
     Already followed — needs writing up. -->

### data-testid naming
<!-- TODO: Convention documented in TESTING.md — cross-reference, do not duplicate here. -->

### Branch/commit conventions
<!-- TODO: No formal convention established yet. Gap to document. -->

---

## §2 Pixel-Frame-System

<!-- TODO: Ausschreiben — Kurzfassung in DESIGN_SYSTEM_CHEATSHEET.md Decision Tree -->

Basis-Klassen der Pixel-Frame-Familie: `sb-pix`, `sb-card`, `sb-pad`, `sb-btn`,
`sb-pill`, `sb-menu-row`. Anpassung via CSS Custom Properties `--pix-bg`,
`--pix-border`, `--pix-step` — kein neues clip-path/border CSS schreiben.

---

## §3 State Vocabulary (geschlossene Menge)

<!-- TODO: Tabelle aller is-*-Klassen mit Bedeutung und erlaubten Trägern -->

Aktuell registrierte Zustands-Klassen (aus DESIGN_SYSTEM_CHEATSHEET.md §3):

| Klasse | Bedeutung |
|--------|-----------|
| `is-active` | Aktives Element in einer Gruppe |
| `is-on` | Binärer Ein-Zustand (Toggle) |
| `is-hot` | Audio läuft gerade |
| `is-setup` | SETUP-Modus aktiv |
| `is-game` | GAME-Modus aktiv |
| `is-danger` | Destruktive Aktion (2-Tap-Confirm) |
| `is-raised` | Erhöhte Fläche (Surface-Hierarchie) |
| `is-italic` | Kursive Darstellung |
| `is-loop` | Loop-Kontext |
| `is-playlist` | Playlist-Kontext |
| `is-combo` | Combo-Kontext |
| `is-deep` | Opt-In für Pad-Depth-Stack |
| `is-compact` | Kompakte Darstellung |

Neue Zustands-Klassen hier ergänzen, **bevor** sie im Code verwendet werden.

---

## §4 Komponentenanatomie

<!-- TODO: Beschreiben wie sb-pix, sb-card, sb-pad strukturell aufgebaut sind -->

---

## §5 Token-Verwendungsregeln

<!-- TODO: Wann welches Token — Farb-Tokens, Spacing, Typography, Radius, Schatten -->

Verbotene Muster in neuem V3-Code:
- Farbliterale (hardcodierte `#hex` oder `rgb(...)`)
- `--sb-*` Legacy-Aliases (nur für Rückwärtskompatibilität mit altem CSS)
- `border-radius` auf `sb-pix`-Familie (pixel-art-Shapes nutzen clip-path)
- `box-shadow` auf clip-path-Elementen (stattdessen `filter: drop-shadow()`)
- Utility-Klassen (`sb-mt-4` etc.)

---

## §6 Komponenten-Inventur

> Auto-generiert via `npm run sync:classes`. Beschreibungen via
> `/* @inventory: Beschreibung */`-Kommentar an der CSS-Definition.
> Klassen ohne Kommentar erscheinen mit leerer Beschreibung — das ist
> gewollt, um fehlende Dokumentation sichtbar zu machen.

<!-- AUTO-GENERATED:sb-classes START — nicht manuell editieren -->
| Klasse | Beschreibung | Definiert in |
|--------|-------------|-------------|
| `sb-board-topbar` | 3-column grid header bar for BoardScreen (back + breadcrumb | mode-toggle | actions). | `v3/src/styles/tokens.css` |
| `sb-board-topbar-left` | Left column of the board top bar (flex row, back button + breadcrumb). | `v3/src/styles/tokens.css` |
| `sb-board-topbar-right` | Right column of the board top bar (actions, right-aligned). | `v3/src/styles/tokens.css` |
| `sb-btn` | Pixel-frame button base; all button variants extend this. | `v3/src/styles/tokens.css` |
| `sb-btn-block` | Full-width block button modifier — 100% width, centered, 44px min touch target (iOS guideline). | `v3/src/styles/tokens.css` |
| `sb-btn-clear` | Bare inline clear/dismiss button — no pixel frame, mono xs text in text-mute, pointer cursor. | `v3/src/styles/tokens.css` |
| `sb-btn-danger` | Button variant for destructive actions; blood-red border and label. | `v3/src/styles/tokens.css` |
| `sb-btn-filled` | Button variant — solid gold fill and dark label; primary CTA. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-btn-ghost` | Button variant — transparent fill, dimmed border; low-emphasis. | `v3/src/styles/tokens.css` |
| `sb-btn-icon` | Icon-sized button modifier for sb-btn — 28×28px touch target, tight padding. | `v3/src/styles/tokens.css` |
| `sb-btn-primary` | Button variant — gold border and label; highlighted action. | `v3/src/styles/tokens.css` |
| `sb-btn-sm` | Small-size modifier for .sb-btn; tighter padding and smaller font. | `v3/src/styles/tokens.css` |
| `sb-btn-xs` | Extra-small button modifier — smaller than sb-btn-sm; for tight button rows in inspector and type-confirm panels. | `v3/src/styles/tokens.css` |
| `sb-caption` | Smallest text style — xs mono in text-mute; for filenames and metadata. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-card` | Pixel-frame container card with padding and drop-shadow elevation. Currently no TSX usage; V3 list items use sb-menu-row instead. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-category-item` | Active category row in filter rail — gold left border indicator, flex space-between, VT323 font. Slice 3 has only "All"; gains more uses in Slice 5+. | `v3/src/styles/tokens.css` |
| `sb-col` | Flex-column layout primitive with min-height:0 — enables overflow scrolling in flex-column children. Use for column containers that scroll. | `v3/src/styles/tokens.css` |
| `sb-count-text` | Inline count/quantity text — mono xs muted. Used in category rows and similar metadata contexts. | `v3/src/styles/tokens.css` |
| `sb-creation-popover` | Fixed 300px popover for Path A (desktop) pad creation flow. | `v3/src/styles/tokens.css` |
| `sb-creation-popover-section` | Padded section divider within the creation popover. Not applied in current PadCreationPopover.tsx implementation. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-creation-sheet` | Mobile bottom sheet for pad creation and pad-type confirmation (slides up from bottom, max 85dvh). | `v3/src/styles/tokens.css` |
| `sb-creation-sheet-backdrop` | Mobile backdrop behind sb-creation-sheet; sb-type-confirm-backdrop is the desktop equivalent. | `v3/src/styles/tokens.css` |
| `sb-display` | Hero title — Press Start 2P with gold glow; for page-level titles only. | `v3/src/styles/tokens.css` |
| `sb-display-vt` | VT323 heading variant of sb-display for medium headings; same glow, less chunky pixels. | `v3/src/styles/tokens.css` |
| `sb-drop-hint` | Drag-over drop zone hint text — padded, mono xs, transition on color/border. border and color set inline by drag state. | `v3/src/styles/tokens.css` |
| `sb-error-label` | Inline error/warning label — blood red, help cursor, left margin for inline placement. | `v3/src/styles/tokens.css` |
| `sb-field-label` | Mono 11px field label for inspector sections — block display, bottom margin, uppercase. Used for NAME/TYPE/AUDIO SOURCE/HOTKEY/FADE labels. | `v3/src/styles/tokens.css` |
| `sb-filter-rail` | Left sidebar filter column — deep background, right border, flex column, iOS-touch scroll. | `v3/src/styles/tokens.css` |
| `sb-flex-1` | Flex fill — takes all remaining space in a flex container. Use as a spacer or to push siblings to opposite ends. | `v3/src/styles/tokens.css` |
| `sb-grid-bg` | Cross-hatch layout grid on the board canvas in SETUP mode. | `v3/src/styles/tokens.css` |
| `sb-hidden` | Visibility utility — hides element from layout (display:none). For hidden file inputs and conditionally invisible nodes. | `v3/src/styles/tokens.css` |
| `sb-hint-text` | Secondary annotative text in inspector rows — mono 10px muted. Intentionally below --fs-xs; consider --fs-xxs token in Session 8. | `v3/src/styles/tokens.css` |
| `sb-hotkey-value` | Hotkey binding value text in inspector — mono xs; color set inline for has/lacks-hotkey state. | `v3/src/styles/tokens.css` |
| `sb-inspector` | Generic right-rail inspector shell; V3 uses specific variants sb-pad-editor and sb-library-panel. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-inspector-section` | Padded content section within an inspector panel, separated by bottom border. | `v3/src/styles/tokens.css` |
| `sb-item-list` | Scrollable flex-column item list — fills remaining height, iOS-touch scroll, padded, 4px gap. | `v3/src/styles/tokens.css` |
| `sb-label` | Uppercase VT323 label; intended for field labels and section headings. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-lib-browser` | Compact library picker container in inspector — flex column, sunk background, bordered. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-empty` | Empty-state placeholder in library browser — dashed border, centered muted text. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-item` | Clickable row in library browser list — padded, truncated, pointer cursor; selection color/bg set inline. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-item-name` | Truncated filename in a library browser item row — ellipsis overflow, mono xs. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-list` | Scrollable item list inside library browser — capped height, sunk background, iOS-touch scroll. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-no-results` | "No results" message inside library browser list — centered, muted. | `v3/src/styles/tokens.css` |
| `sb-lib-browser-search` | Search section wrapper inside library browser — padded with border-bottom divider. | `v3/src/styles/tokens.css` |
| `sb-library-panel` | Library browse panel in the board right rail (280px, hides overflow). | `v3/src/styles/tokens.css` |
| `sb-menu-row` | Pixel-frame list row with icon, primary title, and subtitle slots. | `v3/src/styles/tokens.css` |
| `sb-mode-badge` | Compact inline SETUP/GAME badge for top-bar and status-bar surfaces. | `v3/src/styles/tokens.css` |
| `sb-mode-toggle` | Interactive SETUP | GAME pill in the board top bar center (v24 design). | `v3/src/styles/tokens.css` |
| `sb-mode-toggle-flash` | Reduced-motion fallback for sb-mode-toggle (brightness flash instead of sparks). ModeToggle.tsx skips animation entirely rather than applying this class. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-mode-toggle-half` | Left or right half-button of the mode toggle pill. | `v3/src/styles/tokens.css` |
| `sb-mode-toggle-sep` | 1 px vertical separator between the two mode toggle halves. | `v3/src/styles/tokens.css` |
| `sb-mode-toggle-spark` | Individual animated spark particle emitted on mode switch. | `v3/src/styles/tokens.css` |
| `sb-mode-toggle-sparks` | Overflow container intended for spark particles during mode-switch. Not used; ModeToggle.tsx appends sparks to document.body instead. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-mono` | Secondary mono body text in text-dim; currently used only for the StartScreen tagline, designed as a utility for descriptions and body copy. | `v3/src/styles/tokens.css` |
| `sb-num` | Premiere-style numeric scrubber chip — ew-resize cursor, sunk background; for PAD editor trim and loop inputs. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-overlay-scroll` | Scroll container for overlays and panels; contains overscroll within the element. Currently no TSX usage. [unused-css] | `v3/src/styles/global.css` |
| `sb-pad` | Base pad shell — pixel-frame, type-colour left spine, is-hot glow, is-setup dashed border. | `v3/src/styles/tokens.css` |
| `sb-pad-cell-add` | "+" symbol in empty grid cells; the tap-to-create affordance. | `v3/src/styles/tokens.css` |
| `sb-pad-editor` | Right inspector panel shown when a pad is selected in SETUP mode (280px, scrolls). | `v3/src/styles/tokens.css` |
| `sb-pad-grid` | CSS grid for the active scene's pads; col/row counts from --grid-cols/--grid-rows CSS vars. | `v3/src/styles/tokens.css` |
| `sb-pad-grid-cell` | Single cell wrapper in the pad grid; carries position, DnD states, and touch targets. | `v3/src/styles/tokens.css` |
| `sb-panel-header` | Compact 28px header strip on inspector panels (icon + uppercase label). | `v3/src/styles/tokens.css` |
| `sb-panel-title` | Flexible-fill title span inside a panel header — mono xs in normal text color. | `v3/src/styles/tokens.css` |
| `sb-pill` | Compact pixel-frame badge; type-colour variants via is-on, is-loop, is-playlist, is-combo. | `v3/src/styles/tokens.css` |
| `sb-pix` | Shared CSS base for card/btn/pad/pill/menu-row pixel-frame styling; never applied directly as a className. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-rail-label` | Section label inside a sidebar rail — VT323 11px muted, letterSpacing, padded. For CATEGORY/TAGS headers. | `v3/src/styles/tokens.css` |
| `sb-rail-section` | Padded section container in a sidebar rail. Add .has-divider for a bottom border separator. | `v3/src/styles/tokens.css` |
| `sb-range-input` | Native <input type="range"> styled with design-system gold accent — full width, pointer cursor. | `v3/src/styles/tokens.css` |
| `sb-readonly-field` | Read-only display row in inspector — flex, sunk background, bordered; for hotkey and value display. | `v3/src/styles/tokens.css` |
| `sb-row` | Horizontal flex row; align-items center, 8px gap (--space-2). Standard row for icon+label or toolbar items. | `v3/src/styles/tokens.css` |
| `sb-row-fill` | Centred fill row — fills flex parent (flex:1) and centres content both axes. Use for empty-state containers. | `v3/src/styles/tokens.css` |
| `sb-row-sm` | Compact flex row; align-items center, 4px gap (--space-1). For tight action groups and button clusters. | `v3/src/styles/tokens.css` |
| `sb-row-wrap` | Wrapping flex row; 4px gap (--space-1). For type-selector grids and wrapping button groups. | `v3/src/styles/tokens.css` |
| `sb-scanlines` | CRT scanline overlay via ::after pseudo-element; currently applied to StartScreen only. | `v3/src/styles/tokens.css` |
| `sb-scene-rail` | Left 220px scene navigation column on BoardScreen (fixed width, scrollable). | `v3/src/styles/tokens.css` |
| `sb-scene-tab` | Clickable scene entry in the scene rail; is-active highlights the current scene. | `v3/src/styles/tokens.css` |
| `sb-scene-tab-actions` | Action buttons (duplicate, delete) revealed on hover or on the active scene tab. | `v3/src/styles/tokens.css` |
| `sb-screen` | Full-height screen root container — flex column, 100dvh, surface background, positioned; outline-offset for inset drag indicators. | `v3/src/styles/tokens.css` |
| `sb-screen-empty` | Full-screen centered empty state — flex column, centered both axes, fills parent, mono xs text in text-mute. | `v3/src/styles/tokens.css` |
| `sb-screen-layout` | 2-column content grid for LibraryScreen — 220px filter rail + 1fr content, fills parent, min-height:0 for scroll. | `v3/src/styles/tokens.css` |
| `sb-scroll` | iOS-momentum scroll utility; touch scrolling without overscroll containment. Currently no TSX usage. [unused-css] | `v3/src/styles/global.css` |
| `sb-search-bar` | Outer search section bar — deep background, bottom border, no-shrink. Wraps sb-search-field. | `v3/src/styles/tokens.css` |
| `sb-search-field` | Inner search input row — flex, sunk background, bordered. Wraps icon + input + optional clear button. | `v3/src/styles/tokens.css` |
| `sb-search-input` | Transparent search input inside a bordered container — no background, no border, mono xs font. Use with sb-flex-1 when input shares a flex row with other elements. | `v3/src/styles/tokens.css` |
| `sb-section-header-row` | Flex row for inspector section headers — label left, action right, space-between, 6px bottom margin. | `v3/src/styles/tokens.css` |
| `sb-slider` | Horizontal range track bar for volume and trim controls; Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-slider-fill` | Active filled portion of the slider track; width set by inline style. Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-slider-thumb` | Draggable thumb on the slider track with gold glow. Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-status-bar` | Bottom 24px strip showing mode, board name, and other metadata. | `v3/src/styles/tokens.css` |
| `sb-tab` | Individual tab in a tab bar; is-active shows gold underline and label colour. | `v3/src/styles/tokens.css` |
| `sb-tab-badge` | Count badge inside a tab label — mono xs muted, left margin for separation from tab text. | `v3/src/styles/tokens.css` |
| `sb-tab-bar` | Outer wrapper for the tab navigation row — screen chrome with deep background, bottom border, side padding. Wraps .sb-tabs. | `v3/src/styles/tokens.css` |
| `sb-tabs` | Tab bar container — flex row with bottom border separating tabs from content. | `v3/src/styles/tokens.css` |
| `sb-tag-list` | Flex-wrap container for tag pills — padded with horizontal gutters. | `v3/src/styles/tokens.css` |
| `sb-text-input` | Pixel-style text input — sunk background, bordered, VT323 uppercase. For pad name and form fields. | `v3/src/styles/tokens.css` |
| `sb-toggle` | Binary on/off toggle switch (40×20px); is-on moves thumb right and adds gold glow. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-type-btn` | Type-selector button in pad editor — fills row-wrap evenly, xs font, tight padding; color/border set inline for active state. | `v3/src/styles/tokens.css` |
| `sb-type-confirm` | Desktop modal for confirming a pad-type change (z-index 500, pixel corners); sb-creation-sheet is used on mobile. | `v3/src/styles/tokens.css` |
| `sb-type-confirm-backdrop` | Desktop backdrop for sb-type-confirm; sb-creation-sheet-backdrop is the mobile equivalent. | `v3/src/styles/tokens.css` |
| `sb-type-indicator` | 8×8px colored dot indicating pad type in inspector header; color set inline by caller. | `v3/src/styles/tokens.css` |
| `sb-undo-toast` | Fixed notification toast above the status bar shown after scene deletion. | `v3/src/styles/tokens.css` |
| `sb-undo-toast-progress` | Animated gold progress bar at the bottom of the undo toast (linear shrink). | `v3/src/styles/tokens.css` |
| `sb-upload-bar` | Upload status notification bar — flex row, raised background, top border, mono xs text. Color set inline for error/normal state. | `v3/src/styles/tokens.css` |
| `sb-value-text` | Numeric value display in inspector — mono xs gold; for fade/volume values next to sliders. | `v3/src/styles/tokens.css` |
<!-- AUTO-GENERATED:sb-classes END -->

---

## §A Token-Inventur

> Auto-generiert via `npm run sync:tokens` aus
> `SoS_DESIGN_25052026/tokens.css`. Gruppen entsprechen den
> Abschnitts-Kommentaren in der Token-Quelldatei.

<!-- AUTO-GENERATED:tokens START — nicht manuell editieren -->
### SURFACE HIERARCHY

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--night` | `#08081a` | — |
| `--deep` | `#0e0e22` | — |
| `--surface` | `#16162e` | — |
| `--raised` | `#22224a` | — |
| `--top` | `#2d2d60` | — |
| `--sunk` | `#060614` | — |

### BORDERS

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--border` | `#383868` | default 1px hairline · L* ~0.116 |
| `--border-soft` | `#232348` | dividers inside dense lists |
| `--border-strong` | `#5252a0` | drag handles, focused inputs |
| `--border-gold` | `#c9a84c` | selected / active |
| `--border-blood` | `#a02828` | destructive zones |

### TEXT

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--text` | `#f0e8d0` | — |
| `--text-strong` | `#ffffff` | high emphasis · numbers, headings on raised |
| `--text-dim` | `#b8b0c8` | secondary · descriptions |
| `--text-mute` | `#7e7494` | tertiary · meta only, AA-large |
| `--text-on-gold` | `#14100a` | — |
| `--text-on-blood` | `#ffe8e0` | — |

### BRAND ACCENTS

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--gold` | `#d4b25c` | +9% L* over original — readable at 14px |
| `--gold-bright` | `#f5d57a` | highlights, "now playing", focus rings |
| `--gold-dim` | `#8a6e34` | muted gold — divider lines |
| `--gold-soft` | `rgba(212, 178, 92, 0.18)` | — |
| `--flame` | `#e8821e` | the logo flame |
| `--flame-soft` | `rgba(232, 130, 30, 0.15)` | ambient bg wash (StartScreen radial) |
| `--flame-aura` | `rgba(232, 130, 30, 0.32)` | mid-alpha glow ring |
| `--blood` | `#a02828` | +14% L* over #8b1a1a — readable on dark |
| `--blood-bright` | `#ef7575` | — |
| `--blood-soft` | `rgba(160, 40, 40, 0.18)` | — |

### PAD TYPES

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--pad-single` | `#d4b25c` | — |
| `--pad-single-soft` | `rgba(212, 178, 92, 0.16)` | — |
| `--pad-single-glow` | `rgba(245, 213, 122, 0.55)` | — |
| `--pad-loop` | `#6db5b8` | — |
| `--pad-loop-soft` | `rgba(109, 181, 184, 0.16)` | — |
| `--pad-loop-glow` | `rgba(141, 213, 216, 0.55)` | — |
| `--pad-playlist` | `#9d7fc7` | — |
| `--pad-playlist-soft` | `rgba(157, 127, 199, 0.16)` | — |
| `--pad-playlist-glow` | `rgba(189, 159, 231, 0.55)` | — |
| `--pad-combo` | `#c9529d` | — |
| `--pad-combo-soft` | `rgba(201, 82, 157, 0.18)` | — |
| `--pad-combo-glow` | `rgba(225, 110, 185, 0.55)` | — |

### PAD SURFACE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--pad-edge-light` | `rgba(255, 255, 255, 0.12)` | — |
| `--pad-edge-dark` | `rgba(0, 0, 0, 0.4)` | — |
| `--fade` | `#6fa85f` | — |
| `--fade-soft` | `rgba(111, 168, 95, 0.18)` | — |

### SEMANTIC

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--success` | `#6db5b8` | — |
| `--warning` | `#d4b25c` | gold doubles as caution |
| `--danger` | `var(--blood-bright)` | — |
| `--info` | `#9d7fc7` | violet for hints / metadata |

### MODE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--mode-setup` | `#6db5b8` | — |
| `--mode-setup-soft` | `rgba(109, 181, 184, 0.06)` | — |
| `--mode-setup-glow` | `rgba(141, 213, 216, 0.55)` | — |
| `--mode-game` | `#d4b25c` | — |
| `--mode-game-soft` | `rgba(212, 178, 92, 0.05)` | — |
| `--mode-game-glow` | `rgba(245, 213, 122, 0.55)` | — |

### ATMOSPHERE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--glow-radial` | `#2c1f4a` | — |

### SPACING

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--space-1` | `4px` | — |
| `--space-2` | `8px` | — |
| `--space-3` | `12px` | — |
| `--space-4` | `16px` | — |
| `--space-5` | `20px` | — |
| `--space-6` | `24px` | — |
| `--space-8` | `32px` | — |
| `--space-10` | `40px` | — |
| `--space-12` | `48px` | — |
| `--space-16` | `64px` | — |

### RADIUS

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--radius-sm` | `4px` | — |
| `--radius-pad` | `6px` | — |
| `--radius-md` | `8px` | — |
| `--radius-lg` | `12px` | — |
| `--radius-xl` | `16px` | — |

### ELEVATION

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--shadow-card` | `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.28))` | — |
| `--shadow-pop` | `drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45))` | — |
| `--shadow-pad-lift` | `drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.65))` | — |
| `--glow-flame` | `drop-shadow(0 0 6px rgba(232, 130, 30, 0.55))` | — |

### TYPE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--font-display` | `'Press Start 2P', 'VT323', monospace` | — |
| `--font-ui` | `'VT323', 'Share Tech Mono', monospace` | — |
| `--font-mono` | `'Share Tech Mono', 'VT323', monospace` | — |
| `--fs-xs` | `12px` | — |
| `--fs-sm` | `14px` | — |
| `--fs-md` | `16px` | — |
| `--fs-lg` | `18px` | — |
| `--fs-xl` | `22px` | — |
| `--fs-2xl` | `28px` | — |
| `--fs-3xl` | `36px` | — |
| `--fs-4xl` | `48px` | — |
| `--fs-pixel-sm` | `22px` | — |
| `--fs-pixel-md` | `32px` | — |
| `--fs-pixel-lg` | `48px` | — |
<!-- AUTO-GENERATED:tokens END -->
