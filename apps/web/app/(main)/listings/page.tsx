import { Suspense } from 'react';

import { FilterTriggers } from './FilterTriggers';
import { ListingsClient } from './ListingsClient';

export default function ListingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16">
      <h1 className="text-2xl font-semibold text-foreground">Annonces</h1>

      <Suspense fallback={null}>
        <FilterTriggers />
      </Suspense>

      <Suspense fallback={null}>
        <ListingsClient />
      </Suspense>
    </main>
  );
}
