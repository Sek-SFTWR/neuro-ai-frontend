'use client';

import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import { selectedPersonaIds } from '@/lib/selectors';
import { MODES } from '@/lib/palette';
import type { ModeInputs, ModeKey } from '@/lib/types';

/** How many videos the current form describes, for the honest scope note below.
    Mirrors useEvaluationRun's own counting so the note never drifts from what
    the run button will actually submit. */
function videoCountFor(mode: ModeKey, inputs: ModeInputs): number {
  if (mode === 'youtube') return inputs.youtube.url.trim() ? 1 : 0;
  if (mode === 'file') return inputs.file.file ? 1 : 0;
  if (mode === 'ytcompare') return inputs.ytcompare.urls.filter((u) => u.trim()).length;
  if (mode === 'filecompare') return inputs.filecompare.files.length;
  return inputs.mixcompare.urls.filter((u) => u.trim()).length + inputs.mixcompare.files.length;
}

/** Same "am I ready to run" disabled logic RunBar uses, shared so the header's
    run button (for reachability without scrolling past a long persona list)
    and the bottom run button never drift out of sync. */
function useRunReady(mode: ModeKey) {
  const { state } = useStore();
  const personaCount = selectedPersonaIds(state).length;
  const videoCount = videoCountFor(mode, state.inputs);
  const isCompare = MODES[mode].compare;
  const minVideos = isCompare ? 2 : 1;
  return { disabled: personaCount === 0 || videoCount < minVideos, isCompare, personaCount, videoCount, minVideos };
}

/** Compact run button reused both at the top of the evaluation modal (always
    reachable) and at the bottom via RunBar (in context with the scope note). */
export function RunButton({ mode, onRun }: { mode: ModeKey; onRun: () => void }) {
  const { disabled, isCompare } = useRunReady(mode);
  return (
    <Button variant="accent" size="sm" disabled={disabled} onClick={onRun}>
      <Icon name="play" size={12} />
      {isCompare ? '比較評価を実行' : '評価を実行'}
    </Button>
  );
}

/**
 * The modal's footer: the "am I ready to run" scope note on the left, the way
 * out and the way forward on the right. It sits outside the scrolling body, so
 * both the note and the run button stay put however far the persona list is
 * scrolled — which is why the run button no longer needs a seat in the header.
 */
export function RunBar({ mode, onCancel, onRun, onOpenCriteria }: {
  mode: ModeKey;
  onCancel: () => void;
  onRun: () => void;
  onOpenCriteria: () => void;
}) {
  const { isCompare, personaCount, videoCount, minVideos } = useRunReady(mode);

  let note: React.ReactNode;
  if (personaCount === 0) {
    note = (
      <>
        <span className="text-text-sub">選択中のペルソナ：0名</span>
        <span className="text-pri-high">・1名以上選択すると実行できます</span>
      </>
    );
  } else if (videoCount < minVideos) {
    note = (
      <>
        <span className="text-text-sub">選択中のペルソナ：{personaCount}名</span>
        <span className="text-pri-high">・{isCompare ? '動画を2件以上指定すると実行できます' : '動画を指定すると実行できます'}</span>
      </>
    );
  } else {
    note = (
      <span className="text-text-sub">
        <b className="text-text font-semibold">{personaCount}名</b> × <b className="text-text font-semibold">{videoCount}本</b>の動画を評価します
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap w-full">
      {/* Leaving is its own thing, so it sits apart from the two buttons that
          carry the run forward — no chance of reaching for 評価を実行 and
          landing on キャンセル. */}
      <Button size="sm" className="shrink-0" onClick={onCancel}>キャンセル</Button>

      <div className="text-xs flex items-center gap-1 flex-wrap min-h-[1.4em]">{note}</div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* The criteria drill-in sits with the run button rather than up in the
            body: it is the last thing you check before running, and from here
            it no longer scrolls away with the settings above it. */}
        <Button size="sm" onClick={onOpenCriteria}>
          <Icon name="sliders" size={14} />評価基準を設定
        </Button>
        <RunButton mode={mode} onRun={onRun} />
      </div>
    </div>
  );
}
