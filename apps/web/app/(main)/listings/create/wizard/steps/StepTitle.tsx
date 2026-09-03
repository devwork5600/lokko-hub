'use client';

import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import { Button } from '@/components/ui/button';

export function StepTitle({ onNext }: { onNext: () => void }) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<ListingDraft>();

  async function handleNext() {
    if (await trigger('title')) onNext();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Quel est le titre de ton annonce ?</h2>

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Titre
        </label>
        <input
          id="title"
          {...register('title')}
          placeholder="Ex : Tomates fraîches du jardin"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleNext}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
