/* ==========================================================================
   palette.ts — colour maps and small formatting helpers shared by all views.
   Ported verbatim from assets/js/palette.js; MS.esc() and MS.hl() are gone
   because React escapes for us (see components/ui/Hl.tsx for the ** markup).
   ========================================================================== */

import type { IconName } from '@/components/Icon';
import type { ModeKey, ModelKey, Persona, SpliceSec, StatusKey } from './types';

/* --- Status (kanban columns, mode badges) ------------------------------- */
export const STATUS: Record<StatusKey, { key: StatusKey; label: string; fg: string; bg: string }> = {
  todo: { key: 'todo', label: '未実行', fg: '#6B7280', bg: '#F4F4F5' },
  running: { key: 'running', label: '解析中', fg: '#EA580C', bg: '#FEF0E9' },
  review: { key: 'review', label: 'レビュー待ち', fg: '#2563EB', bg: '#E8F0FE' },
  done: { key: 'done', label: '完了', fg: '#16A34A', bg: '#EAF7EE' },
};

export const STATUS_ORDER: StatusKey[] = ['todo', 'running', 'review', 'done'];

/* --- Priority ----------------------------------------------------------- */
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

/* --- System accent -------------------------------------------------------
   Selectable so a client can settle the brand colour during review without a
   rebuild. Each entry carries its own hover shade rather than deriving one:
   a computed darken looks wrong on the lighter hues, and these are eyeballed.
   The keys are stored in state, so adding one here is the whole change.
   -------------------------------------------------------------------------- */
export interface AccentDef {
  key: string;
  label: string;
  color: string;
  hover: string;
  /** Text colour to place ON this accent. Over half of this palette is light
      enough that white text falls below 3:1 — Yellow is 1.68:1, effectively
      invisible — so the foreground travels with the colour instead of every
      surface assuming white. Surfaces read it via --color-accent-fg. */
  fg: string;
}

export const ACCENTS: AccentDef[] = [
  /* The product's own vermilion, first in the list and the default. Not part
     of the supplied palette — it is the existing brand mark. White on it is
     3.35:1 (below AA); black is 6.26:1, so the same rule as every other entry
     applies and its foreground is black. */
  { key: 'brand', label: 'ブランドオレンジ', color: '#F4581F', hover: '#DB4A15', fg: '#000000' },

  /* The client's supplied palette, in their order. Hover is each colour at 85
     percent lightness; `fg` is whichever of white / near-black scores higher
     against it — every pairing here clears 4.5:1, which a fixed white could
     never do across a range this light. */
  { key: 'lime', label: 'ライム', color: '#A4C400', hover: '#8BA700', fg: '#000000' },
  { key: 'green', label: 'グリーン', color: '#60A917', hover: '#529014', fg: '#000000' },
  { key: 'emerald', label: 'エメラルド', color: '#008A00', hover: '#007500', fg: '#000000' },
  { key: 'teal', label: 'ティール', color: '#00ABA9', hover: '#009190', fg: '#000000' },
  { key: 'cyan', label: 'シアン', color: '#1BA1E2', hover: '#1789C0', fg: '#000000' },
  { key: 'cobalt', label: 'コバルト', color: '#0050EF', hover: '#0044CB', fg: '#FFFFFF' },
  { key: 'indigo', label: 'インディゴ', color: '#6A00FF', hover: '#5A00D9', fg: '#FFFFFF' },
  { key: 'violet', label: 'バイオレット', color: '#AA00FF', hover: '#9100D9', fg: '#FFFFFF' },
  { key: 'pink', label: 'ピンク', color: '#F472D0', hover: '#CF61B1', fg: '#000000' },
  { key: 'magenta', label: 'マゼンタ', color: '#D80073', hover: '#B80062', fg: '#FFFFFF' },
  { key: 'crimson', label: 'クリムゾン', color: '#A20025', hover: '#8A001F', fg: '#FFFFFF' },
  { key: 'red', label: 'レッド', color: '#E51400', hover: '#C31100', fg: '#FFFFFF' },
  { key: 'orange', label: 'オレンジ', color: '#FA6800', hover: '#D55800', fg: '#000000' },
  { key: 'amber', label: 'アンバー', color: '#F0A30A', hover: '#CC8B09', fg: '#000000' },
  { key: 'yellow', label: 'イエロー', color: '#E3C800', hover: '#C1AA00', fg: '#000000' },
  { key: 'brown', label: 'ブラウン', color: '#825A2C', hover: '#6F4D25', fg: '#FFFFFF' },
  { key: 'olive', label: 'オリーブ', color: '#6D8764', hover: '#5D7355', fg: '#000000' },
  { key: 'steel', label: 'スチール', color: '#647687', hover: '#556473', fg: '#FFFFFF' },
  { key: 'mauve', label: 'モーブ', color: '#76608A', hover: '#645275', fg: '#FFFFFF' },
  { key: 'taupe', label: 'トープ', color: '#87794E', hover: '#736742', fg: '#000000' },
];

export function accentOf(key: string): AccentDef {
  return ACCENTS.find((a) => a.key === key) ?? ACCENTS[0];
}

/* --- Analysis engine ---------------------------------------------------- */
export interface ModelDef {
  key: ModelKey;
  label: string;
  /** For the settings recap, where the row is already long. */
  short: string;
  icon: IconName;
  note: string;
  /** Whether the engine can score several videos in one run. NeuroAI takes a
      single file at a time, so the three 比較評価 modes are unavailable to it.
      Declared here so the picker, the mode guard and the run validator all
      read one fact instead of three copies of `model === 'neuroai'`. */
  supportsCompare: boolean;
}

export const MODELS: Record<ModelKey, ModelDef> = {
  neuroai: { key: 'neuroai', label: 'NeuroAI モデル', short: 'NeuroAI', icon: 'brain', note: 'ペルソナの反応予測に最適化された自社モデル', supportsCompare: false },
  gemini: { key: 'gemini', label: 'Gemini Vision モデル', short: 'Gemini Vision', icon: 'eye', note: '映像の被写体・構図の読み取りに強い汎用モデル', supportsCompare: true },
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
