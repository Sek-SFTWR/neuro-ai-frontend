export const login = {
  /* --- shared -------------------------------------------------------------- */
  'login.password': { ja: 'パスワード', en: 'Password' },
  'login.showPassword': { ja: 'パスワードを表示', en: 'Show password' },
  'login.hidePassword': { ja: 'パスワードを非表示', en: 'Hide password' },
  'login.email': { ja: 'メールアドレス', en: 'Email address' },
  'login.emailPlaceholder': { ja: 'you@example.com', en: 'you@example.com' },
  'auth.emailRequired': { ja: 'メールアドレスを入力してください。', en: 'Please enter your email address.' },
  'auth.emailInvalid': { ja: 'メールアドレスの形式が正しくありません。', en: 'That email address is not valid.' },
  'login.networkError': {
    ja: '接続できませんでした。もう一度お試しください。',
    en: 'Could not reach the server. Please try again.',
  },
  'login.note': {
    ja: 'これはモックUIです。実データは含まれていません。',
    en: 'This is a mock UI. It contains no real data.',
  },

  /* --- login --------------------------------------------------------------- */
  'login.title': { ja: '社内プレビュー', en: 'Internal preview' },
  'login.lead': {
    ja: 'メールアドレスと共有パスワードを入力してください。',
    en: 'Enter your email address and the shared password.',
  },
  'login.submit': { ja: 'ログイン', en: 'Log in' },
  'login.submitting': { ja: '確認中…', en: 'Checking…' },
  /* Never names which half was wrong — see the route handler. */
  'login.invalid': {
    ja: 'メールアドレスまたはパスワードが正しくありません。',
    en: 'That email address or password is not correct.',
  },
  'login.rateLimited': {
    ja: '試行回数が多すぎます。しばらくしてからもう一度お試しください。',
    en: 'Too many attempts. Please try again in a few minutes.',
  },
  'login.misconfigured': {
    ja: 'サーバー側の設定が未完了です（APP_EMAIL / APP_PASSWORD / AUTH_SECRET）。',
    en: 'The server is not configured yet (APP_EMAIL / APP_PASSWORD / AUTH_SECRET).',
  },
  'login.expired': {
    ja: 'セッションの有効期限が切れました。もう一度ログインしてください。',
    en: 'Your session has expired. Please log in again.',
  },
  'login.toRegister': { ja: 'アカウント作成', en: 'Create an account' },
  'login.toForgot': { ja: 'パスワードをお忘れですか？', en: 'Forgot your password?' },

  /* --- register ------------------------------------------------------------ */
  'register.title': { ja: 'アカウント作成', en: 'Create an account' },
  'register.lead': {
    ja: '必要事項を入力してアカウントを申請します。',
    en: 'Fill in your details to request an account.',
  },
  'register.name': { ja: '氏名', en: 'Full name' },
  'register.namePlaceholder': { ja: '例：田中 美咲', en: 'e.g. Alex Tanaka' },
  'register.company': { ja: '会社名・部署（任意）', en: 'Company / team (optional)' },
  'register.companyPlaceholder': { ja: '例：マーケティング部', en: 'e.g. Marketing' },
  'register.passwordHint': { ja: '8文字以上', en: 'At least 8 characters' },
  'register.confirm': { ja: 'パスワード（確認）', en: 'Confirm password' },
  'register.submit': { ja: 'アカウントを作成', en: 'Create account' },
  'register.submitting': { ja: '送信中…', en: 'Submitting…' },
  'register.nameRequired': { ja: '氏名を入力してください。', en: 'Please enter your name.' },
  'register.passwordShort': { ja: 'パスワードは8文字以上で入力してください。', en: 'Password must be at least 8 characters.' },
  'register.confirmMismatch': { ja: 'パスワードが一致しません。', en: 'The passwords do not match.' },
  'register.done': {
    ja: 'モックUIのため、アカウントは作成されません。共有パスワードでログインしてください。',
    en: 'This is a mock UI, so no account was created. Please log in with the shared password.',
  },
  'register.toLogin': { ja: 'すでにアカウントをお持ちですか？', en: 'Already have an account?' },

  /* --- forgot password ------------------------------------------------------ */
  'forgot.title': { ja: 'パスワードの再設定', en: 'Reset your password' },
  'forgot.lead': {
    ja: '登録済みのメールアドレスに再設定用リンクを送信します。',
    en: 'We will send a reset link to your registered email address.',
  },
  'forgot.submit': { ja: '再設定リンクを送信', en: 'Send reset link' },
  'forgot.submitting': { ja: '送信中…', en: 'Sending…' },
  'forgot.done': {
    ja: 'モックUIのため、メールは送信されません。共有パスワードでログインしてください。',
    en: 'This is a mock UI, so no email was sent. Please log in with the shared password.',
  },

  /* --- cross-links ---------------------------------------------------------- */
  'auth.backToLogin': { ja: 'ログインに戻る', en: 'Back to log in' },
} satisfies Record<string, { ja: string; en: string }>;
