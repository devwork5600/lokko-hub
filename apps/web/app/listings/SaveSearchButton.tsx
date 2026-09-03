'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { createSavedSearch } from '@/actions/saved-search-actions';

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
      <div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSaved(false);
          }}
        >
          Sauvegarder cette recherche
        </button>
        {saved && <p role="status">Recherche sauvegardée !</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nom de la recherche"
        required
      />
      <button type="submit" disabled={saving || !title.trim()}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
      <button type="button" onClick={() => setOpen(false)}>
        Annuler
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
