'use client';

import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { Segmented, type SegmentedItem } from '@/components/ui/Segmented';
import { useStore } from '@/lib/store';
import { SPLICE_ORDER, spliceLabel } from '@/lib/palette';
import type { SpliceSec } from '@/lib/types';

/* SpliceSec is a union of number literals, so the radiogroup keys are their
   string forms and are mapped back on the way out. */
const SPLICE_ITEMS: SegmentedItem<string>[] = SPLICE_ORDER.map((s) => ({
  key: String(s),
  label: spliceLabel(s),
}));

/**
 * How finely the video is sliced for this run. The model picker used to sit
 * beside it, but which engine analyses the video is a standing preference
 * rather than a per-run decision — it lives on the settings screen now, and
 * every run reads the same state.model from there.
 */
export function AnalysisOptions({ onOpenCriteria }: { onOpenCriteria: () => void }) {
  const { state, patch } = useStore();

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
      <Segmented
        label="解析間隔（スプライス）"
        items={SPLICE_ITEMS}
        value={String(state.splice)}
        onChange={(k) => patch({ splice: Number(k) as SpliceSec })}
      />

      {/* Sits at the end of the settings row, and carries an empty label line so
          it lands on the pills rather than on the labels above them. */}
      <div className="ml-auto flex flex-col gap-1.5">
        <span aria-hidden className="text-xs font-semibold opacity-0 select-none">&nbsp;</span>
        <Button size="sm" onClick={onOpenCriteria}>
          <Icon name="sliders" size={14} />評価基準を設定
        </Button>
      </div>
    </div>
  );
}
