'use client';

import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import { Button } from '@/components/ui/button';

export function StepPrice({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ListingDraft>();

  const price = watch('price');

  async function handleNext() {
    if (await trigger('price')) onNext();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Quel est le prix ?</h2>

      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-foreground">Prix</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price.value || ''}
            onChange={(e) => setValue('price.value', Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="w-32 space-y-1.5">
          <label className="text-sm font-medium text-foreground">Unité</label>
          <select
            value={price.unit}
            onChange={(e) => setValue('price.unit', e.target.value as ListingDraft['price']['unit'])}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="UNIT">à l&apos;unité</option>
            <option value="KG">au kg</option>
            <option value="L">au litre</option>
          </select>
        </div>
      </div>
      {errors.price?.value && <p className="text-sm text-destructive">{errors.price.value.message}</p>}

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" onClick={handleNext} disabled={price.value <= 0}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
