'use client';

import type { ReactNode } from 'react';
import { TabStrip, type TabItem } from './Tabs';
import { useStuck } from '@/lib/useStuck';

/**
 * Collapses a slot to zero width and back.
 *
 * Two nested transitions rather than one, because the space and the content
 * want different timing: the track opens over the long duration (0fr → 1fr
 * animates to the content's *natural* width, so nothing has to be measured),
 * while the content fades and slides over the short one. On the way in the fade
 * is delayed, so room is made before anything appears in it; on the way out it
 * leads, so the content is gone before the gap closes. Both directions then
 * read as one movement instead of a stretch.
 *
 * `from` is the edge the slot sits on, so its content always travels inward.
 */
function Reveal({ show, from, children }: { show: boolean; from: 'left' | 'right'; children: ReactNode }) {
  const offset = from === 'left' ? '-translate-x-2' : 'translate-x-2';
  return (
    <div
      aria-hidden={!show}
      className={`grid transition-[grid-template-columns] duration-420 ease-soft ${
        show ? 'grid-cols-[1fr]' : 'grid-cols-[0fr] pointer-events-none'
      }`}
    >
      {/* py/-my buys the 2px focus-offset room that overflow-hidden would otherwise
          clip, at zero layout cost. Horizontal slack has to come from the slot's
          own padding — padding here would stop the 0fr track collapsing flat. */}
      <div className="min-w-0 overflow-hidden py-1 -my-1">
        <div
          className={`transition-[opacity,transform] duration-260 ease-soft ${
            show ? 'opacity-100 translate-x-0 delay-100' : `opacity-0 ${offset} delay-0`
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The one bar that stays put while a long result scrolls.
 *
 * At rest it is exactly the tab strip it replaces — same row, same left edge,
 * no extra height. Once it docks under the TopBar, `lead` (which result am I
 * reading) and `actions` (settings + exports) open from either side, so the
 * answer to "where am I" and "how do I change this" survives the scroll at the
 * cost of a single row rather than three stacked bars.
 *
 * The strip itself is never duplicated — a second copy would fork active
 * state, focus and keyboard order.
 */
export function StickyTabBar<K extends string>({
  items, activeKey, onChange, lead, actions, children,
}: {
  items: TabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  /** Result identity. Revealed only when docked; it is on screen already at rest. */
  lead?: ReactNode;
  /** Primary actions. Hidden below b860, where the row has no width to spare. */
  actions?: ReactNode;
  /** The content the bar labels. It lives inside the bar's own wrapper — see below. */
  children: ReactNode;
}) {
  const { sentinel, bar, stuck, dock } = useStuck();

  return (
    /* The bar wraps its content rather than sitting beside it, which buys two
       things. The sentinel becomes a plain block sibling instead of a flex item,
       so it stops claiming a whole `gap` of the parent column for its zero
       height. And the bar's containing block becomes exactly the content it
       labels, so it releases at the end of that content instead of riding to the
       bottom of the page. */
    <div>
      <div ref={sentinel} aria-hidden />
      <div
        ref={bar}
        /* No flex `gap`: a collapsed slot still sits between two gaps, which
           would inset the tab strip from the card edges above and below it even
           at rest. The slots carry their own padding instead, so they take up
           exactly nothing until they open.

           bg-page is unconditional: it is the page's own colour, so it costs
           nothing at rest, and anything less than fully opaque lets the tab body
           scroll through the bar while it is docked. Only the rule animates. */
        className={`sticky top-(--topbar-h) z-[250] flex items-center py-2 bg-page border-b transition-colors duration-420 ease-soft ${
          stuck ? 'border-line' : 'border-transparent'
        }`}
      >
        {lead && (
          <div className="min-w-0 shrink">
            <Reveal show={stuck} from="left">{lead}</Reveal>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <TabStrip
            items={items}
            activeKey={activeKey}
            onChange={(k) => { onChange(k); dock(); }}
          />
        </div>

        {actions && (
          <div className="shrink-0 hidden b860:block">
            <Reveal show={stuck} from="right">{actions}</Reveal>
          </div>
        )}
      </div>

      <div className="pt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}
