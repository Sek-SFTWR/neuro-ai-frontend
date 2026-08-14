'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { AttrChip } from '@/components/ui/AttrChip';
import { Button, LinkButton } from '@/components/ui/Button';
import { Collapse } from '@/components/ui/Collapse';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/Input';
import { Empty } from '@/components/ui/Empty';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { useStore } from '@/lib/store';
import { useConfirm } from '@/components/overlays/Confirm';
import { useModal } from '@/components/overlays/Modal';
import { useToast } from '@/components/overlays/Toast';
import { attrGroups } from '@/lib/selectors';
import { attrOf, NO_ATTR, PERSONA_COLORS } from '@/lib/palette';
import type { Persona } from '@/lib/types';

type ViewMode = 'grid' | 'list';

interface DragProps {
  draggable: boolean;
  isDragging: boolean;
  dragHandlers: React.HTMLAttributes<HTMLElement>;
}

/** The grip handle shared by both card and row layouts — same affordance,
    same disabled-while-filtered tooltip, as the drag-reorder already
    established on the History and Axes screens. */
function DragGrip({ draggable }: { draggable: boolean }) {
  return (
    <span
      className={`flex items-center justify-center shrink-0 p-1 ${draggable ? 'text-text-mute cursor-grab active:cursor-grabbing' : 'text-text-mute/40 cursor-not-allowed'}`}
      title={draggable ? 'ドラッグで並び替え' : '検索・属性フィルタ中はドラッグでの並び替えはできません。解除すると再び有効になります。'}
    >
      <Icon name="grip" size={15} />
    </span>
  );
}

/* ======================================================================
   Card (grid view)
   ====================================================================== */

function PersonaCard({
  p, checked, onCheck, onEdit, onDelete, draggable, isDragging, dragHandlers,
}: {
  p: Persona; checked: boolean; onCheck: (v: boolean) => void; onEdit: () => void; onDelete: () => void;
} & DragProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <article
      {...(draggable ? dragHandlers : {})}
      draggable={draggable}
      className={`group bg-surface rounded-card shadow-card p-4 flex flex-col gap-3 transition-[outline,transform,opacity] duration-180 hover:-translate-y-0.5 ${
        checked ? 'outline outline-2 outline-accent -outline-offset-2' : ''
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar persona={p} size="lg" ring className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold truncate leading-tight">{p.name}</div>
        </div>
        <div className="self-start shrink-0 -mt-1 -mr-1 flex items-center gap-0.5">
          <DragGrip draggable={draggable} />
          <label
            className={`inline-flex items-center justify-center p-1 rounded-sm cursor-pointer transition-opacity duration-180 focus-within:opacity-100 has-[:checked]:opacity-100 ${
              checked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Checkbox title="一括削除の選択" aria-label={`${p.name}を選択`} checked={checked} onChange={(e) => onCheck(e.target.checked)} />
          </label>
        </div>
      </div>

      <AttrChip label={attrOf(p)} size="md" />

      {p.trait && <p className="text-xs text-text-sub leading-[1.6] line-clamp-2">{p.trait}</p>}

      {p.detail && (
        <div>
          <LinkButton className="-mx-1.5 flex flex-row items-center gap-1" onClick={() => setDetailOpen((v) => !v)}>
           詳細を見る <Icon name={detailOpen ? 'chevronDown' : 'chevronRight'} size={12} />
          </LinkButton>
          <Collapse open={detailOpen}>
            <div className="mt-2 bg-fill rounded-chip p-2.5 text-xs text-text-sub leading-[1.7] whitespace-pre-wrap max-h-[160px] overflow-y-auto">{p.detail}</div>
          </Collapse>
        </div>
      )}

      <div className="flex gap-1 pt-2.5 border-t border-line mt-auto">
        <LinkButton className='flex flex-row items-center gap-1' onClick={onEdit}><Icon name="pencil" size={13} />編集</LinkButton>
        <LinkButton className='flex flex-row items-center gap-1' danger onClick={onDelete}><Icon name="trash" size={13} />削除</LinkButton>
      </div>
    </article>
  );
}

/* ======================================================================
   Row (list view) — the dense alternative for scanning a large roster
   ====================================================================== */

function PersonaRow({
  p, checked, onCheck, onEdit, onDelete, draggable, isDragging, dragHandlers,
}: {
  p: Persona; checked: boolean; onCheck: (v: boolean) => void; onEdit: () => void; onDelete: () => void;
} & DragProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <div
      {...(draggable ? dragHandlers : {})}
      draggable={draggable}
      className={`flex flex-col gap-2 bg-surface rounded-panel py-2.5 px-4 shadow-card transition-[background-color,outline,opacity] duration-180 hover:bg-surface-hover ${checked ? 'outline outline-2 outline-accent -outline-offset-2' : ''} ${isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-3">
        <DragGrip draggable={draggable} />
        <Checkbox aria-label={`${p.name}を選択`} checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        <Avatar persona={p} size="md" />
        <span className="text-[13px] font-medium w-[104px] shrink-0 truncate">{p.name}</span>
        <span className="hidden min-[680px]:inline-flex shrink-0 max-w-[150px]"><AttrChip label={attrOf(p)} /></span>
        {p.trait && <span className="text-xs text-text-sub flex-1 min-w-0 truncate">{p.trait}</span>}
        {!p.trait && <span className="flex-1" />}
        <span className="flex gap-1 shrink-0">
          {p.detail && (
            <LinkButton className='flex flex-row items-center gap-1' onClick={() => setDetailOpen((v) => !v)}>
              <Icon name={detailOpen ? 'chevronDown' : 'chevronRight'} size={12} />詳細
            </LinkButton>
          )}
          <LinkButton className='flex flex-row items-center gap-1' onClick={onEdit}><Icon name="pencil" size={13} />編集</LinkButton>
          <LinkButton className='flex flex-row items-center gap-1' danger onClick={onDelete}><Icon name="trash" size={13} />削除</LinkButton>
        </span>
      </div>
      {p.detail && (
        <Collapse open={detailOpen}>
          <div className="bg-fill rounded-chip p-2.5 text-xs text-text-sub leading-[1.7] whitespace-pre-wrap ml-[87px]">{p.detail}</div>
        </Collapse>
      )}
    </div>
  );
}

/* ======================================================================
   Create / edit modal
   ====================================================================== */

function PersonaModalBody({ persona, onSaved }: { persona: Persona | null; onSaved: () => void }) {
  const { update } = useStore();
  const toast = useToast();
  const modal = useModal();
  const [photo, setPhoto] = useState<string | null>(persona?.photoUrl || null);
  const nameRef = useRef<HTMLInputElement>(null);
  const attrRef = useRef<HTMLInputElement>(null);
  const traitRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function save() {
    const name = nameRef.current?.value.trim() || '';
    if (!name) { toast.show('氏名を入力してください', true); return; }
    const payload = {
      name,
      attribute: attrRef.current?.value.trim() || '',
      trait: traitRef.current?.value.trim() || '',
      detail: detailRef.current?.value.trim() || '',
      photoUrl: photo || '',
    };

    update((s) => {
      if (persona) {
        return { ...s, personas: s.personas.map((p) => (p.id === persona.id ? { ...p, ...payload } : p)) };
      }
      const id = `p${Date.now() % 1000000}`;
      const color = PERSONA_COLORS[s.personas.length % PERSONA_COLORS.length];
      return {
        ...s,
        personas: [...s.personas, { id, color, ...payload }],
        selected: { ...s.selected, [id]: true },
      };
    });

    toast.show(persona ? 'ペルソナを更新しました' : 'ペルソナを登録しました');
    modal.close();
    onSaved();
  }

  return (
    <>
      <div className="grid grid-cols-1 min-[600px]:grid-cols-[140px_minmax(0,1fr)] gap-4">
        <div className="flex flex-col items-center gap-2">
          <button type="button" aria-label="写真をアップロード" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-full bg-fill flex items-center justify-center text-text-mute relative overflow-hidden transition-colors duration-180 hover:bg-fill-strong">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Icon name="user" size={24} />
            )}
            <span className="absolute right-0.5 bottom-0.5 w-[22px] h-[22px] rounded-full bg-surface shadow-card flex items-center justify-center text-text-sub"><Icon name="camera" size={12} /></span>
          </button>
          <span className="text-[11px] text-text-mute">写真をアップロード</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => setPhoto(String(reader.result));
              reader.readAsDataURL(f);
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Field label="氏名"><Input ref={nameRef} type="text" placeholder="例：田中 美咲" defaultValue={persona?.name || ''} /></Field>
          <Field label="属性（年齢・職業など）"><Input ref={attrRef} type="text" placeholder="例：34歳・共働き主婦・首都圏在住" defaultValue={persona?.attribute || ''} /></Field>
        </div>
      </div>
      <Field label="ペルソナ特徴（ひとことで）"><Input ref={traitRef} type="text" placeholder="例：日常にほっとする時間を求める母" defaultValue={persona?.trait || ''} /></Field>
      <Field label="ペルソナ詳細（価値観・ライフスタイル・購買行動など）">
        <Textarea ref={detailRef} placeholder="生活背景や価値観、メディア接触、ブランドへの態度などを記述します。詳しいほど評価の精度が上がります。" defaultValue={persona?.detail || ''} />
      </Field>
      <div className="flex items-center justify-end gap-2 -mx-4 -mb-4 mt-2 p-4 border-t border-line">
        <Button variant="outline" size="sm" onClick={modal.close}>キャンセル</Button>
        <Button variant="black" size="sm" onClick={save}>保存する</Button>
      </div>
    </>
  );
}

/* ======================================================================
   Attribute group section — shared header for both view modes
   ====================================================================== */

function GroupHeader({
  attr, total, selectedInGroup, collapsed, onToggleCollapse, onSelectAll, onSelectNone,
}: {
  attr: string;
  total: number;
  selectedInGroup: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onToggleCollapse} aria-label="グループを開閉" className="text-text-mute p-0.5 rounded-sm flex shrink-0 transition-colors duration-180 hover:text-text hover:bg-fill">
        <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={15} />
      </button>
      <span className="text-[13px] font-semibold text-text">{attr}</span>
      <span className="text-xs text-text-sub">（{total}名{selectedInGroup ? `・${selectedInGroup}件選択中` : ''}）</span>
      <span className="flex-1" />
      <Button size="xs" onClick={onSelectAll}>全選択</Button>
      <Button size="xs" onClick={onSelectNone}>選択解除</Button>
    </div>
  );
}

/* ======================================================================
   Module
   ====================================================================== */

export function PersonasView() {
  const { state, patch, update } = useStore();
  const modal = useModal();
  const toast = useToast();
  const confirm = useConfirm();
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const search = state.personaSearch;
  const setSearch = (v: string) => patch({ personaSearch: v });
  const [attrFilter, setAttrFilter] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  /* Drag-to-reorder — same pattern as History/Axes: a local order draft,
     committed into state.personas on drop. Reordering is constrained to
     siblings within the same attribute group (dragging across groups would
     ambiguously imply changing someone's attribute, which this doesn't do). */
  const [order, setOrder] = useState<string[]>(state.personas.map((p) => p.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  useEffect(() => {
    setOrder(state.personas.map((p) => p.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.personas.length]);

  const byId = useMemo(() => new Map(state.personas.map((p) => [p.id, p])), [state.personas]);
  const orderedPersonas = useMemo(() => order.map((id) => byId.get(id)).filter((p): p is Persona => !!p), [order, byId]);

  const selectedIds = Object.keys(selection).filter((k) => selection[k]);
  const allGroups = useMemo(() => attrGroups(state.personas), [state.personas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orderedPersonas.filter((p) => {
      if (attrFilter && (p.attribute || NO_ATTR) !== attrFilter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.attribute.toLowerCase().includes(q) || p.trait.toLowerCase().includes(q);
    });
  }, [orderedPersonas, search, attrFilter]);

  const groups = useMemo(() => attrGroups(filtered), [filtered]);
  const filterActive = !!search || !!attrFilter;
  /* Drag reorder only makes sense against the saved order — once a search or
     attribute filter narrows what's visible, the on-screen order isn't "the" order. */
  const reorderable = !filterActive;

  function dragHandlersFor(id: string): React.HTMLAttributes<HTMLElement> {
    return {
      onDragStart: () => setDraggingId(id),
      onDragEnd: () => {
        setDraggingId(null);
        update((s) => ({ ...s, personas: order.map((oid) => byId.get(oid)).filter((p): p is Persona => !!p) }));
        toast.show('並び順を保存しました');
      },
      onDragOver: (ev) => {
        ev.preventDefault();
        if (!draggingId || draggingId === id) return;
        const dragged = byId.get(draggingId);
        const target = byId.get(id);
        if (!dragged || !target || attrOf(dragged) !== attrOf(target)) return;
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

  function openPersonaModal(persona: Persona | null) {
    modal.open({
      title: persona ? 'ペルソナを編集' : '新規ペルソナ',
      body: <PersonaModalBody persona={persona} onSaved={() => {}} />,
    });
  }

  async function remove(p: Persona) {
    if (!(await confirm({ title: 'ペルソナを削除', message: `「${p.name}」を削除しますか？（元に戻せません）`, danger: true }))) return;
    update((s) => {
      const selected = { ...s.selected };
      delete selected[p.id];
      return { ...s, personas: s.personas.filter((x) => x.id !== p.id), selected };
    });
    setSelection((s) => { const n = { ...s }; delete n[p.id]; return n; });
    toast.show('ペルソナを削除しました');
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm({ title: 'ペルソナを削除', message: `選択した${selectedIds.length}件のペルソナを削除しますか？（元に戻せません）`, danger: true }))) return;
    update((s) => {
      const selected = { ...s.selected };
      selectedIds.forEach((id) => delete selected[id]);
      return { ...s, personas: s.personas.filter((p) => !selectedIds.includes(p.id)), selected };
    });
    setSelection({});
    toast.show(`${selectedIds.length}件のペルソナを削除しました`);
  }

  async function deleteAll() {
    if (!(await confirm({ title: '全ペルソナを削除', message: '登録されているすべてのペルソナを削除しますか？（元に戻せません）', danger: true }))) return;
    update((s) => ({ ...s, personas: [], selected: {} }));
    setSelection({});
    toast.show('すべてのペルソナを削除しました');
  }

  function selectGroup(attr: string, on: boolean) {
    setSelection((s) => {
      const n = { ...s };
      groups.find((g) => g.attr === attr)?.personas.forEach((p) => { n[p.id] = on; });
      return n;
    });
  }

  const head = (
    <PageHeader
      title="ペルソナ管理"
      sub={`登録ペルソナ ${state.personas.length}件。評価に使うAIペルソナを登録します。`}
      actions={
        <>
          <Button size="sm" onClick={() => toast.show('persona_template.xlsx をダウンロードしました（氏名 / 属性 / 特徴 / 詳細）')}><Icon name="download" size={14} />Excelテンプレート</Button>
          <Button size="sm" onClick={() => toast.show('Excel（.xlsx / .csv）の1行目に「氏名」列があるか確認してください')}><Icon name="sheet" size={14} />Excel一括登録</Button>
          <Button variant="danger" size="sm" disabled={!selectedIds.length} onClick={bulkDelete}>
            <Icon name="trash" size={14} />選択削除{selectedIds.length ? `（${selectedIds.length}）` : ''}
          </Button>
          <Button variant="danger" size="sm" onClick={deleteAll}>全削除</Button>
          <Button variant="black" size="sm" onClick={() => openPersonaModal(null)}><Icon name="plus" size={14} stroke="#fff" />新規ペルソナ</Button>
        </>
      }
    />
  );

  if (!state.personas.length) {
    return (
      <div className="screen flex flex-col gap-6">
        {head}
        <Empty icon="users" title="ペルソナが登録されていません" sub="評価を実行するには、少なくとも1名のペルソナが必要です。" action="新規ペルソナ" onAction={() => openPersonaModal(null)} />
      </div>
    );
  }

  const toolbar = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="氏名・属性・特徴で検索" className="flex-1" />
        {filterActive && <span className="text-xs text-text-sub whitespace-nowrap">{filtered.length}件ヒット</span>}
        <div className="inline-flex items-center gap-0.5 bg-fill rounded-full p-0.5 shrink-0">
          <button type="button" aria-label="カード表示" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'grid' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
            <Icon name="grid" size={15} />
          </button>
          <button type="button" aria-label="一覧表示" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`p-1.5 rounded-full transition-colors duration-180 ${view === 'list' ? 'bg-surface shadow-card text-text' : 'text-text-sub hover:text-text'}`}>
            <Icon name="list" size={15} />
          </button>
        </div>
      </div>
      <Select
        small
        value={attrFilter}
        onChange={(e) => setAttrFilter(e.target.value)}
        options={[{ value: '', label: `すべての属性（${allGroups.length}）` }, ...allGroups.map((g) => ({ value: g.attr, label: `${g.attr}（${g.personas.length}）` }))]}
      />
    </div>
  );

  return (
    <div className="screen flex flex-col gap-6">
      {head}
      {toolbar}

      {!filtered.length ? (
        <Empty icon="users" title="該当するペルソナが見つかりません" sub="検索条件や属性フィルタを変更してください。" />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => {
            const collapsed = !!collapsedGroups[g.attr];
            const selectedInGroup = g.personas.filter((p) => selection[p.id]).length;
            return (
              <div key={g.attr} className="flex flex-col gap-3">
                <GroupHeader
                  attr={g.attr}
                  total={g.personas.length}
                  selectedInGroup={selectedInGroup}
                  collapsed={collapsed}
                  onToggleCollapse={() => setCollapsedGroups((s) => ({ ...s, [g.attr]: !s[g.attr] }))}
                  onSelectAll={() => selectGroup(g.attr, true)}
                  onSelectNone={() => selectGroup(g.attr, false)}
                />
                {!collapsed && (
                  view === 'grid' ? (
                    <div className="grid gap-4 items-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {g.personas.map((p) => (
                        <PersonaCard
                          key={p.id}
                          p={p}
                          checked={!!selection[p.id]}
                          onCheck={(v) => setSelection((s) => ({ ...s, [p.id]: v }))}
                          onEdit={() => openPersonaModal(p)}
                          onDelete={() => remove(p)}
                          draggable={reorderable}
                          isDragging={draggingId === p.id}
                          dragHandlers={dragHandlersFor(p.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {g.personas.map((p) => (
                        <PersonaRow
                          key={p.id}
                          p={p}
                          checked={!!selection[p.id]}
                          onCheck={(v) => setSelection((s) => ({ ...s, [p.id]: v }))}
                          onEdit={() => openPersonaModal(p)}
                          onDelete={() => remove(p)}
                          draggable={reorderable}
                          isDragging={draggingId === p.id}
                          dragHandlers={dragHandlersFor(p.id)}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
