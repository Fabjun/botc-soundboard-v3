// ─────────────────────────────────────────────────────────────────────────────
// PadTypeConfirmDialog — type-change confirmation per v23 Option C policy
//
// Source: SoS_DESIGN_25052026/v23-pad-type-change.jsx
//
// Shows verdict pill + KEEPS / MIGRATES / DROPS sections.
// RESET cases get a danger-tinted SWITCH button.
// Single tap CANCEL → type snaps back (caller handles).
// Single tap SWITCH → onConfirm() called, caller applies applyTypeChange().
//
// Mobile: renders as a bottom sheet; desktop: centered popover.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'preact/hooks';
import type { JSX } from 'preact';
import type { PadType } from '../types';
import { padMigrationMatrix, type MigrationVerdict } from '../lib/padUtils';

interface PadTypeConfirmDialogProps {
  fromType: PadType;
  toType: PadType;
  onConfirm: () => void;
  onCancel: () => void;
}

const VERDICT_LABELS: Record<MigrationVerdict, string> = {
  add: 'ADDS',
  migrate: 'MIGRATES',
  drop: 'DROPS',
  lossy: 'LOSSY',
  reset: 'RESET',
};

const VERDICT_COLORS: Record<MigrationVerdict, string> = {
  add: 'var(--mode-setup)',
  migrate: 'var(--gold)',
  drop: 'var(--warning)',
  lossy: 'var(--blood-bright)',
  reset: 'var(--blood-bright)',
};

const TYPE_LABELS: Record<PadType, string> = {
  single: 'SINGLE',
  loop: 'LOOP',
  playlist: 'PLAYLIST',
  combo: 'COMBO',
};

export function PadTypeConfirmDialog({
  fromType,
  toType,
  onConfirm,
  onCancel,
}: PadTypeConfirmDialogProps): JSX.Element {
  const { verdict, keeps, migrates, drops } = padMigrationMatrix(fromType, toType);
  const isDangerous = verdict === 'reset' || verdict === 'lossy';

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  const dialogContent = (
    <div
      class={isMobile ? 'sb-creation-sheet' : 'sb-type-confirm'}
      data-testid="type-confirm-dialog"
      style={
        isMobile
          ? {}
          : {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }
      }
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-md)',
            letterSpacing: '.10em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Change pad type?
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--fs-md)',
          }}
        >
          <span style={{ color: 'var(--text-dim)' }}>{TYPE_LABELS[fromType]}</span>
          <span style={{ color: 'var(--text-mute)' }}>→</span>
          <span style={{ color: 'var(--text)' }}>{TYPE_LABELS[toType]}</span>
          <span
            style={{
              marginLeft: 'auto',
              padding: '2px 10px',
              background: VERDICT_COLORS[verdict],
              color: 'var(--night)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-xs)',
              fontWeight: 'bold',
              letterSpacing: '.06em',
            }}
          >
            {VERDICT_LABELS[verdict]}
          </span>
        </div>
      </div>

      {/* Field lists */}
      {keeps.length > 0 && <FieldList label="KEEPS" items={keeps} color="var(--mode-setup)" />}
      {migrates.length > 0 && <FieldList label="MIGRATES" items={migrates} color="var(--gold)" />}
      {drops.length > 0 && <FieldList label="DROPS" items={drops} color="var(--blood-bright)" />}

      {/* Reset warning */}
      {verdict === 'reset' && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--blood-soft)',
            borderTop: '1px solid var(--border-blood)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-xs)',
            color: 'var(--blood-bright)',
          }}
        >
          Audio source and settings will be cleared. Reconfigure the pad after switching.
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--border-soft)',
          justifyContent: 'flex-end',
        }}
      >
        <button
          class="sb-btn sb-btn-sm sb-btn-ghost"
          data-testid="type-confirm-cancel"
          onClick={onCancel}
          style={{ minWidth: 80 }}
        >
          CANCEL
        </button>
        <button
          class={`sb-btn sb-btn-sm ${isDangerous ? 'sb-btn-danger' : 'sb-btn-primary'}`}
          data-testid="type-confirm-switch"
          onClick={onConfirm}
          style={{ minWidth: 80 }}
        >
          SWITCH
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        class={isMobile ? 'sb-creation-sheet-backdrop' : 'sb-type-confirm-backdrop'}
        onClick={onCancel}
        aria-hidden="true"
      />
      {dialogContent}
    </>
  );
}

// ── FieldList ──────────────────────────────────────────────────────────────

function FieldList({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}): JSX.Element {
  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-4)',
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-xs)',
          color,
          letterSpacing: '.08em',
          marginBottom: 'var(--space-1)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div class="sb-row-wrap">
        {items.map((item) => (
          <span
            key={item}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--text-dim)',
              padding: '1px 6px',
              background: 'var(--sunk)',
              border: '1px solid var(--border-soft)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
