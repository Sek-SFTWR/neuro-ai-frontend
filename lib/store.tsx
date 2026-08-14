'use client';

/* ==========================================================================
   store.tsx — the single in-memory store, ported from assets/js/state.js.
   Nothing is persisted (no localStorage), exactly as in the reference where
   the sheet is the source of truth. React context + useState stands in for
   the original's subscribe/notify pair.
   ========================================================================== */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadInitialData } from './mock-data';
import type {
  CompareResult, CompareTab, EvaluationResult, HistoryEntry, ModeInputs,
  ModeKey, ModelKey, Persona, ResultTab, SectionKey, SpliceSec,
} from './types';
import { initResultFlags } from './selectors';

export interface AppState {
  /* --- shell -------------------------------------------------------------- */
  section: SectionKey;
  /** The screen 設定 was opened from, so it has somewhere to go back to. */
  settingsFrom: SectionKey;
  mode: ModeKey;
  /* --- run settings, shared by every mode ---------------------------------- */
  model: ModelKey;
  splice: SpliceSec;
  /** Free-text appended to the analysis prompt for the next run. */
  instruction: string;
  showBanner: boolean;
  theme: 'light' | 'dark';
  /** Key into palette ACCENTS — the system's primary colour. */
  accent: string;
  locale: 'ja' | 'en';

  /* --- data ----------------------------------------------------------------- */
  personas: Persona[];
  axes: string[];
  history: HistoryEntry[];

  /* --- evaluation inputs, keyed by mode ------------------------------------- */
  selected: Record<string, boolean>;
  inputs: ModeInputs;

  /* --- results ---------------------------------------------------------------- */
  result: EvaluationResult | null;
  compare: CompareResult | null;
  resultTab: ResultTab;
  compareTab: CompareTab;

  /* --- per-result view flags (the old `_`-prefixed transients) ---------------- */
  shown: Record<string, boolean>;
  hideAvg: boolean;
  layerAvg: Record<string, boolean>;
  filterCollapsed: boolean;
  selectedSec: number;
  lineStyle: 'now' | 'old';
  radarMode: 'merged' | 'separate';
  stratView: 'grid' | 'single';
  cmpViewMode: 'persona' | 'avg';
  cmpOne: number;
  eqView: 'eq' | 'bubble';
  playbackMode: 'youtube' | 'gaze';
  controlCollapsed: boolean;

  /* --- ui ----------------------------------------------------------------------- */
  historySelection: Record<string, boolean>;
  personaSelection: Record<string, boolean>;
  /** Shared by the top-bar quick search and the Personas screen's own search box. */
  personaSearch: string;
}

function initialInputs(): ModeInputs {
  return {
    youtube: { url: '' },
    file: { file: null },
    ytcompare: { urls: ['', ''] },
    filecompare: { files: [] },
    mixcompare: { urls: ['', ''], files: [] },
  };
}

function buildInitialState(): AppState {
  const { personas, axes, history, selected } = loadInitialData();
  return {
    /* 実行履歴 is the app's home now that the dashboard is gone — it is the one
       screen that shows every saved result at once. */
    section: 'history',
    settingsFrom: 'history',
    mode: 'youtube',
    model: 'neuroai',
    splice: 1,
    instruction: '',
    showBanner: true,
    theme: 'light',
    accent: 'brand',
    locale: 'ja',

    personas,
    axes,
    history,

    selected,
    inputs: initialInputs(),

    result: null,
    compare: null,
    resultTab: 'strategy',
    compareTab: 'summary',

    shown: {},
    hideAvg: false,
    layerAvg: {},
    filterCollapsed: true,
    selectedSec: 0,
    lineStyle: 'now',
    radarMode: 'separate',
    stratView: 'grid',
    cmpViewMode: 'persona',
    cmpOne: 0,
    eqView: 'eq',
    playbackMode: 'youtube',
    controlCollapsed: false,

    historySelection: {},
    personaSelection: {},
    personaSearch: '',
  };
}

type Updater = (prev: AppState) => AppState;

interface StoreValue {
  state: AppState;
  /** Shallow-merge a patch, mirroring the old MS.set(). */
  patch: (partial: Partial<AppState>) => void;
  /** Full functional update for nested changes. */
  update: (fn: Updater) => void;
  /** Reset the per-result view flags when a new result is opened. */
  resetResultFlags: (res: EvaluationResult | CompareResult | null) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(buildInitialState);

  const patch = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const update = useCallback((fn: Updater) => {
    setState((prev) => fn(prev));
  }, []);

  const resetResultFlags = useCallback((res: EvaluationResult | CompareResult | null) => {
    const { shown, layerAvg } = initResultFlags(res);
    setState((prev) => ({
      ...prev,
      shown,
      hideAvg: false,
      layerAvg,
      filterCollapsed: true,
      selectedSec: 0,
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ state, patch, update, resetResultFlags }),
    [state, patch, update, resetResultFlags],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
