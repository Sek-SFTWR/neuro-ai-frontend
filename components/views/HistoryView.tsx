'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Button, LinkButton } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Input';
import { Empty } from '@/components/ui/Empty';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { useStore } from '@/lib/store';
import { useActions } from '@/lib/actions';
import { useConfirm, usePromptModal } from '@/components/overlays/Confirm';
import { useToast } from '@/components/overlays/Toast';
import { MODE_ORDER, MODES, STATUS, STATUS_ORDER } from '@/lib/palette';
import { AxesProgress, Badges, Due, People, Title } from './history/CardContent';
import type { HistoryEntry, ModeKey, Persona, StatusKey } from '@/lib/types';

/* 'custom' is the true default — the natural, drag-reorderable order — kept
   distinct from 'savedAt_desc' so selecting an explicit sort (including
   "newest first") doesn't silently re-sort on every render and mask drag
   reordering underneath it. */
type SortKey = 'custom' | 'savedAt_desc' | 'savedAt_asc' | 'priority' | 'due';
type HistoryViewMode = 'list' | 'grid';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'custom', label: '並び順（ドラッグで変更）' },
  { value: 'savedAt_desc', label: '保存日時（新しい順）' },
  { value: 'savedAt_asc', label: '保存日時（古い順）' },
  { value: 'priority', label: '優先度（高い順）' },
  { value: 'due', label: '期限（近い順）' },
];

const PRIORITY_RANK: Record<string, number> = { 高: 0, 中: 1, 低: 2 };

interface CardProps {
  h: HistoryEntry;
  axesTotal: number;
  personas: Persona[];
  checked: boolean;
  onCheck: (v: boolean) => void;
  onView: () => void;
  onRename: () => void;
  onDelete: () => void;
  dragHandlers: React.HTMLAttributes<HTMLElement>;
  isDragging: boolean;
  draggable: boolean;
}

const DRAG_HINT = '絞り込み・並べ替え中はドラッグでの並び替えはできません。既定の並び順に戻すと再び有効になります。';

function Grip({ draggable }: { draggable: boolean }) {
  return (
    <span
      className={`flex shrink-0 ${draggable ? 'text-text-mute cursor-grab active:cursor-grabbing' : 'text-text-mute/40 cursor-not-allowed'}`}
      title={draggable ? 'ドラッグで並び替え' : DRAG_HINT}
    >
      <Icon name="grip" size={15} />
    </span>
  );
}

function Actions({ onView, onRename, onDelete }: Pick<CardProps, 'onView' | 'onRename' | 'onDelete'>) {
  return (
    <>
      <LinkButton className="flex flex-row items-center gap-1" onClick={onView}><Icon name="eye" size={13} />表示</LinkButton>
      <LinkButton className="flex flex-row items-center gap-1" onClick={onRename}><Icon name="pencil" size={13} />名称変更</LinkButton>
      <LinkButton className="flex flex-row items-center gap-1" danger onClick={onDelete}><Icon name="trash" size={13} />削除</LinkButton>
    </>
  );
}

/** List view. Same information as the card, but laid out along the row so the
    list stays scannable — the axes bar, due date and people cluster to the
    right and drop off progressively as the viewport narrows. */
function HistoryRow({
  h, axesTotal, personas, checked, onCheck, onView, onRename, onDelete, dragHandlers, isDragging, draggable,
}: CardProps) {
  return (
    <div
      {...(draggable ? dragHandlers : {})}
      draggable={draggable}
      className={`flex items-center gap-3 bg-surface rounded-panel py-3 px-4 shadow-card transition-[background-color,opacity] duration-180 hover:bg-surface-hover ${isDragging ? 'opacity-40' : ''}`}
    >
      <Grip draggable={draggable} />
      <Checkbox aria-label="この履歴を選択" checked={checked} onChange={(e) => onCheck(e.target.checked)} />

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Title h={h} />
        <Badges h={h} />
      </div>

      <div className="hidden min-[1100px]:flex w-[190px] shrink-0"><AxesProgress h={h} axesTotal={axesTotal} /></div>
      <div className="hidden min-[900px]:flex shrink-0"><Due h={h} /></div>
      <div className="hidden min-[1280px]:flex shrink-0"><People h={h} personas={personas} spread={false} /></div>

      <span className="flex gap-1 shrink-0"><Actions onView={onView} onRename={onRename} onDelete={onDelete} /></span>
    </div>
  );
}

/** Grid view — the old dashboard board card, with the drag handle, selection
    checkbox and row actions the board never had. */
function HistoryCard({
  h, axesTotal, personas, checked, onCheck, onView, onRename, onDelete, dragHandlers, isDragging, draggable,
}: CardProps) {
  return (
    <article
      {...(draggable ? dragHandlers : {})}
      draggable={draggable}
      className={`bg-surface rounded-card shadow-card p-4 flex flex-col gap-3 transition-[outline,opacity] duration-180 ${checked ? 'outline outline-2 outline-accent -outline-offset-2' : ''} ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Grip draggable={draggable} />
        <span className="flex-1" />
        <Checkbox aria-label="この履歴を選択" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Badges h={h} />
        <Title h={h} clamp />
      </div>

      <AxesProgress h={h} axesTotal={axesTotal} />

      <div className="flex flex-col gap-2 pt-2 border-t border-line">
        <Due h={h} />
        <People h={h} personas={personas} />
      </div>

      <div className="flex gap-1 pt-2.5 border-t border-line mt-auto">
        <Actions onView={onView} onRename={onRename} onDelete={onDelete} />
      </div>
    </article>
  );
}

export function HistoryView() {
  const { state, update } = useStore();
  const { openHistory } = useActions();
  const toast = useToast();
  const confirm = useConfirm();
  const promptModal = usePromptModal();
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<string[]>(state.history.map((h) => h.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  /* Grid first: the card carries the axes bar, due date and people that the row
     drops at narrow widths, so it is the fuller read of a result. */
  const [view, setView] = useState<HistoryViewMode>('grid');

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeKey | ''>('');
  const [statusFilter, setStatusFilter] = useState<StatusKey | ''>('');
  const [sort, setSort] = useState<SortKey>('custom');

  useEffect(() => {
    setOrder(state.history.map((h) => h.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.history.length]);

  const axesTotal = state.axes.length;
  const byId = new Map(state.history.map((h) => [h.id, h]));
  const naturalRows = order.map((id) => byId.get(id)).filter((h): h is HistoryEntry => !!h);

  const filterActive = !!search || !!modeFilter || !!statusFilter;
  const customSort = sort !== 'custom';
  /* Drag reorder only makes sense against the saved order — once a filter or
     an explicit sort is applied, the visible order isn't "the" order. */
  const reorderable = !filterActive && !customSort;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = naturalRows.filter((h) => {
      if (modeFilter && h.mode !== modeFilter) return false;
      if (statusFilter && h.status !== statusFilter) return false;
      if (q && !h.title.toLowerCase().includes(q)) return false;
      return true;
    });
    // 'custom' applies no transform at all — it IS the drag-reordered order.
    if (sort === 'savedAt_asc') list = list.slice().sort((a, b) => (a.savedAt < b.savedAt ? -1 : 1));
    else if (sort === 'savedAt_desc') list = list.slice().sort((a, b) => (a.savedAt > b.savedAt ? -1 : 1));
    else if (sort === 'priority') list = list.slice().sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    else if (sort === 'due') list = list.slice().sort((a, b) => (a.due < b.due ? -1 : 1));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalRows, search, modeFilter, statusFilter, sort]);

  const selectedIds = Object.keys(selection).filter((k) => selection[k]);

  async function rename(h: HistoryEntry) {
    const trimmed = await promptModal({ title: '名称を変更', label: '新しい名称', defaultValue: h.title, confirmLabel: '変更する' });
    if (!trimmed) return;
    update((s) => ({ ...s, history: s.history.map((x) => (x.id === h.id ? { ...x, title: trimmed } : x)) }));
    toast.show('名称を変更しました');
  }

  async function remove(id: string) {
    if (!(await confirm({ title: '履歴を削除', message: 'この履歴を削除しますか？（元に戻せません）', danger: true }))) return;
    update((s) => ({ ...s, history: s.history.filter((x) => x.id !== id) }));
    setSelection((s) => { const n = { ...s }; delete n[id]; return n; });
    toast.show('履歴を削除しました');
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm({ title: '履歴を削除', message: `選択した${selectedIds.length}件を削除しますか？（元に戻せません）`, danger: true }))) return;
    update((s) => ({ ...s, history: s.history.filter((h) => !selectedIds.includes(h.id)) }));
    setSelection({});
    toast.show(`${selectedIds.length}件の履歴を削除しました`);
  }

  function dragHandlersFor(id: string): React.HTMLAttributes<HTMLElement> {
    return {
      onDragStart: () => setDraggingId(id),
      onDragEnd: () => {
        setDraggingId(null);
        update((s) => ({ ...s, history: order.map((oid) => byId.get(oid)!).filter(Boolean) }));
        toast.show('並び順を保存しました');
      },
      onDragOver: (ev) => {
        ev.preventDefault();
        if (!draggingId || draggingId === id) return;
        setOrder((prev) => {
          const from = prev.indexOf(draggingId);
          const to = prev.indexOf(id);
          if (from < 0 || to < 0 || from === to) return prev;
          const next = prev.slice();
          next.splice(from, 1);
          next.splice(to, 0, draggingId);
          return next;
        });
      },
    };
  }

  if (!state.history.length) {
    return (
      <div className="screen flex flex-col gap-6">
        <PageHeader
          title="実行履歴"
          sub="スプレッドシートに保存された評価履歴です。"
          actions={<Button onClick={() => toast.show('履歴を更新しました')}><Icon name="refresh" size={15} />更新</Button>}
        />
        <Empty icon="clock" title="まだ履歴がありません" sub="YouTube評価・動画ファイル評価を実行すると、自動で履歴に保存されます。" />
      </div>
    );
  }

  return (
    <div className="screen flex flex-col gap-6">
      <PageHeader
        title="実行履歴"
        sub={`保存された評価履歴 ${state.history.length}件。「表示」で過去の結果を再表示します。`}
        actions={<Button onClick={() => toast.show('履歴を更新しました')}><Icon name="refresh" size={15} />更新</Button>}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="タイトルで検索" className="flex-1" />
          {filterActive && <span className="text-xs text-text-sub whitespace-nowrap">{rows.length}件ヒット</span>}
          <div className="inline-flex items-center gap-0.5 bg-fill rounded-full p-0.5 shrink-0">
            <button type="button" aria-label="カード表示" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'grid' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
              <Icon name="grid" size={15} />
            </button>
            <button type="button" aria-label="一覧表示" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'list' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
              <Icon name="list" size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[620px]:grid-cols-3 gap-2">
          <Select
            small
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as ModeKey | '')}
            options={[{ value: '', label: 'すべてのモード' }, ...MODE_ORDER.map((k) => ({ value: k, label: MODES[k].short }))]}
          />
          <Select
            small
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusKey | '')}
            options={[{ value: '', label: 'すべてのステータス' }, ...STATUS_ORDER.map((k) => ({ value: k, label: STATUS[k].label }))]}
          />
          <Select small value={sort} onChange={(e) => setSort(e.target.value as SortKey)} options={SORT_OPTIONS} />
        </div>
      </div>

      <div className="flex items-center gap-3 px-0.5 text-xs text-text-sub">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={rows.length > 0 && selectedIds.length === rows.length}
            onChange={(e) => setSelection(e.target.checked ? Object.fromEntries(rows.map((h) => [h.id, true])) : {})}
          />
          すべて選択
        </label>
        <span>{selectedIds.length}件選択中</span>
        <span className="flex-1" />
        <Button variant="danger" size="sm" disabled={!selectedIds.length} onClick={bulkDelete}>
          <Icon name="trash" size={14} />
          {selectedIds.length ? `選択した${selectedIds.length}件を削除` : '選択した履歴を削除'}
        </Button>
      </div>

      {!rows.length ? (
        <Empty icon="clock" title="該当する履歴が見つかりません" sub="検索条件やフィルタを変更してください。" />
      ) : view === 'list' ? (
        <div className="flex flex-col gap-2">
          {rows.map((h) => (
            <HistoryRow
              key={h.id}
              h={h}
              axesTotal={axesTotal}
              personas={state.personas}
              checked={!!selection[h.id]}
              onCheck={(v) => setSelection((s) => ({ ...s, [h.id]: v }))}
              onView={() => openHistory(h.id)}
              onRename={() => rename(h)}
              onDelete={() => remove(h.id)}
              dragHandlers={dragHandlersFor(h.id)}
              isDragging={draggingId === h.id}
              draggable={reorderable}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {rows.map((h) => (
            <HistoryCard
              key={h.id}
              h={h}
              axesTotal={axesTotal}
              personas={state.personas}
              checked={!!selection[h.id]}
              onCheck={(v) => setSelection((s) => ({ ...s, [h.id]: v }))}
              onView={() => openHistory(h.id)}
              onRename={() => rename(h)}
              onDelete={() => remove(h.id)}
              dragHandlers={dragHandlersFor(h.id)}
              isDragging={draggingId === h.id}
              draggable={reorderable}
            />
          ))}
        </div>
      )}
    </div>
  );
}
