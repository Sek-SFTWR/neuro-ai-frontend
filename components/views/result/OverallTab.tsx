'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Bar } from '@/components/ui/Badges';
import { Insight } from '@/components/ui/Badges';
import { Panel } from '@/components/ui/Panel';
import { PersonaFilter } from '@/components/ui/PersonaFilter';
import { ScoreCell } from '@/components/ui/ScoreCell';
import { RadarChart } from '@/components/charts/RadarChart';
import { useStore } from '@/lib/store';
import { attrGroups, enabledLayers, evalsInLayer, personaById, shownEvals } from '@/lib/selectors';
import { AVG_COLOR, layerColor, mean } from '@/lib/palette';
import { axisAverage } from '@/lib/mock-data';
import type { EvaluationResult } from '@/lib/types';

type MatrixView = 'table' | 'card';

export function Legend({ res }: { res: EvaluationResult }) {
  const { state } = useStore();
  const attrs = attrGroups(res.personas).map((g) => g.attr);
  const items: { c: string; l: string }[] = [];
  if (!state.hideAvg) items.push({ c: AVG_COLOR, l: '平均' });
  enabledLayers(state, res).forEach((a) => items.push({ c: layerColor(a, attrs), l: `平均（${a}）` }));
  shownEvals(state, res).slice(0, 16).forEach((e) => {
    const p = personaById(state, e.personaId);
    if (p) items.push({ c: p.color, l: p.name });
  });

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11.5px] text-text-sub">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <i className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: it.c }} />
          {it.l}
        </span>
      ))}
    </div>
  );
}

function AxisBlock({ res, axis }: { res: EvaluationResult; axis: string }) {
  const { state } = useStore();
  const attrs = attrGroups(res.personas).map((g) => g.attr);
  const layers = enabledLayers(state, res);

  return (
    <div className="border border-line rounded-chip p-3 flex flex-col gap-2">
      <span className="text-[12.5px] font-semibold">{axis}</span>

      {!state.hideAvg && (() => {
        const a = axisAverage(res, axis);
        return (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-[84px] shrink-0 text-text-sub flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">平均</span>
            <span className="flex-1"><Bar pct={(a / 5) * 100} color={AVG_COLOR} /></span>
            <span className="min-w-6 text-right font-semibold">{a.toFixed(1)}</span>
          </div>
        );
      })()}

      {layers.map((attr) => {
        const evs = evalsInLayer(state, res, attr);
        if (!evs.length) return null;
        const v = axisAverage(res, axis, evs);
        const c = layerColor(attr, attrs);
        return (
          <div key={attr} className="flex items-center gap-2 text-[11px]">
            <span className="w-[84px] shrink-0 text-text-sub flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap" title={attr}>
              <i className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />{attr}
            </span>
            <span className="flex-1"><Bar pct={(v / 5) * 100} color={c} /></span>
            <span className="min-w-6 text-right font-semibold">{v.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AxisBlocks({ res }: { res: EvaluationResult }) {
  return (
    <div className="grid grid-cols-1 min-[621px]:grid-cols-2 min-[1101px]:grid-cols-3 gap-3">
      {res.axes.map((ax) => <AxisBlock key={ax} res={res} axis={ax} />)}
    </div>
  );
}

export function Matrix({ res, sortByScore, showReasons }: { res: EvaluationResult; sortByScore?: boolean; showReasons?: boolean }) {
  const { state } = useStore();
  const shown = shownEvals(state, res);
  const withAvg = shown.map((e) => ({ e, avg: mean(e.overall.map((o) => o.score)) }));
  if (sortByScore) withAvg.sort((a, b) => b.avg - a.avg);

  return (
    <div className="table-wrap overflow-x-auto rounded-panel border border-line">
      <table className="matrix text-[13px] min-w-full">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 whitespace-nowrap border-b border-line">ペルソナ ＼ 評価軸</th>
            {res.axes.map((a) => (
              <th key={a} className={`text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 whitespace-nowrap border-b border-line ${showReasons ? 'min-w-[190px]' : 'min-w-[110px]'}`}>{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withAvg.map(({ e }) => {
            const p = personaById(state, e.personaId);
            if (!p) return null;
            return (
              <tr key={e.personaId} className="transition-colors duration-180 hover:bg-surface-hover">
                <td className="py-3 px-3 border-b border-line align-top">
                  <span className="flex items-center gap-2 font-medium whitespace-nowrap"><Avatar persona={p} size="xs" />{p.name}</span>
                </td>
                {res.axes.map((ax) => {
                  const hit = e.overall.find((o) => o.axis === ax);
                  return (
                    <td key={ax} className={`py-3 px-3 border-b border-line align-top ${showReasons ? 'min-w-[190px]' : 'min-w-[110px]'}`}>
                      <ScoreCell score={hit ? hit.score : 0} max={5} comment={hit ? hit.comment : '—'} color={p.color} compact={!showReasons} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Same data as Matrix, one card per persona — every axis as a labelled bar,
    for readers who find a wide scrolling table harder to parse than a
    scannable grid. Mirrors the grid/list toggle on the Personas screen. */
function MatrixCards({ res, sortByScore }: { res: EvaluationResult; sortByScore?: boolean }) {
  const { state } = useStore();
  const shown = shownEvals(state, res);
  const withAvg = shown.map((e) => ({ e, avg: mean(e.overall.map((o) => o.score)) }));
  if (sortByScore) withAvg.sort((a, b) => b.avg - a.avg);

  return (
    <div className="grid gap-3 items-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {withAvg.map(({ e }) => {
        const p = personaById(state, e.personaId);
        if (!p) return null;
        return (
          <div key={e.personaId} className="bg-surface border border-line rounded-chip p-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Avatar persona={p} size="sm" />
              <span className="text-[13px] font-semibold truncate">{p.name}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {res.axes.map((ax) => {
                const hit = e.overall.find((o) => o.axis === ax);
                const score = hit ? hit.score : 0;
                return (
                  <div key={ax} className="flex items-center gap-2 text-[11px]">
                    <span className="w-[92px] shrink-0 text-text-sub truncate" title={ax}>{ax}</span>
                    <span className="flex-1"><Bar pct={(score / 5) * 100} color={p.color} /></span>
                    <span className="min-w-5 text-right font-semibold">{score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixViewToggle({ view, onChange }: { view: MatrixView; onChange: (v: MatrixView) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 bg-fill rounded-full p-0.5">
      <button type="button" aria-label="表形式" aria-pressed={view === 'table'} onClick={() => onChange('table')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'table' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
        <Icon name="list" size={15} />
      </button>
      <button type="button" aria-label="カード形式" aria-pressed={view === 'card'} onClick={() => onChange('card')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'card' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
        <Icon name="grid" size={15} />
      </button>
    </div>
  );
}

export function OverallTab({ res }: { res: EvaluationResult }) {
  const [sortByScore, setSortByScore] = useState(false);
  const [matrixView, setMatrixView] = useState<MatrixView>('table');
  const [showReasons, setShowReasons] = useState(false);

  return (
    <div className="tab-body flex flex-col gap-4">
      <PersonaFilter res={res} />
      <div className="grid grid-cols-1 min-[1101px]:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-4 items-start">
        <Panel
          title="評価軸レーダー（5点満点）"
          sub="選択中のペルソナ＋平均を重ねて表示"
          body={
            <>
              <div className="rounded-chip bg-fill p-3 relative" style={{ height: 360 }}><RadarChart res={res} /></div>
              <Legend res={res} />
              <Insight text={res.insights?.radar} />
            </>
          }
        />
        <Panel title="軸別スコア" body={<><Legend res={res} /><AxisBlocks res={res} /></>} />
      </div>
      <Panel
        title="評価根拠（ペルソナ×評価軸）"
        sub={
          matrixView === 'table'
            ? showReasons ? '各セルに点数（5点満点）と評価理由を表示します。横にスクロールできます。' : '各セルに点数（5点満点）を表示します。評価理由も見るには下のスイッチをオンにしてください。'
            : 'ペルソナごとのカードで軸別スコアを表示します。'
        }
        body={
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-xs text-text-sub cursor-pointer w-fit">
                  <input type="checkbox" checked={sortByScore} onChange={(e) => setSortByScore(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
                  平均スコアが高い順に並び替え
                </label>
                {matrixView === 'table' && (
                  <label className="flex items-center gap-2 text-xs text-text-sub cursor-pointer w-fit">
                    <input type="checkbox" checked={showReasons} onChange={(e) => setShowReasons(e.target.checked)} className="w-3.5 h-3.5 accent-accent" />
                    評価理由を表示
                  </label>
                )}
              </div>
              <MatrixViewToggle view={matrixView} onChange={setMatrixView} />
            </div>
            {matrixView === 'table' ? <Matrix res={res} sortByScore={sortByScore} showReasons={showReasons} /> : <MatrixCards res={res} sortByScore={sortByScore} />}
            <Insight text={res.insights?.matrix} />
          </>
        }
      />
    </div>
  );
}
