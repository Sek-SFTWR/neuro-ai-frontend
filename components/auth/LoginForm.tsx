'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AuthError, AuthLinks, AuthNotice, AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { useT } from '@/lib/i18n';
import { EMAIL_RE } from '@/lib/authForm';

/** Maps the API's stable error codes onto dictionary keys, so the copy stays
    translatable and the server never ships a user-facing sentence. */
const ERROR_KEY: Record<string, string> = {
  invalid_credentials: 'login.invalid',
  rate_limited: 'login.rateLimited',
  server_misconfigured: 'login.misconfigured',
};

export function LoginForm({ next, expired }: { next?: string; expired?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* An expired session is context, not a rejection of anything the visitor has
     typed yet — so it reads as a notice above the field rather than as a red
     invalid state on an empty input. It steps aside the moment they start
     typing, or if a real submit error takes its place. */
  const showNotice = expired && !error && !password;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    /* Shape is checked here only to catch typos before a round trip. The
       address itself is verified on the server against APP_EMAIL — this check
       passing means nothing about whether the credential is right. */
    const address = email.trim();
    if (!address) return setEmailError(t('auth.emailRequired'));
    if (!EMAIL_RE.test(address)) return setEmailError(t('auth.emailInvalid'));

    setEmailError(undefined);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(t(ERROR_KEY[body.error ?? ''] ?? 'login.invalid'));
        setPassword('');
        return;
      }
      /* refresh() re-runs middleware with the cookie now set, so the push
         lands on the app instead of bouncing back here. */
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/');
      router.refresh();
    } catch {
      setError(t('login.networkError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t('login.title')} lead={t('login.lead')}>
      {/* noValidate: type="email" would otherwise raise the browser's own
          bubble before our check runs, in the browser's language rather than
          the app's. */}
      <form onSubmit={onSubmit} noValidate>
        {showNotice && <AuthNotice>{t('login.expired')}</AuthNotice>}

        <AuthField
          className="mt-6"
          label={t('login.email')}
          name="email"
          type="email"
          inputMode="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(undefined); }}
          error={emailError}
          autoComplete="email"
          autoFocus
        />

        <AuthField
          className="mt-4"
          label={t('login.password')}
          name="password"
          password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          invalid={!!error}
        />

        {error && <AuthError>{error}</AuthError>}

        <Button type="submit" variant="black" disabled={busy || !email || !password} className="w-full mt-5">
          {busy ? t('login.submitting') : t('login.submit')}
        </Button>

        <AuthLinks>
          <Link href="/forgot-password" className="font-medium text-text-sub rounded-sm px-1 py-0.5 transition-colors duration-180 hover:text-text hover:bg-fill">
            {t('login.toForgot')}
          </Link>
          <span className="text-text-mute" aria-hidden="true">·</span>
          <Link href="/register" className="font-medium text-accent rounded-sm px-1 py-0.5 transition-colors duration-180 hover:bg-fill">
            {t('login.toRegister')}
          </Link>
        </AuthLinks>
      </form>
    </AuthShell>
  );
}
