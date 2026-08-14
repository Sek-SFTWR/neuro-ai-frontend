/* ==========================================================================
   selectors.ts — derived reads over AppState, ported from the selector half
   of assets/js/state.js. Pure functions; components call these with the
   current state/result rather than reaching into globals.
   ========================================================================== */

import { attrOf, sortAttrs } from './palette';
import type { AppState } from './store';
import type { CompareResult, Evaluation, EvaluationResult, Persona, StatusKey } from './types';

export function selectedPersonaIds(state: AppState): string[] {
  return state.personas.filter((p) => state.selected[p.id]).map((p) => p.id);
}

export function selectedPersonas(state: AppState): Persona[] {
  return state.personas.filter((p) => state.selected[p.id]);
}

/** Case-insensitive name/attribute/trait match — shared by the top-bar quick
    search and the Personas screen's own search box. */
export function searchPersonas(state: AppState, query: string): Persona[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return state.personas.filter((p) =>
    p.name.toLowerCase().includes(q) || p.attribute.toLowerCase().includes(q) || p.trait.toLowerCase().includes(q));
}

export interface AttrGroup {
  attr: string;
  personas: Persona[];
}

/** Distinct attribute layers across a persona roster, （属性なし） last. */
export function attrGroups(personas: Persona[]): AttrGroup[] {
  const map: Record<string, Persona[]> = {};
  personas.forEach((p) => {
    const a = attrOf(p);
    (map[a] = map[a] || []).push(p);
  });
  return sortAttrs(Object.keys(map)).map((a) => ({ attr: a, personas: map[a] }));
}

export function personaById(state: AppState, id: string): Persona | null {
  return state.personas.find((p) => p.id === id) || null;
}

/** Evaluations for the personas currently visible in a result view. */
export function shownEvals(state: AppState, res: EvaluationResult | null | undefined): Evaluation[] {
  if (!res) return [];
  return res.evaluations.filter((e) => state.shown[e.personaId] !== false);
}

/** Every evaluation, ignoring the visibility filter. */
export function allEvals(res: EvaluationResult | null | undefined): Evaluation[] {
  return res ? res.evaluations : [];
}

/** Evaluations belonging to one attribute layer (all personas, not just shown). */
export function evalsInLayer(state: AppState, res: EvaluationResult | null | undefined, attr: string): Evaluation[] {
  if (!res) return [];
  return res.evaluations.filter((e) => attrOf(personaById(state, e.personaId)) === attr);
}

export const DEFAULT_SHOWN = 8;

/** Layers enabled for averaging (the 層平均 chips). */
export function enabledLayers(state: AppState, res: EvaluationResult | null | undefined): string[] {
  if (!res) return [];
  return attrGroups(res.personas)
    .filter((g) => state.layerAvg[g.attr])
    .map((g) => g.attr);
}

/** Personas hidden purely because of the initial cap. */
export function hiddenCount(state: AppState, res: EvaluationResult | null | undefined): number {
  if (!res) return 0;
  return res.personas.filter((p) => state.shown[p.id] === false).length;
}

/** Initial per-result view flags when a new result is opened. */
export function initResultFlags(res: EvaluationResult | CompareResult | null | undefined) {
  const shown: Record<string, boolean> = {};
  const layerAvg: Record<string, boolean> = {};
  if (!res) return { shown, layerAvg };

  const personas = res.isCompare ? res.results[0].personas : res.personas;
  /* A 45-persona roster produces 45 unreadable chart series and a 45-row
     evidence table. Open with a legible subset; the filter reveals the rest. */
  const cap = personas.length > 10 ? DEFAULT_SHOWN : personas.length;
  personas.forEach((p, i) => { shown[p.id] = i < cap; });

  attrGroups(personas).forEach((g) => { layerAvg[g.attr] = false; });

  return { shown, layerAvg };
}
