'use client';

import { useFormContext } from 'react-hook-form';

import type { ListingDraft } from '@lokko-hub/validations';

import type { Category } from '@/actions/category-actions';
import { Button } from '@/components/ui/button';

export function StepCategory({
  categories,
  onNext,
  onPrev,
}: {
  categories: Category[];
  onNext: () => void;
  onPrev: () => void;
}) {
  const {
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<ListingDraft>();

  const categoryId = watch('categoryId');
  const subCategoryId = watch('subCategoryId');
  const productId = watch('productId');

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubCategory = subcategories.find((s) => s.id === subCategoryId);
  const products = selectedSubCategory?.products ?? [];

  async function handleNext() {
    if (await trigger(['categoryId', 'subCategoryId', 'productId'])) onNext();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Dans quelle catégorie ?</h2>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Catégorie</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setValue('categoryId', e.target.value);
            setValue('subCategoryId', '');
            setValue('productId', '');
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
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Sous-catégorie</label>
          <select
            value={subCategoryId}
            onChange={(e) => {
              setValue('subCategoryId', e.target.value);
              setValue('productId', '');
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
            onChange={(e) => setValue('productId', e.target.value)}
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

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onPrev}>
          Retour
        </Button>
        <Button type="button" onClick={handleNext} disabled={!categoryId}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
