'use client';

/* ==========================================================================
   actions.ts — navigation + cross-cutting mutations, ported from the
   non-render half of assets/js/router.js. Bundled as one hook so components
   call `const { goSection, openHistory } = useActions()` the way the
   original called MS.router.goSection() from anywhere.
   ========================================================================== */

import { useCallback } from 'react';
import { MODELS, MODES } from './palette';
import { resultFor } from './mock-data';
import { useStore } from './store';
import { useToast } from '@/components/overlays/Toast';
import type { ModeKey, SectionKey } from './types';

export function useActions() {
  const { state, patch, update, resetResultFlags } = useStore();
  const toast = useToast();

  const goSection = useCallback((key: SectionKey) => {
    /* Settings is opened from a button that is on every screen, so "back" has
       to mean the screen you actually left rather than a fixed destination.
       Recorded on the way in; re-entering settings from settings keeps the
       original origin rather than making back a no-op. */
    update((s) => (key === 'settings' && s.section !== 'settings'
      ? { ...s, section: key, settingsFrom: s.section }
      : { ...s, section: key }));
  }, [update]);

  const goMode = useCallback((key: ModeKey) => {
    if (!MODES[key]) return;
    /* The picker already refuses these clicks, but the mode is also reachable
       from elsewhere — keeping the rule here means no caller can leave the app
       in a compare mode the selected engine cannot actually run. */
    if (MODES[key].compare && !MODELS[state.model].supportsCompare) {
      toast.show(`${MODELS[state.model].label}は比較評価に対応していません`, true);
      return;
    }
    /* Re-picking the mode you are already in is a no-op, not a reset. The mode
       picker sits on the evaluate screen itself now, so a stray click on the
       active option would otherwise throw away a result that is on screen. */
    update((s) => (s.mode === key && s.section === 'evaluate'
      ? s
      /* No result exists for the mode we're arriving at, so the control card
         must be open — otherwise a controlCollapsed left true by a previous
         run in a different mode would hide the very form this mode needs. */
      : { ...s, section: 'evaluate', mode: key, result: null, compare: null, controlCollapsed: false }));
  }, [update, state.model, toast]);

  /** Open a saved history entry on the result screen. */
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
        ...s, section: 'result', mode: h.mode,
        compare: payload, result: null, compareTab: 'summary', cmpOne: 0, controlCollapsed: true,
      }));
      resetResultFlags(payload);
    } else if (!payload.isCompare) {
      update((s) => ({
        ...s, section: 'result', mode: h.mode,
        result: payload, compare: null, resultTab: 'strategy', controlCollapsed: true,
      }));
      resetResultFlags(payload);
    }
  }, [state.history, state.personas, state.axes, update, resetResultFlags, toast]);

  return { goSection, goMode, openHistory };
}
