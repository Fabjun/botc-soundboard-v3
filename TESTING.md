# Testing — V3 (Soundboard of Storytelling)

## Überblick

Drei Schichten, eingeführt in Phase 1 (Slice 3.5):

| Schicht | Werkzeug | Zweck | Laufzeit |
|---------|---------|-------|---------|
| Unit | Vitest | Logik-Korrektheit (pure functions, signals, IDB-API) | ~1s |
| E2E | Playwright | Smoke-Pfade in echtem Browser | ~10–30s |
| Visual Regression | Playwright Screenshots | Pixel-Vergleich | Phase 2 |

---

## Werkzeuge

- **Vitest** — Unit-Tests. Schnell (ms), kein Browser, keine Netzwerk-Abhängigkeit. Konfiguration: [v3/vitest.config.ts](v3/vitest.config.ts)
- **Playwright** — E2E-Tests in Chromium + WebKit. Startet den Vite-Dev-Server automatisch. Konfiguration: [v3/playwright.config.ts](v3/playwright.config.ts)
- **fake-indexeddb** — In-Memory-IndexedDB für Unit-Tests. Ersetzt jsdom's fehlende IDB-Implementierung. Setup: [v3/tests/unit/setup.ts](v3/tests/unit/setup.ts)

---

## Verzeichnis-Struktur

```
v3/
  tests/
    unit/
      setup.ts            ← Vitest-Globales: fake-indexeddb/auto
      padUtils.test.ts    ← pure functions (nextFreeSlot, typeInference, migration)
      padDnd.test.ts      ← applySwap, applyInsert (pure, kein DOM)
      store.test.ts       ← Preact Signals mutations + computed reactivity
      idb.test.ts         ← IDB-Layer round-trips (boardPut/Get/Delete, libGetAllMeta)
    e2e/
      app-loads.spec.ts         ← StartScreen mit TAP TO UNLOCK
      library-empty.spec.ts     ← LIBRARY-Button → LibraryScreen
      board-list-empty.spec.ts  ← BOARD-Button → BoardListScreen
      board-create.spec.ts      ← Board anlegen → navigieren → BoardScreen
      mode-toggle.spec.ts       ← GAME ↔ SETUP umschalten
  vitest.config.ts
  playwright.config.ts
  tsconfig.test.json      ← Relaxte TypeScript-Config für Test-Dateien
```

---

## Konventionen

- **Test-Datei-Naming**: `<modul>.test.ts` (Unit), `<feature>.spec.ts` (E2E)
- **Ein Test = eine Annahme** — kein Multi-Assert-Chaos pro `test()`
- **Sprache**: TypeScript (konsistent mit Produktionscode)
- **Tests dokumentieren Verhalten**, nicht Implementierung
- **Keine magic strings** — Selektoren als Kommentar dokumentieren wenn nicht selbsterklärend
- **import type** für Type-only-Imports (verbatimModuleSyntax: true im tsconfig)

---

## Wann läuft welche Schicht

| Moment | Schicht | Befehl |
|--------|---------|--------|
| Beim Speichern (lokal) | Unit (watch) | `npm run test:watch` |
| Vor jedem Commit (automatisch) | Unit | Husky-Hook |
| **Vor jedem Push (manuell)** | E2E | `npm run test:e2e` |
| Slice-Abschluss | Unit + E2E | `npm run test && npm run test:e2e` |
| Phase 2 (CI, geplant) | Unit + E2E + Visual | GitHub Actions |

> **Phase-1-Pflicht bis CI-Integration**: Vor jedem `git push` manuell
> `npm run test:e2e` ausführen. E2E-Tests sind noch nicht im Pre-Commit-Hook
> (zu langsam, ~10–30s). Das kommt in Phase 2.

---

## Befehle

```bash
# Alle Unit-Tests einmal ausführen
cd v3 && npm run test

# Unit-Tests im Watch-Mode (beim Entwickeln)
cd v3 && npm run test:watch

# Vitest-UI (Browser-Interface für Tests)
cd v3 && npm run test:ui

# E2E-Tests (startet Dev-Server automatisch)
cd v3 && npm run test:e2e

# E2E mit UI-Runner (Playwright)
cd v3 && npm run test:e2e:ui

# E2E mit Debug-Modus (Step-through)
cd v3 && npm run test:e2e:debug
```

---

## Neue Unit-Tests schreiben

Für jede neue Logik-Funktion in `src/lib/` oder `src/state/`:

```typescript
// v3/tests/unit/meineModule.test.ts
import { meineFunktion } from '../../src/lib/meineModule';

describe('meineFunktion', () => {
  test('Beschreibung des erwarteten Verhaltens', () => {
    // Arrange
    const input = { ... };
    // Act
    const result = meineFunktion(input);
    // Assert
    expect(result).toEqual({ ... });
  });

  test('Edge Case: ...',  () => {
    expect(meineFunktion(null)).toBeNull(); // ein Test = eine Annahme
  });
});
```

**Richtlinien:**
- Keine realen Browser-APIs in Unit-Tests (IndexedDB ausnahmsweise via fake-indexeddb)
- Signals in `beforeEach` zurücksetzen (sie sind module-level singletons)
- IDB-Tests: `_resetDB()` + `new IDBFactory()` in `beforeEach`

---

## Neue E2E-Tests schreiben

Für jeden neuen Nutzer-Flow:

```typescript
// v3/tests/e2e/meinFeature.spec.ts
import { test, expect } from '@playwright/test';

test('beschreibt den Nutzer-Flow in einem Satz', async ({ page }) => {
  await page.goto('/botc-soundboard-v3/');
  // Navigieren
  await page.getByRole('button', { name: 'BOARD' }).click();
  // Verifizieren
  await expect(page.locator('.sb-mode-toggle')).toBeVisible();
});
```

**Richtlinien:**
- Jeder Test ist self-contained (eigener Zustand, keine Abhängigkeit von anderen Tests)
- `page.goto('/botc-soundboard-v3/')` am Anfang jedes Tests (IndexedDB ist per Browser-Context isoliert)
- Selektoren in Reihenfolge der Robustheit: `getByRole` > `.filter({ hasText })` > CSS-Klasse
- Tests müssen in Chromium UND WebKit bestehen (beide Browser im `playwright.config.ts`)

---

## Tests aktualisieren

- Bei Funktions-Änderung: Tests anpassen ist Teil der Aufgabe, nicht optional
- Bei UI-Änderung (Klassen, Texte): E2E-Selektoren sofort prüfen und korrigieren
- Bei Visual-Regression-Änderung (Phase 2): Screenshot-Baseline aktualisieren mit `playwright test --update-snapshots`
- Bei flakey Tests: **erst untersuchen warum**, dann fixen oder als `test.skip` mit Issue-Referenz markieren. Nie stillschweigend ignorieren.

---

## Bekannte Fallstricke

### 1. Preact Signals sind module-level Singletons

Signals (`boards`, `currentBoardId` etc.) in `src/state/store.ts` persistieren
zwischen Tests, weil der Modul-Cache nicht zurückgesetzt wird. Lösung: `beforeEach`
mit explizitem Reset:

```typescript
beforeEach(() => {
  boards.value = [];
  currentBoardId.value = null;
  // ... weitere Signals die der Test berührt
});
```

### 2. IDB-Singleton in idb.ts

`idb.ts` hält `let _db` als Modul-Singleton. Ohne Reset würde jeder Test in
derselben Fake-DB-Instanz operieren. Lösung: `_resetDB()` aus `idb.ts` exportiert
und in `beforeEach` aufrufen (zusammen mit `new IDBFactory()`).

### 3. CSS-Klassen-Selektoren brechen bei Refactoring

Die E2E-Tests verwenden CSS-Klassen wie `.sb-mode-toggle`, `.sb-pad-grid-cell`,
`.sb-menu-row`. Diese sind stabil solange die Design-System-Klassen sich nicht
ändern (Slice 8 / Polish ist ein Risiko-Moment). **Langfristiger Fix**: auf
`data-testid`-Attribute umstellen. Das ist kein Breaking-Bug, aber ein bekannter
Schwachpunkt. In Phase 2 adressieren.

### 4. getByText-Ambiguität in Playwright

`page.getByText('X')` schlägt fehl wenn "X" mehrfach im DOM vorkommt (strict mode
violation). Immer präzisere Selektoren verwenden:
- `.locator('.some-class').filter({ hasText: 'X' })`
- `getByRole('button', { name: /X/ })`
- `.locator('button.specific-class')`

### 5. IMPORT vs UPLOAD — CLAUDE.md-Diskrepanz

Die LibraryScreen-Schaltfläche heißt im Code **IMPORT** (nicht UPLOAD, wie in
CLAUDE.md fälschlich dokumentiert). Der E2E-Test verwendet korrekt "IMPORT".
CLAUDE.md ist bereits aktualisiert.

---

## Phase 2 (geplant)

- Visual Regression mit Screenshot-Baseline (Playwright Screenshots)
- Volle E2E-Suite für alle 22 Slice-3-Verifikationspunkte aus CLAUDE.md
- CI-Integration via GitHub Actions (`.github/workflows/test.yml`)
- Pre-Commit-Hook-Erweiterung um E2E-Tests (oder Subset davon)
- `@vitest/coverage-v8` für Coverage-Reports
- `data-testid`-Migration für robustere E2E-Selektoren
