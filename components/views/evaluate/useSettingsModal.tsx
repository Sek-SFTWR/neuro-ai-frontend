'use client';

import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { AxesEditor } from '@/components/views/AxesEditor';
import { SettingsBody } from '@/components/views/evaluate/SettingsBody';
import { RunBar } from '@/components/views/evaluate/RunBar';
import { useModal } from '@/components/overlays/Modal';
import { useStore } from '@/lib/store';
import { useEvaluationRun } from '@/lib/useEvaluationRun';

export const CONTROL_LABEL: Record<string, string> = {
  youtube: '評価設定（URL・ペルソナ選択）',
  file: '評価設定（動画ファイル・ペルソナ選択）',
  ytcompare: '評価設定（URL・ペルソナ選択）',
  filecompare: '評価設定（動画ファイル・ペルソナ選択）',
  mixcompare: '評価設定（URL・動画ファイル・ペルソナ選択）',
};

/**
 * The evaluation settings modal and its criteria drill-in.
 *
 * Both the evaluate screen and the result screen open the same dialog — the
 * result screen's "設定を編集" has to reach it too — so the wiring lives here
 * rather than being duplicated, which would let the two copies drift on what
 * the footer does or where × lands.
 */
export function useSettingsModal() {
  const { state } = useStore();
  const { run } = useEvaluationRun();
  const modal = useModal();
  const mode = state.mode;

  function handleRun() {
    modal.close();
    run(mode);
  }

  function openSettings() {
    modal.open({
      title: CONTROL_LABEL[mode],
      wide: true,
      body: <SettingsBody mode={mode} />,
      foot: <RunBar mode={mode} onCancel={modal.close} onRun={handleRun} onOpenCriteria={openCriteria} />,
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
          <Button size="sm" variant="accent" onClick={modal.dismiss}>閉じる</Button>
        </>
      ),
    });
  }

  return { openSettings };
}
