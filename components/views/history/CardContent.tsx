/* ==========================================================================
   The presentational half of a result card, lifted from the old dashboard
   board card so 実行履歴 shows a result the way the board did: priority and
   title carrying the weight, then how far the axes got, then who and when.

   Behaviour — drag, selection, view/rename/delete — stays in HistoryView.
   These pieces are shared by both the grid card and the list row, so the two
   views can never drift apart on what a result looks like.
   ========================================================================== */

import { Icon } from '@/components/Icon';
import { Tag, Bar, StatusChip } from '@/components/ui/Badges';
import { AvatarGroup } from '@/components/ui/Avatar';
import { isOverdue } from '@/lib/selectors';
import { MODE_BADGE, MODES, PRIORITY, STATUS } from '@/lib/palette';
import type { HistoryEntry, Persona } from '@/lib/types';

/** Priority, mode and status. The board could drop mode and status — its
    columns were status, and it was one screen per mode. 実行履歴 filters on
    both, so both have to stay legible on the card itself. */
export function Badges({ h }: { h: HistoryEntry }) {
  const pri = PRIORITY[h.priority];
  const badge = MODE_BADGE[h.mode];
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
      <Tag label={h.priority} fg={pri.fg} bg={pri.bg} icon="flag" />
      <span
        className="inline-flex items-center rounded-full py-[3px] px-2 text-[10.5px] font-semibold whitespace-nowrap"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {MODES[h.mode].short}
      </span>
      <StatusChip status={h.status} />
    </span>
  );
}

/** Title plus the one-line recap of what was evaluated against whom. */
export function Title({ h, clamp }: { h: HistoryEntry; clamp?: boolean }) {
  const sub = MODES[h.mode].label + (h.status === 'todo' ? '' : `・${h.personaCount}名のペルソナ`);
  return (
    <span className="flex flex-col gap-1 min-w-0">
      <span className={`block text-[14px] font-bold text-text leading-snug ${clamp ? 'line-clamp-2' : 'truncate'}`}>
        {h.title}
      </span>
      <span className="block text-xs font-normal text-text-sub truncate">{sub}</span>
    </span>
  );
}

/** Axes progress: label, bar and count merged into one inline row. */
export function AxesProgress({ h, axesTotal }: { h: HistoryEntry; axesTotal: number }) {
  const pct = axesTotal ? Math.round((h.axesDone / axesTotal) * 100) : 0;
  const complete = h.axesDone >= axesTotal;
  const st = STATUS[h.status];
  return (
    <span className="flex items-center gap-2 text-xs min-w-0">
      <span className="flex items-center gap-1 font-medium text-text shrink-0">
        {complete
          ? <Icon name="checkCircle" size={14} stroke="var(--color-green)" />
          : <Icon name="list" size={14} stroke="var(--color-text-mute)" />}
        評価軸
      </span>
      <span className="flex-1 min-w-[40px]"><Bar pct={pct} color={st.fg} /></span>
      <span className="font-normal text-text-sub shrink-0 tabular-nums">{h.axesDone}/{axesTotal}</span>
    </span>
  );
}

/** Due date, which turns into an overdue warning once it has passed. */
export function Due({ h }: { h: HistoryEntry }) {
  if (!h.due) return null;
  const overdue = isOverdue(h.due, h.status);
  return (
    <span className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${overdue ? 'font-semibold text-pri-high' : 'font-normal text-text-sub'}`}>
      <Icon name={overdue ? 'alert' : 'calendar'} size={13} stroke={overdue ? undefined : '#6B7280'} />
      {overdue ? '期限超過：' : '期限：'}{h.due}
    </span>
  );
}

/** Collaborators on the left, attachment and comment counts on the right. */
export function People({ h, personas, spread = true }: { h: HistoryEntry; personas: Persona[]; spread?: boolean }) {
  const shown = personas.slice(0, Math.min(h.personaCount, 5));
  return (
    <span className="flex items-center gap-3 min-w-0">
      <AvatarGroup personas={shown} size="xs" max={3} />
      <span className={`flex items-center gap-3 text-text-mute text-xs ${spread ? 'ml-auto' : ''}`}>
        <span className="flex items-center gap-1"><Icon name="paperclip" size={13} />{h.files}</span>
        <span className="flex items-center gap-1"><Icon name="comment" size={13} />{h.comments}</span>
      </span>
    </span>
  );
}
