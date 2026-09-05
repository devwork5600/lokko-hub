import { getUser } from '@/lib/auth/auth-session';

import { HeaderBar } from './HeaderBar';

export async function Header() {
  const user = await getUser();

  return <HeaderBar isSignedIn={!!user} />;
}
