'use client';

import { TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteSavedSearch } from '@/actions/saved-search-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';

type SavedSearch = {
  id: string;
  title: string;
  query: string | null;
  category: string | null;
  geoLat: number | null;
  geoLng: number | null;
  geoRadiusKm: number | null;
};

function buildSearchUrl(search: SavedSearch) {
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

function describeSearch(search: SavedSearch) {
  const parts: string[] = [];
  if (search.query) parts.push(`"${search.query}"`);
  if (search.category) parts.push(search.category);
  if (search.geoRadiusKm != null) parts.push(`± ${search.geoRadiusKm} km`);
  return parts.length > 0 ? parts.join(' · ') : 'Toutes les annonces';
}

export function SavedSearchCard({ search }: { search: SavedSearch }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSavedSearch(search.id);
    setDeleting(false);
    if (result.success) {
      setConfirmOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <Link href={buildSearchUrl(search)} className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{search.title || 'Recherche sans titre'}</p>
        <p className="truncate text-sm text-muted-foreground">{describeSearch(search)}</p>
      </Link>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button type="button" variant="ghost" size="icon" onClick={() => setConfirmOpen(true)}>
          <TrashIcon className="h-4 w-4" />
        </Button>

        <DialogContent>
          <DialogTitle>Supprimer cette recherche sauvegardée ?</DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu ne recevras plus de notifications pour les nouvelles annonces correspondantes.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
