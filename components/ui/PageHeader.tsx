import type { ReactNode } from 'react';

/** Unifies the title+subtitle+actions row every screen opens with. */
export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-[34px] font-bold tracking-[-0.02em] text-text leading-[1.25]">{title}</h1>
        {sub && <p className="text-xs text-text-sub mt-1.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
