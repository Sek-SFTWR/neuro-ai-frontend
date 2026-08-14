/* ==========================================================================
   mock-data.ts — realistic dummy content from the real system's domain.
   Ported from assets/js/mock-data.js. Everything here stands in for a real
   backend; swap loadInitialData()/simulate()/resultFor() when wiring one up.
   ========================================================================== */

import { PERSONA_COLORS, MODES, mean } from './palette';
import type {
  AxisScore, CompareResult, Evaluation, EvaluationResult, HistoryEntry,
  ModeKey, ModelKey, Persona, PickedFile, PosNegRow, Scene, SpliceSec, TimelinePoint,
} from './types';

/* ======================================================================
   Deterministic PRNG so every reload shows the same numbers
   ====================================================================== */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Rng = () => number;

function rng(seed: string | number): Rng {
  let a = hash(String(seed));
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: Rng, arr: T[]): T {
  return arr[Math.floor(r() * arr.length) % arr.length];
}

/* ======================================================================
   Personas — 10 attribute layers, mirroring the production roster
   ====================================================================== */

const LAYERS: [string, string[]][] = [
  ['お〜いお茶主購入層', ['佐藤 健一', '鈴木 健太', '高橋 大輔', '田中 翔太', '渡辺 拓也']],
  ['ブランド非固定・スイッチャー層', ['伊藤 楓', '山本 達也', '中村 花恵', '小林 直樹', '加藤 和也']],
  ['ミライフーズ_マーケティング部', ['高梨 亮介', '白石 麻里', '森田 拓海', '近江 さやか', '藤原 健',
                                     '川口 有希', '桜井 陽菜', '大西 敦', '平野 直子', 'リン ジェイソン']],
  ['綾鷹主購入層', ['遠藤 翔', '青木 葵', '坂本 颯太', '福田 真由美', '太田 智子']],
  ['伊右衛門ミドル層', ['吉田 隆司', '山田 智也', '佐々木 浩二', '山口 誠', '松本 恵子']],
  ['伊右衛門ライト層', ['井上 健司', '木村 一郎', '林 雅之', '清水 由美', '山崎 和子']],
  ['伊右衛門ロイヤル層', ['森 加奈子', '池田 美咲', '橋本 剛', '阿部 杏', '石川 亮']],
  ['伊右衛門休眠層', ['山下 裕之', '中島 康弘', '石井 哲也', '小川 正樹', '前田 陽子']],
  ['生茶主購入層', ['岡田 秀樹', '長谷川 英樹', '村上 久美子', '近藤 圭介', '後藤 香織']],
  ['緑茶ライト', ['西村 彩乃', '藤井 修平', '岡本 沙織', '金子 裕子', '中野 健太郎']],
];

const TRAITS = [
  '日常にほっとする時間を求める人', '価格よりも味と品質を重視する人',
  '新商品を試すのが好きな人', '健康志向で成分表示をよく読む人',
  'ブランドより手軽さを優先する人', '家族のために選ぶ人',
  'SNSで話題の商品に敏感な人', '仕事の合間の一息を大切にする人',
  '和の世界観に惹かれる人', 'コスパを最優先する人',
];

const DETAILS = [
  '無添加・国産原料を重視し、日常の買い物ではスーパーとドラッグストアを使い分ける。広告は「誠実さ」で判断する傾向が強い。',
  '通勤途中のコンビニで飲料を選ぶことが多く、パッケージの視認性と価格の分かりやすさが購買の決め手になる。',
  'テレビよりも動画配信サービスの視聴時間が長く、タレント起用よりも映像の質感や音楽の印象で好みが決まる。',
  '家族の健康を第一に考え、糖質やカフェインの表示を確認する。ブランドへの信頼が形成されると長く継続購入する。',
  '職場でまとめ買いをすることが多く、味の安定性と入手しやすさを重視する。新規ブランドへの切り替えには慎重。',
];

function buildPersonas(): Persona[] {
  const out: Persona[] = [];
  let n = 0;
  LAYERS.forEach(([attr, names], li) => {
    names.forEach((name, i) => {
      const r = rng('persona-' + name);
      out.push({
        id: 'p' + ++n,
        name,
        attribute: attr,
        trait: pick(r, TRAITS),
        detail: pick(r, DETAILS),
        color: PERSONA_COLORS[(li * 3 + i) % PERSONA_COLORS.length],
        photoUrl: '',
      });
    });
  });
  return out;
}

/* ======================================================================
   Evaluation axes
   ====================================================================== */

const AXES = ['ブランド好意度', '購買意向', '推奨意向', '共感性', '映像の魅力',
              '訴求の伝達', '記憶定着', '話題性', '情緒的価値', '清涼感の伝達'];

/* ======================================================================
   History — the source of 実行履歴
   ====================================================================== */

const HISTORY: HistoryEntry[] = [
  { id: 'h1', title: 'Alyaska (ice cream) Аляска займраг', mode: 'youtube',
    status: 'running', priority: '高', savedAt: '2026-08-06 18:14', durationSec: 52,
    personaCount: 5, axesDone: 4, due: '2026-08-08', files: 52, comments: 7 },

  { id: 'h2', title: '01_夏15_fullbit_事業会社宣伝部.mp4', mode: 'file',
    status: 'todo', priority: '高', savedAt: '2026-07-31 15:36', durationSec: 15,
    personaCount: 10, axesDone: 0, due: '2026-08-12', files: 15, comments: 0 },

  { id: 'h3', title: 'NeuroAI_movie_How to.mp4', mode: 'file',
    status: 'todo', priority: '中', savedAt: '2026-07-23 13:46', durationSec: 68,
    personaCount: 10, axesDone: 0, due: '2026-08-18', files: 68, comments: 0 },

  { id: 'h4', title: 'NeuroAI_movie_capability.mp4', mode: 'file',
    status: 'running', priority: '低', savedAt: '2026-07-23 13:46', durationSec: 30,
    personaCount: 10, axesDone: 2, due: '2026-08-11', files: 30, comments: 4 },

  { id: 'h5', title: 'お〜いお茶 濃い茶「冴えわたれ、私」篇｜伊藤園', mode: 'youtube',
    status: 'todo', priority: '低', savedAt: '2026-07-24 11:05', durationSec: 15,
    personaCount: 10, axesDone: 0, due: '2026-08-14', files: 0, comments: 0 },

  { id: 'h6', title: '6本の比較：緑茶カテゴリ 夏キャンペーン', mode: 'ytcompare',
    status: 'running', priority: '中', savedAt: '2026-07-07 20:33', durationSec: 15,
    personaCount: 45, axesDone: 6, due: '2026-08-10', files: 6, comments: 21,
    videos: ['サントリー緑茶 伊右衛門『父とお茶した・夏』15秒篇',
             '【綾鷹】佐藤健 TVCM「お茶、しよっか。オフィス」篇 15秒',
             'キリン 生茶「きもちよさ、と生きていく 2人」篇 15秒'] },

  { id: 'h7', title: 'お〜いお茶×大谷翔平「いつの日も、僕のそばには お茶がある。」篇 Ver. ON（15秒）',
    mode: 'youtube', status: 'done', priority: '中', savedAt: '2026-07-30 11:15', durationSec: 15,
    personaCount: 45, axesDone: 10, due: '2026-07-30', files: 15, comments: 45 },

  { id: 'h8', title: 'サントリー緑茶 伊右衛門『父とお茶した・夏』15秒篇 奈緒 光石研 サントリー',
    mode: 'youtube', status: 'review', priority: '低', savedAt: '2026-07-19 20:03', durationSec: 15,
    personaCount: 45, axesDone: 10, due: '2026-08-07', files: 15, comments: 45 },

  { id: 'h9', title: '【綾鷹】おにぎり食堂 綾鷹屋 上白石 萌歌 TVCM「あや茶丸 鮭バターおにぎり」篇 15秒 AYATAKA TVCF',
    mode: 'youtube', status: 'done', priority: '低', savedAt: '2026-07-07 20:33', durationSec: 15,
    personaCount: 45, axesDone: 10, due: '2026-07-27', files: 15, comments: 33 },

  { id: 'h10', title: '【綾鷹】佐藤健 TVCM 「お茶、しよっか。オフィス」篇 15秒 AYATAKA TVCF',
    mode: 'youtube', status: 'review', priority: '中', savedAt: '2026-07-07 20:33', durationSec: 15,
    personaCount: 45, axesDone: 10, due: '2026-08-07', files: 15, comments: 38 },

  { id: 'h11', title: 'お〜いお茶 「純国産茶葉100%」篇（日本国内版）', mode: 'youtube',
    status: 'done', priority: '高', savedAt: '2026-07-07 20:33', durationSec: 15,
    personaCount: 45, axesDone: 10, due: '2026-07-25', files: 15, comments: 41 },

  { id: 'h12', title: 'キリン 生茶「きもちよさ、と生きていく 2人」篇 15秒', mode: 'youtube',
    status: 'running', priority: '中', savedAt: '2026-07-07 20:33', durationSec: 15,
    personaCount: 45, axesDone: 3, due: '2026-08-09', files: 15, comments: 12 },

  { id: 'h13', title: '混合比較：夏キャンペーン3案', mode: 'mixcompare',
    status: 'review', priority: '高', savedAt: '2026-07-07 20:34', durationSec: 15,
    personaCount: 10, axesDone: 10, due: '2026-08-08', files: 9, comments: 27,
    videos: ['お〜いお茶 「純国産茶葉100%」篇（日本国内版）',
             '01_夏15_fullbit_事業会社宣伝部.mp4',
             'NeuroAI_movie_capability.mp4'] },

  { id: 'h14', title: '動画ファイル比較：NeuroAI 2素材', mode: 'filecompare',
    status: 'done', priority: '低', savedAt: '2026-07-05 09:12', durationSec: 30,
    personaCount: 10, axesDone: 10, due: '2026-07-20', files: 8, comments: 19,
    videos: ['NeuroAI_movie_How to.mp4', 'NeuroAI_movie_capability.mp4'] },

  { id: 'h15', title: 'お〜いお茶 濃い茶「集中のスイッチ」篇 30秒', mode: 'youtube',
    status: 'done', priority: '中', savedAt: '2026-06-28 14:40', durationSec: 30,
    personaCount: 10, axesDone: 10, due: '2026-07-10', files: 30, comments: 22 },
];

/* ======================================================================
   Result generators
   ====================================================================== */

const SCENE_LABELS = [
  '公園でアイスを食べる男の子', '朝の食卓で家族が talking する場面', 'タレントが振り向くカット',
  '茶畑の遠景から寄っていくカット', 'ペットボトルを開栓するクローズアップ',
  'オフィスで一息つく女性', '湯呑みに緑茶を注ぐ手元', '商品パッケージのアップ',
  '夏の街を歩く後ろ姿', '製造ラインの俯瞰カット', '茶葉をすくうクローズアップ',
  '子どもが笑顔で振り返る', '風にそよぐ茶畑と青空', 'ロゴとキャッチコピーの提示',
  '商品を手に取る瞬間', 'グラスに注がれる緑茶', '家族が食卓を囲む引き',
  '夕暮れの縁側でくつろぐ', '駅のホームで飲むシーン', '結びのブランドロゴ',
];

const NARRATIONS = [
  'あなたの毎日に、澄んだ一杯を。', '茶葉のちから、まっすぐに。',
  '暮らしのそばに、いつもお茶がある。', '純国産茶葉100%。',
  '深くて、澄んでいて、うまい。', 'ひと息が、次の一歩をつくる。', '',
];

function commentFor(r: Rng, score: number, label: string): string {
  if (score >= 8) return pick(r, [
    label + 'の見せ方が印象的で、思わず見入ってしまいます。',
    'ここは商品の魅力がはっきり伝わってきて、好感が持てます。',
    '映像と音のバランスがよく、ブランドらしさを強く感じました。',
  ]);
  if (score >= 6) return pick(r, [
    '悪くない印象です。' + label + 'が自然に入ってきます。',
    '好感は持てますが、もう一歩踏み込んだ訴求が欲しいところです。',
    '落ち着いた導入で、続きが気になります。',
  ]);
  if (score >= 4) return pick(r, [
    label + 'ですね。特段変わったところはありません。',
    'よくある構成なので、記憶には残りにくいかもしれません。',
    '静かなのは良いですが、何が始まるのか少し不安です。',
  ]);
  return pick(r, [
    'ここは間延びして感じられ、離脱しそうになります。',
    '訴求が弱く、何を伝えたいのか掴みにくいです。',
    '自分向けではないと感じてしまいました。',
  ]);
}

function axisCommentFor(r: Rng, score: number, axis: string): string {
  if (score >= 4) return axis + 'は明確に伝わっており、ブランドへの信頼につながっています。';
  if (score >= 3) return axis + 'は一定水準ですが、他社との差別化までは至っていません。';
  if (score >= 2) return axis + 'の訴求が弱く、印象に残りにくい構成でした。';
  return axis + 'はほとんど感じられませんでした。';
}

interface ResultSeed {
  id: string;
  title: string;
  mode: ModeKey;
  personaCount: number;
  durationSec?: number;
  model?: ModelKey;
  spliceSec?: SpliceSec;
}

/* History entries saved before these settings existed carry neither, so every
   read defaults to what the app did back then: NeuroAI, one sample a second. */
export const DEFAULT_MODEL: ModelKey = 'neuroai';
export const DEFAULT_SPLICE: SpliceSec = 1;

/** Build a full single-video result object for a history entry. */
function buildResult(h: ResultSeed, personaRoster: Persona[], axesList: string[], seedSuffix?: string): EvaluationResult {
  const seed = h.id + (seedSuffix || '');
  const r = rng(seed);
  const personas = personaRoster.slice(0, h.personaCount);
  const axes = axesList.slice();
  const dur = Math.max(5, h.durationSec || 15);

  const scenes: Scene[] = [];
  for (let s = 0; s < dur; s++) {
    scenes.push({
      sec: s,
      label: SCENE_LABELS[(s + hash(seed)) % SCENE_LABELS.length],
      narration: pick(r, NARRATIONS),
      image: '',
    });
  }

  const evaluations: Evaluation[] = personas.map((p) => {
    const pr = rng(seed + p.id);
    const base = 3.4 + pr() * 3.6; // per-persona disposition
    const timeline: TimelinePoint[] = scenes.map((sc, i) => {
      const wave = Math.sin((i / dur) * Math.PI * 1.6) * 1.5;
      const score = Math.max(1, Math.min(10, Math.round(base + wave + (pr() - 0.5) * 2)));
      return { sec: i, score, comment: commentFor(pr, score, sc.label) };
    });
    const overall: AxisScore[] = axes.map((ax) => {
      const score = Math.max(1, Math.min(5, Math.round(base / 2 + (pr() - 0.5) * 2)));
      return { axis: ax, score, comment: axisCommentFor(pr, score, ax) };
    });
    return { personaId: p.id, timeline, overall };
  });

  const perSecond = scenes.map((sc, i) => ({
    sec: i,
    text: i === 0
      ? '**' + sc.label + '**から始まります。ペルソナたちは**穏やかな日常の光景**として受け止めていますが、特段のフックがないため、評価は5点前後の**ニュートラルなスタート**となっています。'
      : sc.label + 'では、' + (i % 3 === 0
          ? '**商品の存在感**が高まり、購買意向に近い反応が見られます。'
          : '映像の情緒面が評価される一方、**訴求の明確さ**には課題が残ります。'),
  }));

  return {
    id: h.id,
    historyId: h.id,
    mode: h.mode,
    meta: {
      title: h.title,
      durationSec: dur,
      thumbnail: '',
      watchUrl: h.mode === 'youtube' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '',
      model: h.model || DEFAULT_MODEL,
      spliceSec: h.spliceSec || DEFAULT_SPLICE,
    },
    axes,
    personas,
    scenes,
    evaluations,
    insights: {
      strategy: {
        oneLine: '**日常の何気ない一瞬**を起点に、緑茶を「暮らしに寄り添う存在」として再定義する。',
        target: '30〜40代の共働き世帯。忙しさの中で**ほっとする時間**を意識的に確保したいと考える層。',
        insight: '飲料選択は「味」ではなく**その時間の質**で決まっている。お茶は選ぶ対象ではなく、生活の背景音になっている。',
        value: '**純国産茶葉100%**という確かさを、押しつけずに情緒的な安心感として届ける。',
        detail: '前半は生活シーンの積み重ねで共感を作り、後半で商品と製法情報を一気に提示する構成。' +
                '**タレント好感度**に依存せず、映像の質感とナレーションのトーンでブランド想起を高めている点が特徴。' +
                '一方で購買意向への橋渡しが弱く、店頭想起につながる要素が不足している。',
      },
      scoreTrend: '序盤は**ニュートラル**な立ち上がりですが、中盤で商品カットが入ると全体的にスコアが上昇します。' +
                  '終盤のロゴ提示で再び緩やかに低下しており、**締めの訴求**に改善余地があります。',
      radar: '**情緒的価値**と**映像の魅力**が突出する一方、**購買意向**と**話題性**が伸び悩んでいます。' +
             'ブランド好意度は高水準にあるため、行動喚起の一言を加えるだけで転換率が改善する可能性があります。',
      matrix: 'ロイヤル層は全軸で高く評価する一方、**スイッチャー層**は「訴求の伝達」で厳しい評価をしています。' +
              '同じ映像でも、ブランド接触量によって受け取り方が大きく分かれる構造です。',
      perSecond,
    },
    posneg: {
      summary: '全体として**世界観の完成度**は高く評価されましたが、「結局なにが新しいのか」が伝わらないという指摘が' +
               '複数の層から挙がりました。**製法や原料の一言**を映像内に加えることが最優先の改善点です。',
      rows: personas.map((p): PosNegRow => {
        const pr = rng(seed + 'pn' + p.id);
        return {
          personaId: p.id,
          good: pick(pr, [
            '映像のトーンが落ち着いていて、ブランドの誠実さが伝わってきました。',
            'music と映像のテンポが合っていて、最後まで気持ちよく見られます。',
            '日常のシーンが自分の生活と重なり、親しみを感じました。',
          ]),
          bad: pick(pr, [
            '商品の特徴が最後まで分からず、他社との違いが見えませんでした。',
            '前半が長く感じられ、途中で意識が離れてしまいます。',
            'ナレーションの情報量が少なく、印象だけで終わってしまいました。',
          ]),
          improve: pick(pr, [
            '中盤に製法や原料のカットを1秒入れるだけで納得感が大きく変わると思います。',
            '締めに「今日から新発売」など行動を促す一言があると動きやすいです。',
            'パッケージのアップをもう少し長く見せてほしいです。',
          ]),
        };
      }),
    },
  };
}

/** Build a compare result (2–6 videos) for a compare-mode history entry. */
function buildCompare(h: HistoryEntry, personaRoster: Persona[], axesList: string[]): CompareResult {
  const titles = h.videos && h.videos.length ? h.videos : [h.title];
  const results = titles.map((t, i) =>
    buildResult(
      { id: h.id + '_v' + i, title: t, mode: h.mode, personaCount: h.personaCount, durationSec: h.durationSec, model: h.model, spliceSec: h.spliceSec },
      personaRoster, axesList, '_v' + i,
    ),
  );

  return {
    id: h.id,
    historyId: h.id,
    mode: h.mode,
    isCompare: true,
    meta: {
      title: titles.length + '本の比較：' + titles.slice(0, 2).join(' / '),
      durationSec: h.durationSec,
      model: h.model || DEFAULT_MODEL,
      spliceSec: h.spliceSec || DEFAULT_SPLICE,
    },
    axes: axesList.slice(),
    personas: results[0].personas,
    results,
    cmp: {
      summary: '3案のうち、**情緒的価値**で最も高い評価を得たのは1案目ですが、' +
               '**購買意向**では2案目が優位です。ターゲットの購買段階に応じた出し分けが有効と考えられます。',
      perVideo: results.map((_res, i) => ({
        index: i + 1,
        strengths: ['映像の質感が高く、ブランドの世界観が明確', '導入から中盤までの離脱が少ない'][i % 2],
        weaknesses: ['商品ベネフィットの言語化が弱い', '終盤の訴求が駆け足で情報が入りにくい'][i % 2],
      })),
    },
    cmpInsights: {
      scoreTrend: '**1案目**は中盤にピークを作る山型、**2案目**は序盤から高く推移するフラット型です。' +
                  '短尺での接触が多い媒体では2案目が有利に働きます。',
      radar: '軸ごとの優劣がはっきり分かれており、**単一案での全方位カバーは困難**です。' +
             '媒体別に案を出し分ける方針を推奨します。',
      matrix: 'ロイヤル層は全案を高く評価しますが、**スイッチャー層**の評価は案ごとに1点以上の差が出ています。',
      perSecond: results[0].scenes.map((sc, i) => ({
        sec: i,
        text: sc.label + 'の時点では、案ごとの差はまだ小さく、全体に**様子見の評価**が並びます。',
      })),
    },
  };
}

/* ======================================================================
   Public API — swap these for real backend calls when wiring one up
   ====================================================================== */

export interface AppData {
  personas: Persona[];
  axes: string[];
  history: HistoryEntry[];
  selected: Record<string, boolean>;
}

export function loadInitialData(): AppData {
  const personas = buildPersonas();
  const axes = AXES.slice();
  const history = HISTORY.map((h) => ({ ...h }));

  /* Preselect the first layer so the evaluation screens are not empty. */
  const selected: Record<string, boolean> = {};
  personas.slice(0, 5).forEach((p) => { selected[p.id] = true; });

  return { personas, axes, history, selected };
}

const cache: Record<string, EvaluationResult | CompareResult> = {};

/** Return (memoised) the result payload for a history entry. */
export function resultFor(h: HistoryEntry, personaRoster: Persona[], axesList: string[]): EvaluationResult | CompareResult | null {
  if (cache[h.id]) return cache[h.id];
  if (h.status === 'todo') return null; // not evaluated yet
  const res = MODES[h.mode].compare ? buildCompare(h, personaRoster, axesList) : buildResult(h, personaRoster, axesList);
  cache[h.id] = res;
  return res;
}

function restrictToPersonas<T extends EvaluationResult>(res: T, wanted: Record<string, boolean>): T {
  res.personas = res.personas.filter((p) => wanted[p.id]);
  res.evaluations = res.evaluations.filter((e) => wanted[e.personaId]);
  if (res.posneg) res.posneg.rows = res.posneg.rows.filter((row) => wanted[row.personaId]);
  return res;
}

/** Fresh result for a just-run evaluation in `mode`. */
export function simulate(
  mode: ModeKey,
  title: string | string[],
  personaIds: string[],
  durationSec: number | undefined,
  personaRoster: Persona[],
  axesList: string[],
  runId: string,
  /* An object rather than two more positionals — the list is long enough that
     a bare `'neuroai', 0.5` at the call site would say nothing. */
  settings: { model: ModelKey; spliceSec: SpliceSec },
): EvaluationResult | CompareResult {
  const h: HistoryEntry = {
    id: runId,
    title: Array.isArray(title) ? title.join(' / ') : title,
    mode,
    status: 'review',
    priority: '中',
    savedAt: '',
    durationSec: durationSec || 15,
    personaCount: personaIds.length,
    axesDone: axesList.length,
    due: '',
    files: 0,
    comments: 0,
    model: settings.model,
    spliceSec: settings.spliceSec,
  };

  let res: EvaluationResult | CompareResult;
  if (MODES[mode].compare) {
    h.videos = Array.isArray(title) ? title : [title];
    h.title = h.videos.length + '本の比較：' + h.videos.slice(0, 2).join(' / ');
    res = buildCompare(h, personaRoster, axesList);
  } else {
    res = buildResult(h, personaRoster, axesList);
  }

  /* Restrict to exactly the personas the user picked. */
  const wanted: Record<string, boolean> = {};
  personaIds.forEach((id) => { wanted[id] = true; });

  if (res.isCompare) {
    res.results.forEach((r) => restrictToPersonas(r, wanted));
    res.personas = res.results[0].personas;
  } else {
    restrictToPersonas(res, wanted);
  }

  cache[h.id] = res;
  return res;
}

export function makePickedFileMeta(name: string, size: number, duration = 15): PickedFile {
  return { name, size, duration };
}

/* ======================================================================
   Aggregate helpers used by 実行履歴 and result headers
   ====================================================================== */

export function overallScore(res: EvaluationResult): number {
  const all: number[] = [];
  res.evaluations.forEach((e) => e.timeline.forEach((t) => all.push(t.score)));
  return Math.round(mean(all) * 10);
}

export function personaAverage(ev: Evaluation): number {
  return mean(ev.timeline.map((t) => t.score));
}

export function axisAverage(res: EvaluationResult, axis: string, evals?: Evaluation[]): number {
  const list = (evals || res.evaluations).map((e) => {
    const hit = e.overall.filter((o) => o.axis === axis)[0];
    return hit ? hit.score : 0;
  });
  return mean(list);
}
