'use client';

import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Insight } from '@/components/ui/Badges';
import { PersonaFilter } from '@/components/ui/PersonaFilter';
import { ScoreCell } from '@/components/ui/ScoreCell';
import { Select } from '@/components/ui/Select';
import { LineChart } from '@/components/charts/LineChart';
import { TimelineCards } from './TimelineCards';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { personaAverage } from '@/lib/mock-data';
import { clock, mean } from '@/lib/palette';
import { grad } from '@/lib/resultDisplay';
import { useToast } from '@/components/overlays/Toast';
import type { EvaluationResult } from '@/lib/types';

function ScoreSummary({ res }: { res: EvaluationResult }) {
  const { state } = useStore();
  const shown = shownEvals(state, res);
  const all: number[] = [];
  shown.forEach((e) => e.timeline.forEach((t) => all.push(t.score)));

  return (
    <div className="flex flex-col gap-2.5 bg-fill rounded-chip py-3 px-4">
      <span className="flex items-baseline gap-1">
        <span className="text-xs text-text-sub mr-2 self-center">全体スコア</span>
        <span className="text-[32px] font-bold tracking-[-0.02em]">{Math.round(mean(all) * 10)}</span>
        <span className="text-[13px] text-text-sub">/100</span>
      </span>
      <div className="flex gap-1.5 overflow-x-auto scroll-x pb-1 -mb-1">
        {shown.map((e) => {
          const p = personaById(state, e.personaId);
          if (!p) return null;
          return (
            <span key={e.personaId} className="inline-flex items-center gap-1.5 bg-surface rounded-full py-1 pr-2.5 pl-1 text-xs font-medium shadow-card shrink-0">
              <Avatar persona={p} size="xs" />
              {p.name}
              <span className="font-bold" style={{ color: p.color }}>{personaAverage(e).toFixed(1)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Strip({ res }: { res: EvaluationResult }) {
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1.5 scroll-x">
      {res.scenes.map((sc) => (
        <span key={sc.sec} className="w-[34px] shrink-0 flex flex-col items-center gap-[3px] relative">
          <span className="w-[34px] h-[22px] rounded-xs overflow-hidden bg-fill block" style={{ background: sc.image ? '#000' : grad(sc.sec) }} />
          <span className="text-[9px] text-text-mute">{clock(sc.sec)}</span>
        </span>
      ))}
    </div>
  );
}

function Evidence({ res, sec }: { res: EvaluationResult; sec: number }) {
  const { state } = useStore();
  const sc = res.scenes[sec];
  if (!sc) return null;
  const shown = shownEvals(state, res);
  const ins = res.insights?.perSecond?.[sec];

  return (
    <>
      <div className="flex items-center gap-2 bg-fill rounded-chip py-2.5 px-3 text-[13px] font-medium">
        <span className="min-w-5 text-center rounded-full py-[3px] px-[7px] text-[11px] font-semibold bg-fill text-text-sub">{clock(sec)}</span>
        {clock(sec)}時点　{sc.label}
      </div>
      {shown.length ? (
        shown.map((e) => {
          const p = personaById(state, e.personaId);
          if (!p) return null;
          const t = e.timeline[sec];
          return (
            <div key={e.personaId} className="flex items-start gap-3 py-[11px] border-b border-line last:border-b-0">
              <Avatar persona={p} size="sm" />
              <span className="text-[12.5px] font-semibold min-w-[104px] pt-0.5">{p.name}</span>
              <span className="flex-1"><ScoreCell score={t.score} max={10} comment={t.comment} color={p.color} /></span>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-text-sub">表示するペルソナがありません。</p>
      )}
      <Insight text={ins?.text} />
    </>
  );
}

export function TimelineTab({ res }: { res: EvaluationResult }) {
  const { state, patch } = useStore();
  const toast = useToast();

  return (
    <div className="tab-body flex flex-col gap-4">
      <Panel
        title="1秒ごとのタイムライン"
        body={
          <>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => toast.show('連番ファイル（001.jpg → 0:00）を各秒に割り当てます')}>
                <Icon name="folder" size={14} />フォルダから画像を一括登録
              </Button>
              <Button size="sm" onClick={() => toast.show('NeuroAIアテンション解析には NEUROAI_API_KEY が必要です', true)}>
                <Icon name="brain" size={14} />フォルダからNeuroAIで評価を行い登録
              </Button>
            </div>
            <p className="text-xs text-text-sub">
              連番ファイル（001.jpg → 0:00、002.jpg → 0:01 …）を各秒に割り当て、完了後に履歴を更新保存します。NeuroAI解析には NEUROAI_API_KEY が必要です。
            </p>
            <TimelineCards scenes={res.scenes} />
          </>
        }
      />

      <PersonaFilter res={res} />

      <Panel
        title="1秒ごとのスコア推移"
        body={
          <>
            <ScoreSummary res={res} />
            <div className="flex items-center gap-2 text-xs text-text-sub">
              グラフデザイン:
              <Select
                small
                fullWidth={false}
                value={state.lineStyle}
                onChange={(e) => patch({ lineStyle: e.target.value as 'now' | 'old' })}
                options={[
                  { value: 'now', label: '今のデザイン（ダーク／グロー）' },
                  { value: 'old', label: '過去のデザイン（シンプル）' },
                ]}
              />
            </div>
            <div className={`rounded-chip p-3 relative h-[300px] ${state.lineStyle === 'now' ? '' : 'bg-fill'}`} style={state.lineStyle === 'now' ? { background: 'var(--chart-dark)' } : undefined}>
              <LineChart res={res} />
            </div>
            <Strip res={res} />
            <Insight text={res.insights?.scoreTrend} />
          </>
        }
      />

      <Panel
        title="1秒ごとの評価根拠（全ペルソナ）"
        sub="秒数を選ぶと、その時間の全ペルソナの評価を並べて表示します。"
        body={
          <>
            <div className="flex flex-wrap gap-[5px]">
              {res.scenes.map((sc) => (
                <button
                  key={sc.sec}
                  type="button"
                  onClick={() => patch({ selectedSec: sc.sec })}
                  className={`min-w-[42px] rounded-sm py-[5px] px-2 text-[11px] font-medium border transition-colors duration-180 ${
                    sc.sec === state.selectedSec ? 'bg-black-ms border-black-ms text-white font-semibold' : 'bg-surface border-line text-text-sub hover:bg-fill hover:text-text'
                  }`}
                >
                  {clock(sc.sec)}
                </button>
              ))}
            </div>
            <Evidence res={res} sec={state.selectedSec} />
          </>
        }
      />
    </div>
  );
}
