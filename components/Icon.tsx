/* ==========================================================================
   Icon.tsx — lucide-style 24x24 stroke icon set, ported from assets/js/icons.js.
   No emoji anywhere in this app; every glyph comes from here.
   ========================================================================== */

const PATHS = {
  /* --- brand / media --------------------------------------------------- */
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  playCircle: '<circle cx="12" cy="12" r="9"/><polygon points="10 8.5 16 12 10 15.5"/>',
  pauseCircle: '<circle cx="12" cy="12" r="9"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2.5"/><polygon points="16 10.5 22 7 22 17 16 13.5"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10 9 15.5 12 10 15"/>',
  upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 9 12 4 17 9"/><line x1="12" y1="4" x2="12" y2="16"/>',
  monitor: '<rect x="2" y="4" width="20" height="13" rx="2.5"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',

  /* --- compare modes ---------------------------------------------------- */
  columns: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
  filesCompare: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/><line x1="5" y1="9" x2="8" y2="9"/><line x1="16" y1="9" x2="19" y2="9"/>',
  shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',

  /* --- navigation ------------------------------------------------------- */
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  trending: '<polyline points="3 16 8 10 12 13 21 5"/><polyline points="16 5 21 5 21 10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M17 5.5a3.5 3.5 0 010 6.5"/><path d="M18.5 20a6.4 6.4 0 00-2.5-5"/>',
  sliders: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.2"/><circle cx="15" cy="12" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
  /* A cog, distinct from `sliders`. The two used to share one glyph, so the
     app-wide settings screen and the per-run 評価軸/評価基準 controls were
     drawn identically despite being different destinations. */
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="6"/><line x1="16" y1="3" x2="16" y2="6"/>',

  /* --- rail utilities --------------------------------------------------- */
  sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.6 2.6 0 015 .9c0 1.8-2.5 2.2-2.5 3.9"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none"/>',
  logout: '<path d="M14 20H6a2 2 0 01-2-2V6a2 2 0 012-2h8"/><polyline points="16 8 20 12 16 16"/><line x1="10" y1="12" x2="20" y2="12"/>',

  /* --- generic actions -------------------------------------------------- */
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  x: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  check: '<polyline points="5 12.5 10 17.5 19 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/>',
  bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronRight: '<polyline points="9 6 15 12 9 18"/>',
  chevronLeft: '<polyline points="15 6 9 12 15 18"/>',
  dots: '<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>',
  grip: '<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>',
  refresh: '<path d="M20 11a8 8 0 10-1.6 5.4"/><polyline points="20 5 20 11 14 11"/>',
  trash: '<polyline points="4 7 20 7"/><path d="M9 7V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v2"/><path d="M6.5 7l1 13a1.5 1.5 0 001.5 1.4h6a1.5 1.5 0 001.5-1.4l1-13"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 013 3L7.5 18.5 3.5 20l1.5-4z"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  external: '<path d="M14 4h6v6"/><line x1="20" y1="4" x2="11" y2="13"/><path d="M18 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h5"/>',

  /* --- content ---------------------------------------------------------- */
  file: '<path d="M14 3v5h5"/><path d="M19 8v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h7z"/>',
  sheet: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="20"/>',
  folder: '<path d="M3 7.5A2 2 0 015 5.5h4l2 2.5h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 11 12 16 17 11"/><line x1="12" y1="4" x2="12" y2="16"/>',
  save: '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="8 21 8 14 16 14 16 21"/><polyline points="8 3 8 8 14 8"/>',
  camera: '<path d="M3 8.5A2 2 0 015 6.5h2.2l1.3-2h7l1.3 2H19a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="3.4"/>',
  imagePlus: '<path d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"/><circle cx="9" cy="9.5" r="1.6"/><polyline points="4 18 9.5 12.5 13 15.5"/><line x1="18" y1="3" x2="18" y2="9"/><line x1="15" y1="6" x2="21" y2="6"/>',
  paperclip: '<path d="M21 11l-8.5 8.5a4.5 4.5 0 01-6.4-6.4l8.6-8.6a3 3 0 014.3 4.3l-8.6 8.6a1.5 1.5 0 01-2.1-2.1l7.9-7.9"/>',
  comment: '<path d="M21 12a8 8 0 01-8 8H4l2-3a8 8 0 1115-5z"/>',
  flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>',

  /* --- analysis --------------------------------------------------------- */
  sparkles: '<path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M18.5 16.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/>',
  barChart: '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="11" width="3.4" height="6" rx="1"/><rect x="12" y="6" width="3.4" height="11" rx="1"/>',
  messageSquare: '<path d="M20 4H4a1.5 1.5 0 00-1.5 1.5v10A1.5 1.5 0 004 17h3v4l4.5-4H20a1.5 1.5 0 001.5-1.5v-10A1.5 1.5 0 0020 4z"/>',
  brain: '<path d="M9.5 3.5A2.8 2.8 0 007 6.3a2.6 2.6 0 00-1.6 4.5A2.8 2.8 0 006.5 16a2.7 2.7 0 003 4.4V3.5z"/><path d="M14.5 3.5A2.8 2.8 0 0117 6.3a2.6 2.6 0 011.6 4.5A2.8 2.8 0 0117.5 16a2.7 2.7 0 01-3 4.4V3.5z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  alert: '<path d="M12 4l9 16H3z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 11 15.5 16.5 9.5"/>',
  filter: '<polygon points="3 5 21 5 14 13 14 19 10 21 10 13"/>',
} as const;

export type IconName = keyof typeof PATHS;

/** Icons that are drawn filled rather than stroked. */
const FILLED: Partial<Record<IconName, true>> = { dots: true, play: true };

export interface IconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  fill?: string;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Set false to fall back to a flat single-tone render (rare — duotone is the default everywhere). */
  duotone?: boolean;
}

/**
 * Every icon renders as two stacked copies of the same path data — a soft,
 * low-opacity fill underneath (tinted to whatever colour the icon already
 * uses) and the crisp stroke line on top. This is what gives the set its
 * duotone depth without hand-authoring a second artwork layer per icon: any
 * closed shape in an icon (a circle, a rect, a polygon) picks up a tonal
 * "shadow" fill, while pure line details (a `<line>`, a chevron `<polyline>`)
 * contribute no fill area and simply stay crisp — exactly how professional
 * duotone sets like Phosphor or Solar treat simple glyphs. No call site needs
 * to change: the effect derives entirely from whatever `stroke`/`fill` colour
 * the caller already passes (or `currentColor` if neither is given).
 */
export function Icon({ name, size = 20, stroke, fill, width, className, style, duotone = true }: IconProps) {
  const d = PATHS[name];
  if (!d) return null;

  const filled = FILLED[name];
  const strokeColor = stroke || (filled ? 'none' : 'currentColor');
  const fillColor = fill || (filled ? 'currentColor' : 'none');
  const sw = width || 2;

  /* Small solid glyphs (the overflow-menu dots, the rail's play triangle)
     are single flat shapes with no line detail to duotone — leave them as-is. */
  if (filled || !duotone) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: d }}
      />
    );
  }

  const tint = strokeColor !== 'none' ? strokeColor : fillColor;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g fill={tint} fillOpacity={0.22} stroke="none" dangerouslySetInnerHTML={{ __html: d }} />
      <g
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: d }}
      />
    </svg>
  );
}

/* ======================================================================
   Brand mark
   A solid accent disc with the play triangle cut straight out of it, so the
   glyph is the negative space rather than a shape sitting on top. One path,
   one colour, no container — it reads at 16px and works on any background.
   ====================================================================== */

const LOGO_PATH =
  /* the disc */
  'M16 0a16 16 0 1 0 0 32a16 16 0 1 0 0-32z' +
  /* the play triangle, punched out via fill-rule="evenodd".
     Sits ~1.2u right of the disc's centre so it reads optically centred. */
  'M13.13 10.46L21.27 14.94Q23.2 16 21.27 17.06L13.13 21.54' +
  'Q11.2 22.6 11.2 20.4L11.2 11.6Q11.2 9.4 13.13 10.46z';

/* Defaults to the live accent token rather than a literal, so the brand mark
   follows the system colour the client picks. A hardcoded orange here left the
   logo stranded while every other accent surface re-tinted. */
export function Logo({ size = 32, color = 'var(--color-accent)' }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path fill={color} fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  );
}
