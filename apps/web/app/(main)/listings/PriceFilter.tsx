'use client';

import * as Slider from '@radix-ui/react-slider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const MIN = 0;
const MAX = 150;
const STEP = 5;

export function PriceFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const priceMin = Number(searchParams.get('priceMin') ?? MIN);
  const priceMax = Number(searchParams.get('priceMax') ?? MAX);

  const [range, setRange] = useState<[number, number]>([priceMin, priceMax]);

  function handleCommit(value: number[]) {
    const [min, max] = value;
    const params = new URLSearchParams(searchParams.toString());

    if (min > MIN) params.set('priceMin', String(min));
    else params.delete('priceMin');
    if (max < MAX) params.set('priceMax', String(max));
    else params.delete('priceMax');
    params.delete('page');

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        Prix : {range[0]} € — {range[1]} €{range[1] === MAX && '+'}
      </label>
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center"
        min={MIN}
        max={MAX}
        step={STEP}
        value={range}
        onValueChange={(value) => setRange(value as [number, number])}
        onValueCommit={handleCommit}
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-muted">
          <Slider.Range className="absolute h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb
          aria-label="Prix minimum"
          className="block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <Slider.Thumb
          aria-label="Prix maximum"
          className="block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </Slider.Root>
    </div>
  );
}
