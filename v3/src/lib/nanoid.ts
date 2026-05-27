// ─────────────────────────────────────────────────────────────────────────────
// nanoid — tiny URL-safe unique ID generator
//
// Not using the npm package to avoid an extra dep for a trivial utility.
// 21-char alphanumeric IDs: 2^126 collision space (more than sufficient).
// Uses crypto.getRandomValues (available in all target environments).
// ─────────────────────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 21;

export function nanoid(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join('');
}
