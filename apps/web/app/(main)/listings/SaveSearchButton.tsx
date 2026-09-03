'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { createSavedSearch } from '@/actions/saved-search-actions';
import { Button } from '@/components/ui/button';

export function SaveSearchButton() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

    setSaved(true);
    setOpen(false);
    setTitle('');
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(true);
            setSaved(false);
          }}
        >
          Sauvegarder cette recherche
        </Button>
        {saved && <p className="text-sm text-muted-foreground">Recherche sauvegardée !</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nom de la recherche"
        required
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
      />
      <Button type="submit" size="sm" disabled={saving || !title.trim()}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Annuler
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
