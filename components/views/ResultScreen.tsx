'use client';

import { ResultView } from '@/components/views/result/ResultView';
import { CompareView } from '@/components/views/compare/CompareView';
import { useSettingsModal } from '@/components/views/evaluate/useSettingsModal';
import { useStore } from '@/lib/store';

/**
 * A finished result, on its own.
 *
 * No page header, no mode picker, no settings summary: once a result exists,
 * the run that produced it is settled, and repeating the setup controls above
 * it only pushed the thing you came to read further down the page.
 *
 * Two routes back to the setup remain. The docked tab bar reveals 「設定を編集」
 * once it sticks, which covers the case of changing something mid-read; and
 * the rail's 評価 entry returns to the setup screen, whose settings card is
 * always visible. The second matters because the first only appears after
 * enough scrolling to stick the bar — on a short result it may never show.
 */
export function ResultScreen() {
  const { state } = useStore();
  const { openSettings } = useSettingsModal();

  return (
    <div className="screen flex flex-col gap-6">
      {state.compare
        ? <CompareView cmp={state.compare} onOpenSettings={openSettings} />
        : state.result
          ? <ResultView res={state.result} onOpenSettings={openSettings} />
          : null}
    </div>
  );
}
