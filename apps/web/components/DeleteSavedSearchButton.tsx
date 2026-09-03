'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteSavedSearch } from '@/actions/saved-search-actions';

export function DeleteSavedSearchButton({ savedSearchId }: { savedSearchId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    setDeleting(true);
    const result = await deleteSavedSearch(savedSearchId);
    if (result.success) {
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={deleting}>
      {deleting ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}
