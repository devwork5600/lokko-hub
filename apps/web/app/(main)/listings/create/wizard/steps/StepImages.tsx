'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import { Button } from '@/components/ui/button';

import { ImageUploadField } from '../../../ImageUploadField';

export function StepImages({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { watch, trigger } = useFormContext<ListingDraft>();
  const [uploading, setUploading] = useState(false);

  const images = watch('images');

  async function handleNext() {
    if (await trigger('images')) onNext();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Ajoute des photos</h2>

      <ImageUploadField onUploadingChange={setUploading} />

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" onClick={handleNext} disabled={images.length === 0 || uploading}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
