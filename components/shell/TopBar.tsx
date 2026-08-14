'use client';

import { useState } from 'react';
import { Icon, Logo } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { PersonaSearchPopover } from '@/components/overlays/PersonaSearchPopover';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { useT, type Locale } from '@/lib/i18n';

/** Same segmented-pill recipe as the grid/list view toggles elsewhere in the
    app (Personas, History) — a two-way switch reads as one control family
    regardless of what it's switching. */
function LocaleSwitch() {
  const { state, patch } = useStore();
  const t = useT();
  const options: { key: Locale; label: string }[] = [
    { key: 'ja', label: 'JA' },
    { key: 'en', label: 'EN' },
  ];
  return (
    <div className="h-(--ctl-h) hidden md:inline-flex items-center gap-0.5 bg-surface rounded-full p-(--ctl-pad) shadow-card shrink-0" aria-label={t('shell.language')}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={state.locale === o.key}
          onClick={() => patch({ locale: o.key })}
          className={`h-(--ctl-item) px-2.5 rounded-full text-[11px] font-semibold transition-colors duration-180 ${
            state.locale === o.key ? 'bg-fill text-text' : 'text-text-mute hover:text-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The top bar carries no menu — all navigation lives in the left rail. Only
 * the brand (which returns home) and the account actions live here.
 */
export function TopBar() {
  const { state } = useStore();
  const { goSection } = useActions();
  const t = useT();
  const first = state.personas.slice(0, 4);
  const rest = Math.max(0, state.personas.length - first.length);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);

  return (
    <header className="h-(--topbar-h) flex items-center gap-4 sticky top-0 z-[300] bg-page">
      <a
        href="#"
        aria-label={t('shell.brand')}
        onClick={(e) => { e.preventDefault(); goSection('history'); }}
        className="group h-(--ctl-h) flex items-center gap-2 shrink-0 bg-surface rounded-full py-(--ctl-pad) pr-4 pl-(--ctl-pad) shadow-card transition-colors duration-180 hover:bg-surface-hover"
      >
        <span className="w-(--ctl-item) h-(--ctl-item) flex items-center justify-center shrink-0 transition-transform duration-260 ease-soft group-hover:-rotate-[8deg] group-hover:scale-[1.06] group-active:scale-[0.94]">
          <Logo size={21} />
        </span>
        <span className="text-[15px] font-normal whitespace-nowrap text-text-mute">
          <b className="font-bold text-text mr-[0.28em]">Movie</b>Simulator
        </span>
      </a>

      <div className="flex items-center gap-2 shrink-0 ml-auto relative">
        <div className="h-(--ctl-h) hidden lg:flex items-center gap-2 bg-surface rounded-full py-(--ctl-pad) pl-(--ctl-pad) pr-3 shadow-card">
          <span className="flex items-center [&>*+*]:-ml-2">
            {first.map((p) => (
              <Avatar key={p.id} persona={p} size="xs" ring />
            ))}
          </span>
          <span className="text-xs font-medium text-text-sub whitespace-nowrap inline-flex items-center gap-0.5">
            +{rest} <Icon name="chevronDown" size={11} />
          </span>
        </div>

        <LocaleSwitch />

        <button
          type="button"
          aria-label={t('shell.searchPersonas')}
          aria-expanded={!!searchAnchor}
          onClick={(e) => setSearchAnchor(searchAnchor ? null : e.currentTarget)}
          className={`w-(--ctl-h) h-(--ctl-h) rounded-full shadow-card flex items-center justify-center relative text-text-sub transition-[background-color,transform] duration-180 hover:scale-[1.06] active:scale-[0.96] ${
            searchAnchor ? 'bg-fill' : 'bg-surface hover:bg-surface-hover'
          }`}
        >
          <Icon name="search" size={17} />
        </button>
        {searchAnchor && <PersonaSearchPopover anchor={searchAnchor} onClose={() => setSearchAnchor(null)} />}

        <div className="h-(--ctl-h) flex items-center gap-1.5 bg-surface rounded-full py-(--ctl-pad) pl-(--ctl-pad) pr-2.5 shadow-card cursor-pointer text-text-mute transition-colors duration-180 hover:bg-surface-hover">
          <span className="w-(--ctl-item) h-(--ctl-item) rounded-full flex items-center justify-center text-white font-semibold text-[11px] bg-text-sub">ミ</span>
          <Icon name="chevronDown" size={13} />
        </div>
      </div>
    </header>
  );
}
