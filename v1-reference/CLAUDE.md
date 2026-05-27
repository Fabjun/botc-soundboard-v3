# CLAUDE.md — BotC Soundboard ("Soundboard of Storytelling")

> **Maintenance rule**: This file is the single source of truth for project-specific guidelines.
> Claude Code must keep it up to date autonomously — update it whenever new permanent standards
> emerge, existing rules are revised, or important architectural decisions are made. Do not wait
> to be asked. If you change something that implies a new rule, write it here immediately.

---

## Project identity

- **App name**: "Soundboard of Storytelling"  
- **Repo**: https://github.com/Fabjun/botc-soundboard  
- **Live URL**: https://fabjun.github.io/botc-soundboard/ (GitHub Pages, ~1 min deploy lag)  
- **Primary target device**: iPhone + Brave browser + Bluetooth Numpad (Logilink ID0212v2)  
- **Secondary**: laptop/desktop  
- **Language**: app UI = English; Fabian communicates in German or English

---

## Architecture (non-negotiable)

- **Single file**: all code lives in `index.html`. No build system, no bundler, no framework.
- **Persistence**: IndexedDB (`botc`, v1) — two stores: `p` (boards + pads), `lib` (audio assets keyed by SHA-256 hash)
- **Preferences**: `localStorage` only
- **PWA**: `manifest.json` + `sw.js`. Bump `VERSION` in `sw.js` with every significant `index.html` change so the service worker updates.
- **Versioning**: `APP_VERSION` in `index.html` must match `CHANGELOG[0].v`. The `console.assert` guard at the bottom of the script block enforces this — never break it.
- **V1.5 versioning**: same rule applies — `APP_VERSION` in `v1_5/app.js` must match `CHANGELOG[0].v`; `console.assert` guard after the array enforces it. Always add a CHANGELOG entry when bumping `APP_VERSION`.
- **No `</script>` in JS strings**: the HTML parser terminates the script block on that byte sequence. Use `<\/script>` if the literal must appear (e.g., in CHANGELOG text).

---

## iPhone / iOS Safari — memory & stability rules (CRITICAL)

iOS Safari kills the tab when JS heap exceeds ~600 MB (older iPhones) or ~1-1.5 GB (newer). All code paths that touch IndexedDB or audio must respect these limits:

### Banned patterns
| Pattern | Why | Replacement |
|---------|-----|-------------|
| `libGetAll()` in any function that doesn't need audio data | loads 150-240 MB of audio bufs into RAM | `libGetAllMeta()` — cursor that omits `buf` |
| Parallel `decodeAudioData` for N files | N × 50-100 MB PCM = instant OOM at N > 10 | One decode at a time; release buffer when done |
| Storing raw audio `buf` in `eFiles[]` entries | holds copies of 5-8 MB compressed + 50-100 MB decoded | store `{name, hash, size}` only; lazy-load via `libGet(hash)` |
| `buildExportJson()` style: load all bufs at once | 150-300 MB all in RAM | stream one entry at a time via `buildExportBlob()` |
| `new FileReader` in a forEach loop over N files | N parallel reads + N parallel addToLib decodes | `_processFilesSerial()` — one file at a time |

### Required patterns
- `libGetAllMeta()` for any listing/filtering/renaming that doesn't need audio playback
- `_ensureLibBuf(hash)` for on-demand decode with in-flight deduplication
- `s.buffer = null` in `onended` to release PCM before next decode
- `jsonStr = null` after JSON.parse in import to free the large string
- `e.data = null` after `base64ToBuf` to free base64 strings immediately
- `LRU_BUF_MAX_BYTES = 150 MB` — never raise without careful analysis

### When adding any new code that touches audio or IDB
Ask: "Does this call `libGetAll()`? Does this trigger parallel decodes? Does this hold raw audio in JS heap?" If yes to any → refactor before shipping.

---

## Design language

### Color palette (use CSS variables, never hardcode)
```
--night  #0a0a14   deepest background
--deep   #0f0f1e   screen backgrounds
--surface #16162a  cards, panels
--raised  #1e1e35  elevated elements
--border  #2a2a4a  default borders
--gold    #c9a84c  primary accent (headings, active state, CTA)
--gold-dim #7a5f28 subtle borders, section labels
--blood   #8b1a1a  destructive / danger
--blood-bright #c0392b hover/active on destructive
--active  #4fc3f7  status indicators, SETUP mode accent
--text    #e8e0d0  primary text
--text-dim #8a8098 secondary / dimmed text
```

**Color code rule (never mix):**
- SETUP mode = blue/cool (`--active: #4fc3f7`)
- GAME mode = gold/warm (`--gold: #c9a84c`)

### Typography
- `'Press Start 2P'` — titles only. 13-16px, letter-spacing:0
- `'VT323'` — all UI labels, buttons, headings, section titles. 12-17px (`var(--ff-label)`)
- `'Share Tech Mono'` — body text, descriptions, inputs, filenames (`var(--ff-body)`)

### UI rules
- No emojis (render as colorful glyphs). Use Unicode/ASCII from VT323 charset.
- Every delete button: 2-tap confirmation (first tap shows confirmation state, second tap executes)
- All counts/labels: dynamic from data, never hardcoded
- Scroll position of overlays/list views: save and restore on re-open
- Min touch target on all interactive elements: 44px (iOS guideline)
- `overscroll-behavior:none` on all fixed overlay panels
- `-webkit-overflow-scrolling:touch` on all scroll containers

---

## Permanent coding standards

- **`libGetAll()` call sites**: zero. Every call that was there has been replaced with `libGetAllMeta()`. If you find a new need for `libGetAll()`, think hard first — it's almost always wrong.
- **Delete buttons**: always 2-tap confirmation. Use `showConfirmDel()`.
- **Inline onclick with user data**: always `escHtml(JSON.stringify(value))` in attributes. Never bare `JSON.stringify`.
- **IndexedDB transactions**: use `libGet(hash)` / `libPut(entry)` / `libDelete(hash)` helpers. Never open raw transactions for lib operations outside these helpers.
- **Waveform data**: computed at upload time (`_computePeaks`, stored as `entry.peaks`). Use stored peaks where possible; only call `decodeWaveform` as fallback for old entries without peaks.
- **`eFiles[]` entries**: always `{name, hash, size}` for library files. Never store raw audio buf in eFiles.
- **Version sync**: bump `APP_VERSION`, add `CHANGELOG[0]`, bump `sw.js VERSION` — always all three together.

---

## Workflow rules

1. **After every feature or fix**: `git add index.html sw.js && git commit -m "..." && git push`
2. Do not leave changes local-only. The user tests on GitHub Pages and iPhone.
3. After every push: give a short summary of what changed and what to test.
4. Before implementing any change: explain the plan and design context, wait for confirmation.
5. "Kannst du X?" is a question — answer first, wait for go-ahead before implementing.
6. Update `update_log.md` in memory after every commit.
7. Update this `CLAUDE.md` when permanent standards change.
