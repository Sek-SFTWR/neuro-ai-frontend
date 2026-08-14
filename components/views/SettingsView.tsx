'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Segmented, type SegmentedItem } from '@/components/ui/Segmented';
import { AxesEditor } from '@/components/views/AxesEditor';
import { useModal } from '@/components/overlays/Modal';
import { useToast } from '@/components/overlays/Toast';
import { useStore } from '@/lib/store';
import { MODEL_ORDER, MODELS } from '@/lib/palette';
import { useT, type Locale } from '@/lib/i18n';
import type { ModelKey } from '@/lib/types';

/**
 * A titled block on the settings page. Every group is framed the same way so
 * the screen reads as one list of settings rather than four unrelated cards —
 * the same job Section does inside the evaluate modal.
 */
function Group({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="bg-surface rounded-card shadow-card p-5 flex flex-col gap-4">
      {/* Whatever a group needs to say about itself belongs here, above its
          controls — not trailing after them, where it collides with the
          per-option note Segmented already renders under the selected pill. */}
      <div>
        <h2 className="text-[13px] font-semibold text-text">{title}</h2>
        {sub && <p className="text-xs text-text-sub mt-1 leading-[1.6]">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/** A label/description on the left, its control on the right — the shape a
    settings row takes when the control is small enough to sit inline. */
function Row({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-text">{label}</div>
        {sub && <p className="text-xs text-text-sub mt-0.5 leading-[1.6]">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsView() {
  const { state, patch } = useStore();
  const t = useT();
  const toast = useToast();
  const modal = useModal();
  const router = useRouter();

  const THEME_ITEMS: SegmentedItem<'light' | 'dark'>[] = [
    { key: 'light', label: t('settings.themeLight'), icon: 'sun' },
    { key: 'dark', label: t('settings.themeDark'), icon: 'moon' },
  ];

  const LOCALE_ITEMS: SegmentedItem<Locale>[] = [
    { key: 'ja', label: '日本語' },
    { key: 'en', label: 'English' },
  ];

  /* No `note`: the per-model blurb would render under the pills and push this
     row out of line with the ones above it. What the setting is for is said
     once, at group level. */
  const MODEL_ITEMS: SegmentedItem<ModelKey>[] = MODEL_ORDER.map((k) => ({
    key: k,
    label: MODELS[k].label,
    icon: MODELS[k].icon,
  }));

  /* The store holds only mock data, so there is nothing to clear on the client
     — dropping the cookie is the whole of signing out. router.refresh() makes
     middleware re-evaluate and bounce us to /login. */
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* the cookie may already be gone; the redirect below settles it either way */
    }
    toast.show(t('shell.nav.loggedOut'));
    router.replace('/login');
    router.refresh();
  }

  /* The axes editor is the same component the evaluate flow drills into, so
     both entry points edit one state.axes with one UI. It commits every add,
     remove and reorder as it happens — hence a single「閉じる」and nothing to
     discard. */
  function openCriteria() {
    modal.open({
      title: t('settings.criteriaOpen'),
      wide: true,
      body: <AxesEditor />,
      foot: <Button size="sm" variant="black" onClick={modal.dismiss}>{t('settings.close')}</Button>,
    });
  }

  /* One centred column, header included, rather than the grid that fills the
     width on the data screens. Settings is a short list read top to bottom —
     spreading four cards across a wide monitor makes the eye hunt for the next
     one, and a lone left-aligned column leaves the page looking unfinished.
     Centring the whole block keeps the header sitting over its own content. */
  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-6">
      <PageHeader title={t('settings.title')} sub={t('settings.sub')} />

      <div className="flex flex-col gap-4">
        <Group title={t('settings.appearance')}>
          <Row label={t('settings.theme')}>
            <Segmented
              label={t('settings.theme')}
              items={THEME_ITEMS}
              value={state.theme}
              onChange={(k) => patch({ theme: k })}
              className="[&>span:first-child]:sr-only"
            />
          </Row>
          <div className="border-t border-line" />
          <Row label={t('settings.language')}>
            <Segmented
              label={t('settings.language')}
              items={LOCALE_ITEMS}
              value={state.locale}
              onChange={(k) => patch({ locale: k })}
              className="[&>span:first-child]:sr-only"
            />
          </Row>
        </Group>

        <Group title={t('settings.analysis')} sub={t('settings.modelNote')}>
          <Row label={t('settings.model')}>
            <Segmented
              label={t('settings.model')}
              items={MODEL_ITEMS}
              value={state.model}
              onChange={(k) => patch({ model: k })}
              className="[&>span:first-child]:sr-only"
            />
          </Row>
        </Group>

        <Group title={t('settings.criteria')} sub={t('settings.criteriaNote')}>
          <Row label={t('settings.criteriaCount', { count: state.axes.length })}>
            <Button size="sm" onClick={openCriteria}>
              <Icon name="sliders" size={14} />{t('settings.criteriaOpen')}
            </Button>
          </Row>
        </Group>

        <Group title={t('settings.account')}>
          <div className="flex items-center gap-3">
            {/* A generic mark, not an initial: the old top-bar chip showed 「ミ」
                for a mock person, and putting a personal initial on a login
                that is explicitly shared would misrepresent whose it is. */}
            <span className="w-10 h-10 rounded-full bg-fill text-text-sub flex items-center justify-center shrink-0">
              <Icon name="users" size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-text">{t('settings.sharedAccount')}</div>
              <p className="text-xs text-text-sub mt-0.5 leading-[1.6]">{t('settings.sharedAccountNote')}</p>
            </div>
          </div>
          <div className="border-t border-line" />
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" onClick={() => toast.show(t('settings.profileComingSoon'))}>
              <Icon name="user" size={14} />{t('settings.editProfile')}
            </Button>
            <Button size="sm" variant="danger" className="ml-auto" onClick={logout}>
              <Icon name="logout" size={14} />{t('shell.nav.logout')}
            </Button>
          </div>
        </Group>
      </div>
    </div>
  );
}
