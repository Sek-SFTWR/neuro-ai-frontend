'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { type TabItem } from '@/components/ui/Tabs';
import { StickyTabBar } from '@/components/ui/StickyTabBar';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/overlays/Toast';
import { useKeyChanged } from '@/lib/useKeyChanged';
import { overallScore } from '@/lib/mock-data';
import { StrategyTab } from './StrategyTab';
import { TimelineTab } from './TimelineTab';
import { OverallTab } from './OverallTab';
import { PosNegTab } from './PosNegTab';
import { PlaybackTab } from './PlaybackTab';
import type { EvaluationResult, ResultTab } from '@/lib/types';
import { MODELS, MODES, spliceLabel } from '@/lib/palette';

export const RESULT_TABS: TabItem<ResultTab>[] = [
  { key: 'strategy', label: '広告戦略の読み解き', icon: 'compass' },
  { key: 'timeline', label: '1秒ごとの評価', icon: 'trending' },
  { key: 'overall', label: '軸別評価', icon: 'radar' },
  { key: 'posneg', label: 'ポジネガ', icon: 'messageSquare' },
  { key: 'playback', label: '再生＆連動', icon: 'monitor' },
];

interface Actions {
  exporting: boolean;
  onSave: () => void;
  onExport: () => void;
}

function Spinner() {
  return <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin-fast" />;
}

function ResultHeader({ res, exporting, onSave, onExport }: { res: EvaluationResult } & Actions) {
  const m = MODES[res.mode];

  return (
    <div className="flex items-center gap-3 bg-surface rounded-card p-4 shadow-card flex-wrap">
      <span className="w-[88px] h-14 rounded-chip bg-fill flex items-center justify-center text-text-mute overflow-hidden shrink-0">
        <Icon name="play" size={20} />
      </span>
      <span className="flex-1 min-w-[220px]">
        <span className="block text-[11px] font-semibold text-accent tracking-[0.04em] uppercase">{m.label}</span>
        <span className="block text-base font-semibold text-text leading-[1.4]">{res.meta.title}</span>
        <span className="block text-xs text-text-sub mt-0.5">全{res.meta.durationSec}秒 ・ {spliceLabel(res.meta.spliceSec)}ごと分析 ・ {MODELS[res.meta.model].short} ・ {res.personas.length}名のペルソナ</span>
      </span>
      <span className="flex items-center gap-2.5 bg-fill rounded-chip py-1.5 px-3.5 shrink-0" title="全ペルソナ・全秒の平均から算出した総合スコア">
        <span className="text-[10.5px] font-semibold text-text-sub whitespace-nowrap">総合スコア</span>
        <span className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold tracking-[-0.02em] text-text leading-none">{overallScore(res)}</span>
          <span className="text-[11px] text-text-sub">/100</span>
        </span>
      </span>
      <span className="flex items-center gap-2">
        <Button size="sm" onClick={onSave}><Icon name="save" size={14} />履歴を更新保存</Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          {exporting ? <Spinner /> : <Icon name="download" size={14} />}
          {exporting ? '作成中…' : 'PPTX出力'}
        </Button>
      </span>
    </div>
  );
}

/** Who am I reading — the header card's three identifying bits at one line's height. */
function DockedIdentity({ res }: { res: EvaluationResult }) {
  return (
    <span className="flex items-center gap-2 min-w-0 pr-3">
      <span className="w-7 h-7 rounded-sm bg-fill flex items-center justify-center text-text-mute shrink-0">
        <Icon name="play" size={13} />
      </span>
      <span className="text-[13px] font-semibold text-text truncate">{res.meta.title}</span>
      <span className="flex items-baseline gap-0.5 bg-fill rounded-chip py-1 px-2.5 shrink-0" title="総合スコア">
        <span className="text-[13px] font-bold tracking-[-0.02em] text-text leading-none">{overallScore(res)}</span>
        <span className="text-[10px] text-text-sub">/100</span>
      </span>
    </span>
  );
}

/** The header card's actions, squared off — settings stays labelled because it
    is the one the user came looking for. */
function DockedActions({ onOpenSettings, exporting, onSave, onExport }: { onOpenSettings: () => void } & Actions) {
  return (
    <span className="flex items-center gap-2 pl-3 pr-1">
      <Button variant="outline" size="sm" onClick={onOpenSettings}>
        <Icon name="sliders" size={14} />設定を編集
      </Button>
      <IconButton label="履歴を更新保存" onClick={onSave}><Icon name="save" size={14} /></IconButton>
      <IconButton label="PPTX出力" onClick={onExport}>{exporting ? <Spinner /> : <Icon name="download" size={14} />}</IconButton>
    </span>
  );
}

export function ResultView({ res, onOpenSettings }: { res: EvaluationResult; onOpenSettings: () => void }) {
  const { state, patch } = useStore();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const tabKey = `${state.resultTab}${res.id}`;
  const tabChanged = useKeyChanged(tabKey);

  /* Held here, not in either bar: the header card and the docked bar both show
     the export button and must not disagree about whether it is running. */
  function onSave() {
    toast.show('履歴を更新保存しました');
  }
  function onExport() {
    if (exporting) return;
    setExporting(true);
    setTimeout(() => { setExporting(false); toast.show('PPTXを作成しました'); }, 1200);
  }
  const actions: Actions = { exporting, onSave, onExport };

  let body: React.ReactNode;
  switch (state.resultTab) {
    case 'timeline': body = <TimelineTab res={res} />; break;
    case 'overall': body = <OverallTab res={res} />; break;
    case 'posneg': body = <PosNegTab res={res} />; break;
    case 'playback': body = <PlaybackTab res={res} />; break;
    default: body = <StrategyTab res={res} />;
  }

  return (
    <>
      <ResultHeader res={res} {...actions} />
      <StickyTabBar
        items={RESULT_TABS}
        activeKey={state.resultTab}
        onChange={(k) => patch({ resultTab: k })}
        lead={<DockedIdentity res={res} />}
        actions={<DockedActions onOpenSettings={onOpenSettings} {...actions} />}
      >
        <div className={tabChanged ? 'tab-enter' : ''}>{body}</div>
      </StickyTabBar>
    </>
  );
}
