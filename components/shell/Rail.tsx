'use client';

import { Icon, type IconName } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { useToast } from '@/components/overlays/Toast';
import { useT } from '@/lib/i18n';
import type { SectionKey } from '@/lib/types';

const SECTIONS: { key: SectionKey; labelKey: string; icon: IconName }[] = [
  { key: 'evaluate', labelKey: 'shell.nav.evaluate', icon: 'play' },
  { key: 'history', labelKey: 'shell.nav.history', icon: 'clock' },
  { key: 'personas', labelKey: 'shell.nav.personas', icon: 'users' },
];

/** `bottom` parks the group at the far end of the rail — the right end of the
    row below 860px, the foot of the column above it. The column case needs the
    nav to be taller than its contents for mt-auto to have anything to push
    against; see the height on <nav> below. */
function RailGroup({ children, bottom }: { children: React.ReactNode; bottom?: boolean }) {
  return (
    <div className={`w-auto b860:w-full flex flex-row b860:flex-col items-center gap-2 py-(--ctl-pad) px-(--ctl-pad) b860:px-0 bg-surface rounded-full shadow-card shrink-0 ${bottom ? 'ml-auto b860:ml-0 b860:mt-auto' : ''}`}>
      {children}
    </div>
  );
}

function RailItem({
  label, icon, active, variant, onClick,
}: {
  label: string;
  icon: IconName;
  active?: boolean;
  variant?: 'section' | 'theme';
  onClick?: () => void;
}) {
  const activeCls =
    variant === 'section' && active
      ? 'bg-accent text-accent-fg hover:bg-accent-hover'
      : variant === 'theme' && active
        ? 'text-text'
        : 'text-rail-icon hover:text-text hover:bg-surface-hover';

  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`group/rail relative w-(--ctl-item) h-(--ctl-item) p-0 rounded-full flex items-center justify-center shrink-0 transition-[color,background-color,transform] duration-180 hover:scale-[1.06] ${activeCls}`}
    >
      <Icon name={icon} size={16} className={`transition-transform duration-260 ease-soft ${active && variant === 'section' ? 'scale-[0.88]' : ''}`} />
      <span className="hidden b860:group-hover/rail:block absolute left-[calc(100%+18px)] top-1/2 -translate-y-1/2 bg-black-ms text-white text-xs font-medium py-1.5 px-2.5 rounded-sm whitespace-nowrap z-[350]">
        {label}
      </span>
    </button>
  );
}

/**
 * The primary navigation: one black circle for the section you are in, and
 * nothing else competing with it. The five evaluation modes used to sit here
 * as a second capsule of destinations; they are options inside the evaluate
 * screen now (see views/evaluate/ModePicker), because picking a mode is a
 * choice within one task, not a place to navigate to.
 * Below 860px the capsules turn on their side and scroll horizontally.
 */
export function Rail() {
  const { state } = useStore();
  const { goSection } = useActions();
  const toast = useToast();
  const t = useT();

  return (
    <nav
      aria-label={t('shell.nav.aria')}
      /* The height is what sends the help/logout capsule to the foot of the
         rail: the nav is a column of content-sized capsules, so without it
         mt-auto has no free space to absorb and the group just trails the
         sections. 100dvh minus everything above the rail (the sticky top bar
         and the header gap) makes the column reach exactly the bottom of the
         viewport and no further, so it never adds page scroll of its own. */
      className="w-full b860:w-(--rail-w) shrink-0 flex flex-row b860:flex-col items-center b860:items-stretch gap-2 b860:gap-5 pb-2 b860:pb-6 static b860:sticky b860:top-[calc(var(--topbar-h)+8px)] b860:h-[calc(100dvh-var(--topbar-h)-var(--header-gap))] overflow-x-auto b860:overflow-visible no-scrollbar z-[200]"
    >
      {/* Theme and logout used to bookend this rail. They are preferences and
          account actions, not destinations, so they live on the settings
          screen now — the rail is purely "where am I". */}
      <RailGroup>
        {SECTIONS.map((s) => (
          <RailItem key={s.key} label={t(s.labelKey)} icon={s.icon} variant="section" active={state.section === s.key} onClick={() => goSection(s.key)} />
        ))}
      </RailGroup>

      <RailGroup bottom>
        <RailItem label={t('shell.nav.help')} icon="help" onClick={() => toast.show(t('shell.nav.helpComingSoon'))} />
      </RailGroup>
    </nav>
  );
}
