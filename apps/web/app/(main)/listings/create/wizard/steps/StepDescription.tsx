'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import { createListing } from '@/actions/listing-actions';
import { Button } from '@/components/ui/button';

export function StepDescription({ onPrev }: { onPrev: () => void }) {
  const router = useRouter();
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<ListingDraft>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!(await trigger('description'))) return;

    setSubmitting(true);
    setError(null);
    const result = await createListing(getValues());
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue.');
      return;
    }

    router.push(`/listings/${result.listingId}`);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Décris ton annonce</h2>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={5}
          placeholder="Décris ton produit : provenance, quantité, fraîcheur..."
          className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onPrev} disabled={submitting}>
          Retour
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Publication...' : 'Publier'}
        </Button>
      </div>
    </div>
  );
}
