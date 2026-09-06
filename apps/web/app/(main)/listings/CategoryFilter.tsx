'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { getCategories } from '@/actions/category-actions';

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  });

  const categorySlug = searchParams.get('category') ?? '';
  const subCategorySlug = searchParams.get('subCategory') ?? '';
  const productSlug = searchParams.get('product') ?? '';

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);
  const subcategories = selectedCategory?.subcategories ?? [];
  const selectedSubCategory = subcategories.find((s) => s.slug === subCategorySlug);
  const products = selectedSubCategory?.products ?? [];

  function updateParams(next: { category?: string; subCategory?: string; product?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.category !== undefined) {
      if (next.category) params.set('category', next.category);
      else params.delete('category');
      params.delete('subCategory');
      params.delete('product');
    }
    if (next.subCategory !== undefined) {
      if (next.subCategory) params.set('subCategory', next.subCategory);
      else params.delete('subCategory');
      params.delete('product');
    }
    if (next.product !== undefined) {
      if (next.product) params.set('product', next.product);
      else params.delete('product');
    }
    params.delete('page');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Catégorie
        </label>
        <select
          id="category"
          value={categorySlug}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">Toutes les catégories</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="subCategory" className="text-sm font-medium text-foreground">
            Sous-catégorie
          </label>
          <select
            id="subCategory"
            value={subCategorySlug}
            onChange={(e) => updateParams({ subCategory: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Toutes</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="product" className="text-sm font-medium text-foreground">
            Produit
          </label>
          <select
            id="product"
            value={productSlug}
            onChange={(e) => updateParams({ product: e.target.value })}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Tous</option>
            {products.map((product) => (
              <option key={product.id} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
