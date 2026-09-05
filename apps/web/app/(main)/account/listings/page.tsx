import Link from 'next/link';
import { SquarePlus } from 'lucide-react';

import { getUser } from '@/lib/auth/auth-session';

import { UserListingsClient } from './UserListingsClient';

export default async function MyListingsPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes annonces.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Mes annonces</h1>
        <Link
          href="/listings/create"
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <SquarePlus className="h-4 w-4" />
          Publier une annonce
        </Link>
      </div>

      <UserListingsClient />
    </div>
  );
}
