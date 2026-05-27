// ─────────────────────────────────────────────────────────────────────────────
// StartScreen — fire animation + TAP TO UNLOCK entry point
//
// Source: SoS_DESIGN_25052026/v2-screens.jsx StartScreen
//
// Responsibilities:
//  1. Render the app splash (flame, title, tagline)
//  2. On button tap: unlock the Web Audio context
//  3. Show current AudioContext state in the footer
//
// TODO Slice 4: integrate with real audio engine (src/audio/);
//               handle iOS AudioContext suspend/resume lifecycle properly.
// ─────────────────────────────────────────────────────────────────────────────

import type { JSX } from 'preact';
import { PixelIcon } from '../components/PixelIcon';
import { audioContextState, currentScreen } from '../state/store';

// ── FlameLogo ────────────────────────────────────────────────────────────────
// Inline here; large enough to warrant a separate component once reused.
// Source: SoS_DESIGN_25052026/components.jsx FlameLogo

interface FlameLogoProps {
  size?: number;
}

function FlameLogo({ size = 80 }: FlameLogoProps): JSX.Element {
  return (
    <div
      style={{
        color: 'var(--flame)',
        filter: 'var(--glow-flame)',
      }}
    >
      <PixelIcon name="flame" size={size} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a short human-readable label for the current AudioContext state. */
function describeAudioState(): string {
  switch (audioContextState.value) {
    case 'locked':    return 'audio context idle · tap to activate';
    case 'running':   return 'audio context running · ready';
    case 'suspended': return 'audio context suspended';
  }
}

/** Unlocks the Web Audio API context (required by browsers, especially iOS). */
async function handleUnlock(): Promise<void> {
  // TODO Slice 4: integrate with real audio engine (src/audio/);
  //               handle iOS AudioContext suspend/resume lifecycle properly.
  try {
    const ctx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    audioContextState.value = ctx.state === 'running' ? 'running' : 'suspended';
  } catch {
    // Older browsers or unusual environments: optimistically mark running
    // so the user can proceed. The real engine will validate in Slice 4.
    audioContextState.value = 'running';
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

const APP_VERSION = '3.0.0-alpha';

export function StartScreen(): JSX.Element {
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
        {/* Ambient glow ring — animated via sb-flicker defined in global.css */}
        <div
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, var(--flame-aura) 0%, transparent 60%)',
            animation: 'sb-flicker 1.6s ease-in-out infinite',
          }}
        />
        <FlameLogo size={120} />
      </div>

      {/* ── App title ── */}
      <div
        class="sb-display"
        style={{ fontSize: 22, textAlign: 'center', marginBottom: 18 }}
      >
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
        onClick={() => {
          handleUnlock().catch(console.error);
        }}
      >
        <PixelIcon name="play" size={14} />
        TAP TO UNLOCK
      </button>

      {/* ── Navigation buttons ── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 32,
        }}
      >
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          onClick={() => { currentScreen.value = 'library'; }}
        >
          <PixelIcon name="book" size={12} />
          LIBRARY
        </button>
      </div>

      {/* ── Footer: version + audio state ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-mute)',
          textAlign: 'center',
          padding: '0 16px',
        }}
      >
        v {APP_VERSION} · {describeAudioState()}
      </div>
    </div>
  );
}
