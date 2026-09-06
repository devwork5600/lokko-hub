import type { Metadata } from 'next';

import { getCategories } from '@/actions/category-actions';
import { getListings } from '@/actions/listing-actions';
import { BrandBanner } from '@/components/home/BrandBanner';
import { Categories } from '@/components/home/Categories';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { CategoryIconGrid } from '@/components/home/CategoryIconGrid';
import { ListingsSection } from '@/components/home/ListingsSection';
import { getUser } from '@/lib/auth/auth-session';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [user, categories] = await Promise.all([getUser(), getCategories()]);

  const [fruitsLegumes, produitsArtisanaux, boissons, epicerie] = await Promise.all([
    getListings({ pageSize: 12, category: 'fruits-legumes' }),
    getListings({ pageSize: 12, category: 'produits-artisanaux' }),
    getListings({ pageSize: 12, category: 'boissons' }),
    getListings({ pageSize: 12, category: 'epicerie' }),
  ]);

  return (
    <main className="w-full px-4">
      <Categories categories={categories} />
      <CategoryCarousel categories={categories} />

      <BrandBanner isSignedIn={!!user} />

      <ListingsSection
        title="Fruits et légumes"
        listings={fruitsLegumes.listings}
        href="/listings?category=fruits-legumes"
      />
      <ListingsSection
        title="Produits artisanaux"
        listings={produitsArtisanaux.listings}
        href="/listings?category=produits-artisanaux"
      />

      <div className="my-12">
        <CategoryIconGrid />
      </div>

      <ListingsSection title="Boissons" listings={boissons.listings} href="/listings?category=boissons" />
      <ListingsSection title="Épicerie" listings={epicerie.listings} href="/listings?category=epicerie" />
    </main>
  );
}
