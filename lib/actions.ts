'use client';

/* ==========================================================================
   actions.ts — navigation + cross-cutting mutations, ported from the
   non-render half of assets/js/router.js. Bundled as one hook so components
   call `const { goSection, openHistory } = useActions()` the way the
   original called MS.router.goSection() from anywhere.
   ========================================================================== */

import { useCallback } from 'react';
import { MODES } from './palette';
import { resultFor } from './mock-data';
import { useStore } from './store';
import { useToast } from '@/components/overlays/Toast';
import type { ModeKey, SectionKey } from './types';

export function useActions() {
  const { state, patch, update, resetResultFlags } = useStore();
  const toast = useToast();

  const goSection = useCallback((key: SectionKey) => {
    patch({ section: key });
  }, [patch]);

  const goMode = useCallback((key: ModeKey) => {
    if (!MODES[key]) return;
    /* Re-picking the mode you are already in is a no-op, not a reset. The mode
       picker sits on the evaluate screen itself now, so a stray click on the
       active option would otherwise throw away a result that is on screen. */
    update((s) => (s.mode === key && s.section === 'evaluate'
      ? s
      /* No result exists for the mode we're arriving at, so the control card
         must be open — otherwise a controlCollapsed left true by a previous
         run in a different mode would hide the very form this mode needs. */
      : { ...s, section: 'evaluate', mode: key, result: null, compare: null, controlCollapsed: false }));
  }, [update]);

  /** Open a saved history entry in its matching evaluation screen. */
  const openHistory = useCallback((id: string) => {
    const h = state.history.find((x) => x.id === id);
    if (!h) return;
    const payload = resultFor(h, state.personas, state.axes);
    if (!payload) {
      toast.show('この履歴には保存された結果がありません', true);
      return;
    }

    if (MODES[h.mode].compare && payload.isCompare) {
      update((s) => ({
        ...s, section: 'evaluate', mode: h.mode,
        compare: payload, result: null, compareTab: 'summary', cmpOne: 0, controlCollapsed: true,
      }));
      resetResultFlags(payload);
    } else if (!payload.isCompare) {
      update((s) => ({
        ...s, section: 'evaluate', mode: h.mode,
        result: payload, compare: null, resultTab: 'strategy', controlCollapsed: true,
      }));
      resetResultFlags(payload);
    }
  }, [state.history, state.personas, state.axes, update, resetResultFlags, toast]);

  return { goSection, goMode, openHistory };
}
