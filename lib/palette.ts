/* ==========================================================================
   palette.ts — colour maps and small formatting helpers shared by all views.
   Ported verbatim from assets/js/palette.js; MS.esc() and MS.hl() are gone
   because React escapes for us (see components/ui/Hl.tsx for the ** markup).
   ========================================================================== */

import type { IconName } from '@/components/Icon';
import type { ModeKey, ModelKey, Persona, PriorityKey, SpliceSec, StatusKey } from './types';

/* --- Status (kanban columns, mode badges) ------------------------------- */
export const STATUS: Record<StatusKey, { key: StatusKey; label: string; fg: string; bg: string }> = {
  todo: { key: 'todo', label: '未実行', fg: '#6B7280', bg: '#F4F4F5' },
  running: { key: 'running', label: '解析中', fg: '#EA580C', bg: '#FEF0E9' },
  review: { key: 'review', label: 'レビュー待ち', fg: '#2563EB', bg: '#E8F0FE' },
  done: { key: 'done', label: '完了', fg: '#16A34A', bg: '#EAF7EE' },
};

export const STATUS_ORDER: StatusKey[] = ['todo', 'running', 'review', 'done'];

/* --- Priority ----------------------------------------------------------- */
export const PRIORITY: Record<PriorityKey, { fg: string; bg: string }> = {
  高: { fg: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  中: { fg: '#EA580C', bg: 'rgba(234,88,12,0.08)' },
  低: { fg: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
};

/* --- Evaluation modes --------------------------------------------------- */
export interface ModeDef {
  key: ModeKey;
  label: string;
  short: string;
  icon: IconName;
  compare: boolean;
}

export const MODES: Record<ModeKey, ModeDef> = {
  youtube: { key: 'youtube', label: 'YouTube評価', short: 'YouTube', icon: 'youtube', compare: false },
  file: { key: 'file', label: '動画ファイル評価', short: '動画ファイル', icon: 'upload', compare: false },
  ytcompare: { key: 'ytcompare', label: 'YouTube比較評価', short: 'YouTube比較', icon: 'columns', compare: true },
  filecompare: { key: 'filecompare', label: '動画ファイル比較評価', short: '動画ファイル比較', icon: 'filesCompare', compare: true },
  mixcompare: { key: 'mixcompare', label: '混合比較評価', short: '混合比較', icon: 'shuffle', compare: true },
};

export const MODE_ORDER: ModeKey[] = ['youtube', 'file', 'ytcompare', 'filecompare', 'mixcompare'];

/* --- Analysis engine ---------------------------------------------------- */
export interface ModelDef {
  key: ModelKey;
  label: string;
  /** For the settings recap, where the row is already long. */
  short: string;
  icon: IconName;
  note: string;
}

export const MODELS: Record<ModelKey, ModelDef> = {
  neuroai: { key: 'neuroai', label: 'NeuroAI モデル', short: 'NeuroAI', icon: 'brain', note: 'ペルソナの反応予測に最適化された自社モデル' },
  gemini: { key: 'gemini', label: 'Gemini Vision モデル', short: 'Gemini Vision', icon: 'eye', note: '映像の被写体・構図の読み取りに強い汎用モデル' },
};

export const MODEL_ORDER: ModelKey[] = ['neuroai', 'gemini'];

/* --- Splice (analysis interval) ----------------------------------------- */
export const SPLICE_ORDER: SpliceSec[] = [0.25, 0.5, 0.75, 1];

/** `0.25` → "0.25秒", `1` → "1秒". */
export function spliceLabel(s: SpliceSec): string {
  return `${s}秒`;
}

/* Badge tint per mode, used on history rows. */
export const MODE_BADGE: Record<ModeKey, { fg: string; bg: string }> = {
  youtube: { fg: '#16A34A', bg: '#EAF7EE' },
  file: { fg: '#EA580C', bg: '#FEF0E9' },
  ytcompare: { fg: '#2563EB', bg: '#E8F0FE' },
  filecompare: { fg: '#2563EB', bg: '#E8F0FE' },
  mixcompare: { fg: '#6B7280', bg: '#F4F4F5' },
};

/* --- Per-video colours (compare) and per-attribute layer colours -------- */
export const VIDEO_COLORS = ['#2F6B4F', '#B5522A', '#2C3E63', '#C8912B', '#6D5B9E', '#2F8F8A'];
export const VIDEO_SYMBOLS = ['●', '▲', '■', '◆', '★', '✚'];
export const VIDEO_POINTS = ['circle', 'triangle', 'rect', 'rectRot', 'star', 'crossRot'];
export const LAYER_PALETTE = ['#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
export const AVG_COLOR = '#64748B';

/* Deterministic persona colour when none is stored. */
export const PERSONA_COLORS = [
  '#2F6B4F', '#C8912B', '#B5522A', '#2C3E63', '#6D5B9E',
  '#2F8F8A', '#A8632F', '#3B5F8A', '#7A5C3E', '#4A6B2F',
];

export const NO_ATTR = '（属性なし）';

export const PRESET_AXES = [
  '清涼感の伝達', '健康イメージ', '和の世界観', 'タレント好感度',
  '高級感', '親しみやすさ', '革新性', 'コスパ感',
];

/* ======================================================================
   Helpers
   ====================================================================== */

export function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function initial(name: string): string {
  return String(name || '?').trim().charAt(0) || '?';
}

/** #RGB or #RRGGBB → rgba(). */
export function hexA(hex: string, a: number): string {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function fmtSize(bytes: number): string {
  if (bytes >= 1048576) return `${Math.round(bytes / 1048576)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function mean(arr: number[]): number {
  if (!arr || !arr.length) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

/* Sort attribute groups alphabetically, with （属性なし） always last. */
export function sortAttrs(attrs: string[]): string[] {
  return attrs.slice().sort((a, b) => {
    if (a === NO_ATTR) return 1;
    if (b === NO_ATTR) return -1;
    return a.localeCompare(b, 'ja');
  });
}

export function attrOf(p: Persona | null | undefined): string {
  return p && p.attribute ? p.attribute : NO_ATTR;
}

/* Stable colour for an attribute layer. */
export function layerColor(attr: string, allAttrs: string[]): string {
  const i = allAttrs.indexOf(attr);
  return LAYER_PALETTE[(i < 0 ? 0 : i) % LAYER_PALETTE.length];
}

/* Video identity in compare views: colour = persona, point-symbol = video. */
export function videoColor(i: number): string {
  return VIDEO_COLORS[i % VIDEO_COLORS.length];
}

export function videoSymbol(i: number): string {
  return VIDEO_SYMBOLS[i % VIDEO_SYMBOLS.length];
}
