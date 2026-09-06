import { getUser } from '@/lib/auth/auth-session';

import { FavoritesClient } from './FavoritesClient';

export default async function FavoritesPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes favoris.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Favoris</h1>

      <FavoritesClient />
    </div>
  );
}
