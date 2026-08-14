'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AuthLinks, AuthShell, AuthSuccess } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { useT } from '@/lib/i18n';
import { EMAIL_RE, MIN_PASSWORD } from '@/lib/authForm';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

/**
 * Mock registration. The validation, the pending state and the success panel
 * are all real UI — what is deliberately absent is a backend: no account is
 * created, which the success copy says outright rather than implying an
 * account is waiting somewhere. The shared-password gate remains the only
 * thing actually guarding the deploy.
 */
export function RegisterForm() {
  const t = useT();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    // Clearing on edit keeps a corrected field from staying red while typing.
    setErrors((prev) => (prev[k as keyof Errors] ? { ...prev, [k]: undefined } : prev));
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!form.name.trim()) next.name = t('register.nameRequired');
    if (!form.email.trim()) next.email = t('auth.emailRequired');
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t('auth.emailInvalid');
    if (form.password.length < MIN_PASSWORD) next.password = t('register.passwordShort');
    if (form.confirm !== form.password) next.confirm = t('register.confirmMismatch');
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    // Stands in for the round trip, so the pending state is visible in review.
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title={t('register.title')} lead={t('register.lead')}>
        <AuthSuccess>{t('register.done')}</AuthSuccess>
        <AuthLinks>
          <Link href="/login" className="font-medium text-accent rounded-sm px-1 py-0.5 transition-colors duration-180 hover:bg-fill">
            {t('auth.backToLogin')}
          </Link>
        </AuthLinks>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('register.title')} lead={t('register.lead')}>
      {/* noValidate hands validation to the code above, so every field reports
          in the app's own voice instead of the browser's default bubble. */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 mt-6">
        <AuthField
          label={t('register.name')} name="name" type="text"
          placeholder={t('register.namePlaceholder')}
          value={form.name} onChange={set('name')} error={errors.name}
          autoComplete="name" autoFocus
        />
        <AuthField
          label={t('register.company')} name="organization" type="text"
          placeholder={t('register.companyPlaceholder')}
          value={form.company} onChange={set('company')}
          autoComplete="organization"
        />
        <AuthField
          label={t('login.email')} name="email" type="email" inputMode="email"
          placeholder={t('login.emailPlaceholder')}
          value={form.email} onChange={set('email')} error={errors.email}
          autoComplete="email"
        />
        <div>
          <AuthField
            label={t('login.password')} name="new-password" password
            value={form.password} onChange={set('password')} error={errors.password}
            autoComplete="new-password"
          />
          {!errors.password && (
            <p className="text-[11px] text-text-mute mt-1.5">{t('register.passwordHint')}</p>
          )}
        </div>
        <AuthField
          label={t('register.confirm')} name="confirm-password" password
          value={form.confirm} onChange={set('confirm')} error={errors.confirm}
          autoComplete="new-password"
        />

        <Button type="submit" variant="black" disabled={busy} className="w-full mt-1">
          {busy ? t('register.submitting') : t('register.submit')}
        </Button>

        <AuthLinks>
          <span className="text-text-sub">{t('register.toLogin')}</span>
          <Link href="/login" className="font-medium text-accent rounded-sm px-1 py-0.5 transition-colors duration-180 hover:bg-fill">
            {t('login.submit')}
          </Link>
        </AuthLinks>
      </form>
    </AuthShell>
  );
}
