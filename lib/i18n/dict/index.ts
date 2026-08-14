import { common } from './common';
import { login } from './login';
import { shell } from './shell';

/** One namespace file per screen (personas.ts, history.ts, …)
    keeps this merge point a one-line-per-file addition — new namespaces
    never need to touch an existing one, so parallel work on different
    screens never conflicts on this file. */
export const DICT: Record<string, { ja: string; en: string }> = {
  ...common,
  ...login,
  ...shell,
};
