'use client';

import { Icon, Logo } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { useT } from '@/lib/i18n';

/**
 * The top bar carries no menu — all navigation lives in the left rail. What
 * used to sit on the right (a persona summary, a persona search, an account
 * chip, a JA/EN switch) was four controls competing for the same corner, three
 * of which were status rather than action. They are gone or moved to the
 * settings screen; the corner now holds the one thing that opens it.
 */
export function TopBar() {
  const { state } = useStore();
  const { goSection } = useActions();
  const t = useT();
  const onSettings = state.section === 'settings';

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

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* aria-current rather than aria-pressed: this navigates to a screen,
            it does not toggle a setting on. */}
        <button
          type="button"
          aria-label={t('shell.nav.settings')}
          title={t('shell.nav.settings')}
          aria-current={onSettings ? 'page' : undefined}
          onClick={() => goSection('settings')}
          className={`w-(--ctl-h) h-(--ctl-h) rounded-full shadow-card flex items-center justify-center transition-[background-color,color,transform] duration-180 hover:scale-[1.06] active:scale-[0.96] ${
            onSettings ? 'bg-accent text-accent-fg' : 'bg-surface text-text-sub hover:bg-surface-hover hover:text-text'
          }`}
        >
          <Icon name="settings" size={17} />
        </button>
      </div>
    </header>
  );
}
