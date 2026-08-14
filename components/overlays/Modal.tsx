'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface ModalOptions {
  title: string;
  body: ReactNode;
  foot?: ReactNode;
  wide?: boolean;
  /** Overrides what the close button / Escape / backdrop click do, instead
      of dismissing the modal outright — e.g. a "settings → criteria" drill-in
      calls this to step back to the settings view rather than losing it. */
  onClose?: () => void;
}

interface ModalValue {
  open: (opts: ModalOptions) => void;
  /** The ×/Escape/backdrop path: defers to the modal's own `onClose` if it has
      one, so a drill-in can step back instead of tearing the stack down. */
  close: () => void;
  /** Tears the modal down regardless of `onClose` — for an explicit "I am done
      here" action, which a modal that redirects its close has no other way to
      offer. */
  dismiss: () => void;
}

const ModalContext = createContext<ModalValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ModalOptions | null>(null);
  const optsRef = useRef<ModalOptions | null>(null);
  optsRef.current = opts;

  const open = useCallback((o: ModalOptions) => setOpts(o), []);
  const dismiss = useCallback(() => setOpts(null), []);
  const close = useCallback(() => {
    if (optsRef.current?.onClose) optsRef.current.onClose();
    else setOpts(null);
  }, []);

  useEffect(() => {
    if (!opts) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [opts, close]);

  return (
    <ModalContext.Provider value={{ open, close, dismiss }}>
      {children}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(ev) => { if (ev.target === ev.currentTarget) close(); }}
        className={`fixed inset-0 z-[600] p-10 bg-[rgba(17,17,17,0.32)] ${opts ? 'flex' : 'hidden'} items-center justify-center`}
      >
        {opts && (
          /* The card is sized by its content and only capped — never stretched.
             `wide` was bare 80vw, which on a 2560px display is 2000px of form
             for what is usually one input and a few pills. */
          <div className={`bg-surface rounded-card shadow-card max-h-[calc(100vh-80px)] flex flex-col animate-fade-up ${opts.wide ? 'w-[80vw] max-w-[860px]' : 'w-full max-w-[640px]'}`}>
            <header className="flex items-center gap-2 p-4 pb-3">
              <h2 className="text-[15px] font-semibold">{opts.title}</h2>
              <button
                type="button"
                aria-label="閉じる"
                onClick={close}
                className="text-text-mute flex p-1 rounded-full ml-auto transition-colors duration-180 hover:text-text hover:bg-fill"
              >
                <Icon name="x" size={18} />
              </button>
            </header>
            {/* pb-4 unconditionally: the footer now draws a rule, so body content
                must not run up against it. */}
            <div className="px-4 pb-4 flex flex-col gap-4 overflow-y-auto scroll-y">{opts.body}</div>
            {opts.foot && (
              <footer className="flex items-center justify-end gap-2 p-4 border-t border-line">{opts.foot}</footer>
            )}
          </div>
        )}
      </div>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
}
