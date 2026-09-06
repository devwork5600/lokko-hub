'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { isBookmarked, toggleBookmark } from '@/actions/listing-actions';

export function useBookmark(listingId: string, initialBookmarked: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ['bookmark', listingId];

  const { data: bookmarked = initialBookmarked } = useQuery({
    queryKey,
    queryFn: () => isBookmarked(listingId),
    initialData: initialBookmarked,
    staleTime: 1000 * 60,
  });

  const mutation = useMutation({
    mutationFn: () => toggleBookmark(listingId),
    // No optimistic update here: flipping the heart before the server confirms
    // means an unauthenticated click flashes it filled, then reverts — confusing.
    // Wait for the real result instead, it's a fast local DB call either way.
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result.bookmarked);
    },
    onError: () => {
      toast.error('Connecte-toi pour ajouter cette annonce à tes favoris.');
    },
  });

  return {
    bookmarked,
    toggle: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
