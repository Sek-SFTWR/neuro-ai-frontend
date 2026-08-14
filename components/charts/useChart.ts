'use client';

import { useEffect, useRef } from 'react';
import { Chart, type ChartConfiguration, type ChartTypeRegistry } from 'chart.js/auto';

/** Creates a Chart.js instance on mount/dep-change and destroys it on cleanup. */
export function useChart<T extends keyof ChartTypeRegistry>(
  config: ChartConfiguration<T> | null,
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    const el = canvasRef.current;
    if (!el || !config) return;
    chartRef.current = new Chart(el, config as ChartConfiguration);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(configKey(config as ChartConfiguration | null))]);

  return canvasRef;
}

/** Chart configs contain functions (tooltip callbacks, etc.) that JSON.stringify
    can't hash meaningfully — key off data + a few option primitives instead.
    Grid/tick/tooltip colours are included explicitly (all plain strings) so a
    theme change, which only touches those, still triggers a rebuild. */
function configKey(config: ChartConfiguration | null) {
  if (!config) return null;
  const scales = config.options?.scales as Record<string, { grid?: { color?: unknown }; ticks?: { color?: unknown } }> | undefined;
  return {
    type: config.type,
    labels: config.data?.labels,
    datasets: config.data?.datasets?.map((d) => ({ label: d.label, data: d.data, borderColor: d.borderColor })),
    scaleColors: scales ? Object.values(scales).map((s) => [s?.grid?.color, s?.ticks?.color]) : undefined,
    tooltipBg: (config.options?.plugins?.tooltip as { backgroundColor?: unknown } | undefined)?.backgroundColor,
  };
}
