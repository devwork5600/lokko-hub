'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createListing, updateListing } from '@/actions/listing-actions';
import type { Category } from '@/actions/category-actions';

type ListingImageValue = { url: string; index: number };

type ListingFormValues = {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  productId: string;
  city: string;
  postalCode: string;
  priceValue: string;
  priceUnit: 'UNIT' | 'KG' | 'L';
  images: ListingImageValue[];
};

const EMPTY_VALUES: ListingFormValues = {
  title: '',
  description: '',
  categoryId: '',
  subCategoryId: '',
  productId: '',
  city: '',
  postalCode: '',
  priceValue: '',
  priceUnit: 'UNIT',
  images: [],
};

const MAX_IMAGES = 3;

export function ListingForm({
  categories,
  listingId,
  initialValues,
}: {
  categories: Category[];
  listingId?: string;
  initialValues?: Partial<ListingFormValues>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ListingFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedCategory = categories.find((c) => c.id === values.categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubCategory = subcategories.find((s) => s.id === values.subCategoryId);
  const products = selectedSubCategory?.products ?? [];

  function set<K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function reindex(images: { url: string }[]): ListingImageValue[] {
    return images.map((img, index) => ({ url: img.url, index }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      for (const file of files) {
        if (values.images.length + 1 > MAX_IMAGES) {
          setError(`Maximum ${MAX_IMAGES} images.`);
          break;
        }

        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Échec de l'upload.");
          break;
        }

        setValues((prev) => ({ ...prev, images: reindex([...prev.images, { url: result.url }]) }));
      }
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setValues((prev) => ({
      ...prev,
      images: reindex(prev.images.filter((img) => img.index !== index)),
    }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setValues((prev) => {
      const next = [...prev.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, images: reindex(next) };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const draft = {
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId,
      productId: values.productId,
      location: { city: values.city, postalCode: values.postalCode },
      price: { value: Number(values.priceValue), unit: values.priceUnit },
      images: values.images,
    };

    const result = listingId
      ? await updateListing(listingId, draft)
      : await createListing(draft);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue.');
      return;
    }

    router.push(`/listings/${result.listingId}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Titre</label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="category">Catégorie</label>
        <select
          id="category"
          value={values.categoryId}
          onChange={(e) => {
            set('categoryId', e.target.value);
            set('subCategoryId', '');
            set('productId', '');
          }}
          required
        >
          <option value="">Choisir...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div>
          <label htmlFor="subCategory">Sous-catégorie</label>
          <select
            id="subCategory"
            value={values.subCategoryId}
            onChange={(e) => {
              set('subCategoryId', e.target.value);
              set('productId', '');
            }}
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
        <div>
          <label htmlFor="product">Produit</label>
          <select
            id="product"
            value={values.productId}
            onChange={(e) => set('productId', e.target.value)}
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

      <div>
        <label htmlFor="city">Ville</label>
        <input id="city" value={values.city} onChange={(e) => set('city', e.target.value)} required />
      </div>

      <div>
        <label htmlFor="postalCode">Code postal</label>
        <input
          id="postalCode"
          value={values.postalCode}
          onChange={(e) => set('postalCode', e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="priceValue">Prix</label>
        <input
          id="priceValue"
          type="number"
          step="0.01"
          min="0"
          value={values.priceValue}
          onChange={(e) => set('priceValue', e.target.value)}
          required
        />
        <select
          value={values.priceUnit}
          onChange={(e) => set('priceUnit', e.target.value as ListingFormValues['priceUnit'])}
        >
          <option value="UNIT">à l&apos;unité</option>
          <option value="KG">au kg</option>
          <option value="L">au litre</option>
        </select>
      </div>

      <div>
        <label htmlFor="images">Photos (max {MAX_IMAGES})</label>
        <input
          id="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          disabled={uploading || values.images.length >= MAX_IMAGES}
        />
        {uploading && <p>Envoi en cours...</p>}

        {values.images.length > 0 && (
          <ul>
            {values.images.map((image, i) => (
              <li key={image.url}>
                <Image src={image.url} alt="" width={80} height={80} />
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(i, 1)}
                  disabled={i === values.images.length - 1}
                >
                  ↓
                </button>
                <button type="button" onClick={() => removeImage(image.index)}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={submitting || uploading}>
        {submitting ? 'Envoi...' : listingId ? 'Enregistrer' : 'Publier'}
      </button>
    </form>
  );
}
