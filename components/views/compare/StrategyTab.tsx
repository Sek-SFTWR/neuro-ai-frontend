'use client';

import { Fragment } from 'react';
import { Hl } from '@/components/ui/Hl';
import { Panel } from '@/components/ui/Panel';
import { Select } from '@/components/ui/Select';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { StrategyTab as SingleStrategyTab } from '@/components/views/result/StrategyTab';
import { useStore } from '@/lib/store';
import type { CompareResult, StrategyInsight } from '@/lib/types';

const STRAT_ROWS: { label: string; key: keyof StrategyInsight; hero?: boolean }[] = [
  { label: '★ 戦略', key: 'oneLine', hero: true },
  { label: 'ターゲット', key: 'target' },
  { label: 'インサイト', key: 'insight' },
  { label: '提供価値', key: 'value' },
  { label: '戦略詳細', key: 'detail' },
];

export function StrategyTab({ cmp }: { cmp: CompareResult }) {
  const { state, patch } = useStore();

  const bar = (
    <div className="flex items-center gap-2 text-xs text-text-sub flex-wrap">
      表示:
      <Select
        small
        fullWidth={false}
        value={state.stratView}
        onChange={(e) => patch({ stratView: e.target.value as 'grid' | 'single' })}
        options={[{ value: 'grid', label: '横並び比較' }, { value: 'single', label: '1件ずつ表示' }]}
      />
      {state.stratView === 'single' && (
        <>
          　動画を選択:
          <Select
            small
            fullWidth={false}
            value={String(state.cmpOne)}
            onChange={(e) => patch({ cmpOne: Number(e.target.value) })}
            options={cmp.results.map((r, i) => ({ value: String(i), label: `${i + 1}. ${r.meta.title}` }))}
          />
        </>
      )}
    </div>
  );

  if (state.stratView === 'single') {
    const i = cmp.results[state.cmpOne] ? state.cmpOne : 0;
    const r = cmp.results[i];
    return (
      <div className="tab-body flex flex-col gap-4">
        {bar}
        <div className="text-[15px] font-semibold text-text flex items-center gap-2"><VideoBadge index={i} />{r.meta.title}</div>
        <SingleStrategyTab res={r} />
      </div>
    );
  }

  return (
    <div className="tab-body flex flex-col gap-4">
      {bar}
      <Panel
        title="広告戦略の読み解き（動画比較）"
        sub="行＝項目／列＝動画。同じ項目を動画間で横並びで比較できます。"
        body={
          <div className="table-wrap overflow-x-auto rounded-panel border border-line">
            <div
              className="grid gap-px bg-line min-w-full"
              style={{ gridTemplateColumns: `minmax(120px,130px) repeat(${cmp.results.length}, minmax(200px,1fr))` }}
            >
              <div className="bg-fill p-3 sticky left-0 z-[2]" />
              {cmp.results.map((r, i) => (
                <div key={i} className="bg-fill p-3 font-semibold text-xs flex items-center gap-1.5">
                  <VideoBadge index={i} /> {r.meta.title}
                </div>
              ))}
              {STRAT_ROWS.map((row) => (
                <Fragment key={row.key}>
                  <div className="bg-fill p-3 font-semibold text-text-sub text-[11.5px] sticky left-0 z-[2]">{row.label}</div>
                  {cmp.results.map((r, i) => (
                    <div key={i} className={`bg-surface p-3 text-xs leading-[1.7] ${row.hero ? 'font-semibold text-[13px]' : ''}`}>
                      <Hl text={r.insights?.strategy?.[row.key]} />
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
