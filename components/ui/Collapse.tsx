import type { ReactNode } from 'react';

/**
 * Smooth height transition via the grid-template-rows 0fr→1fr trick (the
 * only way to animate to "the height of the content" without measuring it in
 * JS) — same mechanic Panel.tsx and ControlCard use for their collapsible
 * bodies, factored out for smaller inline toggles like a card's quick-view.
 */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows,opacity] duration-260 ease-soft"
      style={{ gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0 }}
    >
      <div className="min-h-0 min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
