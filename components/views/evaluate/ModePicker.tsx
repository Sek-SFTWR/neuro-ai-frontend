'use client';

import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { MODES } from '@/lib/palette';
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

const GROUPS: { label: string; note: string; modes: ModeKey[] }[] = [
  { label: '単体評価', note: '1本の動画を評価', modes: ['youtube', 'file'] },
  { label: '比較評価', note: '複数の動画を同じ条件で比較', modes: ['ytcompare', 'filecompare', 'mixcompare'] },
];

function ModeOption({ mode, active, onSelect }: { mode: ModeKey; active: boolean; onSelect: () => void }) {
  const m = MODES[mode];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={`flex-1 min-w-[136px] flex items-center gap-2.5 text-left rounded-chip border py-2.5 px-3 transition-[color,background-color,border-color] duration-180 ${
        active
          ? 'bg-accent border-accent text-white'
          : 'bg-surface border-line text-text hover:bg-surface-hover'
      }`}
    >
      <span className={`w-8 h-8 rounded-chip flex items-center justify-center shrink-0 ${active ? 'bg-white/18 text-white' : 'bg-fill text-text-sub'}`}>
        <Icon name={m.icon} size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-tight truncate">{m.short}</span>
        <span className={`block text-[11px] leading-tight mt-0.5 truncate ${active ? 'text-white/75' : 'text-text-mute'}`}>{HINT[mode]}</span>
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
  const { goMode } = useActions();

  return (
    <div className="bg-surface rounded-card p-4 shadow-card flex flex-col b1000:flex-row gap-4" role="radiogroup" aria-label="評価の種類">
      {GROUPS.map((g, gi) => (
        <div
          key={g.label}
          className={`flex flex-col gap-2 min-w-0 ${gi ? 'b1000:flex-[3] b1000:border-l b1000:border-line b1000:pl-4 border-t border-line pt-4 b1000:border-t-0 b1000:pt-0' : 'b1000:flex-[2]'}`}
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-text">{g.label}</span>
            <span className="text-[11px] text-text-mute">{g.note}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {g.modes.map((k) => (
              <ModeOption key={k} mode={k} active={state.mode === k} onSelect={() => goMode(k)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
