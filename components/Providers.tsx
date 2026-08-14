'use client';

import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import { ToastProvider } from '@/components/overlays/Toast';
import { ModalProvider } from '@/components/overlays/Modal';
import { ProgressProvider } from '@/components/overlays/ProgressModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>
        <ModalProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </ModalProvider>
      </ToastProvider>
    </StoreProvider>
  );
}
