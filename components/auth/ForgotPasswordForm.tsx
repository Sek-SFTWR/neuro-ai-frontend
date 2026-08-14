'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AuthLinks, AuthShell, AuthSuccess } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { useT } from '@/lib/i18n';
import { EMAIL_RE } from '@/lib/authForm';

/**
 * Mock password reset. No mail is sent, and the success panel says so — a
 * screen that claims "check your inbox" would leave a coworker waiting on an
 * email that is never coming.
 */
export function ForgotPasswordForm() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;

    const value = email.trim();
    if (!value) return setError(t('auth.emailRequired'));
    if (!EMAIL_RE.test(value)) return setError(t('auth.emailInvalid'));

    setError(undefined);
    setBusy(true);
    // Stands in for the round trip, so the pending state is visible in review.
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setDone(true);
  }

  return (
    <AuthShell title={t('forgot.title')} lead={t('forgot.lead')}>
      {done ? (
        <AuthSuccess>{t('forgot.done')}</AuthSuccess>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <AuthField
            className="mt-6"
            label={t('login.email')} name="email" type="email" inputMode="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(undefined); }}
            error={error}
            autoComplete="email"
            autoFocus
          />
          <Button type="submit" variant="black" disabled={busy} className="w-full mt-5">
            {busy ? t('forgot.submitting') : t('forgot.submit')}
          </Button>
        </form>
      )}

      <AuthLinks>
        <Link href="/login" className="font-medium text-accent rounded-sm px-1 py-0.5 transition-colors duration-180 hover:bg-fill">
          {t('auth.backToLogin')}
        </Link>
      </AuthLinks>
    </AuthShell>
  );
}
