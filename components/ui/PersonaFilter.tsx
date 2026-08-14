'use client';

import { Icon } from '@/components/Icon';
import { useStore } from '@/lib/store';
import { attrGroups, hiddenCount } from '@/lib/selectors';
import { AVG_COLOR, layerColor } from '@/lib/palette';
import { Button } from './Button';
import { Collapse } from './Collapse';
import type { EvaluationResult } from '@/lib/types';

/**
 * The result-side "表示するペルソナ" filter — shared between the single-video
 * result view and the compare view (which passes results[0] as `res`).
 * Distinct from PersonaBar: this toggles state.shown / state.layerAvg /
 * state.hideAvg rather than the evaluation-input state.selected.
 */
export function PersonaFilter({ res }: { res: EvaluationResult }) {
  const { state, update } = useStore();
  const groups = attrGroups(res.personas);
  const attrs = groups.map((g) => g.attr);
  const hidden = hiddenCount(state, res);

  function toggleCollapsed() {
    update((s) => ({ ...s, filterCollapsed: !s.filterCollapsed }));
  }
  function pick(id: string) {
    update((s) => ({ ...s, shown: { ...s.shown, [id]: s.shown[id] === false } }));
  }
  function showAll() {
    update((s) => {
      const shown = { ...s.shown };
      res.personas.forEach((p) => { shown[p.id] = true; });
      return { ...s, shown };
    });
  }
  function hideAll() {
    update((s) => {
      const shown = { ...s.shown };
      res.personas.forEach((p) => { shown[p.id] = false; });
      return { ...s, shown };
    });
  }
  function toggleAvg() {
    update((s) => ({ ...s, hideAvg: !s.hideAvg }));
  }
  function groupShow(attr: string) {
    update((s) => {
      const shown = { ...s.shown };
      res.personas.forEach((p) => { if ((p.attribute || '（属性なし）') === attr) shown[p.id] = true; });
      return { ...s, shown };
    });
  }
  function groupHide(attr: string) {
    update((s) => {
      const shown = { ...s.shown };
      res.personas.forEach((p) => { if ((p.attribute || '（属性なし）') === attr) shown[p.id] = false; });
      return { ...s, shown };
    });
  }
  function toggleLayerAvg(attr: string) {
    update((s) => ({ ...s, layerAvg: { ...s.layerAvg, [attr]: !s.layerAvg[attr] } }));
  }

  const head = (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" aria-label="フィルタを開閉" onClick={toggleCollapsed} className="text-text-mute p-0.5 rounded-sm flex shrink-0 transition-colors duration-180 hover:text-text hover:bg-fill">
        <Icon name={state.filterCollapsed ? 'chevronRight' : 'chevronDown'} size={15} />
      </button>
      <span className="text-[13px] font-semibold">表示するペルソナ</span>
      <Button size="xs" onClick={showAll}>全表示</Button>
      <Button size="xs" onClick={hideAll}>全非表示</Button>
      <button
        type="button"
        onClick={toggleAvg}
        className={`inline-flex items-center gap-1.5 rounded-full py-[5px] px-3 text-xs font-medium border transition-colors duration-180 ${
          state.hideAvg ? 'bg-surface border-line text-text-sub' : 'font-semibold'
        }`}
        style={state.hideAvg ? undefined : { background: `color-mix(in srgb, ${AVG_COLOR} 12%, var(--color-surface))`, borderColor: `color-mix(in srgb, ${AVG_COLOR} 45%, var(--color-surface))`, color: AVG_COLOR }}
      >
        <i className="w-2 h-2 rounded-full shrink-0" style={{ background: AVG_COLOR }} />
        平均
      </button>
      {hidden > 0 && <span className="text-xs text-text-sub">グラフを読みやすくするため{hidden}名を非表示にしています</span>}
    </div>
  );

  return (
    <div className="bg-surface rounded-card p-4 shadow-card flex flex-col gap-3">
      {head}
      <Collapse open={!state.filterCollapsed}>
        <div className="flex flex-col gap-0.5">
          {groups.map((g) => {
            const shownN = g.personas.filter((p) => state.shown[p.id] !== false).length;
            const lc = layerColor(g.attr, attrs);
            const layerOn = !!state.layerAvg[g.attr];
            return (
              <div key={g.attr} className="flex items-start gap-2 py-2.5 border-b border-dashed border-line last:border-b-0 flex-wrap">
                <div className="text-xs font-semibold text-text min-w-[210px] pt-[5px]">
                  {g.attr}
                  <span className="font-normal text-text-sub">（{shownN}/{g.personas.length}）</span>
                </div>
                <div className="flex gap-1 pt-0.5 items-center">
                  <Button size="xs" onClick={() => groupShow(g.attr)}>表示</Button>
                  <Button size="xs" onClick={() => groupHide(g.attr)}>非表示</Button>
                  <button
                    type="button"
                    onClick={() => toggleLayerAvg(g.attr)}
                    className={`inline-flex items-center gap-1.5 rounded-full py-[5px] px-3 text-xs font-medium border transition-colors duration-180 ${
                      layerOn ? 'font-semibold' : 'bg-surface border-line text-text-sub'
                    }`}
                    style={layerOn ? { background: `color-mix(in srgb, ${lc} 12%, var(--color-surface))`, borderColor: `color-mix(in srgb, ${lc} 45%, var(--color-surface))`, color: lc } : undefined}
                  >
                    <i className="w-2 h-2 rounded-full shrink-0" style={{ background: lc }} />
                    層平均
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                  {g.personas.map((p) => {
                    const on = state.shown[p.id] !== false;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => pick(p.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full py-[5px] px-3 text-xs font-medium border transition-colors duration-180 ${
                          on ? 'font-semibold' : 'bg-surface border-line text-text-sub'
                        }`}
                        style={on ? { background: `color-mix(in srgb, ${p.color} 12%, var(--color-surface))`, borderColor: `color-mix(in srgb, ${p.color} 45%, var(--color-surface))`, color: p.color } : undefined}
                      >
                        <i className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}
