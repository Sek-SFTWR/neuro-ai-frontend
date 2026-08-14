'use client';

import type { ChartConfiguration } from 'chart.js';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { hexA, VIDEO_COLORS, VIDEO_POINTS, VIDEO_SYMBOLS } from '@/lib/palette';
import { axisAverage } from '@/lib/mock-data';
import { radarOptions } from '@/lib/chartHelpers';
import { useChart } from './useChart';
import type { CompareResult, EvaluationResult } from '@/lib/types';

/** One radar per video (separate) or all overlaid (merged) when videoIndex is omitted. */
export function CompareRadarChart({ cmp, videoIndex }: { cmp: CompareResult; videoIndex?: number }) {
  const { state } = useStore();
  const axes = cmp.axes;
  const ds: ChartConfiguration<'radar'>['data']['datasets'] = [];

  function push(res: EvaluationResult, vi: number) {
    const c = VIDEO_COLORS[vi % 6];
    if (state.cmpViewMode === 'avg') {
      ds.push({
        label: `${VIDEO_SYMBOLS[vi % 6]} 平均`,
        data: axes.map((ax) => axisAverage(res, ax)),
        borderColor: c,
        backgroundColor: hexA(c, 0.1),
        pointStyle: VIDEO_POINTS[vi % 6],
        pointBackgroundColor: c,
      });
    } else {
      shownEvals(state, res).forEach((e) => {
        const p = personaById(state, e.personaId) || { color: '#6B7280', name: '' };
        ds.push({
          label: `${p.name}／${VIDEO_SYMBOLS[vi % 6]}`,
          data: axes.map((ax) => {
            const hit = e.overall.find((o) => o.axis === ax);
            return hit ? hit.score : 0;
          }),
          borderColor: p.color,
          backgroundColor: hexA(p.color, 0.05),
          pointStyle: VIDEO_POINTS[vi % 6],
          pointBackgroundColor: p.color,
        });
      });
    }
  }

  if (videoIndex == null) cmp.results.forEach(push);
  else push(cmp.results[videoIndex], videoIndex);

  const canvasRef = useChart<'radar'>({
    type: 'radar',
    data: { labels: axes, datasets: ds },
    options: radarOptions(false, state.theme),
  });

  return <canvas ref={canvasRef} />;
}
