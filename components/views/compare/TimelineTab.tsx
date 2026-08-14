'use client';

import { Fragment } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Insight } from '@/components/ui/Badges';
import { Panel } from '@/components/ui/Panel';
import { ScoreCell } from '@/components/ui/ScoreCell';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { CombinedLineChart } from '@/components/charts/CombinedLineChart';
import { TimelineCards } from '@/components/views/result/TimelineCards';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { clock, mean, videoColor } from '@/lib/palette';
import { overallScore } from '@/lib/mock-data';
import { grad } from '@/lib/resultDisplay';
import type { CompareResult } from '@/lib/types';

function CombinedEvidence({ cmp, sec }: { cmp: CompareResult; sec: number }) {
  const { state } = useStore();
  const primary = cmp.results[0];

  return (
    <div className="table-wrap overflow-x-auto rounded-panel border border-line">
      <table className="matrix text-[13px] min-w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 whitespace-nowrap border-b border-line">
              {state.cmpViewMode === 'avg' ? '評価' : 'ペルソナ'}
            </th>
            {cmp.results.map((r, i) => {
              const sc = r.scenes[sec];
              return (
                <th key={i} className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line min-w-[190px]">
                  <span className="flex items-center gap-1.5"><VideoBadge index={i} /> {r.meta.title}</span>
                  <span className="text-text-mute font-normal block mt-0.5">{clock(sec)}　{sc ? sc.label : '—'}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {state.cmpViewMode === 'avg' ? (
            <tr>
              <td className="py-3 px-3 border-b border-line align-top"><span className="font-medium">全員平均</span></td>
              {cmp.results.map((r, i) => {
                const vals = r.evaluations.map((e) => e.timeline[sec]?.score).filter((v): v is number => v != null);
                if (!vals.length) return <td key={i} className="py-3 px-3 border-b border-line align-top text-xs text-text-sub">—</td>;
                const excerpt = r.evaluations.slice(0, 3)
                  .map((e) => e.timeline[sec]?.comment.replace(/\*\*/g, '').slice(0, 22))
                  .filter(Boolean).join(' / ');
                return (
                  <td key={i} className="py-3 px-3 border-b border-line align-top min-w-[190px]">
                    <ScoreCell score={Number(mean(vals).toFixed(1))} max={10} comment={excerpt} color={videoColor(i)} />
                  </td>
                );
              })}
            </tr>
          ) : (
            shownEvals(state, primary).map((pe) => {
              const p = personaById(state, pe.personaId);
              if (!p) return null;
              return (
                <tr key={pe.personaId} className="transition-colors duration-180 hover:bg-surface-hover">
                  <td className="py-3 px-3 border-b border-line align-top"><span className="flex items-center gap-2 font-medium whitespace-nowrap"><Avatar persona={p} size="xs" />{p.name}</span></td>
                  {cmp.results.map((r, i) => {
                    const e = r.evaluations.find((x) => x.personaId === pe.personaId);
                    const t = e?.timeline[sec];
                    if (!t) return <td key={i} className="py-3 px-3 border-b border-line align-top text-xs text-text-sub">—</td>;
                    return (
                      <td key={i} className="py-3 px-3 border-b border-line align-top min-w-[190px]">
                        <ScoreCell score={t.score} max={10} comment={t.comment} color={p.color} />
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <Insight text={cmp.cmpInsights.perSecond[sec]?.text} />
    </div>
  );
}

export function TimelineTab({ cmp }: { cmp: CompareResult }) {
  const { state, patch } = useStore();
  const maxDur = Math.max(...cmp.results.map((r) => r.meta.durationSec));

  return (
    <div className="tab-body flex flex-col gap-4">
      <Panel
        title="1秒ごとのタイムライン"
        body={cmp.results.map((r, i) => (
          <Fragment key={i}>
            <div className="text-[12.5px] font-semibold flex items-center gap-1.5"><VideoBadge index={i} />{r.meta.title}</div>
            <TimelineCards scenes={r.scenes} />
          </Fragment>
        ))}
      />

      <Panel
        title="1秒ごとのスコア推移"
        sub="色＝ペルソナ／記号の形＝動画"
        body={
          <>
            <div className="grid grid-cols-1 min-[240px]:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              {cmp.results.map((r, i) => (
                <div key={i} className="border border-line rounded-chip p-3 flex flex-col gap-2">
                  <div className="text-xs font-semibold flex items-center gap-1.5"><VideoBadge index={i} /><span className="truncate">{r.meta.title}</span></div>
                  <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">{overallScore(r)}</span><span className="text-[13px] text-text-sub">/100</span></div>
                </div>
              ))}
            </div>
            <div className={`rounded-chip p-3 relative ${state.lineStyle === 'now' ? '' : 'bg-fill'}`} style={{ height: 340, background: state.lineStyle === 'now' ? 'var(--chart-dark)' : undefined }}>
              <CombinedLineChart cmp={cmp} />
            </div>
            {cmp.results.map((r, i) => (
              <div key={i}>
                <div className="flex items-center gap-1.5 text-xs text-text-sub"><VideoBadge index={i} /><span className="truncate">{r.meta.title}</span></div>
                <div className="flex gap-[3px] overflow-x-auto pb-1.5 scroll-x">
                  {r.scenes.map((sc) => (
                    <span key={sc.sec} className="w-[34px] shrink-0 flex flex-col items-center gap-[3px]">
                      <span className="w-[34px] h-[22px] rounded-xs border border-dashed border-line block" style={{ background: grad(sc.sec) }} />
                      <span className="text-[9px] text-text-mute">{clock(sc.sec)}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <Insight text={cmp.cmpInsights.scoreTrend} />
          </>
        }
      />

      <Panel
        title="1秒ごとの評価根拠（動画×ペルソナ）"
        sub="秒を選ぶと、表示中の動画×ペルソナの評価を表示します。"
        body={
          <>
            <div className="flex flex-wrap gap-[5px]">
              {Array.from({ length: maxDur }, (_, s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patch({ selectedSec: s })}
                  className={`min-w-[42px] rounded-sm py-[5px] px-2 text-[11px] font-medium border transition-colors duration-180 ${
                    s === state.selectedSec ? 'bg-black-ms border-black-ms text-white font-semibold' : 'bg-surface border-line text-text-sub hover:bg-fill hover:text-text'
                  }`}
                >
                  {clock(s)}
                </button>
              ))}
            </div>
            <CombinedEvidence cmp={cmp} sec={state.selectedSec} />
          </>
        }
      />
    </div>
  );
}
