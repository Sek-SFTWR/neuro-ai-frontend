export const login = {
  'login.title': { ja: '社内プレビュー', en: 'Internal preview' },
  'login.lead': {
    ja: '共有パスワードを入力してください。',
    en: 'Enter the shared password to continue.',
  },
  'login.password': { ja: 'パスワード', en: 'Password' },
  'login.showPassword': { ja: 'パスワードを表示', en: 'Show password' },
  'login.hidePassword': { ja: 'パスワードを非表示', en: 'Hide password' },
  'login.submit': { ja: 'ログイン', en: 'Log in' },
  'login.submitting': { ja: '確認中…', en: 'Checking…' },
  'login.invalid': { ja: 'パスワードが正しくありません。', en: 'That password is not correct.' },
  'login.rateLimited': {
    ja: '試行回数が多すぎます。しばらくしてからもう一度お試しください。',
    en: 'Too many attempts. Please try again in a few minutes.',
  },
  'login.misconfigured': {
    ja: 'サーバー側の設定が未完了です（APP_PASSWORD / AUTH_SECRET）。',
    en: 'The server is not configured yet (APP_PASSWORD / AUTH_SECRET).',
  },
  'login.networkError': {
    ja: '接続できませんでした。もう一度お試しください。',
    en: 'Could not reach the server. Please try again.',
  },
  'login.expired': {
    ja: 'セッションの有効期限が切れました。もう一度ログインしてください。',
    en: 'Your session has expired. Please log in again.',
  },
  'login.note': {
    ja: 'これはモックUIです。実データは含まれていません。',
    en: 'This is a mock UI. It contains no real data.',
  },
} satisfies Record<string, { ja: string; en: string }>;
