import Image from 'next/image';
import Link from 'next/link';

import type { ListingCard as ListingCardType } from '@/actions/listing-actions';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchCard({ listing }: { listing: ListingCardType }) {
  const image = listing.images[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Aucune image</div>
        )}
      </div>
      <div className="p-2">
        <h3 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
          {listing.title}
        </h3>
        <p className="text-sm font-semibold text-foreground">
          {listing.price} €{listing.priceUnit !== 'UNIT' ? `/${listing.priceUnit.toLowerCase()}` : ''}
        </p>
        <p className="text-xs text-muted-foreground">{listing.location.city}</p>
      </div>
    </Link>
  );
}

export function SearchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <div className="aspect-4/5 w-full">
        <Skeleton className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-foreground uppercase">
          lokko
        </Skeleton>
      </div>
      <div className="space-y-2 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
