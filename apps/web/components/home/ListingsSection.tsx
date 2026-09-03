import { MoveRight } from 'lucide-react';
import Link from 'next/link';

import type { ListingCard } from '@/actions/listing-actions';

import { ListingCarousel } from './ListingCarousel';

export function ListingsSection({
  title,
  listings,
  href,
}: {
  title: string;
  listings: ListingCard[];
  href: string;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mx-auto my-2 w-full max-w-6xl space-y-3 lg:my-16">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold lg:text-xl">{title} :</h2>
        <Link
          href={href}
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Voir plus d&apos;annonces
          <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <ListingCarousel listings={listings} />
    </section>
  );
}
