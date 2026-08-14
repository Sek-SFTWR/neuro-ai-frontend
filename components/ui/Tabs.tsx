import { Icon, type IconName } from '@/components/Icon';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: IconName;
}

/** Segmented pill switcher / tab strip — no track, white active pill. */
export function TabStrip<K extends string>({
  items, activeKey, onChange,
}: {
  items: TabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar" role="tablist">
      {items.map((it) => {
        const on = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.key)}
            className={`h-(--ctl-h) inline-flex items-center gap-1.5 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors duration-180 [&_svg]:stroke-current ${
              on ? 'bg-surface text-text font-semibold shadow-card' : 'text-text-sub hover:text-text hover:bg-white/60'
            }`}
          >
            {it.icon && <Icon name={it.icon} size={15} />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
