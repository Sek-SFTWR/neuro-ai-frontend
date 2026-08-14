'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { searchPersonas } from '@/lib/selectors';

interface PersonaSearchPopoverProps {
  anchor: HTMLElement;
  onClose: () => void;
}

/** Global "which persona was that again" search, anchored under the top bar's
    search button. Shares state.personaSearch with the Personas screen's own
    search box, so picking up where you left off there just works. */
export function PersonaSearchPopover({ anchor, onClose }: PersonaSearchPopoverProps) {
  const { state, patch } = useStore();
  const { goSection } = useActions();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  const results = searchPersonas(state, state.personaSearch).slice(0, 8);

  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    setPos({ top: window.scrollY + r.bottom + 8, right: window.innerWidth - r.right });
    inputRef.current?.focus();
  }, [anchor]);

  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target as Node) && ev.target !== anchor) onClose();
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') onClose();
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [anchor, onClose]);

  function openPersona() {
    goSection('personas');
    onClose();
  }

  if (!pos) return null;

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-[400] w-[340px] bg-surface rounded-panel border border-line shadow-card overflow-hidden"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="relative border-b border-line">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none">
          <Icon name="search" size={14} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={state.personaSearch}
          onChange={(e) => patch({ personaSearch: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') openPersona(); }}
          placeholder="ペルソナを氏名・属性・特徴で検索"
          className="w-full bg-transparent py-3 pl-9 pr-3 text-[13px] text-text placeholder:text-text-mute focus:outline-none"
        />
      </div>

      {state.personaSearch.trim() ? (
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {results.length ? (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={openPersona}
                className="flex items-center gap-2.5 w-full py-2 px-2.5 rounded-sm text-left transition-colors duration-180 hover:bg-fill"
              >
                <Avatar persona={p} size="xs" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium truncate">{p.name}</span>
                  <span className="block text-[11px] text-text-sub truncate">{p.attribute}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-text-sub py-3 px-2.5">該当するペルソナが見つかりません</p>
          )}
          {searchPersonas(state, state.personaSearch).length > results.length && (
            <button type="button" onClick={openPersona} className="w-full text-center text-xs font-medium text-accent hover:text-accent-hover py-2 border-t border-line">
              ペルソナ管理ですべての結果を見る →
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-sub py-3 px-3.5">入力すると登録ペルソナ{state.personas.length}件から検索します</p>
      )}
    </div>
  );
}
