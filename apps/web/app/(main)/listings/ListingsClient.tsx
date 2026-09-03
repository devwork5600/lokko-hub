'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';

import { getListings } from '@/actions/listing-actions';
import { useInfiniteScrollObserver } from '@/hooks/use-infinite-scroll-observer';
import { parseSearchParams } from '@/lib/parse-search-params';

import { SearchCard, SearchCardSkeleton } from './SearchCard';

const PAGE_SIZE = 8;

export function ListingsClient() {
  const searchParams = useSearchParams();
  const parsedParams = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, status, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['listings', parsedParams],
    queryFn: ({ pageParam }) => getListings({ ...parsedParams, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (lastPage.hasMore ? pages.length + 1 : undefined),
  });

  useInfiniteScrollObserver({
    targetRef: loadMoreRef,
    enabled: !!hasNextPage && !isFetchingNextPage,
    onIntersect: fetchNextPage,
    rootMargin: '10px',
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

  const listings = (data?.pages ?? []).flatMap((page) => page.listings);

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
        <p className="mt-12 text-center text-sm text-muted-foreground">
          {listings.length === 0 ? 'Aucune annonce ne correspond à ta recherche.' : 'Plus aucun résultat'}
        </p>
      )}
    </div>
  );
}
