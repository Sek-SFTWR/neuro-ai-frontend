'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { type TabItem } from '@/components/ui/Tabs';
import { StickyTabBar } from '@/components/ui/StickyTabBar';
import { Select } from '@/components/ui/Select';
import { PersonaFilter } from '@/components/ui/PersonaFilter';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { PlaybackTab } from '@/components/views/result/PlaybackTab';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/overlays/Toast';
import { useKeyChanged } from '@/lib/useKeyChanged';
import { MODES } from '@/lib/palette';
import { SummaryTab } from './SummaryTab';
import { StrategyTab } from './StrategyTab';
import { TimelineTab } from './TimelineTab';
import { OverallTab } from './OverallTab';
import { PosNegTab } from './PosNegTab';
import type { CompareResult, CompareTab as CompareTabKey } from '@/lib/types';

const COMPARE_TABS: TabItem<CompareTabKey>[] = [
  { key: 'summary', label: '比較サマリー', icon: 'barChart' },
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

function CompareHeader({ cmp, exporting, onSave, onExport }: { cmp: CompareResult } & Actions) {
  const m = MODES[cmp.mode];

  return (
    <>
      <div className="flex items-center gap-3 bg-surface rounded-card p-4 shadow-card flex-wrap">
        <span className="w-[88px] h-14 rounded-chip bg-fill flex items-center justify-center text-text-mute shrink-0"><Icon name="columns" size={20} /></span>
        <span className="flex-1 min-w-[220px]">
          <span className="block text-[11px] font-semibold text-accent tracking-[0.04em] uppercase">{m.label}</span>
          <span className="block text-base font-semibold text-text leading-[1.4]">{cmp.results.length}本の動画を比較</span>
          <span className="block text-xs text-text-sub mt-0.5">{cmp.results.length}本 ・ {cmp.personas.length}名のペルソナ ・ 評価軸{cmp.axes.length}件</span>
        </span>
        <span className="flex items-center gap-2">
          <Button size="sm" onClick={onSave}><Icon name="save" size={14} />履歴を更新保存</Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            {exporting ? <Spinner /> : <Icon name="download" size={14} />}
            {exporting ? '作成中…' : 'PPTX出力'}
          </Button>
        </span>
      </div>
      <div className="h-3" />
      <div className="flex flex-wrap items-center gap-2.5">
        {cmp.results.map((r, i) => (
          <span key={i} className="flex items-center gap-2 bg-fill rounded-chip py-1.5 px-3 text-xs min-w-0 max-w-full">
            <VideoBadge index={i} />
            <span className="truncate">{r.meta.title}</span>
          </span>
        ))}
      </div>
    </>
  );
}

function Selector({ cmp }: { cmp: CompareResult }) {
  const { state, patch } = useStore();
  const tab = state.compareTab;
  if (tab === 'summary' || tab === 'strategy' || tab === 'posneg') return null;

  if (tab === 'playback') {
    return (
      <div className="flex items-center gap-2 text-xs text-text-sub">
        動画を選択:
        <Select
          small
          fullWidth={false}
          value={String(state.cmpOne)}
          onChange={(e) => patch({ cmpOne: Number(e.target.value) })}
          options={cmp.results.map((r, i) => ({ value: String(i), label: `${i + 1}. ${r.meta.title}` }))}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-text-sub">
        表示:
        <Select
          small
          fullWidth={false}
          value={state.cmpViewMode}
          onChange={(e) => patch({ cmpViewMode: e.target.value as 'persona' | 'avg' })}
          options={[{ value: 'persona', label: 'ペルソナごと' }, { value: 'avg', label: '平均' }]}
        />
      </div>
      {state.cmpViewMode === 'persona' && <PersonaFilter res={cmp.results[0]} />}
    </div>
  );
}

/** Which comparison am I reading — the header card's identity at one line's height. */
function DockedIdentity({ cmp }: { cmp: CompareResult }) {
  return (
    <span className="flex items-center gap-2 min-w-0 pr-3">
      <span className="w-7 h-7 rounded-sm bg-fill flex items-center justify-center text-text-mute shrink-0">
        <Icon name="columns" size={13} />
      </span>
      <span className="text-[13px] font-semibold text-text truncate">{cmp.results.length}本の動画を比較</span>
    </span>
  );
}

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

export function CompareView({ cmp, onOpenSettings }: { cmp: CompareResult; onOpenSettings: () => void }) {
  const { state, patch } = useStore();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const tabKey = `${state.compareTab}${cmp.id}`;
  const tabChanged = useKeyChanged(tabKey);

  /* Held here so the header card and the docked bar cannot disagree about
     whether the export is running. */
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
  switch (state.compareTab) {
    case 'strategy': body = <StrategyTab cmp={cmp} />; break;
    case 'timeline': body = <TimelineTab cmp={cmp} />; break;
    case 'overall': body = <OverallTab cmp={cmp} />; break;
    case 'posneg': body = <PosNegTab cmp={cmp} />; break;
    case 'playback': body = <PlaybackTab res={cmp.results[state.cmpOne] || cmp.results[0]} />; break;
    default: body = <SummaryTab cmp={cmp} />;
  }

  return (
    <>
      <CompareHeader cmp={cmp} {...actions} />
      <StickyTabBar
        items={COMPARE_TABS}
        activeKey={state.compareTab}
        onChange={(k) => patch({ compareTab: k })}
        lead={<DockedIdentity cmp={cmp} />}
        actions={<DockedActions onOpenSettings={onOpenSettings} {...actions} />}
      >
        <Selector cmp={cmp} />
        <div className={tabChanged ? 'tab-enter' : ''}>{body}</div>
      </StickyTabBar>
    </>
  );
}
