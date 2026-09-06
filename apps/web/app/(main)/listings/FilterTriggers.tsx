'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { FilterDrawer } from './FilterDrawer';
import { SaveSearchButton } from './SaveSearchButton';

export function FilterTriggers() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="my-8 flex flex-wrap items-center gap-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Filtres
      </Button>

      {hasActiveFilters && <SaveSearchButton />}

      <FilterDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
