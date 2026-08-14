/**
 * Table cell for a score + its rationale, with a mini bar so relative
 * magnitude reads at a glance instead of requiring a compare-the-numbers
 * pass. Used everywhere a persona/video is scored against an axis or a
 * timeline second (the evidence and matrix tables across result/compare).
 */
export function ScoreCell({
  score, max, comment, color, compact = false,
}: {
  score: number;
  max: number;
  comment?: string | null;
  color?: string;
  /** Hide the rationale text — for a "scores only" density mode. */
  compact?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  return (
    <div className="flex flex-col gap-1 min-w-[150px]">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-bold shrink-0" style={{ color }}>
          {score}<span className="text-xs font-normal text-text-sub">/{max}</span>
        </span>
        <span className="flex-1 h-1 rounded-full bg-track overflow-hidden">
          <i className="block h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color || 'var(--color-accent)' }} />
        </span>
      </div>
      {!compact && comment && <span className="text-xs text-text-sub leading-[1.6]">{comment}</span>}
    </div>
  );
}
