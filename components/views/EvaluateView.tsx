'use client';

import { Icon } from '@/components/Icon';
import { Empty } from '@/components/ui/Empty';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { AxesEditor } from '@/components/views/AxesEditor';
import { ModePicker } from '@/components/views/evaluate/ModePicker';
import { SettingsBody } from '@/components/views/evaluate/SettingsBody';
import { RunBar } from '@/components/views/evaluate/RunBar';
import { SettingsSummary } from '@/components/views/evaluate/SettingsSummary';
import { ResultView } from '@/components/views/result/ResultView';
import { CompareView } from '@/components/views/compare/CompareView';
import { useStore } from '@/lib/store';
import { useModal } from '@/components/overlays/Modal';
import { useEvaluationRun } from '@/lib/useEvaluationRun';
import { MODES } from '@/lib/palette';

const CONTROL_LABEL: Record<string, string> = {
  youtube: '評価設定（URL・ペルソナ選択）',
  file: '評価設定（動画ファイル・ペルソナ選択）',
  ytcompare: '評価設定（URL・ペルソナ選択）',
  filecompare: '評価設定（動画ファイル・ペルソナ選択）',
  mixcompare: '評価設定（URL・動画ファイル・ペルソナ選択）',
};

export function EvaluateView() {
  const { state } = useStore();
  const { run } = useEvaluationRun();
  const modal = useModal();
  const mode = state.mode;
  const m = MODES[mode];

  function handleRun() {
    modal.close();
    run(mode);
  }

  function openSettings() {
    modal.open({
      title: CONTROL_LABEL[mode],
      wide: true,
      body: <SettingsBody mode={mode} onOpenCriteria={openCriteria} />,
      foot: <RunBar mode={mode} onCancel={modal.close} onRun={handleRun} />,
    });
  }

  function openCriteria() {
    modal.open({
      title: '評価基準を設定',
      wide: true,
      /* × / Escape / backdrop step back to the settings modal rather than
         dropping the whole stack — this is a drill-in, not a separate screen. */
      onClose: openSettings,
      body: <AxesEditor />,
      /* Both ways out live in the footer now the modal has one, rather than a
         back link floating at the top of the body and no way out at all.
         「閉じる」not「キャンセル」: AxesEditor commits every add, remove and
         reorder to the store as it happens, so there is nothing to discard. */
      foot: (
        <>
          <Button size="sm" className="mr-auto" onClick={openSettings}>
            <Icon name="chevronLeft" size={13} />評価設定に戻る
          </Button>
          <Button size="sm" variant="black" onClick={modal.dismiss}>閉じる</Button>
        </>
      ),
    });
  }

  let resultBlock: React.ReactNode;
  if (state.compare && m.compare) {
    resultBlock = <CompareView cmp={state.compare} onOpenSettings={openSettings} />;
  } else if (state.result && !m.compare) {
    resultBlock = <ResultView res={state.result} onOpenSettings={openSettings} />;
  } else {
    resultBlock = (
      <Empty
        icon={m.icon}
        title="まだ評価結果がありません"
        sub={m.compare ? '「設定を編集」から2件以上の動画を指定し、比較評価を実行してください。' : '「設定を編集」から動画を指定し、評価を実行してください。'}
        action="設定を編集"
        onAction={openSettings}
      />
    );
  }

  return (
    <div className="screen flex flex-col gap-6">
      <PageHeader title="動画評価" sub="動画をペルソナの視点で評価します。評価の種類を選び、設定してから実行してください。" />

      {/* The five modes were five rail destinations, which made one task read as
          five screens. They are options on this one screen now. */}
      <ModePicker />

      <SettingsSummary label={CONTROL_LABEL[mode]} onOpen={openSettings} />

      {/* The label belongs to the result under it, not to the gap above it. At
          the column's own gap-6 it sat equidistant between two cards and read as
          attached to neither, so it binds to its content and keeps the full gap
          only on the side that separates it from the settings card. */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[15px] font-semibold text-text flex items-center gap-2">{m.compare ? '比較結果' : '評価結果'}</div>
        <div className="flex flex-col gap-6">{resultBlock}</div>
      </div>
    </div>
  );
}
