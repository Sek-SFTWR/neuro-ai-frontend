/* ==========================================================================
   Domain types. The mock layer in lib/mock-data.ts produces exactly these
   shapes, so swapping it for a real backend is a matter of matching them.
   ========================================================================== */

export type StatusKey = 'todo' | 'running' | 'review' | 'done';
export type ModeKey = 'youtube' | 'file' | 'ytcompare' | 'filecompare' | 'mixcompare';

/** Which engine analyses the video. */
export type ModelKey = 'neuroai' | 'gemini';
/** Seconds between analysis samples — the "splice" the run is cut into. */
export type SpliceSec = 0.25 | 0.5 | 0.75 | 1;

export type SectionKey = 'evaluate' | 'result' | 'history' | 'personas' | 'settings';

export type ResultTab = 'strategy' | 'timeline' | 'overall' | 'posneg' | 'playback';
export type CompareTab = 'summary' | ResultTab;

export interface Persona {
  id: string;
  name: string;
  /** Display name of whoever added this persona. The login is shared, so this
      is authored metadata, not an identity the app can verify. */
  createdBy: string;
  attribute: string;
  trait: string;
  detail: string;
  color: string;
  photoUrl: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  mode: ModeKey;
  status: StatusKey;
  /** Display name of whoever ran this evaluation — see Persona.createdBy. */
  createdBy: string;
  /** When the run was saved. This is the card's date; there is no deadline. */
  savedAt: string;
  durationSec: number;
  personaCount: number;
  axesDone: number;
  files: number;
  comments: number;
  /** Absent on entries saved before the settings existed — read via SPLICE_FALLBACK. */
  model?: ModelKey;
  spliceSec?: SpliceSec;
  /** Titles of the individual videos, for the three compare modes. */
  videos?: string[];
}

export interface Scene {
  sec: number;
  label: string;
  narration: string;
  image: string;
}

/** Per-second score, 0–10. */
export interface TimelinePoint {
  sec: number;
  score: number;
  comment: string;
}

/** Per-axis score, 0–5. */
export interface AxisScore {
  axis: string;
  score: number;
  comment: string;
}

export interface Evaluation {
  personaId: string;
  timeline: TimelinePoint[];
  overall: AxisScore[];
}

export interface StrategyInsight {
  oneLine: string;
  target: string;
  insight: string;
  value: string;
  detail: string;
}

export interface PerSecondInsight {
  sec: number;
  text: string;
}

export interface PosNegRow {
  personaId: string;
  good: string;
  bad: string;
  improve: string;
}

export interface EvaluationResult {
  id: string;
  historyId: string;
  mode: ModeKey;
  isCompare?: false;
  meta: {
    title: string;
    durationSec: number;
    thumbnail: string;
    watchUrl: string;
    /** The settings this run was produced with. */
    model: ModelKey;
    spliceSec: SpliceSec;
  };
  axes: string[];
  personas: Persona[];
  scenes: Scene[];
  evaluations: Evaluation[];
  insights: {
    strategy: StrategyInsight;
    scoreTrend: string;
    radar: string;
    matrix: string;
    perSecond: PerSecondInsight[];
  };
  posneg: {
    summary: string;
    rows: PosNegRow[];
  } | null;
}

export interface CompareResult {
  id: string;
  historyId: string;
  mode: ModeKey;
  isCompare: true;
  meta: {
    title: string;
    durationSec: number;
    model: ModelKey;
    spliceSec: SpliceSec;
  };
  axes: string[];
  personas: Persona[];
  results: EvaluationResult[];
  cmp: {
    summary: string;
    perVideo: { index: number; strengths: string; weaknesses: string }[];
  };
  cmpInsights: {
    scoreTrend: string;
    radar: string;
    matrix: string;
    perSecond: PerSecondInsight[];
  };
}

/** A picked video file, reduced to the metadata the UI actually shows. */
export interface PickedFile {
  name: string;
  size: number;
  duration: number;
}

export interface ModeInputs {
  youtube: { url: string };
  file: { file: PickedFile | null };
  ytcompare: { urls: string[] };
  filecompare: { files: PickedFile[] };
  mixcompare: { urls: string[]; files: PickedFile[] };
}
