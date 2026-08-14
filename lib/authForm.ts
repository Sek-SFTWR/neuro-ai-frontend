/* Shared client-side form rules for the auth screens. Kept out of the
   components so register and password-reset cannot drift apart on what
   counts as a valid address. */

/** Deliberately permissive: something@something.tld. Client-side email checks
    exist to catch typos, not to adjudicate RFC 5322 — a stricter pattern
    rejects valid addresses far more often than it catches bad ones. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD = 8;
