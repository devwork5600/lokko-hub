'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import type { Category } from '@/actions/category-actions';

export function Categories({ categories }: { categories: Category[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCategory = useMemo(
    () => categories.find((c) => c.name === hovered),
    [hovered, categories],
  );

  function handleEnter(name: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(name);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setHovered(null), 200);
  }

  return (
    <div className="relative z-20 mx-auto hidden max-w-6xl bg-background lg:block">
      <ul className="relative z-50 flex items-center justify-between py-4" onMouseLeave={handleLeave}>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/listings?category=${category.slug}`}
              onMouseEnter={() => handleEnter(category.name)}
              className={`px-4 text-sm font-medium capitalize transition-colors ${
                hovered === category.name ? 'text-primary' : 'hover:text-primary'
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-px w-full bg-primary" />

      {activeCategory && (
        <div
          className="absolute top-full z-10 flex h-92 w-full shadow-2xl"
          onMouseEnter={() => timeoutRef.current && clearTimeout(timeoutRef.current)}
          onMouseLeave={handleLeave}
        >
          <div className="flex w-56 flex-col justify-between bg-secondary p-4 font-medium capitalize dark:bg-secondary-foreground">
            {activeCategory.name}
            <Link
              href={`/listings?category=${activeCategory.slug}`}
              className="text-sm font-semibold underline-offset-2 hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto bg-background p-6">
            {activeCategory.subcategories.length > 0 ? (
              <ul className="grid grid-cols-3 gap-6">
                {activeCategory.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <p className="mb-3 font-medium underline decoration-primary underline-offset-6">
                      {sub.name}
                    </p>
                    <ul className="mb-2 space-y-1 text-sm">
                      {sub.products.length > 0 ? (
                        sub.products.map((product) => (
                          <li key={product.id} className="transition-colors hover:text-primary">
                            <Link
                              href={`/listings?category=${activeCategory.slug}&subCategory=${sub.slug}&product=${product.slug}`}
                              className="block"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground">Aucun produit</li>
                      )}
                    </ul>
                    <Link
                      href={`/listings?category=${activeCategory.slug}&subCategory=${sub.slug}`}
                      className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Voir tout
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune sous-catégorie</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
