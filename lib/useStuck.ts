'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** --topbar-h is the dock line: the sticky bar comes to rest flush under the TopBar. */
function dockLine(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 0;
}

/**
 * Drives a `position: sticky` bar that has to change shape once it docks.
 *
 * `sentinel` is a zero-height marker rendered just before the bar; the observer
 * flips `stuck` the moment it crosses the dock line. Nothing listens to scroll,
 * so no work happens per frame while the user scrolls.
 *
 * `dock()` scrolls back to the position where the bar has *just* docked. Tab
 * strips call it on change: a scroll depth earned inside a long tab is
 * meaningless in a short one, and without it you land in dead space below the
 * new tab's content.
 */
export function useStuck() {
  const sentinel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  /* Distance from the sentinel's bottom to the bar's top in normal flow — the
     parent's flex `gap`. Only measurable while the bar is *not* stuck, so it is
     re-read on every un-stick rather than assumed. dock() needs it: scrolling
     to the sentinel alone lands a gap short and pops the bar straight back out. */
  const flowGap = useRef(0);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let io: IntersectionObserver | undefined;
    /* --topbar-h is redefined at the 1024px breakpoint, so the root margin has
       to be re-read — and the observer rebuilt — whenever the window resizes. */
    const attach = () => {
      io?.disconnect();
      /* Read once and close over it, so the test below and the root margin can
         never disagree about where the dock line is. */
      const line = dockLine();
      io = new IntersectionObserver(
        ([e]) => {
          /* Compare against the dock line, NOT 0. The bar is pinned the instant
             the sentinel passes `line`, so testing `top < 0` leaves a gap the
             height of the TopBar where the bar is visibly docked but still
             styled as though it were at rest. */
          const isStuck = e.boundingClientRect.top < line;
          if (!isStuck && bar.current) {
            flowGap.current = bar.current.getBoundingClientRect().top - e.boundingClientRect.bottom;
          }
          setStuck(isStuck);
        },
        { rootMargin: `-${line}px 0px 0px 0px`, threshold: 0 },
      );
      io.observe(el);
    };
    attach();

    window.addEventListener('resize', attach);
    return () => {
      io?.disconnect();
      window.removeEventListener('resize', attach);
    };
  }, []);

  const dock = useCallback(() => {
    const el = sentinel.current;
    if (!el) return;
    /* The sentinel is in normal flow, so its rect still reports the true
       document position even while the bar above it is pinned. +1px keeps the
       bar a hair past the threshold instead of oscillating on it. */
    const top = el.getBoundingClientRect().bottom + window.scrollY + flowGap.current - dockLine() + 1;
    /* Only ever pulls back up. If the bar has not docked yet the user is
       already looking at the top of the result — leave their scroll alone. */
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  }, []);

  return { sentinel, bar, stuck, dock };
}
