'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// The server already marked notifications/messages as read on load — sync the
// navbar badge, which was fetched before that happened.
export function SyncNotificationBadge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
  }, [queryClient]);

  return null;
}
