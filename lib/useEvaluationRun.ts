'use client';

import { useCallback, useRef } from 'react';
import { useStore } from './store';
import { useToast } from '@/components/overlays/Toast';
import { useProgress } from '@/components/overlays/ProgressModal';
import { selectedPersonaIds } from './selectors';
import { CREATORS, simulate } from './mock-data';
import { MODELS, MODES } from './palette';
import type { ModeKey } from './types';

function validate(state: ReturnType<typeof useStore>['state'], mode: ModeKey): string | null {
  const inputs = state.inputs;
  const ids = selectedPersonaIds(state);

  if (mode === 'youtube' && !inputs.youtube.url.trim()) return 'YouTubeのURLを入力してください';
  if (mode === 'file' && !inputs.file.file) return '動画ファイルを選択してください';
  if (mode === 'ytcompare') {
    const urls = inputs.ytcompare.urls.filter((u) => u.trim());
    if (urls.length < 2) return 'URLを2件以上入力してください';
  }
  if (mode === 'filecompare' && inputs.filecompare.files.length < 2) return '動画ファイルを2本以上選択してください';
  if (mode === 'mixcompare') {
    const u2 = inputs.mixcompare.urls.filter((u) => u.trim()).length;
    if (u2 + inputs.mixcompare.files.length < 2) return 'YouTube URLと動画ファイルを合わせて2件以上指定してください';
  }
  if (!ids.length) return 'ペルソナを1人以上選択してください';
  /* Last line of defence: a compare run submitted while the engine cannot take
     more than one video would produce a result the model never computed. */
  if (MODES[mode].compare && !MODELS[state.model].supportsCompare) {
    return `${MODELS[state.model].label}は比較評価に対応していません。設定でモデルを変更してください`;
  }
  return null;
}

/** Titles used for the generated result, derived from the actual inputs. */
function titlesFor(state: ReturnType<typeof useStore>['state'], mode: ModeKey): string | string[] {
  const inputs = state.inputs;
  if (mode === 'youtube') return `YouTube動画：${inputs.youtube.url.slice(0, 60)}`;
  if (mode === 'file') return inputs.file.file!.name;
  if (mode === 'ytcompare') {
    return inputs.ytcompare.urls.filter((u) => u.trim()).map((_u, i) => `YouTube動画 ${i + 1}`);
  }
  if (mode === 'filecompare') return inputs.filecompare.files.map((f) => f.name);
  return inputs.mixcompare.urls.filter((u) => u.trim()).map((_u, i) => `YouTube動画 ${i + 1}`)
    .concat(inputs.mixcompare.files.map((f) => f.name));
}

export function useEvaluationRun() {
  const { state, update, resetResultFlags } = useStore();
  const toast = useToast();
  const progress = useProgress();
  const stateRef = useRef(state);
  stateRef.current = state;

  const run = useCallback((mode: ModeKey) => {
    const err = validate(stateRef.current, mode);
    if (err) { toast.show(err, true); return; }

    const ids = selectedPersonaIds(stateRef.current);
    const isCompare = MODES[mode].compare;
    const titles = titlesFor(stateRef.current, mode);
    const videoCount = isCompare ? (Array.isArray(titles) ? titles.length : 1) : 1;
    const totalSteps = videoCount * (1 + ids.length + 1);
    let step = 0;

    progress.open(isCompare);
    if (!isCompare) progress.setProgressStep(0);

    if (progress.runTimer.current) clearInterval(progress.runTimer.current);
    progress.runTimer.current = setInterval(() => {
      step++;
      const pct = Math.min(92, Math.round((step / totalSteps) * 92));
      let sub: string;

      if (isCompare) {
        const titleList = Array.isArray(titles) ? titles : [titles];
        const vi = Math.min(videoCount - 1, Math.floor(step / (totalSteps / videoCount)));
        const label = String(titleList[vi]).slice(0, 28);
        sub = step % (1 + ids.length + 1) === 0
          ? `${label}：読み解きを作成中…`
          : `${label}：ペルソナ評価 ${Math.min(ids.length, step % (ids.length + 2))}/${ids.length}…`;
      } else {
        if (step <= 1) { progress.setProgressStep(0); sub = '動画をアップロードしています…'; }
        else if (step <= 2) { progress.setProgressStep(1); sub = '動画を解析しています…'; }
        else if (step <= ids.length + 2) {
          progress.setProgressStep(2);
          sub = `ペルソナが視聴・評価しています（${Math.min(ids.length, step - 2)}/${ids.length}）`;
        } else { progress.setProgressStep(3); sub = '読み解きを作成しています…'; }
      }

      progress.setProgress(pct, sub);

      if (step >= totalSteps) {
        if (progress.runTimer.current) clearInterval(progress.runTimer.current);
        progress.setProgress(100, '完了しました');
        setTimeout(() => finish(mode, titles, ids), 420);
      }
    }, 130);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback((mode: ModeKey, titles: string | string[], ids: string[]) => {
    const s = stateRef.current;
    const dur = mode === 'file' && s.inputs.file.file ? Math.min(120, Math.floor(s.inputs.file.file.duration || 15)) : 15;

    const runId = `run_${Date.now()}`;
    const res = simulate(mode, titles, ids, dur, s.personas, s.axes, runId, { model: s.model, spliceSec: s.splice });

    progress.close();

    const savedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const resultDurationSec = res.isCompare ? res.results[0].meta.durationSec : res.meta.durationSec;

    update((prev) => ({
      ...prev,
      /* A finished run goes straight to its result — the setup screen has
         nothing left to say once the run it configured has produced one. */
      section: 'result',
      compare: res.isCompare ? res : null,
      result: res.isCompare ? null : res,
      compareTab: res.isCompare ? 'summary' : prev.compareTab,
      resultTab: res.isCompare ? prev.resultTab : 'strategy',
      controlCollapsed: true,
      history: [
        {
          id: res.id,
          title: res.meta.title,
          mode,
          status: 'review',
          /* Shared login: there is no signed-in identity to read, so a run
             is attributed to the roster's first name until accounts exist. */
          createdBy: CREATORS[0],
          savedAt,
          durationSec: resultDurationSec,
          personaCount: ids.length,
          axesDone: prev.axes.length,
          files: dur,
          comments: ids.length,
          model: s.model,
          spliceSec: s.splice,
        },
        ...prev.history,
      ],
    }));

    resetResultFlags(res);
    toast.show('評価が完了しました。履歴に保存しました');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { run };
}
