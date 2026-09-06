'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { getBookmarkedListings } from '@/actions/listing-actions';
import { useInfiniteScrollObserver } from '@/hooks/use-infinite-scroll-observer';

import { SearchCard, SearchCardSkeleton } from '../../listings/SearchCard';

const PAGE_SIZE = 8;

export function FavoritesClient() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, status, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['bookmarked-listings'],
    queryFn: ({ pageParam }) => getBookmarkedListings({ page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
  });

  useInfiniteScrollObserver({
    targetRef: loadMoreRef,
    enabled: !!hasNextPage && !isFetchingNextPage,
    onIntersect: fetchNextPage,
    rootMargin: '200px',
  });

  if (status === 'pending') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <SearchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <p className="text-center text-sm text-destructive">Impossible de charger tes favoris.</p>;
  }

  const listings = data.pages.flatMap((page) => page.listings);

  if (listings.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Tu n&apos;as encore aucun favori.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <SearchCard key={listing.id} listing={listing} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SearchCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-1" />

      {!hasNextPage && !isFetching && (
        <p className="mt-12 text-center text-sm text-muted-foreground">Tu as atteint la fin de tes favoris.</p>
      )}
    </div>
  );
}
