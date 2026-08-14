export const settings = {
  'settings.title': { ja: '設定', en: 'Settings' },
  'settings.back': { ja: '戻る', en: 'Back' },
  'settings.sub': {
    ja: '表示・解析・アカウントの設定です。この画面の変更はすぐに反映されます。',
    en: 'Display, analysis and account settings. Changes here apply immediately.',
  },

  /* --- account -------------------------------------------------------------- */
  'settings.account': { ja: 'アカウント', en: 'Account' },
  'settings.profile': { ja: 'プロフィール', en: 'Profile' },
  'settings.sharedAccount': { ja: '共有プレビューアカウント', en: 'Shared preview account' },
  'settings.sharedAccountNote': {
    ja: '社内共有のログインです。個人アカウントではないため、誰がログインしたかは記録されません。',
    en: 'One shared internal login. It is not a personal account, so it does not record who signed in.',
  },
  'settings.editProfile': { ja: 'プロフィールを編集', en: 'Edit profile' },
  'settings.profileComingSoon': {
    ja: 'モックUIのため、プロフィールは編集できません。',
    en: 'This is a mock UI, so the profile cannot be edited.',
  },

  /* --- appearance ----------------------------------------------------------- */
  'settings.appearance': { ja: '表示', en: 'Appearance' },
  'settings.theme': { ja: 'テーマ', en: 'Theme' },
  'settings.themeLight': { ja: 'ライト', en: 'Light' },
  'settings.themeDark': { ja: 'ダーク', en: 'Dark' },
  'settings.language': { ja: '表示言語', en: 'Language' },
  'settings.accent': { ja: 'システムカラー', en: 'System colour' },
  /* Says plainly that this control exists for the review, not for end users —
     otherwise it reads as a shipped personalisation feature. */
  'settings.accentNote': {
    ja: '※ モックUI用の項目です。ブランドカラーをその場で確認・決定していただくために用意しています。実装時は決定した1色に固定され、この選択欄は表示されません。',
    en: 'Note: this control exists for the mock only, so the brand colour can be reviewed and agreed on the spot. In the real build it is fixed to the chosen colour and this selector does not appear.',
  },

  /* --- analysis ------------------------------------------------------------- */
  'settings.analysis': { ja: '解析', en: 'Analysis' },
  'settings.model': { ja: '解析モデル', en: 'Analysis model' },
  'settings.splice': { ja: '解析間隔（スプライス）', en: 'Analysis interval (splice)' },
  'settings.analysisNote': {
    ja: 'すべての評価実行で使われる既定値です。',
    en: 'The defaults used for every evaluation run.',
  },

  /* --- criteria ------------------------------------------------------------- */
  'settings.criteria': { ja: '評価軸', en: 'Evaluation axes' },
  'settings.criteriaNote': {
    ja: '総合評価のレーダーチャートで使う評価軸です。ここで設定した軸が、すべての動画評価に共通で適用されます。',
    en: 'The axes used by the overall radar chart. They apply to every video evaluation.',
  },
  'settings.criteriaOpen': { ja: '評価軸を設定', en: 'Configure axes' },
  'settings.criteriaCount': { ja: '{count}件の評価軸', en: '{count} axes' },
  'settings.close': { ja: '閉じる', en: 'Close' },
} satisfies Record<string, { ja: string; en: string }>;
