'use client';

import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useModal } from './Modal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Styles the confirm button as destructive (the delete-flow default). */
  danger?: boolean;
}

/**
 * Promise-based replacement for window.confirm, styled like the rest of the
 * app instead of the browser's native dialog. Resolves true/false from the
 * two buttons; dismissing via the header X, Escape, or the backdrop leaves
 * the promise pending (equivalent to cancel — nothing destructive runs) since
 * Modal exposes no separate "was dismissed" hook to resolve false from.
 */
export function useConfirm() {
  const modal = useModal();
  return useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const finish = (v: boolean) => { modal.close(); resolve(v); };
      modal.open({
        title: opts.title,
        body: <p className="text-[13px] leading-[1.7] text-text-sub">{opts.message}</p>,
        foot: (
          <>
            <Button variant="outline" size="sm" onClick={() => finish(false)}>キャンセル</Button>
            <Button variant={opts.danger ? 'danger' : 'black'} size="sm" onClick={() => finish(true)}>
              {opts.confirmLabel || '削除する'}
            </Button>
          </>
        ),
      });
    });
  }, [modal]);
}

interface PromptOptions {
  title: string;
  label: string;
  defaultValue?: string;
  confirmLabel?: string;
}

/** Promise-based replacement for window.prompt — resolves the trimmed value,
    or null if cancelled / left blank. */
export function usePromptModal() {
  const modal = useModal();
  const ref = useRef<HTMLInputElement>(null);
  return useCallback((opts: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      const finish = (v: string | null) => { modal.close(); resolve(v); };
      const submit = () => finish(ref.current?.value.trim() || null);
      modal.open({
        title: opts.title,
        body: (
          <Input
            ref={ref}
            autoFocus
            defaultValue={opts.defaultValue}
            aria-label={opts.label}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          />
        ),
        foot: (
          <>
            <Button variant="outline" size="sm" onClick={() => finish(null)}>キャンセル</Button>
            <Button variant="accent" size="sm" onClick={submit}>{opts.confirmLabel || '保存する'}</Button>
          </>
        ),
      });
    });
  }, [modal]);
}
