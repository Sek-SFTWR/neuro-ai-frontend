'use client';

import { useStore } from '@/lib/store';
import { lineOptions } from '@/lib/chartHelpers';
import { useChart } from './useChart';

export interface TrendRow {
  savedAt: string;
  title: string;
  score: number;
}

export function TrendChart({ rows }: { rows: TrendRow[] }) {
  const { state } = useStore();
  const canvasRef = useChart<'line'>({
    type: 'line',
    data: {
      labels: rows.map((r) => r.savedAt.slice(5, 10)),
      datasets: [{
        label: '全体スコア',
        data: rows.map((r) => r.score),
        borderColor: '#F4581F',
        backgroundColor: 'rgba(244,88,31,0.10)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#F4581F',
      }],
    },
    options: lineOptions(false, 100, state.theme),
  });

  return <canvas ref={canvasRef} />;
}
