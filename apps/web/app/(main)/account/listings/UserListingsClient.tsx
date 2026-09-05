'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { getUserListings } from '@/actions/listing-actions';
import { useInfiniteScrollObserver } from '@/hooks/use-infinite-scroll-observer';

import { UserListingCard, UserListingCardSkeleton } from './UserListingCard';

const PAGE_SIZE = 8;

export function UserListingsClient() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, status, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['user-listings'],
    queryFn: ({ pageParam }) => getUserListings({ page: pageParam, pageSize: PAGE_SIZE }),
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
          <UserListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return <p className="text-center text-sm text-destructive">Impossible de charger tes annonces.</p>;
  }

  const listings = data.pages.flatMap((page) => page.listings);

  if (listings.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Tu n&apos;as encore publié aucune annonce.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {listings.map((listing) => (
          <UserListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <UserListingCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-1" />

      {!hasNextPage && !isFetching && (
        <p className="mt-12 text-center text-sm text-muted-foreground">Tu as atteint la fin de tes annonces.</p>
      )}
    </div>
  );
}
