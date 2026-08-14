'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/overlays/Toast';
import { PRESET_AXES } from '@/lib/palette';

function AxisChip({
  a, onRemove, dragHandlers, isDragging,
}: {
  a: string;
  onRemove: () => void;
  dragHandlers: React.HTMLAttributes<HTMLSpanElement>;
  isDragging: boolean;
}) {
  return (
    <span
      {...dragHandlers}
      draggable
      className={`group relative inline-flex items-center gap-1 rounded-full py-1.5 pl-2 pr-2 text-[13px] font-medium bg-surface border border-line text-text transition-[background-color,border-color,opacity] duration-180 hover:border-line-hover ${isDragging ? 'opacity-40' : ''}`}
    >
      <span className="text-text-mute cursor-grab active:cursor-grabbing flex shrink-0" title="ドラッグで並び替え">
        <Icon name="grip" size={13} />
      </span>
      {a}
      <button
        type="button"
        aria-label={`${a}を削除`}
        onClick={onRemove}
        className="text-text-mute flex p-0.5 rounded-full transition-colors duration-180 hover:text-pri-high hover:bg-pri-high-bg"
      >
        <Icon name="x" size={13} />
      </button>
    </span>
  );
}

/** The 評価軸設定 editor itself — reorderable chips, free-text add, and
    preset shortcuts. Shared between the full AxesView page and the
    in-context "評価基準を設定" modal opened from the evaluate flow, so both
    places manage the exact same state.axes with the same UI. */
export function AxesEditor() {
  const { state, update } = useStore();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<string[]>(state.axes);
  const [draggingAxis, setDraggingAxis] = useState<string | null>(null);

  /* Self-heal against additions/removals made outside a drag session (e.g.
     via the add input, a preset click, or the × button) while preserving any
     manual reordering already applied to `order`. This avoids syncing via a
     separate effect — and the render/commit gap that would cause. */
  const known = order.filter((a) => state.axes.includes(a));
  const extra = state.axes.filter((a) => !known.includes(a));
  const axesOrder = known.length === order.length && extra.length === 0 ? order : [...known, ...extra];

  function add(raw: string) {
    const v = raw.trim();
    if (!v || state.axes.includes(v)) return;
    update((s) => ({ ...s, axes: [...s.axes, v] }));
    toast.show(`評価軸「${v}」を追加しました`);
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(v: string) {
    update((s) => ({ ...s, axes: s.axes.filter((a) => a !== v) }));
    toast.show(`評価軸「${v}」を削除しました`);
  }

  function dragHandlersFor(a: string): React.HTMLAttributes<HTMLSpanElement> {
    return {
      onDragStart: () => setDraggingAxis(a),
      onDragEnd: () => {
        setDraggingAxis(null);
        update((s) => ({ ...s, axes: axesOrder }));
        toast.show('評価軸の並び順を保存しました');
      },
      onDragOver: (ev) => {
        ev.preventDefault();
        if (!draggingAxis || draggingAxis === a) return;
        const from = axesOrder.indexOf(draggingAxis);
        const to = axesOrder.indexOf(a);
        if (from < 0 || to < 0 || from === to) return;
        const next = axesOrder.slice();
        next.splice(from, 1);
        next.splice(to, 0, draggingAxis);
        setOrder(next);
      },
    };
  }

  const presets = PRESET_AXES.filter((p) => !state.axes.includes(p));

  const body = (
    <>
      <div className="flex flex-wrap gap-2">
        {axesOrder.length ? (
          axesOrder.map((a) => (
            <AxisChip
              key={a}
              a={a}
              onRemove={() => remove(a)}
              dragHandlers={dragHandlersFor(a)}
              isDragging={draggingAxis === a}
            />
          ))
        ) : (
          <p className="text-xs text-text-sub">評価軸がまだありません。下の入力欄またはプリセットから追加してください。</p>
        )}
      </div>
      {axesOrder.length > 1 && (
        <p className="text-[11px] text-text-mute -mt-1">ドラッグで並び替えできます。レーダーチャートの表示順に反映されます。</p>
      )}

      <div className="flex gap-2 items-center">
        <Input ref={inputRef} type="text" placeholder="評価軸を追加（例：清涼感の伝達）" aria-label="評価軸を追加" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(e.currentTarget.value); } }} />
        <Button variant="black" onClick={() => add(inputRef.current?.value || '')}>追加</Button>
      </div>

      <div className="border-t border-line pt-4 flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-text-sub">プリセットから追加</span>
        <div className="flex flex-wrap gap-2">
          {presets.length ? (
            presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => add(p)}
                className="inline-flex items-center gap-1.5 rounded-full py-1.5 px-3.5 text-xs font-medium bg-surface border border-line text-text-sub transition-colors duration-180 hover:bg-fill hover:border-line-hover hover:text-text"
              >
                <Icon name="plus" size={12} />{p}
              </button>
            ))
          ) : (
            <p className="text-xs text-text-sub">プリセットの評価軸はすべて追加済みです。</p>
          )}
        </div>
      </div>
    </>
  );

  return body;
}
