'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import type { ListingStatus } from '@lokko-hub/db';
import { listingSchema, type ListingDraft } from '@lokko-hub/validations';

import type { Category } from '@/actions/category-actions';
import { archiveListing, unarchiveListing, updateListing } from '@/actions/listing-actions';
import { ImageUploadField } from '@/app/(main)/listings/ImageUploadField';
import type { CitySuggestion } from '@/app/api/city/route';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { Button } from '@/components/ui/button';

const statusLabels: Record<ListingStatus, string> = {
  ACTIVE: 'En ligne',
  ARCHIVED: 'Archivée',
  VERIFICATION: 'En vérification',
  REJECTED: 'Refusée',
};

export function EditListingForm({
  listingId,
  categories,
  defaultValues,
  initialStatus,
  rejectionReason,
}: {
  listingId: string;
  categories: Category[];
  defaultValues: ListingDraft;
  initialStatus: ListingStatus;
  rejectionReason: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [statusPending, setStatusPending] = useState(false);
  const statusLocked = status === 'VERIFICATION' || status === 'REJECTED';

  const form = useForm<ListingDraft>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });

  const { register, control, setValue, formState } = form;
  const categoryId = useWatch({ control, name: 'categoryId' });
  const subCategoryId = useWatch({ control, name: 'subCategoryId' });
  const productId = useWatch({ control, name: 'productId' });
  const location = useWatch({ control, name: 'location' });
  const price = useWatch({ control, name: 'price' });

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubCategory = subcategories.find((s) => s.id === subCategoryId);
  const products = selectedSubCategory?.products ?? [];

  async function onSubmit(values: ListingDraft) {
    setSubmitting(true);
    const result = await updateListing(listingId, values);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Une erreur est survenue.');
      return;
    }

    toast.success('Annonce mise à jour !');
    router.push(`/listings/${listingId}`);
  }

  async function handleStatusChange(next: 'ACTIVE' | 'ARCHIVED') {
    setStatusPending(true);
    const result = next === 'ARCHIVED' ? await archiveListing(listingId) : await unarchiveListing(listingId);
    setStatusPending(false);

    if (!result.success) {
      toast.error(result.error ?? 'Une erreur est survenue.');
      return;
    }

    setStatus(next);
    toast.success(next === 'ARCHIVED' ? 'Annonce archivée.' : 'Annonce remise en ligne.');
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-8">
        {rejectionReason && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Cette annonce a été refusée : {rejectionReason}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Statut
          </label>
          <select
            id="status"
            value={status}
            disabled={statusLocked || statusPending}
            onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'ARCHIVED')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="ACTIVE">{statusLabels.ACTIVE}</option>
            <option value="ARCHIVED">{statusLabels.ARCHIVED}</option>
            <option value="VERIFICATION" disabled>
              {statusLabels.VERIFICATION}
            </option>
            <option value="REJECTED" disabled>
              {statusLabels.REJECTED}
            </option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Titre
          </label>
          <input
            id="title"
            {...register('title')}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          {formState.errors.title && (
            <p className="text-sm text-destructive">{formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={5}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
          />
          {formState.errors.description && (
            <p className="text-sm text-destructive">{formState.errors.description.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setValue('categoryId', e.target.value, { shouldDirty: true });
                setValue('subCategoryId', '', { shouldDirty: true });
                setValue('productId', '', { shouldDirty: true });
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Choisir...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formState.errors.categoryId && (
              <p className="text-sm text-destructive">{formState.errors.categoryId.message}</p>
            )}
          </div>

          {subcategories.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Sous-catégorie</label>
              <select
                value={subCategoryId}
                onChange={(e) => {
                  setValue('subCategoryId', e.target.value, { shouldDirty: true });
                  setValue('productId', '', { shouldDirty: true });
                }}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Choisir...</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {products.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Produit</label>
              <select
                value={productId}
                onChange={(e) => setValue('productId', e.target.value, { shouldDirty: true })}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Choisir...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Ville</label>
          <CityAutocomplete
            value={location.city && location.postalCode ? `${location.city} (${location.postalCode})` : ''}
            onSelect={(suggestion: CitySuggestion) =>
              setValue(
                'location',
                {
                  city: suggestion.city,
                  postalCode: suggestion.postalCode,
                  lat: suggestion.lat,
                  lng: suggestion.lng,
                },
                { shouldDirty: true },
              )
            }
          />
          {formState.errors.location && (
            <p className="text-sm text-destructive">Choisis une ville dans la liste.</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Prix</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price.value || ''}
              onChange={(e) => setValue('price.value', Number(e.target.value), { shouldDirty: true })}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="w-32 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Unité</label>
            <select
              value={price.unit}
              onChange={(e) =>
                setValue('price.unit', e.target.value as ListingDraft['price']['unit'], { shouldDirty: true })
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="UNIT">à l&apos;unité</option>
              <option value="KG">au kg</option>
              <option value="L">au litre</option>
            </select>
          </div>
        </div>
        {formState.errors.price?.value && (
          <p className="text-sm text-destructive">{formState.errors.price.value.message}</p>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Photos</label>
          <ImageUploadField onUploadingChange={setUploading} />
        </div>

        <Button type="submit" className="w-full" disabled={submitting || uploading}>
          {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </form>
    </FormProvider>
  );
}
