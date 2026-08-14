import { Icon, type IconName } from '@/components/Icon';
import { Hl } from './Hl';
import { STATUS } from '@/lib/palette';
import type { StatusKey } from '@/lib/types';

/** Tinted label: coloured text + icon on an 8% tint. */
export function Tag({ label, fg, bg, icon }: { label: string; fg: string; bg: string; icon?: IconName }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11px] font-medium" style={{ background: bg, color: fg }}>
      {icon && <Icon name={icon} size={11} stroke={fg} width={2.2} />}
      {label}
    </span>
  );
}

export function StatusChip({ status }: { status: StatusKey }) {
  const s = STATUS[status] || STATUS.todo;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: s.bg, color: s.fg }}>
      <i className="w-[9px] h-[9px] rounded-full border-2 border-current shrink-0" />
      {s.label}
    </span>
  );
}

export function CountBadge({ n, fg, bg }: { n: number; fg?: string; bg?: string }) {
  return (
    <span
      className="min-w-5 text-center rounded-full px-[7px] py-[3px] text-[11px] font-semibold bg-fill text-text-sub"
      style={fg ? { background: bg, color: fg } : undefined}
    >
      {n}
    </span>
  );
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-track overflow-hidden">
      <i className="block h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function Insight({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return (
    <div className="bg-fill rounded-chip p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-sub tracking-[0.02em]">
        <Icon name="compass" size={13} stroke="var(--color-accent)" />
        AIの読み解き
      </div>
      <div className="text-[12.5px] leading-[1.75] text-text">
        <Hl text={text} />
      </div>
    </div>
  );
}
