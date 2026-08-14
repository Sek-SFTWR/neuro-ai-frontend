'use client';

import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { Segmented, type SegmentedItem } from '@/components/ui/Segmented';
import { useStore } from '@/lib/store';
import { MODEL_ORDER, MODELS, SPLICE_ORDER, spliceLabel } from '@/lib/palette';
import type { ModelKey, SpliceSec } from '@/lib/types';

const MODEL_ITEMS: SegmentedItem<ModelKey>[] = MODEL_ORDER.map((k) => ({
  key: k,
  label: MODELS[k].label,
  icon: MODELS[k].icon,
  note: MODELS[k].note,
}));

/* SpliceSec is a union of number literals, so the radiogroup keys are their
   string forms and are mapped back on the way out. */
const SPLICE_ITEMS: SegmentedItem<string>[] = SPLICE_ORDER.map((s) => ({
  key: String(s),
  label: spliceLabel(s),
}));

/**
 * The two run-shaping settings: which engine analyses the video, and how
 * finely it is sliced. Both belong to the run rather than to any one input
 * mode, so they sit between the video inputs and the persona picker in the
 * evaluation modal — after "what am I evaluating", before "who is watching".
 */
export function AnalysisOptions({ onOpenCriteria }: { onOpenCriteria: () => void }) {
  const { state, patch } = useStore();

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
      <Segmented
        label="解析モデル"
        items={MODEL_ITEMS}
        value={state.model}
        onChange={(k) => patch({ model: k })}
      />
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
