'use client';

import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import type { CitySuggestion } from '@/app/api/city/route';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { Button } from '@/components/ui/button';

export function StepLocation({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ListingDraft>();

  const location = watch('location');

  function handleSelect(suggestion: CitySuggestion) {
    setValue('location', {
      city: suggestion.city,
      postalCode: suggestion.postalCode,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  }

  async function handleNext() {
    if (await trigger('location')) onNext();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Où se trouve ton annonce ?</h2>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Ville</label>
        <CityAutocomplete
          value={location.city && location.postalCode ? `${location.city} (${location.postalCode})` : ''}
          onSelect={handleSelect}
        />
        {errors.location && <p className="text-sm text-destructive">Choisis une ville dans la liste.</p>}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" onClick={handleNext} disabled={!location.lat || !location.lng}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
