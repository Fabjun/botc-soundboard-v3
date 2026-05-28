# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### In Progress
- Slice 4 (Audio Playback) — V1 engine wrapped in src/audio/

## [0.3.0] — 2026-05-28

### Added
- Slice 3: Board, Scene, Pad CRUD with full IndexedDB persistence
- Pointer-events-based drag-and-drop (iOS-compatible, replaces HTML5 DnD)
- Mode toggle (SETUP/GAME) with spark animation
- Pad type change with confirmation dialog
- Architecture Decision Records (ADRs) in docs/architecture/

### Infrastructure
- Husky pre-commit hook (build + unit tests + smoke E2E)
- Full test infrastructure: Vitest unit tests + Playwright E2E
- Visual regression tests (macOS-only baselines)
- ESLint + Prettier enforced in CI
- Bundle size monitoring via size-limit
- GitHub Pages deployment via GitHub Actions (gated on green CI)

## [0.2.0] — 2026-05-27

### Added
- Slice 2: Library screen with audio file upload
- SHA-256 deduplication via @noble/hashes (works without Secure Context — iPhone LAN compatible)
- IndexedDB persistence with metadata/blob split (iOS memory safety)
- Serial upload pipeline (never parallel decode)
- 2-tap delete confirmation pattern
- Waveform visualization with stored peaks

## [0.1.0] — 2026-05-27

### Added
- Slice 1: StartScreen with flame animation
- Vite + Preact + TypeScript + Signals scaffold
- Design system tokens (tokens.css, SoS_DESIGN_25052026)
- PWA configuration via vite-plugin-pwa
- PixelIcon, TopBarV2, StatusBarV2 components
