'use client';

import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { attrGroups, selectedPersonaIds } from '@/lib/selectors';
import { Button } from './Button';
import { useState } from 'react';
import { AttrDropdown } from '@/components/overlays/AttrDropdown';
import type { Persona } from '@/lib/types';

/**
 * A chip inside a horizontally-scrolling group row. The row needs
 * overflow-x-auto to scroll, and CSS overflow-x/overflow-y are coupled (the
 * spec forces overflow-y to auto too once overflow-x isn't visible) — so a
 * custom absolutely-positioned hover card poking out above the row would get
 * silently clipped. A native title attribute sidesteps that entirely, the
 * same way the rail drops its hover tooltip once it becomes horizontally
 * scrollable on narrow screens.
 */
function PersonaChip({ p, on, onClick }: { p: Persona; on: boolean; onClick: () => void }) {
  const hint = [p.attribute, p.trait].filter(Boolean).join(' ・ ');
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={hint || undefined}
      className={`shrink-0 relative inline-flex items-center gap-1.5 rounded-full py-[5px] px-3 text-xs font-medium border transition-colors duration-180 ${
        on ? 'font-semibold' : 'bg-surface border-line text-text-sub hover:text-text'
      }`}
      style={
        on
          ? { background: `color-mix(in srgb, ${p.color} 12%, var(--color-surface))`, borderColor: `color-mix(in srgb, ${p.color} 45%, var(--color-surface))`, color: p.color }
          : { borderColor: undefined }
      }
      onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLElement).style.borderColor = p.color; }}
      onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLElement).style.borderColor = ''; }}
    >
      <i className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
      {p.name}
    </button>
  );
}

/**
 * The 評価ペルソナ picker. Selection lives in state.selected and is shared
 * across all five evaluation modes, matching the reference behaviour. Each
 * attribute group is a fixed-height horizontal slider rather than a
 * wrap-and-collapse list — every group stays visible at a glance, and a
 * roster of any size never makes the picker taller than its group count.
 */
export function PersonaBar() {
  const { state, update } = useStore();
  const [dropdownAnchor, setDropdownAnchor] = useState<HTMLElement | null>(null);
  const groups = attrGroups(state.personas);
  const selCount = selectedPersonaIds(state).length;

  function toggle(id: string) {
    update((s) => ({ ...s, selected: { ...s.selected, [id]: !s.selected[id] } }));
  }
  function selectAll() {
    update((s) => {
      const selected = { ...s.selected };
      s.personas.forEach((p) => { selected[p.id] = true; });
      return { ...s, selected };
    });
  }
  function selectNone() {
    update((s) => ({ ...s, selected: {} }));
  }
  function groupAll(attr: string) {
    update((s) => {
      const selected = { ...s.selected };
      s.personas.forEach((p) => { if ((p.attribute || '（属性なし）') === attr) selected[p.id] = true; });
      return { ...s, selected };
    });
  }
  function groupNone(attr: string) {
    update((s) => {
      const selected = { ...s.selected };
      s.personas.forEach((p) => { if ((p.attribute || '（属性なし）') === attr) selected[p.id] = false; });
      return { ...s, selected };
    });
  }

  if (!state.personas.length) {
    return (
      <div className="flex flex-col gap-3">
        <Head selCount={selCount} onAll={selectAll} onNone={selectNone} onAttr={(e) => setDropdownAnchor(e.currentTarget)} />
        <p className="text-xs text-text-sub">ペルソナが登録されていません。「＋管理」から追加してください。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Head selCount={selCount} onAll={selectAll} onNone={selectNone} onAttr={(e) => setDropdownAnchor(e.currentTarget)} />
      <div className="flex flex-col gap-0.5">
        {groups.map((g) => {
          const on = g.personas.filter((p) => state.selected[p.id]).length;
          return (
            <div key={g.attr} className="flex flex-col gap-1.5 py-2.5 border-b border-dashed border-line last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">
                  {g.attr}
                  <span className="font-normal text-text-sub">（{on}/{g.personas.length}）</span>
                </span>
                <span className="flex-1" />
                <Button size="xs" title={`${g.attr}を全選択`} onClick={() => groupAll(g.attr)}>全選択</Button>
                <Button size="xs" title={`${g.attr}の選択を解除`} onClick={() => groupNone(g.attr)}>解除</Button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scroll-x pb-1 -mb-1">
                {g.personas.map((p) => (
                  <PersonaChip key={p.id} p={p} on={!!state.selected[p.id]} onClick={() => toggle(p.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {dropdownAnchor && (
        <AttrDropdown
          anchor={dropdownAnchor}
          onClose={() => setDropdownAnchor(null)}
          onAdd={(attrs) => {
            update((s) => {
              const selected = { ...s.selected };
              let n = 0;
              s.personas.forEach((p) => {
                const a = p.attribute || '（属性なし）';
                if (attrs.includes(a) && !selected[p.id]) { selected[p.id] = true; n++; }
              });
              return { ...s, selected };
            });
          }}
        />
      )}
    </div>
  );
}

function Head({ selCount, onAll, onNone, onAttr }: { selCount: number; onAll: () => void; onNone: () => void; onAttr: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const { patch } = useStore();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[13px] font-semibold">評価ペルソナ（{selCount}名）</span>
      <Button size="xs" onClick={onAll}>全選択</Button>
      <Button size="xs" onClick={onNone}>全解除</Button>
      <Button size="xs" onClick={onAttr}><Icon name="filter" size={12} />属性で選択</Button>
      <span className="flex-1" />
      <a href="#" className="text-xs font-medium text-text-sub px-1.5 py-1 rounded-sm hover:text-text hover:bg-fill transition-colors duration-180" onClick={(e) => { e.preventDefault(); patch({ section: 'personas' }); }}>
        ＋管理
      </a>
    </div>
  );
}
