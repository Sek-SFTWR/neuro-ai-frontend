'use client';

import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { MODELS, MODES } from '@/lib/palette';
import type { ModeKey } from '@/lib/types';

/** One line each, so the picker answers "which one do I want" without the user
    having to open the settings modal to find out what a mode actually takes. */
const HINT: Record<ModeKey, string> = {
  youtube: 'URL 1件',
  file: 'ファイル 1件',
  ytcompare: 'URL 2件以上',
  filecompare: 'ファイル 2件以上',
  mixcompare: 'URL＋ファイル',
};

const GROUPS: { label: string; note: string; modes: ModeKey[]; compare: boolean }[] = [
  { label: '単体評価', note: '1本の動画を評価', modes: ['youtube', 'file'], compare: false },
  { label: '比較評価', note: '複数の動画を同じ条件で比較', modes: ['ytcompare', 'filecompare', 'mixcompare'], compare: true },
];

function ModeOption({ mode, active, disabled, reason, onSelect }: {
  mode: ModeKey; active: boolean; disabled?: boolean; reason?: string; onSelect: () => void;
}) {
  const m = MODES[mode];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      /* aria-disabled with the click still bound, rather than `disabled`: a
         disabled button is skipped by the keyboard and explains nothing, and
         the reason for the block lives on another screen. The handler is a
         no-op, so nothing is selectable that should not be. */
      aria-disabled={disabled || undefined}
      title={disabled ? reason : undefined}
      onClick={() => { if (!disabled) onSelect(); }}
      className={`flex-1 min-w-[136px] flex items-center gap-2.5 text-left rounded-chip border py-2.5 px-3 transition-[color,background-color,border-color,opacity] duration-180 ${
        disabled
          ? 'bg-fill border-transparent text-text-mute opacity-60 cursor-not-allowed'
          : active
            ? 'bg-accent border-accent text-accent-fg'
            : 'bg-surface border-line text-text hover:bg-surface-hover'
      }`}
    >
      <span className={`w-8 h-8 rounded-chip flex items-center justify-center shrink-0 ${
        disabled ? 'bg-fill-strong text-text-mute' : active ? 'bg-white/18 text-white' : 'bg-fill text-text-sub'
      }`}>
        <Icon name={m.icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight truncate">{m.short}</span>
        <span className={`block text-[11px] leading-tight mt-0.5 truncate ${
          disabled ? 'text-text-mute' : active ? 'text-white/75' : 'text-text-mute'
        }`}>{HINT[mode]}</span>
      </span>
    </button>
  );
}

/**
 * The five evaluation modes as five options on one screen, rather than five
 * rail destinations that looked like five separate screens for what is one
 * task with one form. Grouping by 単体 / 比較 is what actually distinguishes
 * them — the source (YouTube / file / mixed) is the second-order choice.
 */
export function ModePicker() {
  const { state } = useStore();
  const { goMode, goSection } = useActions();
  const model = MODELS[state.model];
  const blockedReason = `${model.label}は1本ずつの評価のみ対応しています。比較評価には比較対応モデルを選択してください。`;

  return (
    <div className="bg-surface rounded-card p-4 shadow-card flex flex-col b1000:flex-row gap-4" role="radiogroup" aria-label="評価の種類">
      {GROUPS.map((g, gi) => (
        <div
          key={g.label}
          className={`flex flex-col gap-2 min-w-0 ${gi ? 'b1000:flex-[3] b1000:border-l b1000:border-line b1000:pl-4 border-t border-line pt-4 b1000:border-t-0 b1000:pt-0' : 'b1000:flex-[2]'}`}
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-[13px] font-semibold ${g.compare && !model.supportsCompare ? 'text-text-mute' : 'text-text'}`}>{g.label}</span>
            <span className="text-[11px] text-text-mute">{g.note}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {g.modes.map((k) => (
              <ModeOption
                key={k}
                mode={k}
                active={state.mode === k}
                disabled={g.compare && !model.supportsCompare}
                reason={blockedReason}
                onSelect={() => goMode(k)}
              />
            ))}
          </div>

          {/* Why the group is greyed out, and the one place that can change it.
              Without this the options read as broken rather than unavailable,
              and the setting that disabled them is on another screen. */}
          {g.compare && !model.supportsCompare && (
            <p className="flex items-start gap-1.5 rounded-sm bg-orange-bg px-2.5 py-2 text-[11px] font-medium text-orange leading-[1.6]">
              <Icon name="alert" size={12} className="mt-px shrink-0" />
              <span>
                解析モデルに<b className="font-semibold">{model.label}</b>が選択されています。このモデルは動画を1本ずつしか受け取れないため、比較評価は利用できません。
                <button
                  type="button"
                  onClick={() => goSection('settings')}
                  className="ml-1 underline underline-offset-2 font-semibold hover:no-underline"
                >
                  設定でモデルを変更
                </button>
              </span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
