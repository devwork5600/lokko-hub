import { getUserSavedSearches } from '@/actions/saved-search-actions';
import { SavedSearchCard } from '@/components/SavedSearchCard';
import { getUser } from '@/lib/auth/auth-session';

export default async function SavedSearchesPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes recherches sauvegardées.</p>;
  }

  const savedSearches = await getUserSavedSearches();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Recherches sauvegardées</h1>

      {savedSearches.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Aucune recherche sauvegardée pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search) => (
            <SavedSearchCard key={search.id} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}
