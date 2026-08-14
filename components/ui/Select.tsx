'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/Icon';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  /** Shaped like a change event so the dozen existing call sites keep working
      unchanged: they all read `e.target.value`. */
  onChange?: (e: { target: { value: string } }) => void;
  small?: boolean;
  /** Fill the row (default) vs. size to content — for a compact inline
      dropdown next to a label. */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * A listbox, not a native `<select>`.
 *
 * The native control's open list is drawn by the OS: its blue highlight, its
 * font and its padding ignore the app's tokens entirely, and no amount of CSS
 * reaches inside it. Rendering the options ourselves is the only way the open
 * state can look like the rest of the app — which is why this exists despite a
 * native select being less code.
 *
 * The trade is that everything the native control gave for free has to be
 * rebuilt: roles, arrow/Home/End keys, type-through-Escape, outside-click, and
 * scrolling the highlighted row into view. It is deliberately positioned in
 * flow rather than portalled — no Select currently sits inside a scroller, and
 * an absolute popup keeps it glued to its trigger without measuring anything.
 */
export function Select({
  options, value, onChange, small, fullWidth = true, disabled, className = '', ...rest
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const current = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Keyboard navigation is useless if the row it moves to is out of sight. */
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function commit(i: number) {
    const op = options[i];
    if (op) onChange?.({ target: { value: op.value } });
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(selectedIndex);
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); commit(active); }
    else if (e.key === 'Tab') setOpen(false);
  }

  return (
    <div ref={wrapRef} className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => { if (!disabled) { setActive(selectedIndex); setOpen((o) => !o); } }}
        onKeyDown={onKeyDown}
        /* Open borrows the focus treatment rather than inventing a third
           state: while the list is up, this control is where you are. */
        className={`w-full flex items-center justify-between gap-2 bg-surface border rounded-chip text-text font-medium text-left cursor-pointer transition-colors duration-180 focus:outline focus:outline-2 focus:outline-accent focus:-outline-offset-2 ${
          open ? 'border-accent outline outline-2 outline-accent -outline-offset-2' : 'border-line hover:border-line-hover'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${
          small ? 'py-[7px] pl-3 pr-2.5 text-xs' : 'py-[11px] pl-3.5 pr-3 text-[13px]'
        }`}
        {...rest}
      >
        <span className="truncate">{current?.label ?? ''}</span>
        <Icon
          name="chevronDown"
          size={small ? 13 : 15}
          className={`shrink-0 text-text-mute transition-transform duration-180 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-[400] min-w-full w-max max-w-[min(360px,90vw)] max-h-[280px] overflow-y-auto bg-surface border border-line rounded-chip shadow-card py-1 animate-fade-up"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                /* preventDefault keeps focus on the trigger, so the button
                   keeps its ring and Escape still reaches the handler. */
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
                className={`flex items-center gap-2 px-3 cursor-pointer transition-colors duration-180 ${
                  small ? 'py-1.5 text-xs' : 'py-2 text-[13px]'
                } ${i === active ? 'bg-fill' : ''} ${selected ? 'font-semibold text-accent' : 'text-text'}`}
              >
                <span className="w-3.5 shrink-0 flex items-center justify-center">
                  {selected && <Icon name="check" size={13} />}
                </span>
                <span className="truncate">{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
