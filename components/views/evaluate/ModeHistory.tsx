'use client';

import { Icon } from '@/components/Icon';
import { LinkButton } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/Badges';
import { AvatarGroup } from '@/components/ui/Avatar';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { MODES } from '@/lib/palette';
import type { HistoryEntry } from '@/lib/types';

const MAX_ROWS = 5;

function Row({ h, onOpen }: { h: HistoryEntry; onOpen: () => void }) {
  const { state } = useStore();
  const personas = state.personas.slice(0, Math.min(h.personaCount, 3));
  /* A run that never produced anything cannot be opened — the row says so
     rather than offering a 表示 that lands on an empty screen. */
  const openable = h.status !== 'todo';

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-chip transition-colors duration-180 hover:bg-fill">
      <span className="w-7 h-7 rounded-sm bg-fill flex items-center justify-center text-text-sub shrink-0">
        <Icon name={MODES[h.mode].icon} size={14} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-text truncate">{h.title}</span>
        <span className="block text-[11px] text-text-mute truncate mt-0.5">
          {h.createdBy} ・ {h.savedAt} ・ {h.personaCount}名
        </span>
      </span>

      <span className="hidden min-[900px]:flex shrink-0"><AvatarGroup personas={personas} size="xs" max={3} /></span>
      <span className="shrink-0"><StatusChip status={h.status} /></span>

      <span className="shrink-0 w-[64px] flex justify-end">
        {openable
          ? <LinkButton className="flex flex-row items-center gap-1" onClick={onOpen}><Icon name="eye" size={13} />表示</LinkButton>
          : <span className="text-[11px] text-text-mute pr-1.5">未実行</span>}
      </span>
    </div>
  );
}

/**
 * Past runs of the evaluation type currently selected.
 *
 * The evaluate screen used to show one empty state and nothing else, so the
 * work already done in this mode was only reachable by leaving for 実行履歴 and
 * filtering it back down. Scoping the list to state.mode makes the mode picker
 * answer two questions at once — what will I run, and what has been run.
 */
export function ModeHistory() {
  const { state } = useStore();
  const { goSection, openHistory } = useActions();

  const rows = state.history.filter((h) => h.mode === state.mode);
  if (!rows.length) return null;

  const shown = rows.slice(0, MAX_ROWS);
  const hidden = rows.length - shown.length;

  return (
    <div className="bg-surface rounded-card shadow-card p-4 flex flex-col gap-1">
      <div className="flex items-baseline gap-2 flex-wrap px-1 pb-1">
        <span className="text-[13px] font-semibold text-text">{MODES[state.mode].label}の実行履歴</span>
        <span className="text-[11px] text-text-mute">{rows.length}件</span>
        <span className="flex-1" />
        <LinkButton onClick={() => goSection('history')}>すべての履歴を見る</LinkButton>
      </div>

      {shown.map((h) => (
        <Row key={h.id} h={h} onOpen={() => openHistory(h.id)} />
      ))}

      {/* Says what is not on screen rather than silently truncating — five rows
          out of twelve looks like the whole list otherwise. */}
      {hidden > 0 && (
        <p className="text-[11px] text-text-mute px-3 pt-1.5">
          ほか{hidden}件は「すべての履歴を見る」から確認できます。
        </p>
      )}
    </div>
  );
}
