# Soundboard of Storytelling — Design System

> **Source of truth.** `DESIGN_SYSTEM_CHEATSHEET.md` ist der Kurzauszug für
> den Arbeitsalltag. Wenn Cheatsheet und dieses Dokument widersprüchlich sind,
> gewinnt dieses Dokument.

---

## §1 Nomenklatur

<!-- TODO: Ausschreiben — Kurzfassung in DESIGN_SYSTEM_CHEATSHEET.md §60-second contract -->

Klassen-Konventionen:
- Block: `sb-<block>` (z. B. `sb-pad`, `sb-btn`)
- Teil: `sb-<block>-<part>` (z. B. `sb-pad-title`, `sb-btn-sm`)
- Zustand: `is-<state>` (z. B. `is-hot`, `is-setup`) — nie block-scoped

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
| `sb-btn-danger` | Button variant for destructive actions; blood-red border and label. | `v3/src/styles/tokens.css` |
| `sb-btn-filled` | Button variant — solid gold fill and dark label; primary CTA. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-btn-ghost` | Button variant — transparent fill, dimmed border; low-emphasis. | `v3/src/styles/tokens.css` |
| `sb-btn-primary` | Button variant — gold border and label; highlighted action. | `v3/src/styles/tokens.css` |
| `sb-btn-sm` | Small-size modifier for .sb-btn; tighter padding and smaller font. | `v3/src/styles/tokens.css` |
| `sb-caption` | Smallest text style — xs mono in text-mute; for filenames and metadata. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-card` | Pixel-frame container card with padding and drop-shadow elevation. Currently no TSX usage; V3 list items use sb-menu-row instead. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-creation-popover` | Fixed 300px popover for Path A (desktop) pad creation flow. | `v3/src/styles/tokens.css` |
| `sb-creation-popover-section` | Padded section divider within the creation popover. Not applied in current PadCreationPopover.tsx implementation. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-creation-sheet` | Mobile bottom sheet for pad creation and pad-type confirmation (slides up from bottom, max 85dvh). | `v3/src/styles/tokens.css` |
| `sb-creation-sheet-backdrop` | Mobile backdrop behind sb-creation-sheet; sb-type-confirm-backdrop is the desktop equivalent. | `v3/src/styles/tokens.css` |
| `sb-display` | Hero title — Press Start 2P with gold glow; for page-level titles only. | `v3/src/styles/tokens.css` |
| `sb-display-vt` | VT323 heading variant of sb-display for medium headings; same glow, less chunky pixels. | `v3/src/styles/tokens.css` |
| `sb-grid-bg` | Cross-hatch layout grid on the board canvas in SETUP mode. | `v3/src/styles/tokens.css` |
| `sb-inspector` | Generic right-rail inspector shell; V3 uses specific variants sb-pad-editor and sb-library-panel. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-inspector-section` | Padded content section within an inspector panel, separated by bottom border. | `v3/src/styles/tokens.css` |
| `sb-label` | Uppercase VT323 label; intended for field labels and section headings. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
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
| `sb-pill` | Compact pixel-frame badge; type-colour variants via is-on, is-loop, is-playlist, is-combo. | `v3/src/styles/tokens.css` |
| `sb-pix` | Shared CSS base for card/btn/pad/pill/menu-row pixel-frame styling; never applied directly as a className. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-scanlines` | CRT scanline overlay via ::after pseudo-element; currently applied to StartScreen only. | `v3/src/styles/tokens.css` |
| `sb-scene-rail` | Left 220px scene navigation column on BoardScreen (fixed width, scrollable). | `v3/src/styles/tokens.css` |
| `sb-scene-tab` | Clickable scene entry in the scene rail; is-active highlights the current scene. | `v3/src/styles/tokens.css` |
| `sb-scene-tab-actions` | Action buttons (duplicate, delete) revealed on hover or on the active scene tab. | `v3/src/styles/tokens.css` |
| `sb-scroll` | iOS-momentum scroll utility; touch scrolling without overscroll containment. Currently no TSX usage. [unused-css] | `v3/src/styles/global.css` |
| `sb-slider` | Horizontal range track bar for volume and trim controls; Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-slider-fill` | Active filled portion of the slider track; width set by inline style. Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-slider-thumb` | Draggable thumb on the slider track with gold glow. Slice 8+ feature. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-status-bar` | Bottom 24px strip showing mode, board name, and other metadata. | `v3/src/styles/tokens.css` |
| `sb-tab` | Individual tab in a tab bar; is-active shows gold underline and label colour. | `v3/src/styles/tokens.css` |
| `sb-tabs` | Tab bar container — flex row with bottom border separating tabs from content. | `v3/src/styles/tokens.css` |
| `sb-toggle` | Binary on/off toggle switch (40×20px); is-on moves thumb right and adds gold glow. Currently no TSX usage. [unused-css] | `v3/src/styles/tokens.css` |
| `sb-type-confirm` | Desktop modal for confirming a pad-type change (z-index 500, pixel corners); sb-creation-sheet is used on mobile. | `v3/src/styles/tokens.css` |
| `sb-type-confirm-backdrop` | Desktop backdrop for sb-type-confirm; sb-creation-sheet-backdrop is the mobile equivalent. | `v3/src/styles/tokens.css` |
| `sb-undo-toast` | Fixed notification toast above the status bar shown after scene deletion. | `v3/src/styles/tokens.css` |
| `sb-undo-toast-progress` | Animated gold progress bar at the bottom of the undo toast (linear shrink). | `v3/src/styles/tokens.css` |
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
| `--night` | `#08081A` | — |
| `--deep` | `#0E0E22` | — |
| `--surface` | `#16162E` | — |
| `--raised` | `#22224A` | — |
| `--top` | `#2D2D60` | — |
| `--sunk` | `#060614` | — |

### BORDERS

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--border` | `#383868` | default 1px hairline · L* ~0.116 |
| `--border-soft` | `#232348` | dividers inside dense lists |
| `--border-strong` | `#5252A0` | drag handles, focused inputs |
| `--border-gold` | `#C9A84C` | selected / active |
| `--border-blood` | `#A02828` | destructive zones |

### TEXT

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--text` | `#F0E8D0` | — |
| `--text-strong` | `#FFFFFF` | high emphasis · numbers, headings on raised |
| `--text-dim` | `#B8B0C8` | secondary · descriptions |
| `--text-mute` | `#7E7494` | tertiary · meta only, AA-large |
| `--text-on-gold` | `#14100A` | — |
| `--text-on-blood` | `#FFE8E0` | — |

### BRAND ACCENTS

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--gold` | `#D4B25C` | +9% L* over original — readable at 14px |
| `--gold-bright` | `#F5D57A` | highlights, "now playing", focus rings |
| `--gold-dim` | `#8A6E34` | muted gold — divider lines |
| `--gold-soft` | `rgba(212, 178, 92, 0.18)` | — |
| `--flame` | `#E8821E` | the logo flame |
| `--blood` | `#A02828` | +14% L* over #8b1a1a — readable on dark |
| `--blood-bright` | `#EF7575` | — |
| `--blood-soft` | `rgba(160, 40, 40, 0.18)` | — |

### PAD TYPES

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--pad-single` | `#D4B25C` | — |
| `--pad-single-soft` | `rgba(212, 178, 92, 0.16)` | — |
| `--pad-single-glow` | `rgba(245, 213, 122, 0.55)` | — |
| `--pad-loop` | `#6DB5B8` | — |
| `--pad-loop-soft` | `rgba(109, 181, 184, 0.16)` | — |
| `--pad-loop-glow` | `rgba(141, 213, 216, 0.55)` | — |
| `--pad-playlist` | `#9D7FC7` | — |
| `--pad-playlist-soft` | `rgba(157, 127, 199, 0.16)` | — |
| `--pad-playlist-glow` | `rgba(189, 159, 231, 0.55)` | — |
| `--pad-combo` | `#C9529D` | — |
| `--pad-combo-soft` | `rgba(201, 82, 157, 0.18)` | — |
| `--pad-combo-glow` | `rgba(225, 110, 185, 0.55)` | — |

### PAD SURFACE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--pad-edge-light` | `rgba(255, 255, 255, 0.12)` | — |
| `--pad-edge-dark` | `rgba(0,   0,   0,   0.40)` | — |
| `--fade` | `#6FA85F` | — |
| `--fade-soft` | `rgba(111, 168, 95, 0.18)` | — |

### SEMANTIC

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--success` | `#6DB5B8` | — |
| `--warning` | `#D4B25C` | gold doubles as caution |
| `--danger` | `var(--blood-bright)` | — |
| `--info` | `#9D7FC7` | violet for hints / metadata |

### MODE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--mode-setup` | `#6DB5B8` | — |
| `--mode-setup-soft` | `rgba(109, 181, 184, 0.06)` | — |
| `--mode-setup-glow` | `rgba(141, 213, 216, 0.55)` | — |
| `--mode-game` | `#D4B25C` | — |
| `--mode-game-soft` | `rgba(212, 178, 92, 0.05)` | — |
| `--mode-game-glow` | `rgba(245, 213, 122, 0.55)` | — |

### ATMOSPHERE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--glow-radial` | `#2C1F4A` | — |

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
| `--shadow-card` | `drop-shadow(0 4px 8px rgba(0,0,0,.28))` | — |
| `--shadow-pop` | `drop-shadow(0 8px 24px rgba(0,0,0,.45))` | — |
| `--shadow-pad-lift` | `drop-shadow(3px 3px 0 rgba(0,0,0,.65))` | — |
| `--glow-flame` | `drop-shadow(0 0 6px rgba(232,130,30,.55))` | — |

### TYPE

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--font-display` | `"Press Start 2P", "VT323", monospace` | — |
| `--font-ui` | `"VT323", "Share Tech Mono", monospace` | — |
| `--font-mono` | `"Share Tech Mono", "VT323", monospace` | — |
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

### Legacy Aliases (--sb-*)

| Token | Wert | Beschreibung |
|-------|------|-------------|
| `--sb-bg-deep` | `var(--night)` | — |
| `--sb-bg-base` | `var(--deep)` | — |
| `--sb-bg-panel` | `var(--surface)` | — |
| `--sb-bg-panel-2` | `var(--raised)` | — |
| `--sb-bg-panel-sunk` | `var(--sunk)` | — |
| `--sb-glow-radial` | `var(--glow-radial)` | — |
| `--sb-border` | `var(--border)` | — |
| `--sb-border-soft` | `var(--border-soft)` | — |
| `--sb-border-active` | `var(--border-gold)` | — |
| `--sb-border-danger` | `var(--border-blood)` | — |
| `--sb-text` | `var(--text)` | — |
| `--sb-text-dim` | `var(--text-dim)` | — |
| `--sb-text-mute` | `var(--text-mute)` | — |
| `--sb-text-on-accent` | `var(--text-on-gold)` | — |
| `--sb-flame` | `var(--flame)` | — |
| `--sb-amber` | `var(--gold)` | — |
| `--sb-amber-glow` | `var(--gold-bright)` | — |
| `--sb-accent-1` | `var(--gold)` | — |
| `--sb-accent-1-soft` | `var(--gold-dim)` | — |
| `--sb-danger` | `var(--blood-bright)` | — |
| `--sb-warning` | `var(--warning)` | — |
| `--sb-success` | `var(--success)` | — |
| `--sb-info` | `var(--info)` | — |
| `--sb-space-1` | `var(--space-1)` | — |
| `--sb-space-2` | `var(--space-2)` | — |
| `--sb-space-3` | `var(--space-3)` | — |
| `--sb-space-4` | `var(--space-4)` | — |
| `--sb-space-5` | `var(--space-5)` | — |
| `--sb-space-6` | `var(--space-6)` | — |
| `--sb-space-8` | `var(--space-8)` | — |
| `--sb-space-10` | `var(--space-10)` | — |
| `--sb-space-12` | `var(--space-12)` | — |
| `--sb-space-16` | `var(--space-16)` | — |
| `--sb-radius-sm` | `var(--radius-sm)` | — |
| `--sb-radius-md` | `var(--radius-md)` | — |
| `--sb-radius-lg` | `var(--radius-lg)` | — |
| `--sb-radius-xl` | `var(--radius-xl)` | — |
| `--sb-radius-pad` | `var(--radius-pad)` | — |
| `--sb-shadow-card` | `var(--shadow-card)` | — |
| `--sb-shadow-pop` | `var(--shadow-pop)` | — |
| `--sb-glow-amber` | `var(--glow-gold)` | — |
| `--sb-glow-flame` | `var(--glow-flame)` | — |
| `--sb-font-display` | `var(--font-display)` | — |
| `--sb-font-ui` | `var(--font-ui)` | — |
| `--sb-font-mono` | `var(--font-mono)` | — |
| `--sb-fs-xs` | `var(--fs-xs)` | — |
| `--sb-fs-sm` | `var(--fs-sm)` | — |
| `--sb-fs-md` | `var(--fs-md)` | — |
| `--sb-fs-lg` | `var(--fs-lg)` | — |
| `--sb-fs-xl` | `var(--fs-xl)` | — |
| `--sb-fs-2xl` | `var(--fs-2xl)` | — |
| `--sb-fs-3xl` | `var(--fs-3xl)` | — |
| `--sb-fs-4xl` | `var(--fs-4xl)` | — |
| `--sb-fs-pixel-sm` | `var(--fs-pixel-sm)` | — |
| `--sb-fs-pixel-md` | `var(--fs-pixel-md)` | — |
| `--sb-fs-pixel-lg` | `var(--fs-pixel-lg)` | — |
| `--night` | `#07120D` | — |
| `--deep` | `#0B1E16` | — |
| `--surface` | `#102A20` | — |
| `--raised` | `#18402F` | — |
| `--top` | `#1F5240` | — |
| `--sunk` | `#050E0A` | — |
| `--border` | `#2A5640` | — |
| `--border-soft` | `#1A382B` | — |
| `--border-strong` | `#3A7A5C` | — |
| `--border-gold` | `#C9A04F` | — |
| `--text` | `#EFE6C8` | — |
| `--text-dim` | `#ACB5A6` | — |
| `--text-mute` | `#6F7E73` | — |
| `--flame` | `#D8893A` | — |
| `--gold` | `#C9A04F` | — |
| `--gold-bright` | `#F2CC5C` | — |
| `--pad-single` | `#C97D3A` | — |
| `--pad-single-soft` | `rgba(201,125,58,.16)` | — |
| `--pad-single-glow` | `rgba(232,158,80,.55)` | — |
| `--pad-loop` | `#4FA67A` | — |
| `--pad-loop-soft` | `rgba(79,166,122,.16)` | — |
| `--pad-loop-glow` | `rgba(95,200,144,.55)` | — |
| `--pad-playlist` | `#8A6FA0` | — |
| `--pad-playlist-soft` | `rgba(138,111,160,.16)` | — |
| `--pad-playlist-glow` | `rgba(176,144,202,.55)` | — |
| `--glow-radial` | `#18402F` | — |
| `--night` | `#050816` | — |
| `--deep` | `#0A1228` | — |
| `--surface` | `#111E40` | — |
| `--raised` | `#1A2C5E` | — |
| `--top` | `#233A7C` | — |
| `--sunk` | `#050A18` | — |
| `--border` | `#2B4382` | — |
| `--border-soft` | `#1B2A52` | — |
| `--border-strong` | `#4564B5` | — |
| `--border-gold` | `#3DD4F0` | — |
| `--text` | `#E2F0FF` | — |
| `--text-dim` | `#9DB5D6` | — |
| `--text-mute` | `#5F7AA2` | — |
| `--flame` | `#FF3D8B` | — |
| `--gold` | `#3DD4F0` | — |
| `--gold-bright` | `#6EF0FF` | — |
| `--pad-single` | `#FF5FA8` | — |
| `--pad-single-glow` | `rgba(255,95,168,.55)` | — |
| `--pad-loop` | `#3DD4F0` | — |
| `--pad-loop-glow` | `rgba(61,212,240,.55)` | — |
| `--pad-playlist` | `#B988FF` | — |
| `--pad-playlist-glow` | `rgba(185,136,255,.55)` | — |
| `--pad-combo` | `#FFD256` | — |
| `--pad-combo-glow` | `rgba(255,210,86,.55)` | — |
| `--glow-radial` | `#143052` | — |
| `--night` | `#0A0606` | — |
| `--deep` | `#16090A` | — |
| `--surface` | `#20121A` | — |
| `--raised` | `#2E1A22` | — |
| `--top` | `#44232E` | — |
| `--sunk` | `#0A0404` | — |
| `--border` | `#523040` | — |
| `--border-soft` | `#2E1820` | — |
| `--border-strong` | `#804052` | — |
| `--border-gold` | `#D63A3A` | — |
| `--text` | `#F2DDD2` | — |
| `--text-dim` | `#C09A95` | — |
| `--text-mute` | `#835A55` | — |
| `--flame` | `#B5302E` | — |
| `--gold` | `#D63A3A` | — |
| `--gold-bright` | `#F26666` | — |
| `--pad-single` | `#C7B07A` | — |
| `--pad-single-soft` | `rgba(199,176,122,.14)` | — |
| `--pad-single-glow` | `rgba(225,205,150,.50)` | — |
| `--pad-loop` | `#C04C75` | — |
| `--pad-loop-glow` | `rgba(192,76,117,.55)` | — |
| `--pad-playlist` | `#7A5295` | — |
| `--pad-playlist-glow` | `rgba(122,82,149,.55)` | — |
| `--pad-combo` | `#5A9FB0` | — |
| `--pad-combo-soft` | `rgba(90,159,176,.16)` | — |
| `--pad-combo-glow` | `rgba(120,195,212,.55)` | — |
| `--glow-radial` | `#3A1416` | — |
| `--pix-step` | `5px` | — |
| `--pix-thick` | `2px` | — |
| `--pix-bg` | `var(--surface)` | — |
| `--pix-border` | `var(--border)` | — |
| `--pix-step` | `6px` | — |
| `--pix-step` | `6px` | — |
| `--pix-step` | `4px` | — |
| `--pix-bg` | `var(--blood-soft)` | — |
| `--pix-border` | `var(--border-blood)` | — |
| `--pix-border` | `var(--blood-bright)` | — |
| `--pix-step` | `5px` | — |
| `--pad-color` | `var(--gold)` | — |
| `--pad-glow` | `var(--pad-single-glow)` | — |
| `--pix-bg` | `var(--surface)` | — |
| `--pix-border` | `var(--border)` | — |
| `--pix-border` | `var(--pad-color)` | — |
| `--pix-border` | `var(--border-strong)` | — |
| `--pad-filter-base` | `var(--shadow-pad-lift)` | — |
| `--pix-border` | `var(--border-strong)` | — |
| `--pix-step` | `3px` | — |
| `--pix-bg` | `var(--sunk)` | — |
| `--pix-border` | `var(--border-soft)` | — |
| `--pix-step` | `3px` | — |
<!-- AUTO-GENERATED:tokens END -->
