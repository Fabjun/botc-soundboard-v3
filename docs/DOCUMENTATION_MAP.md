# Documentation Map — Soundboard of Storytelling

This file describes the role and scope of every documentation locus in the project.
When you are unsure where something belongs or where to look something up, start here.

---

## Design system

### `DESIGN_SYSTEM.md`
Full design system specification. This is the **source of truth** for all design rules.
Auto-generated sections §6 (CSS class inventory) and §A (token inventory) are maintained
by `npm run sync:docs` — do not edit them manually.
**Source of truth for:** CSS class rules, state vocabulary (`is-*`), token usage rules,
component anatomy, pixel-frame patterns, and all project-wide naming conventions (§1).

### `DESIGN_SYSTEM_CHEATSHEET.md`
Single-page quick reference for daily use. Short form of `DESIGN_SYSTEM.md`.
When the cheatsheet and the main document conflict, the main document wins.
**Source of truth for:** Nothing exclusively — it summarises `DESIGN_SYSTEM.md`.

---

## Design origin

### `SoS_DESIGN_25052026/`
Frozen design handoff package from the original external design phase (2026-05-25).
Contains: 30+ JSX reference files (`app.jsx`, `foundations.jsx`, `v1`–`v26` exploration
files), `tokens.css` (design handoff origin — see note below), `HANDOFF.md`,
`Design System.html`, `Responsive Strategy V3.html`.
**Source of truth for:** Visual and interaction design intent; source material for V3
component implementations; original component shapes and token values.
**Note on `SoS_DESIGN_25052026/tokens.css`:** This is the original token file from the
design phase. It is kept as a reference only — the running app loads
`v3/src/styles/tokens.css`, which has evolved since handoff (see that file's header).

### `v3/src/styles/tokens.css`
Canonical app token file. This is the file the app loads at runtime.
Has `@inventory` comments (used by `npm run sync:tokens`). Has diverged from the design
handoff origin since V3 development began.
**Source of truth for:** All CSS custom properties (tokens) used in the running app.

---

## Decision records

### `docs/architecture/`
Architecture Decision Records (ADRs). Documents cross-cutting decisions: data model,
persistence strategy, platform assumptions, new infrastructure choices.
Index: `docs/architecture/README.md`. Template: `docs/architecture/_template.md`.
**Source of truth for:** Why a major architectural approach was chosen and what
alternatives were considered.

---

## Engineering guidance

### `CLAUDE.md`
Claude Code operating instructions. Permanent coding standards and workflow rules.
Must be kept up to date after every session that establishes new permanent standards.
**Source of truth for:** Conventions Claude must follow; rules for commits, testing,
build, slice completion, and all code-level standards enforced during sessions.

### `TESTING.md`
Test architecture, commands, and conventions. Includes the `data-testid` naming
convention, E2E patterns, known caveats (Playwright/WebKit limitations), and the
pre-commit/CI gate specification.
**Source of truth for:** Test structure, test commands, `data-testid` naming.

---

## Working notes

### `DESIGN_NOTES.md`
Design-detail decisions, RESOLVED entries, and slice-specific open questions.
Not a feature backlog and not an architecture record. When a design-detail decision
hardens into a permanent convention, it migrates to `DESIGN_SYSTEM.md`. When a deferred
item becomes a feature or known limitation, it moves to `BACKLOG.md`.
**Source of truth for:** Design-detail rationale and open "how exactly" questions at
the slice level.

### `BACKLOG.md`
Living backlog: all deferred items, known limitations, and open UX decisions.
Updated at each slice completion (per CLAUDE.md Workflow Rule 14).
**Source of truth for:** What work is explicitly deferred, and why.

---

## Hierarchy rule

When two documents make conflicting statements about the same topic, the precedence is:

1. `CLAUDE.md` — binding operating rule (highest)
2. `docs/architecture/` ADR — architectural decision
3. `DESIGN_SYSTEM.md` — design system specification
4. `DESIGN_SYSTEM_CHEATSHEET.md` — summary of the above
5. `DESIGN_NOTES.md` / `BACKLOG.md` — working notes (lower; may be outdated)
