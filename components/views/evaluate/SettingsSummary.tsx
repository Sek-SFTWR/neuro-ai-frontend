'use client';

import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { selectedPersonaIds } from '@/lib/selectors';
import { MODELS, MODES, spliceLabel } from '@/lib/palette';
import type { ModeInputs, ModeKey } from '@/lib/types';

/** A short, honest recap of what the (possibly-closed) settings modal currently holds. */
function inputSummary(mode: ModeKey, inputs: ModeInputs): string {
  if (mode === 'youtube') return inputs.youtube.url.trim() ? inputs.youtube.url : '動画URL：未設定';
  if (mode === 'file') return inputs.file.file ? inputs.file.file.name : '動画ファイル：未選択';
  if (mode === 'ytcompare') {
    const n = inputs.ytcompare.urls.filter((u) => u.trim()).length;
    return n ? `URL ${n}件を設定済み` : 'URL：未設定';
  }
  if (mode === 'filecompare') {
    const n = inputs.filecompare.files.length;
    return n ? `動画ファイル ${n}件を設定済み` : '動画ファイル：未選択';
  }
  const u = inputs.mixcompare.urls.filter((x) => x.trim()).length;
  const f = inputs.mixcompare.files.length;
  return u || f ? `URL ${u}件・動画ファイル ${f}件を設定済み` : 'URL・動画ファイル：未設定';
}

/**
 * The compact, always-visible recap that replaces the old inline collapsible
 * control card. Evaluation settings (video input + persona picker + run
 * action) now live in a wide modal — this bar shows what's currently
 * configured and is the one thing that opens it.
 */
export function SettingsSummary({ label, onOpen }: { label: string; onOpen: () => void }) {
  const { state } = useStore();
  const mode = state.mode;
  const personaCount = selectedPersonaIds(state).length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-3 w-full text-left bg-surface rounded-card p-4 shadow-card transition-colors duration-180 hover:bg-surface-hover"
    >
      <span className="w-9 h-9 rounded-chip bg-fill flex items-center justify-center text-text-sub shrink-0">
        <Icon name={MODES[mode].icon} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text">{label}</span>
        <span className="block text-xs text-text-sub truncate mt-0.5">
          {inputSummary(mode, state.inputs)} ・ ペルソナ {personaCount}名選択中
          {' '}・ {MODELS[state.model].short} ・ {spliceLabel(state.splice)}ごと
        </span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent shrink-0 transition-transform duration-180 group-hover:translate-x-0.5">
        設定を編集
        <Icon name="chevronRight" size={13} />
      </span>
    </button>
  );
}
