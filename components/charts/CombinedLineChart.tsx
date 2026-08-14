'use client';

import type { ChartConfiguration } from 'chart.js';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { clock, mean, VIDEO_COLORS, VIDEO_POINTS, VIDEO_SYMBOLS } from '@/lib/palette';
import { GLOW, lineOptions } from '@/lib/chartHelpers';
import { useChart } from './useChart';
import type { CompareResult } from '@/lib/types';

export function CombinedLineChart({ cmp }: { cmp: CompareResult }) {
  const { state } = useStore();
  const dark = state.lineStyle === 'now';
  const maxDur = Math.max(...cmp.results.map((r) => r.meta.durationSec));
  const labels: string[] = [];
  for (let i = 0; i < maxDur; i++) labels.push(clock(i));

  const ds: ChartConfiguration<'line'>['data']['datasets'] = [];
  cmp.results.forEach((res, vi) => {
    const sym = VIDEO_POINTS[vi % VIDEO_POINTS.length];
    if (state.cmpViewMode === 'avg') {
      ds.push({
        label: `${VIDEO_SYMBOLS[vi % 6]} 全員平均`,
        data: labels.map((_, s) => (s < res.meta.durationSec ? mean(res.evaluations.map((e) => e.timeline[s].score)) : null)),
        borderColor: VIDEO_COLORS[vi % 6],
        backgroundColor: VIDEO_COLORS[vi % 6],
        pointStyle: sym,
        pointRadius: 3,
        tension: 0.35,
        spanGaps: false,
      });
    } else {
      shownEvals(state, res).forEach((e) => {
        const p = personaById(state, e.personaId) || { color: '#6B7280', name: '' };
        ds.push({
          label: `${p.name}／${VIDEO_SYMBOLS[vi % 6]}`,
          data: labels.map((_, s) => (s < res.meta.durationSec ? e.timeline[s].score : null)),
          borderColor: p.color,
          backgroundColor: p.color,
          pointStyle: sym,
          pointRadius: 2.5,
          tension: 0.35,
          spanGaps: false,
        });
      });
    }
  });

  const canvasRef = useChart<'line'>({
    type: 'line',
    data: { labels, datasets: ds },
    options: lineOptions(dark, 10, state.theme),
    plugins: dark ? [GLOW] : [],
  });

  return <canvas ref={canvasRef} />;
}
