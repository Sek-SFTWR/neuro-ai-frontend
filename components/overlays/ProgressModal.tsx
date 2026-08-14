'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

const STEPS = [
  '動画をアップロードしています',
  'Geminiが動画を解析しています',
  'ペルソナが視聴・評価しています',
  '評価を集計しています',
];

interface ProgressState {
  open: boolean;
  isCompare: boolean;
  pct: number;
  sub: string;
  step: number;
}

interface ProgressValue {
  open: (isCompare: boolean) => void;
  setProgress: (pct: number, sub?: string) => void;
  setProgressStep: (n: number) => void;
  close: () => void;
  /** Handle to the interval-driven "run" so callers can clear it on unmount. */
  runTimer: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
}

const ProgressContext = createContext<ProgressValue | null>(null);

const INITIAL: ProgressState = { open: false, isCompare: false, pct: 0, sub: '', step: -1 };

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(INITIAL);
  const runTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const open = useCallback((isCompare: boolean) => {
    setState({ open: true, isCompare, pct: 0, sub: '準備しています', step: isCompare ? -1 : 0 });
  }, []);

  const setProgress = useCallback((pct: number, sub?: string) => {
    setState((s) => ({ ...s, pct, sub: sub == null ? s.sub : sub }));
  }, []);

  const setProgressStep = useCallback((n: number) => {
    setState((s) => ({ ...s, step: n }));
  }, []);

  const close = useCallback(() => {
    if (runTimer.current) { clearInterval(runTimer.current); runTimer.current = null; }
    setState(INITIAL);
  }, []);

  const value = useMemo<ProgressValue>(() => ({ open, setProgress, setProgressStep, close, runTimer }), [open, setProgress, setProgressStep, close]);

  const dashoffset = 214 - 214 * (state.pct / 100);

  return (
    <ProgressContext.Provider value={value}>
      {children}
      <div
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        className={`fixed inset-0 z-[600] p-6 bg-[rgba(17,17,17,0.32)] ${state.open ? 'flex' : 'hidden'} items-center justify-center`}
      >
        {state.open && (
          <div className="bg-surface rounded-card shadow-card w-full max-w-[420px] max-h-[calc(100vh-48px)] flex flex-col items-center text-center py-8 px-6 gap-3 animate-fade-up">
            <div className="relative w-20 h-20">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-line)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="var(--color-accent)" strokeWidth="6"
                  strokeLinecap="round" strokeDasharray="214" strokeDashoffset={dashoffset}
                  style={{ transition: 'stroke-dashoffset .4s cubic-bezier(.2,.8,.2,1)' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-text">
                {Math.round(state.pct)}%
              </span>
            </div>
            <h2 className="text-[15px] font-semibold">
              {state.isCompare ? '複数の動画を評価しています' : 'ペルソナが視聴・評価しています'}
            </h2>
            <p className="text-xs text-text-sub min-h-[18px]">{state.sub}</p>

            {!state.isCompare && (
              <div className="flex flex-col gap-2.5 w-full mt-2 text-left">
                {STEPS.map((label, i) => {
                  const done = i < state.step;
                  const active = i === state.step;
                  return (
                    <div key={i} className={`flex items-center gap-2.5 text-xs ${active ? 'text-text font-medium' : done ? 'text-text-sub' : 'text-text-mute'}`}>
                      <span
                        className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center ${
                          done ? 'bg-green border-green text-white' : active ? 'border-accent border-t-transparent animate-spin-slow' : 'border-line'
                        }`}
                      >
                        {done && <Icon name="check" size={11} stroke="#fff" width={3} />}
                      </span>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
