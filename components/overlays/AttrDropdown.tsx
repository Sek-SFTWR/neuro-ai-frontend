'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { attrGroups } from '@/lib/selectors';
import { NO_ATTR } from '@/lib/palette';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Input';
import { useToast } from './Toast';

interface AttrDropdownProps {
  anchor: HTMLElement;
  onClose: () => void;
  onAdd: (attrs: string[]) => void;
}

/** The 属性で選択 floating dropdown, positioned under its trigger button. */
export function AttrDropdown({ anchor, onClose, onAdd }: AttrDropdownProps) {
  const { state } = useStore();
  const toast = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const groups = attrGroups(state.personas).filter((g) => g.attr !== NO_ATTR);

  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    setPos({
      top: window.scrollY + r.bottom + 6,
      left: Math.min(window.scrollX + r.left, window.innerWidth - 320),
    });
  }, [anchor]);

  useEffect(() => {
    if (!groups.length) {
      toast.show('登録されている属性がありません', true);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target as Node) && ev.target !== anchor) onClose();
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [anchor, onClose]);

  if (!pos || !groups.length) return null;

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute z-[400] w-[308px] bg-surface rounded-panel border border-line shadow-card overflow-hidden"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="py-2.5 px-3 text-xs font-semibold text-text-sub border-b border-line">属性を選んでペルソナを選択（複数可）</div>
      <div className="max-h-[280px] overflow-y-auto p-1.5">
        {groups.map((g) => (
          <label key={g.attr} className="flex items-center gap-2 py-2 px-2.5 rounded-sm text-[13px] hover:bg-fill transition-colors duration-180 cursor-pointer">
            <Checkbox checked={!!checked[g.attr]} onChange={(e) => setChecked((c) => ({ ...c, [g.attr]: e.target.checked }))} />
            <span className="truncate">{g.attr}</span>
            <span className="ml-auto text-[11px] text-text-mute">{g.personas.length}名</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2 py-2.5 px-3 border-t border-line">
        <Button
          variant="black"
          size="sm"
          onClick={() => {
            const picked = Object.keys(checked).filter((k) => checked[k]);
            onClose();
            if (picked.length) onAdd(picked);
          }}
        >
          選択に追加
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>閉じる</Button>
      </div>
    </div>
  );
}
