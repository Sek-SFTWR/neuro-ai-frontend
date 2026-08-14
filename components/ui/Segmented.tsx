'use client';

import { Icon, type IconName } from '@/components/Icon';

export interface SegmentedItem<K extends string> {
  key: K;
  label: string;
  icon?: IconName;
  /** Shown under the group when this option is the selected one. */
  note?: string;
}

/**
 * A labelled one-of-N setting: same tracked-pill recipe as the grid/list
 * toggles, but a radiogroup rather than a tablist. TabStrip switches which
 * view of the same thing you are looking at; this picks a value that changes
 * what the next run does, and screen readers need to be told which is which.
 */
export function Segmented<K extends string>({
  label, items, value, onChange, className = '',
}: {
  label: string;
  items: SegmentedItem<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string;
}) {
  const note = items.find((it) => it.key === value)?.note;

  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="text-xs font-semibold text-text-sub">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex items-center gap-0.5 bg-fill rounded-full p-0.5 self-start max-w-full overflow-x-auto no-scrollbar">
        {items.map((it) => {
          const on = it.key === value;
          return (
            <button
              key={it.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(it.key)}
              className={`h-(--btn-h-sm) inline-flex items-center gap-1.5 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors duration-180 [&_svg]:stroke-current ${
                on ? 'bg-surface text-text font-semibold shadow-card' : 'text-text-sub hover:text-text'
              }`}
            >
              {it.icon && <Icon name={it.icon} size={14} />}
              {it.label}
            </button>
          );
        })}
      </div>
      {note && <span className="text-[11.5px] text-text-mute">{note}</span>}
    </div>
  );
}
