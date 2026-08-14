'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/overlays/Toast';

interface PanelProps {
  title: string;
  sub?: string;
  body: ReactNode;
  /** Show the screenshot button in the header (default true). */
  shot?: boolean;
  id?: string;
  defaultCollapsed?: boolean;
}

/**
 * Collapsible panel. The extra `.collapse` wrapper is what makes the
 * collapse animate: a CSS grid whose single row transitions 1fr → 0fr, the
 * one way to transition to "the height of the content" without measuring it
 * in JS. Overflow is clamped only while collapsed or mid-animation, so an
 * open panel never clips a persona hover-card.
 */
export function Panel({ title, sub, body, shot = true, id, defaultCollapsed = false }: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [animating, setAnimating] = useState(false);
  const toast = useToast();
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toggle() {
    setAnimating(true);
    setCollapsed((c) => !c);
    if (safety.current) clearTimeout(safety.current);
    safety.current = setTimeout(() => setAnimating(false), 500);
  }

  useEffect(() => () => { if (safety.current) clearTimeout(safety.current); }, []);

  return (
    <section id={id} className={`bg-surface rounded-card p-4 shadow-card flex flex-col transition-[gap] duration-420 ease-soft ${collapsed ? 'gap-0' : 'gap-3'}`}>
      <header className="flex items-center gap-2 cursor-pointer select-none" onClick={toggle}>
        <span className="text-sm font-semibold text-text">{title}</span>
        {shot && (
          <button
            type="button"
            aria-label="このパネルを画像として保存"
            className="text-text-mute p-1 rounded-sm flex ml-auto ring-0"
            onClick={(ev) => {
              ev.stopPropagation();
              toast.show(`「${title}」を画像として保存しました`);
            }}
          >
            <Icon name="camera" size={15} />
          </button>
        )}
        <span className={`text-text-mute transition-transform duration-180 ${shot ? '' : 'ml-auto'} ${collapsed ? '-rotate-90' : ''}`}>
          <Icon name="chevronDown" size={16} />
        </span>
      </header>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-420 ease-soft"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr', opacity: collapsed ? 0 : 1 }}
        onTransitionEnd={() => setAnimating(false)}
      >
        <div className={`min-h-0 min-w-0 flex flex-col gap-3 ${collapsed || animating ? 'overflow-hidden' : ''}`}>
          {sub && <p className="text-xs text-text-sub -mt-1.5">{sub}</p>}
          <div className="flex flex-col gap-3">{body}</div>
        </div>
      </div>
    </section>
  );
}
