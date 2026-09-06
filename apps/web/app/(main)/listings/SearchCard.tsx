'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import type { ListingCard as ListingCardType } from '@/actions/listing-actions';
import { ImageSkeleton } from '@/components/ImageSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { preloadListingImages } from '@/lib/preload-listing-images';

export function SearchCard({ listing }: { listing: ListingCardType }) {
  const image = listing.images[0];
  const hasPreloaded = useRef(false);
  const [loaded, setLoaded] = useState(false);

  function handlePreload() {
    if (hasPreloaded.current) return;
    hasPreloaded.current = true;
    preloadListingImages(listing.images.map((img) => img.url));
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      onMouseEnter={handlePreload}
      onTouchStart={handlePreload}
      className="group block overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        {image ? (
          <>
            {!loaded && <ImageSkeleton />}
            <Image
              src={image.url}
              alt={image.altText ?? listing.title}
              fill
              quality={50}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Aucune image</div>
        )}
      </div>
      <div className="p-2">
        <h2 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
          {listing.title}
        </h2>
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
