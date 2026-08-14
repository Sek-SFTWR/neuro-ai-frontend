'use client';

import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import { DICT } from './dict';

export type Locale = 'ja' | 'en';
type Vars = Record<string, string | number>;

function interpolate(str: string, vars?: Vars): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** `t('namespace.key', { count: 3 })` — looks up state.locale's string for
    the key (falling back to Japanese, then to the raw key itself so a
    missing translation never blanks the UI), then substitutes any {var}
    placeholders. */
export function useT() {
  const { state } = useStore();
  const locale = state.locale;
  return useCallback((key: string, vars?: Vars): string => {
    const entry = DICT[key];
    if (!entry) {
      if (process.env.NODE_ENV !== 'production') console.warn(`[i18n] missing key: ${key}`);
      return key;
    }
    return interpolate(entry[locale] ?? entry.ja, vars);
  }, [locale]);
}
