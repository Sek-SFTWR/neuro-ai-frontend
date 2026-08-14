const SIZE = {
  sm: 'gap-1.5 py-[3px] px-2.5 text-[11px] font-medium',
  md: 'gap-2 py-[6px] px-3 text-[12.5px] font-semibold',
};

/**
 * A persona's attribute as a plain neutral badge — same fill as the detail
 * box (.bg-fill), no per-attribute colour, so a card's attribute reads as a
 * calm label rather than competing for attention with 50+ different hues
 * across the roster.
 */
export function AttrChip({ label, size = 'sm' }: { label: string; size?: 'sm' | 'md' }) {
  return (
    <span className={`inline-flex items-center max-w-full rounded-chip bg-fill text-text-sub ${SIZE[size]}`}>
      <span className="truncate">{label}</span>
    </span>
  );
}
