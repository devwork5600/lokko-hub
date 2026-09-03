'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { Category } from '@/actions/category-actions';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };
    update();
    api.on('select', update);
  }, [api]);

  return (
    <div className="relative my-4 h-9 w-full px-1 lg:hidden">
      <div
        className={cn(
          'pointer-events-none absolute top-0 bottom-0 left-3 z-10 w-6 bg-gradient-to-r from-background to-transparent',
          current === 1 && 'hidden',
        )}
      />

      <Carousel setApi={setApi} opts={{ align: 'start', dragFree: true }} className="w-full px-3">
        <CarouselContent className="-ml-2">
          {categories.map((category) => (
            <CarouselItem key={category.id} className="basis-auto pl-2">
              <button
                onClick={() => router.push(`/listings?category=${category.slug}`)}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium whitespace-nowrap text-primary-foreground"
              >
                {category.name}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div
        className={cn(
          'pointer-events-none absolute top-0 right-3 bottom-0 z-10 w-6 bg-gradient-to-l from-background to-transparent',
          current === count && 'hidden',
        )}
      />
    </div>
  );
}
