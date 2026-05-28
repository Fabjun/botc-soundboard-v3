// ─────────────────────────────────────────────────────────────────────────────
// StartScreen — fire animation + TAP TO UNLOCK entry point
//
// Source: SoS_DESIGN_25052026/v2-screens.jsx StartScreen
//
// Responsibilities:
//  1. Render the app splash (flame, title, tagline)
//  2. On button tap: unlock the Web Audio context + navigate to board-list
//  3. Show version (clickable → changelog overlay) + audio state in footer
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { PixelIcon } from '../components/PixelIcon';
import { audioContextState, currentScreen } from '../state/store';
import { initAudio } from '../audio/index';
import { APP_VERSION, CHANGELOG } from '../lib/changelog';

declare const __BUILD_DATE__: string;

// ── FlameLogo ────────────────────────────────────────────────────────────────

function FlameLogo({ size = 80 }: { size?: number }): JSX.Element {
  return (
    <div style={{ color: 'var(--flame)', filter: 'var(--glow-flame)' }}>
      <PixelIcon name="flame" size={size} />
    </div>
  );
}

// ── ChangelogOverlay ──────────────────────────────────────────────────────────

function ChangelogOverlay({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--deep)',
        display: 'flex',
        flexDirection: 'column',
        overscrollBehavior: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-lg)',
            letterSpacing: '.08em',
            color: 'var(--text)',
          }}
        >
          CHANGELOG
        </div>
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          onClick={onClose}
          aria-label="Close changelog"
        >
          ×
        </button>
      </div>

      {/* Scrollable entries */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {CHANGELOG.map((entry) => (
          <div key={entry.version}>
            {/* Version header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'var(--fs-lg)',
                  letterSpacing: '.06em',
                  color: 'var(--gold)',
                }}
              >
                v {entry.version}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-mute)',
                }}
              >
                {entry.date}
              </span>
            </div>

            {/* Items */}
            <ul
              style={{
                margin: 0,
                paddingLeft: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              {entry.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    lineHeight: 1.55,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function describeAudioState(): string {
  switch (audioContextState.value) {
    case 'locked':
      return 'audio context idle · tap to activate';
    case 'running':
      return 'audio context running · ready';
    case 'suspended':
      return 'audio context suspended';
  }
}

/**
 * initAudio() MUST be the first statement — no await before it.
 * iOS Safari's user-gesture window closes on the first async tick (ADR-0043).
 * Wrapped in try-catch so navigation always succeeds even if AudioContext
 * creation fails (e.g. browser privacy settings).
 */
function handleUnlock(): void {
  try {
    initAudio();
  } catch (e) {
    console.warn('[audio] AudioContext init failed — pads will be silent:', e);
  }
  audioContextState.value = 'running';
  currentScreen.value = 'board-list';
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function StartScreen(): JSX.Element {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <div
      class="sb sb-scanlines"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '100dvh',
        background: `
          radial-gradient(60% 50% at 50% 65%, var(--flame-soft) 0%, transparent 70%),
          radial-gradient(120% 70% at 50% -10%, var(--glow-radial) 0%, transparent 65%),
          var(--night)
        `,
      }}
    >
      {showChangelog && <ChangelogOverlay onClose={() => setShowChangelog(false)} />}

      {/* ── Flame logo with ambient glow ── */}
      <div
        style={{
          width: 200,
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--flame-aura) 0%, transparent 60%)',
            animation: 'sb-flicker 1.6s ease-in-out infinite',
          }}
        />
        <FlameLogo size={120} />
      </div>

      {/* ── App title ── */}
      <div class="sb-display" style={{ fontSize: 22, textAlign: 'center', marginBottom: 18 }}>
        SOUNDBOARD
        <br />
        OF STORYTELLING
      </div>

      {/* ── Tagline ── */}
      <div
        class="sb-mono is-italic"
        style={{
          fontSize: 13,
          color: 'var(--text-dim)',
          marginBottom: 36,
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        // a tool for game-masters and other creative creatures
      </div>

      {/* ── Unlock button — minimum 44px touch target per CLAUDE.md ── */}
      <button
        class="sb-btn sb-btn-primary"
        style={{
          minWidth: 240,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
        onClick={handleUnlock}
      >
        <PixelIcon name="play" size={14} />
        TAP TO UNLOCK
      </button>

      {/* ── Navigation buttons ── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          onClick={() => { currentScreen.value = 'board-list'; }}
        >
          <PixelIcon name="scroll" size={12} />
          BOARD
        </button>
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          onClick={() => { currentScreen.value = 'library'; }}
        >
          <PixelIcon name="book" size={12} />
          LIBRARY
        </button>
      </div>

      {/* ── Footer: clickable version → changelog + audio state ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-mute)',
          textAlign: 'center',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
            cursor: 'pointer',
            letterSpacing: 'inherit',
            textDecoration: 'underline dotted',
            textUnderlineOffset: '3px',
          }}
          onClick={() => setShowChangelog(true)}
          aria-label="Open changelog"
        >
          v {APP_VERSION}
        </button>
        <span>· build {__BUILD_DATE__} ·</span>
        <span>{describeAudioState()}</span>
      </div>
    </div>
  );
}
