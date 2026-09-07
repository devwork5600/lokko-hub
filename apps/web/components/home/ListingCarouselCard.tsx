'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import type { ListingCard } from '@/actions/listing-actions';
import { ImageSkeleton } from '@/components/ImageSkeleton';
import { formatRelativeDate } from '@/lib/format-relative-date';
import { preloadListingImages } from '@/lib/preload-listing-images';

export function ListingCarouselCard({ listing, priority }: { listing: ListingCard; priority?: boolean }) {
  const image = listing.images[0];
  const hasPreloaded = useRef(false);
  const [loaded, setLoaded] = useState(false);

  function handlePreload() {
    if (hasPreloaded.current) return;
    hasPreloaded.current = true;
    preloadListingImages(listing.images.map((img) => img.url));
  }

  return (
    <Link href={`/listings/${listing.id}`} onMouseEnter={handlePreload} onTouchStart={handlePreload}>
      <article className="group flex h-full w-44 flex-col overflow-hidden rounded-xl bg-background lg:w-52">
        <div className="flex items-center gap-1.5 py-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {listing.owner.name?.charAt(0).toUpperCase() ?? '?'}
          </span>
          <p className="max-w-28 truncate text-sm capitalize">{listing.owner.name}</p>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted lg:h-72">
          {image ? (
            <>
              {!loaded && <ImageSkeleton className="rounded-lg" />}
              <Image
                src={image.url}
                alt={image.altText ?? listing.title}
                fill
                priority={priority}
                quality={50}
                sizes="(min-width: 1024px) 208px, 176px"
                className={`object-cover transition-[opacity,scale] duration-300 group-hover:scale-105 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLoaded(true)}
              />
            </>
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
