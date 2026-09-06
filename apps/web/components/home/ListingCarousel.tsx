'use client';

import type { ListingCard } from '@/actions/listing-actions';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

import { ListingCarouselCard } from './ListingCarouselCard';

export function ListingCarousel({ listings, priority }: { listings: ListingCard[]; priority?: boolean }) {
  if (listings.length === 0) return null;

  return (
    <div className="relative mx-auto my-6 w-full max-w-6xl">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <CarouselContent>
          {listings.map((listing, index) => (
            <CarouselItem key={listing.id} className="basis-48 lg:basis-56">
              <ListingCarouselCard listing={listing} priority={priority && index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
