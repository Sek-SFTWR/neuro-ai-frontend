import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAuthConfigured,
  verifyPassword,
} from '@/lib/auth';

/**
 * Per-IP throttle. This is module state, so on Vercel it is per warm lambda
 * instance rather than global — an attacker with luck gets a few extra tries
 * across cold starts. It is friction, not a guarantee; the real defence is a
 * password long enough that 10 tries per 10 minutes is hopeless.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(ip: string, now: number): boolean {
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

/** A success clears the visitor's budget so a legitimate typo streak never
    locks someone out for the rest of the window. */
function resetAttempts(ip: string) {
  attempts.delete(ip);
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: 'server_misconfigured' },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (tooManyAttempts(ip, Date.now())) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let password = '';
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === 'string') password = body.password;
  } catch {
    /* fall through to the generic failure below */
  }

  if (!(await verifyPassword(password))) {
    // One message for "empty", "wrong", and "malformed" alike — a login form
    // has nothing to gain from telling the caller which it was.
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  resetAttempts(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,                                   // JS can never read it
    secure: process.env.NODE_ENV === 'production',    // http://localhost still works in dev
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
