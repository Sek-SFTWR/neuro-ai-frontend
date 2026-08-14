'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

interface ToastState {
  message: string;
  isError: boolean;
  open: boolean;
}

interface ToastValue {
  show: (msg: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: '', isError: false, open: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, isError = false) => {
    setState({ message: msg, isError, open: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState((s) => ({ ...s, open: false })), 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 bottom-7 z-[800] flex items-center gap-2 text-white text-[13px] font-medium py-3 px-[18px] rounded-full shadow-card max-w-[min(560px,calc(100vw-48px))] transition-[opacity,transform] duration-180 ${
          state.open ? 'opacity-100 -translate-x-1/2 translate-y-0' : 'opacity-0 -translate-x-1/2 translate-y-3 pointer-events-none'
        } ${state.isError ? 'bg-[#7F1D1D]' : 'bg-black-ms'}`}
      >
        <Icon name={state.isError ? 'alert' : 'checkCircle'} size={15} stroke="#fff" />
        <span>{state.message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
