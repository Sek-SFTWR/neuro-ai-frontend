import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Every request that is not the login screen or the auth API has to carry a
 * valid session cookie. Running the check in middleware (rather than inside a
 * layout) means an unauthenticated visitor never receives a byte of the app —
 * the redirect happens at the edge, before any page renders.
 *
 * `_next/static` is deliberately exempt: the login screen itself is served
 * from those chunks, so gating them would deadlock the gate. The consequence
 * is that the compiled JS bundle stays reachable to anyone who guesses a chunk
 * URL. For a mock UI with no real data that is the right trade; do not put a
 * real secret in client code and expect this gate to hide it.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/).*)'],
};

/** Only same-origin absolute paths may come back from `?next=`, so the login
    form can never be turned into an open redirect to another site. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (pathname === '/login') {
    if (!authed) return NextResponse.next();
    return NextResponse.redirect(new URL(safeNext(req.nextUrl.searchParams.get('next')), req.url));
  }

  if (authed) return NextResponse.next();

  const url = new URL('/login', req.url);
  if (pathname !== '/') url.searchParams.set('next', pathname + search);
  /* Carrying a cookie we refused is a different story from carrying none: the
     session expired, or the secrets moved under it. Say so, rather than
     bouncing the visitor back to a blank form that looks like their correct
     password did nothing. */
  if (token) url.searchParams.set('expired', '1');

  const res = NextResponse.redirect(url);
  // Drop the rejected cookie so it stops being replayed on every request.
  if (token) res.cookies.delete(SESSION_COOKIE);
  return res;
}
