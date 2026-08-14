/* ==========================================================================
   chartHelpers.ts — Chart.js option builders, ported from assets/js/charts.js.
   ========================================================================== */

import type { Chart, ChartOptions, Plugin } from 'chart.js';

type Theme = 'light' | 'dark';

/* Chart.js draws to a <canvas>, which can't read CSS custom properties at
   paint time — these mirror the --color-line / --color-text-sub tokens in
   globals.css by hand. Keep them in sync if the palette there changes. */
const GRID = { light: '#EAEAEA', dark: '#35363B' };
const TICK = { light: '#6B7280', dark: '#A1A1AA' };

/* A soft glow behind the dark-theme line chart, as in the original. */
export const GLOW: Plugin<'line'> = {
  id: 'msGlow',
  beforeDatasetsDraw(c: Chart) {
    c.ctx.save();
    c.ctx.shadowColor = 'rgba(56,189,248,0.55)';
    c.ctx.shadowBlur = 14;
  },
  afterDatasetsDraw(c: Chart) {
    c.ctx.restore();
  },
};

/** `glow` is the chart's own dark/glow *style* toggle (independent of the
    app theme — it's always a self-contained dark box). `theme` is the app
    theme, and only matters for the plain/"old" style, which otherwise
    hardcodes light-mode grid/tick colours that would look wrong on a dark
    page. */
export function lineOptions(glow: boolean, maxY: number, theme: Theme = 'light'): ChartOptions<'line'> {
  const grid = glow ? 'rgba(255,255,255,0.08)' : GRID[theme];
  const tick = glow ? '#94A3B8' : TICK[theme];
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: glow ? 'rgba(8,19,31,0.95)' : 'rgba(10,10,10,0.92)',
        titleFont: { family: 'Inter, "Noto Sans JP", sans-serif', size: 12, weight: 600 },
        bodyFont: { family: 'Inter, "Noto Sans JP", sans-serif', size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { color: grid },
        ticks: { color: tick, font: { size: 10 }, maxRotation: 0, autoSkipPadding: 16 },
      },
      y: {
        min: 0,
        max: maxY,
        grid: { color: grid },
        ticks: { color: tick, font: { size: 10 }, stepSize: maxY > 10 ? 20 : maxY > 5 ? 2 : 1 },
      },
    },
    elements: { point: { radius: 0, hoverRadius: 4 }, line: { borderWidth: 2 } },
  };
}

export function radarOptions(showLegend: boolean, theme: Theme = 'light'): ChartOptions<'radar'> {
  const grid = GRID[theme];
  const tick = TICK[theme];
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: showLegend
        ? { position: 'bottom', labels: { boxWidth: 8, usePointStyle: true, font: { size: 11 } } }
        : { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,10,10,0.92)',
        padding: 10, cornerRadius: 8, usePointStyle: true, boxWidth: 8, boxHeight: 8,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false },
        grid: { color: grid },
        angleLines: { color: grid },
        pointLabels: { color: tick, font: { size: 10.5 } },
      },
    },
    elements: { line: { borderWidth: 2 }, point: { radius: 2.5, hoverRadius: 5 } },
  };
}
