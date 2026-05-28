// In-app changelog — mirrors CHANGELOG.md but structured for the UI.
// Most-recent entry first. version must match APP_VERSION in StartScreen.

export type ChangelogEntry = {
  version: string;
  date: string;
  items: string[];
};

export const APP_VERSION = '3.0.4';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '3.0.4',
    date: '2026-05-28',
    items: [
      'Audio playback: SINGLE, LOOP, PLAYLIST, COMBO pads all play audio',
      'LRU decoded-buffer cache (150 MB cap) — iOS memory safety preserved from V1',
      'TAP TO UNLOCK wires AudioContext synchronously in gesture handler (iOS requirement)',
      'iOS ringer-switch fix: silent WAV upgrades audio session to "playback" category',
      'is-hot / is-looping CSS state driven by Preact Signals — reactive without polling',
    ],
  },
  {
    version: '3.0.3',
    date: '2026-05-27',
    items: [
      'Board, Scene, Pad CRUD — full create / rename / duplicate / delete',
      'Pad DnD: SWAP + INSERT via Pointer Events (iOS-safe — no HTML5 DnD)',
      'SETUP / GAME mode toggle with spark animation',
      '3 pad-creation paths: tap empty slot, library drag, ADD PAD button',
      'Pad type selection dialog with 2-tap-delete confirm pattern',
    ],
  },
  {
    version: '3.0.2',
    date: '2026-05-27',
    items: [
      'Library: import audio files, rename, delete',
      'Serial upload pipeline — never loads all audio into RAM at once (iOS safety)',
      'SHA-256 content addressing via @noble/hashes — works without Secure Context (iPhone LAN)',
      'Waveform peak visualisation computed at import, stored in IDB',
    ],
  },
  {
    version: '3.0.1',
    date: '2026-05-27',
    items: [
      'Project scaffold: Preact + TypeScript + Vite + PWA (vite-plugin-pwa)',
      'StartScreen with TAP TO UNLOCK entry point',
      'Design system: tokens, typography, pixel-art icon set',
      'IndexedDB persistence layer with typed helpers',
    ],
  },
];
