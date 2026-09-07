import type { Metadata } from 'next';
import { Suspense } from 'react';

import { FilterTriggers } from './FilterTriggers';
import { ListingsClient } from './ListingsClient';

export const metadata: Metadata = {
  title: 'Annonces',
  // Canonicalize every filter/search combination to the clean listing page
  // instead of letting query-string variants compete as duplicate content.
  alternates: { canonical: '/listings' },
};

export default function ListingsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16">
      <Suspense fallback={null}>
        <FilterTriggers />
      </Suspense>

      <Suspense fallback={null}>
        <ListingsClient />
      </Suspense>
    </main>
  );
}
