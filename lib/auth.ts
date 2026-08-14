/*
 * Shared-password gate for the mock UI.
 *
 * There is no user database and no backend — the whole app is a client-side
 * mock — so "logged in" means exactly one thing: the visitor typed the shared
 * password once. What we hand back is an HMAC-signed, HttpOnly cookie rather
 * than a "loggedIn=true" flag, so a visitor cannot mint their own session from
 * devtools, and so the password itself never sits in the browser.
 *
 * The signing key is derived from BOTH secrets: rotating either AUTH_SECRET or
 * APP_PASSWORD invalidates every session that is already out there, which is
 * the only revocation mechanism a passwordless-by-design gate can have.
 *
 * Everything here uses Web Crypto (not node:crypto) because middleware runs on
 * the edge runtime.
 */

const enc = new TextEncoder();

export const SESSION_COOKIE = 'ms_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

/* --- base64url ------------------------------------------------------------ */

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecodeToString(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
}

/* --- configuration -------------------------------------------------------- */

type AuthConfig = { password: string; secret: string };

function config(): AuthConfig | null {
  const password = process.env.APP_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) return null;
  return { password, secret };
}

/** False when APP_PASSWORD / AUTH_SECRET are missing. The gate fails CLOSED on
    this — a misconfigured deploy locks everyone out instead of quietly serving
    the app to the open internet. */
export function isAuthConfigured(): boolean {
  return config() !== null;
}

let cachedKey: Promise<CryptoKey> | null = null;

function hmacKey(cfg: AuthConfig): Promise<CryptoKey> {
  cachedKey ??= crypto.subtle.importKey(
    'raw',
    // NUL-separated so ("ab", "c") and ("a", "bc") can never derive the same key.
    enc.encode(`${cfg.secret}\u0000${cfg.password}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return cachedKey;
}

/* --- constant-time compare ------------------------------------------------ */

/** Compares two EQUAL-LENGTH strings without an early return. Callers must
    only pass fixed-length values (hex digests, signatures) — the length check
    itself is not constant time. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/* --- password ------------------------------------------------------------- */

/** Both sides are hashed first so the comparison runs over two 64-char strings
    — the timing of a wrong guess no longer leaks how much of the password (or
    how much of its length) was right. */
export async function verifyPassword(candidate: string): Promise<boolean> {
  const cfg = config();
  if (!cfg) return false;
  const [a, b] = await Promise.all([sha256Hex(candidate), sha256Hex(cfg.password)]);
  return safeEqual(a, b);
}

/* --- session token -------------------------------------------------------- */

async function sign(payload: string, cfg: AuthConfig): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(cfg), enc.encode(payload));
  return b64urlEncode(new Uint8Array(sig));
}

/** `<base64url payload>.<base64url HMAC>` — a minimal JWT-shaped token without
    the dependency. The payload holds nothing but an expiry; there is no
    identity to carry. */
export async function createSessionToken(now: number = Date.now()): Promise<string> {
  const cfg = config();
  if (!cfg) throw new Error('APP_PASSWORD / AUTH_SECRET are not set');
  const payload = b64urlEncode(
    enc.encode(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS })),
  );
  return `${payload}.${await sign(payload, cfg)}`;
}

export async function verifySessionToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  const cfg = config();
  if (!cfg || !token) return false;

  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let expected: string;
  try {
    expected = await sign(payload, cfg);
  } catch {
    return false;
  }
  // Signature first: never parse a payload we have not authenticated.
  if (!safeEqual(sig, expected)) return false;

  try {
    const { exp } = JSON.parse(b64urlDecodeToString(payload)) as { exp?: unknown };
    return typeof exp === 'number' && exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}
