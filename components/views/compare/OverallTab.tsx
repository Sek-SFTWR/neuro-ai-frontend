'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Bar, Insight } from '@/components/ui/Badges';
import { Panel } from '@/components/ui/Panel';
import { LinkButton } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ScoreCell } from '@/components/ui/ScoreCell';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { CompareRadarChart } from '@/components/charts/CompareRadarChart';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { videoColor } from '@/lib/palette';
import { axisAverage } from '@/lib/mock-data';
import type { CompareResult } from '@/lib/types';

function AxisRow({ cmp, axis }: { cmp: CompareResult; axis: string }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const hasPersonaRows = state.cmpViewMode !== 'avg';

  return (
    <div className="border border-line rounded-chip p-3 flex flex-col gap-2">
      <span className="text-[12.5px] font-semibold">{axis}</span>
      {cmp.results.map((r, i) => {
        const v = axisAverage(r, axis);
        return (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="w-[84px] shrink-0 flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap" title={r.meta.title}>
              <VideoBadge index={i} />{r.meta.title.slice(0, 6)}
            </span>
            <span className="flex-1"><Bar pct={(v / 5) * 100} color={videoColor(i)} /></span>
            <span className="min-w-6 text-right font-semibold">{v.toFixed(1)}</span>
          </div>
        );
      })}
      {hasPersonaRows && (
        <>
          <LinkButton onClick={() => setOpen((o) => !o)}>{open ? 'ペルソナ別を隠す ▴' : 'ペルソナ別を表示 ▾'}</LinkButton>
          {open && cmp.results.map((r, i) => shownEvals(state, r).map((e) => {
            const p = personaById(state, e.personaId);
            if (!p) return null;
            const hit = e.overall.find((o) => o.axis === axis);
            const v = hit ? hit.score : 0;
            return (
              <div key={`${i}-${e.personaId}`} className="flex items-center gap-2 text-[11px]">
                <span className="w-[84px] shrink-0 flex items-center gap-1"><VideoBadge index={i} /><Avatar persona={p} size="xs" /></span>
                <span className="flex-1"><Bar pct={(v / 5) * 100} color={p.color} /></span>
                <span className="min-w-6 text-right font-semibold">{v}</span>
              </div>
            );
          }))}
        </>
      )}
    </div>
  );
}

function EvidenceMatrix({ cmp, showReasons }: { cmp: CompareResult; showReasons: boolean }) {
  const { state } = useStore();
  const primary = cmp.results[0];
  const colWidth = showReasons ? 'min-w-[190px]' : 'min-w-[110px]';

  if (state.cmpViewMode === 'avg') {
    return (
      <table className="matrix text-[13px] min-w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line">動画 ＼ 評価軸</th>
            {cmp.axes.map((a) => <th key={a} className={`text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line ${colWidth}`}>{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {cmp.results.map((r, i) => (
            <tr key={i} className="transition-colors duration-180 hover:bg-surface-hover">
              <td className="py-3 px-3 border-b border-line align-top"><span className="flex items-center gap-1.5 font-medium whitespace-nowrap"><VideoBadge index={i} />{r.meta.title}</span></td>
              {cmp.axes.map((ax) => {
                const v = axisAverage(r, ax);
                const excerpt = r.evaluations.slice(0, 3).map((e) => e.overall.find((o) => o.axis === ax)?.comment.replace(/\*\*/g, '').slice(0, 22)).filter(Boolean).join(' / ');
                return (
                  <td key={ax} className={`py-3 px-3 border-b border-line align-top ${colWidth}`}>
                    <ScoreCell score={Number(v.toFixed(1))} max={5} comment={excerpt} color={videoColor(i)} compact={!showReasons} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <table className="matrix text-[13px] min-w-full">
      <thead>
        <tr>
          <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line">ペルソナ</th>
          <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line">動画</th>
          {cmp.axes.map((a) => <th key={a} className={`text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line ${colWidth}`}>{a}</th>)}
        </tr>
      </thead>
      <tbody>
        {shownEvals(state, primary).map((pe, pIdx) => {
          const p = personaById(state, pe.personaId);
          if (!p) return null;
          const groupBg = pIdx % 2 === 1 ? 'bg-fill/40' : '';
          return cmp.results.map((r, i) => {
            const e = r.evaluations.find((x) => x.personaId === pe.personaId);
            // Heavier top border on the first row of each persona group (skip the very first
            // group) so the rowSpan cell's grouping reads unambiguously against the rows below it.
            const groupTop = i === 0 && pIdx > 0 ? 'border-t-2 border-t-line' : '';
            return (
              <tr key={`${pe.personaId}-${i}`} className={`transition-colors duration-180 hover:bg-surface-hover ${groupBg}`}>
                {i === 0 && (
                  <td rowSpan={cmp.results.length} className={`py-3 px-3 border-b border-line align-top ${groupTop}`}><span className="flex items-center gap-2 font-medium whitespace-nowrap"><Avatar persona={p} size="xs" />{p.name}</span></td>
                )}
                <td className={`py-3 px-3 border-b border-line align-top whitespace-nowrap ${groupTop}`}><VideoBadge index={i} /></td>
                {cmp.axes.map((ax) => {
                  const hit = e?.overall.find((o) => o.axis === ax);
                  return (
                    <td key={ax} className={`py-3 px-3 border-b border-line align-top ${colWidth} ${groupTop}`}>
                      <ScoreCell score={hit ? hit.score : 0} max={5} comment={hit ? hit.comment : '—'} color={p.color} compact={!showReasons} />
                    </td>
                  );
                })}
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}

export function OverallTab({ cmp }: { cmp: CompareResult }) {
  const { state, patch } = useStore();
  const [showReasons, setShowReasons] = useState(false);

  return (
    <div className="tab-body flex flex-col gap-4">
      <Panel
        title="評価軸レーダー（5点満点）"
        sub={state.cmpViewMode === 'avg' ? '各動画の平均を重ねて表示（記号の形＝動画）' : '動画×ペルソナを重ねて表示（記号の形＝動画）'}
        body={
          <>
            <div className="flex items-center gap-2 text-xs text-text-sub">
              レーダー表示:
              <Select
                small
                fullWidth={false}
                value={state.radarMode}
                onChange={(e) => patch({ radarMode: e.target.value as 'merged' | 'separate' })}
                options={[{ value: 'separate', label: '動画ごとに分割' }, { value: 'merged', label: '1つに集約' }]}
              />
            </div>
            {state.radarMode === 'separate' ? (
              <div className="grid grid-cols-1 min-[260px]:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
                {cmp.results.map((r, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="text-xs font-semibold flex items-center gap-1.5"><VideoBadge index={i} /><span className="truncate">{r.meta.title}</span></div>
                    <div className="rounded-chip bg-fill p-3 relative" style={{ height: 300 }}><CompareRadarChart cmp={cmp} videoIndex={i} /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-chip bg-fill p-3 relative" style={{ height: 400 }}><CompareRadarChart cmp={cmp} /></div>
            )}
            <Insight text={cmp.cmpInsights.radar} />
          </>
        }
      />

      <Panel
        title="軸別スコア"
        sub={state.cmpViewMode === 'avg' ? '記号の形＝動画（全員平均）' : '記号の形＝動画／丸＝ペルソナ'}
        body={<div className="grid grid-cols-1 min-[621px]:grid-cols-2 min-[1101px]:grid-cols-3 gap-3">{cmp.axes.map((ax) => <AxisRow key={ax} cmp={cmp} axis={ax} />)}</div>}
      />

      <Panel
        title={state.cmpViewMode === 'avg' ? '評価根拠（動画×評価軸／コメント抜粋）' : '評価根拠（動画×ペルソナ×評価軸）'}
        body={
          <>
            <label className="flex items-center gap-2 text-xs text-text-sub cursor-pointer w-fit">
              <input type="checkbox" checked={showReasons} onChange={(e) => setShowReasons(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
              評価理由を表示
            </label>
            <div className="table-wrap overflow-x-auto rounded-panel border border-line"><EvidenceMatrix cmp={cmp} showReasons={showReasons} /></div>
            <Insight text={cmp.cmpInsights.matrix} />
          </>
        }
      />
    </div>
  );
}
