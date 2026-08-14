/* ==========================================================================
   The presentational half of a result card, lifted from the old dashboard
   board card so 実行履歴 shows a result the way the board did: the title
   carrying the weight, then how far the axes got, then who made it and when.

   Behaviour — drag, selection, view/rename/delete — stays in HistoryView.
   These pieces are shared by both the grid card and the list row, so the two
   views can never drift apart on what a result looks like.
   ========================================================================== */

import { Icon } from '@/components/Icon';
import { Bar, StatusChip } from '@/components/ui/Badges';
import { AvatarGroup } from '@/components/ui/Avatar';
import { MODE_BADGE, MODES, STATUS } from '@/lib/palette';
import type { HistoryEntry, Persona } from '@/lib/types';

/** Mode and status. The board could drop both — its columns were status, and
    it was one screen per mode. 実行履歴 filters on both, so both have to stay
    legible on the card itself. The priority flag that used to lead this row is
    gone: nothing in the app acted on it. */
export function Badges({ h }: { h: HistoryEntry }) {
  const badge = MODE_BADGE[h.mode];
  return (
    <span className="flex items-center gap-1.5 flex-wrap">
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

/** When the run was saved. This was previously labelled 期限 and styled as an
    overdue warning, but nothing ever set a deadline — the value was always the
    timestamp the run was created at, so it now says so. */
export function Created({ h }: { h: HistoryEntry }) {
  if (!h.savedAt) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-normal text-text-sub whitespace-nowrap">
      <Icon name="calendar" size={13} stroke="#6B7280" />
      作成：{h.savedAt}
    </span>
  );
}

/** Who ran it. Reads as a byline next to the personas rather than a metric. */
export function Creator({ h }: { h: HistoryEntry }) {
  if (!h.createdBy) return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-normal text-text-sub min-w-0" title={`作成者：${h.createdBy}`}>
      <Icon name="user" size={13} stroke="#6B7280" />
      <span className="truncate">{h.createdBy}</span>
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
