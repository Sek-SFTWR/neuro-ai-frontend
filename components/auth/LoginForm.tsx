'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Logo } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';

/** Maps the API's stable error codes onto dictionary keys, so the copy stays
    translatable and the server never ships a user-facing sentence. */
const ERROR_KEY: Record<string, string> = {
  invalid_password: 'login.invalid',
  rate_limited: 'login.rateLimited',
  server_misconfigured: 'login.misconfigured',
};

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
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
    <main className="min-h-dvh grid place-items-center px-5 py-12 bg-page">
      <div className="w-full max-w-[380px] animate-fade-up">
        {/* The brand sits outside the card, at the top-bar's own scale — the
            gate should read as the front door of this app, not a generic form. */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Logo size={24} />
          <span className="text-[17px] font-normal text-text-mute">
            <b className="font-bold text-text mr-[0.28em]">Movie</b>Simulator
          </span>
        </div>

        <form onSubmit={onSubmit} className="bg-surface rounded-card shadow-card p-7">
          <h1 className="text-[15px] font-semibold text-text">{t('login.title')}</h1>
          <p className="text-xs text-text-sub leading-[1.6] mt-1.5">{t('login.lead')}</p>

          <label className="block mt-6">
            <span className="text-xs font-semibold text-text-sub">{t('login.password')}</span>

            {/* The reveal toggle lives inside the field, so the control that
                acts on the value sits with the value. pr-11 reserves its lane
                so a long password never runs under the icon. */}
            <span className="relative block mt-1.5">
              <input
                type={reveal ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                className={`w-full bg-surface border rounded-chip py-[11px] pl-3.5 pr-11 text-[13px] font-medium text-text transition-colors duration-180 placeholder:text-text-mute hover:border-line-hover focus:outline focus:outline-2 focus:-outline-offset-2 ${
                  error
                    ? 'border-pri-high focus:border-pri-high focus:outline-pri-high'
                    : 'border-line focus:border-accent focus:outline-accent'
                }`}
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={t(reveal ? 'login.hidePassword' : 'login.showPassword')}
                aria-pressed={reveal}
                title={t(reveal ? 'login.hidePassword' : 'login.showPassword')}
                className={`absolute top-1/2 right-1 -translate-y-1/2 w-8 h-8 rounded-sm flex items-center justify-center transition-colors duration-180 hover:bg-fill ${
                  reveal ? 'text-accent' : 'text-text-mute hover:text-text-sub'
                }`}
              >
                <Icon name="eye" size={15} />
              </button>
            </span>
          </label>

          {/* role="alert" so a screen reader hears the rejection without focus
              having to leave the field. */}
          {error && (
            <p
              id="login-error"
              role="alert"
              className="flex items-start gap-1.5 mt-2.5 text-xs font-medium text-pri-high leading-[1.5]"
            >
              <Icon name="alert" size={13} className="mt-px" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="black"
            disabled={busy || !password}
            className="w-full mt-5"
          >
            {busy ? t('login.submitting') : t('login.submit')}
          </Button>

          <p className="text-[11px] text-text-mute leading-[1.6] text-center mt-5 pt-5 border-t border-line">
            {t('login.note')}
          </p>
        </form>
      </div>
    </main>
  );
}
