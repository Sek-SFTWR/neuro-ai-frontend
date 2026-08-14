import { LoginForm } from '@/components/auth/LoginForm';

/** The gate lives outside the app shell on purpose — no rail, no top bar, no
    store-backed chrome to render before the visitor is allowed in. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
