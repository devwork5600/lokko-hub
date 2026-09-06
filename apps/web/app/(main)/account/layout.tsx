import type { ReactNode } from 'react';

import { AccountNav } from './components/AccountNav';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 pb-16">
      <AccountNav />
      <div className="mt-6">{children}</div>
    </main>
  );
}
