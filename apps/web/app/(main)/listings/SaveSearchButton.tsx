'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { createSavedSearch } from '@/actions/saved-search-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function SaveSearchButton() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const geoLat = searchParams.get('geoLat');
    const geoLng = searchParams.get('geoLng');
    const geoRadiusKm = searchParams.get('geoRadiusKm');

    const result = await createSavedSearch({
      title,
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      geoLat: geoLat ? Number(geoLat) : undefined,
      geoLng: geoLng ? Number(geoLng) : undefined,
      geoRadiusKm: geoRadiusKm ? Number(geoRadiusKm) : undefined,
    });

    setSaving(false);
    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue.');
      return;
    }

    setOpen(false);
    setTitle('');
    toast.success('Recherche sauvegardée !');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Sauvegarder cette recherche
      </Button>

      <DialogContent>
        <DialogTitle>Sauvegarder cette recherche</DialogTitle>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de la recherche"
            autoFocus
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
