import Image from 'next/image';
import Link from 'next/link';

import type { ListingCard } from '@/actions/listing-actions';
import { formatRelativeDate } from '@/lib/format-relative-date';

export function ListingCarouselCard({ listing }: { listing: ListingCard }) {
  const image = listing.images[0];

  return (
    <Link href={`/listings/${listing.id}`}>
      <article className="group mr-6 flex h-full w-44 flex-col overflow-hidden rounded-xl bg-background lg:w-52">
        <div className="flex items-center gap-1.5 py-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {listing.owner.name?.charAt(0).toUpperCase() ?? '?'}
          </span>
          <p className="max-w-28 truncate text-sm capitalize">{listing.owner.name}</p>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted lg:h-72">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? listing.title}
              fill
              sizes="(max-width: 768px) 80vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Aucune image
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-0.5 pt-2">
          <h3 className="line-clamp-1 text-sm leading-snug font-semibold lg:text-base">{listing.title}</h3>
          <p className="text-base">
            {listing.price.toLocaleString('fr-FR')} €
            {listing.priceUnit !== 'UNIT' && <span> / {listing.priceUnit.toLowerCase()}</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            {listing.location.city} ({listing.location.postalCode})
          </p>
          <p className="text-sm text-muted-foreground">{formatRelativeDate(listing.createdAt)}</p>
        </div>
      </article>
    </Link>
  );
}
