'use client';

import { useRef } from 'react';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/overlays/Toast';
import { clock } from '@/lib/palette';
import { grad } from '@/lib/resultDisplay';
import type { Scene } from '@/lib/types';

/** Shared by the single-video result view and the compare view (one strip
    per video). The per-scene image button is a toast-only stand-in in the
    reference build — there is no real upload wired to it there either.

    The strip scrolls natively (overflow-x-auto), but native scroll alone
    gives no visual hint that it's scrollable, and not every input device
    sends a horizontal delta for a plain vertical wheel/trackpad gesture —
    so a long scene list can look like it just "stops" rather than
    continues. The arrow buttons and edge fades make "there's more" and
    "you can move it" obvious regardless of input device. */
export function TimelineCards({ scenes }: { scenes: Scene[] }) {
  const toast = useToast();
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dx: number) {
    trackRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div ref={trackRef} className="flex gap-3 overflow-x-auto pb-2 scroll-x">
        {scenes.map((sc) => (
          <article key={sc.sec} className="group w-[300px] shrink-0 bg-surface border border-line rounded-panel overflow-hidden flex flex-col">
            <div className="h-42 relative flex items-center justify-center text-white/85" style={{ background: sc.image ? '#000' : grad(sc.sec), height: 168 }}>
              {sc.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sc.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <Icon name="video" size={24} stroke="rgba(255,255,255,.6)" />
              )}
              <span className="absolute left-2 top-2 bg-black/72 text-white text-[11px] font-semibold py-[3px] px-2 rounded-full">{clock(sc.sec)}</span>
              <span className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-180">
                <Button
                  size="xs"
                  onClick={() => toast.show(sc.image ? `${clock(sc.sec)} の画像を削除しました` : `${clock(sc.sec)} に登録する画像を選択してください`)}
                >
                  <Icon name={sc.image ? 'trash' : 'imagePlus'} size={12} />{sc.image ? '削除' : '画像'}
                </Button>
              </span>
            </div>
            <div className="p-3 flex flex-col gap-1">
              <span className="text-xs leading-[1.6]"><b className="text-text-sub font-semibold">概要</b>：{sc.label}</span>
              {sc.narration && <span className="text-xs leading-[1.6]"><b className="text-text-sub font-semibold">ナレーション</b>：{sc.narration}</span>}
            </div>
          </article>
        ))}
      </div>
      {scenes.length > 4 && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-10 bg-[linear-gradient(90deg,var(--color-surface)_0%,transparent_100%)]" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-[linear-gradient(270deg,var(--color-surface)_0%,transparent_100%)]" />
          <button
            type="button"
            aria-label="前のシーンへ"
            onClick={() => scrollBy(-320)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface border border-line shadow-card flex items-center justify-center text-text-sub transition-colors duration-180 hover:text-text hover:bg-fill"
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <button
            type="button"
            aria-label="次のシーンへ"
            onClick={() => scrollBy(320)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface border border-line shadow-card flex items-center justify-center text-text-sub transition-colors duration-180 hover:text-text hover:bg-fill"
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </>
      )}
    </div>
  );
}
