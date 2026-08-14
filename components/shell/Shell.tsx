'use client';

import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { Rail } from './Rail';
import { useStore } from '@/lib/store';
import { useKeyChanged } from '@/lib/useKeyChanged';
import { EvaluateView } from '@/components/views/EvaluateView';
import { HistoryView } from '@/components/views/HistoryView';
import { PersonasView } from '@/components/views/PersonasView';
import { SettingsView } from '@/components/views/SettingsView';

export function Shell() {
  const { state } = useStore();

  /* Section only. The evaluation mode used to be part of this key, back when
     each mode was its own rail destination; now that it's a picker inside the
     evaluate screen, replaying the whole page transition (and jumping scroll
     to the top) on every mode toggle would contradict what the picker says —
     that you are still on the same screen. */
  const viewChanged = useKeyChanged(state.section);

  useEffect(() => {
    if (viewChanged) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [viewChanged]);

  /* The dark-theme CSS block targets :root[data-theme="dark"] — this is the
     only place that attribute gets set, so every screen re-skins from the
     one state.theme flag. */
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  let view: React.ReactNode;
  switch (state.section) {
    case 'evaluate': view = <EvaluateView />; break;
    case 'history': view = <HistoryView />; break;
    case 'personas': view = <PersonasView />; break;
    case 'settings': view = <SettingsView />; break;
    default: view = null;
  }

  return (
    <div className="min-h-screen flex flex-col px-(--page-x)">
      <TopBar />
      <div className="flex-1 flex flex-col b860:flex-row items-stretch b860:items-start gap-0 b860:gap-(--rail-gap) pt-2 b860:pt-(--header-gap) min-h-0">
        <Rail />
        <main className={`flex-1 min-w-0 pt-2 b860:pt-0 pb-10 flex flex-col gap-6 ${viewChanged ? 'view-enter' : ''}`}>
          {view}
        </main>
      </div>
    </div>
  );
}
