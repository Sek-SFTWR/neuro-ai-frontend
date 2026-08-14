'use client';

import type { ReactNode } from 'react';
import { Icon, Logo } from '@/components/Icon';
import { useT } from '@/lib/i18n';

export function AuthShell({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  const t = useT();
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

        <div className="bg-surface rounded-card shadow-card p-7">
          <h1 className="text-[15px] font-semibold text-text">{title}</h1>
          <p className="text-xs text-text-sub leading-[1.6] mt-1.5">{lead}</p>
          {children}
          <p className="text-[11px] text-text-mute leading-[1.6] text-center mt-5 pt-5 border-t border-line">
            {t('login.note')}
          </p>
        </div>
      </div>
    </main>
  );
}

/** Amber, for context the visitor did not cause (an expired session). */
export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 mt-4 rounded-sm bg-orange-bg px-3 py-2 text-xs font-medium text-orange leading-[1.5]">
      <Icon name="alert" size={13} className="mt-px" />
      {children}
    </p>
  );
}

/** Red, for a rejection of something the visitor typed. `role="alert"` so a
    screen reader hears it without focus having to leave the field. */
export function AuthError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 mt-2.5 text-xs font-medium text-pri-high leading-[1.5]">
      <Icon name="alert" size={13} className="mt-px" />
      {children}
    </p>
  );
}

/** The terminal state of the two mock flows: what would have happened, plus
    what to actually do next. */
export function AuthSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col items-center text-center gap-2.5 rounded-chip bg-green-bg px-4 py-5">
      <Icon name="checkCircle" size={22} className="text-green" />
      <p className="text-xs font-medium text-text leading-[1.7]">{children}</p>
    </div>
  );
}

/** The row of cross-links at the foot of a card (「アカウント作成」「ログインに戻る」…). */
export function AuthLinks({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center gap-1.5 mt-5 text-xs">{children}</div>;
}
