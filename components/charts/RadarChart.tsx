'use client';

import type { ChartConfiguration } from 'chart.js';
import { useStore } from '@/lib/store';
import { attrGroups, enabledLayers, evalsInLayer, personaById, shownEvals } from '@/lib/selectors';
import { AVG_COLOR, hexA, layerColor } from '@/lib/palette';
import { axisAverage } from '@/lib/mock-data';
import { radarOptions } from '@/lib/chartHelpers';
import { useChart } from './useChart';
import type { EvaluationResult } from '@/lib/types';

/** Axis radar, 0–5. */
export function RadarChart({ res }: { res: EvaluationResult }) {
  const { state } = useStore();
  const axes = res.axes;

  const ds: ChartConfiguration<'radar'>['data']['datasets'] = shownEvals(state, res).map((e) => {
    const p = personaById(state, e.personaId) || { color: '#6B7280', name: '' };
    return {
      label: p.name,
      data: axes.map((ax) => {
        const hit = e.overall.find((o) => o.axis === ax);
        return hit ? hit.score : 0;
      }),
      borderColor: p.color,
      backgroundColor: hexA(p.color, 0.08),
      pointBackgroundColor: p.color,
    };
  });

  if (!state.hideAvg) {
    ds.push({
      label: '平均',
      data: axes.map((ax) => axisAverage(res, ax)),
      borderColor: AVG_COLOR,
      backgroundColor: hexA(AVG_COLOR, 0.12),
      borderDash: [5, 4],
      pointBackgroundColor: AVG_COLOR,
    });
  }

  const attrs = attrGroups(res.personas).map((g) => g.attr);
  enabledLayers(state, res).forEach((attr) => {
    const evs = evalsInLayer(state, res, attr);
    if (!evs.length) return;
    const c = layerColor(attr, attrs);
    ds.push({
      label: `平均（${attr}）`,
      data: axes.map((ax) => axisAverage(res, ax, evs)),
      borderColor: c,
      backgroundColor: hexA(c, 0.06),
      borderDash: [3, 3],
      pointBackgroundColor: c,
    });
  });

  const canvasRef = useChart<'radar'>({
    type: 'radar',
    data: { labels: axes, datasets: ds },
    options: radarOptions(false, state.theme),
  });

  return <canvas ref={canvasRef} />;
}
