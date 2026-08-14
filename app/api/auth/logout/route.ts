import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

/** POST-only so a stray <img src="/api/auth/logout"> or a link prefetch cannot
    sign anyone out. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
