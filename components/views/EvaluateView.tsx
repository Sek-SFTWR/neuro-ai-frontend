'use client';

import { Empty } from '@/components/ui/Empty';
import { PageHeader } from '@/components/ui/PageHeader';
import { ModePicker } from '@/components/views/evaluate/ModePicker';
import { SettingsSummary } from '@/components/views/evaluate/SettingsSummary';
import { ModeHistory } from '@/components/views/evaluate/ModeHistory';
import { CONTROL_LABEL, useSettingsModal } from '@/components/views/evaluate/useSettingsModal';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { MODES } from '@/lib/palette';

/**
 * Setting up a run: pick a mode, review the settings, start.
 *
 * The finished result used to hang below all of this on the same screen, which
 * meant reading a result came with the whole setup form stacked on top of it.
 * The result is its own screen now (views/ResultScreen) with its own rail
 * entry; what stays here is only what you need before a run exists.
 */
export function EvaluateView() {
  const { state } = useStore();
  const { goSection } = useActions();
  const { openSettings } = useSettingsModal();
  const mode = state.mode;
  const m = MODES[mode];

  const hasResult = m.compare ? !!state.compare : !!state.result;
  const hasModeHistory = state.history.some((h) => h.mode === mode);

  return (
    <div className="screen flex flex-col gap-6">
      <PageHeader title="動画評価" sub="動画をペルソナの視点で評価します。評価の種類を選び、設定してから実行してください。" />

      {/* The five modes were five rail destinations, which made one task read as
          five screens. They are options on this one screen now. */}
      <ModePicker />

      <SettingsSummary label={CONTROL_LABEL[mode]} onOpen={openSettings} />

      {/* A run that has already finished is not shown here, but pretending it
          does not exist would strand it — the empty state becomes a way back to
          it instead. */}
      {hasResult ? (
        <Empty
          icon={m.icon}
          title={m.compare ? '比較結果があります' : '評価結果があります'}
          sub="結果は「評価結果」画面で表示しています。設定を変えて再実行することもできます。"
          action={m.compare ? '比較結果を表示' : '評価結果を表示'}
          actionIcon="eye"
          onAction={() => goSection('result')}
        />
      ) : !hasModeHistory ? (
        /* Only when this mode has no past runs either. With a history below,
           a full-height "nothing here yet" card contradicts the list under it. */
        <Empty
          icon={m.icon}
          title="まだ評価結果がありません"
          sub={m.compare ? '「設定を編集」から2件以上の動画を指定し、比較評価を実行してください。' : '「設定を編集」から動画を指定し、評価を実行してください。'}
          action="設定を編集"
          onAction={openSettings}
        />
      ) : null}

      <ModeHistory />
    </div>
  );
}
