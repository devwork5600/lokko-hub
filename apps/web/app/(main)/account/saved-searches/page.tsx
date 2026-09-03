import Link from 'next/link';

import { getUserSavedSearches } from '@/actions/saved-search-actions';
import { DeleteSavedSearchButton } from '@/components/DeleteSavedSearchButton';
import { getUser } from '@/lib/auth/auth-session';

function buildSearchUrl(search: {
  query: string | null;
  category: string | null;
  geoLat: number | null;
  geoLng: number | null;
  geoRadiusKm: number | null;
}) {
  const params = new URLSearchParams();
  if (search.query) params.set('q', search.query);
  if (search.category) params.set('category', search.category);
  if (search.geoLat != null && search.geoLng != null && search.geoRadiusKm != null) {
    params.set('geoLat', String(search.geoLat));
    params.set('geoLng', String(search.geoLng));
    params.set('geoRadiusKm', String(search.geoRadiusKm));
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : '/listings';
}

export default async function SavedSearchesPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour voir tes recherches sauvegardées.</p>
      </main>
    );
  }

  const savedSearches = await getUserSavedSearches();

  return (
    <main>
      <h1>Recherches sauvegardées</h1>

      {savedSearches.length === 0 ? (
        <p>Aucune recherche sauvegardée pour le moment.</p>
      ) : (
        <ul>
          {savedSearches.map((search) => (
            <li key={search.id}>
              <Link href={buildSearchUrl(search)}>{search.title}</Link>
              <DeleteSavedSearchButton savedSearchId={search.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
