'use client';

import type { ChartConfiguration } from 'chart.js';
import { useStore } from '@/lib/store';
import { allEvals, attrGroups, enabledLayers, evalsInLayer, personaById, shownEvals } from '@/lib/selectors';
import { AVG_COLOR, clock, layerColor, mean } from '@/lib/palette';
import { GLOW, lineOptions } from '@/lib/chartHelpers';
import { useChart } from './useChart';
import type { EvaluationResult } from '@/lib/types';

/** Per-second score line: one series per shown persona + 平均 + 層平均. */
export function LineChart({ res }: { res: EvaluationResult }) {
  const { state } = useStore();
  const dark = state.lineStyle === 'now';
  const dur = res.meta.durationSec;
  const labels: string[] = [];
  for (let i = 0; i < dur; i++) labels.push(clock(i));

  const ds: ChartConfiguration<'line'>['data']['datasets'] = shownEvals(state, res).map((e) => {
    const p = personaById(state, e.personaId) || { color: '#6B7280', name: '' };
    return {
      label: p.name,
      data: e.timeline.map((t) => t.score),
      borderColor: p.color,
      backgroundColor: p.color,
      tension: 0.35,
      pointStyle: 'circle',
    };
  });

  /* Averages are computed over ALL personas, visible or not. */
  if (!state.hideAvg) {
    ds.push({
      label: '平均',
      data: labels.map((_, s) => mean(allEvals(res).map((e) => e.timeline[s].score))),
      borderColor: dark ? '#CBD5E1' : AVG_COLOR,
      backgroundColor: dark ? '#CBD5E1' : AVG_COLOR,
      borderDash: [6, 4],
      tension: 0.35,
    });
  }

  const attrs = attrGroups(res.personas).map((g) => g.attr);
  enabledLayers(state, res).forEach((attr) => {
    const evs = evalsInLayer(state, res, attr);
    if (!evs.length) return;
    const c = layerColor(attr, attrs);
    ds.push({
      label: `平均（${attr}）`,
      data: labels.map((_, s) => mean(evs.map((e) => e.timeline[s].score))),
      borderColor: c,
      backgroundColor: c,
      borderDash: [9, 5],
      tension: 0.35,
    });
  });

  const canvasRef = useChart<'line'>({
    type: 'line',
    data: { labels, datasets: ds },
    options: lineOptions(dark, 10, state.theme),
    plugins: dark ? [GLOW] : [],
  });

  return <canvas ref={canvasRef} />;
}
