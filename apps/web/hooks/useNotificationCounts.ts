'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getUnreadMessagesCount } from '@/actions/messages-actions';
import { getUnreadNotificationsCount } from '@/actions/notification-actions';
import { useSession } from '@/lib/auth/auth-client';
import { getActiveConversationId } from '@/lib/active-conversation';
import { getSocket } from '@/lib/socket-client';

const QUERY_KEY = ['notifications-count'];

type Counts = { unreadMessages: number; unreadNotifications: number };

export function useNotificationCounts() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const socket = getSocket();

    // Refetch the real DB count rather than bumping it locally — the
    // conversation thread (if open) marks itself read and invalidates on its
    // own, so a blind local +1 here would just race that and drift.
    const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

    const onNewMessage = (data: { conversationId: string }) => {
      // Already reading this conversation — it marks itself as read, skip.
      if (data.conversationId === getActiveConversationId()) return;
      refresh();
    };

    socket.on('message:new', onNewMessage);
    socket.on('notification:new', refresh);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('notification:new', refresh);
    };
  }, [session?.user?.id, queryClient]);

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Counts> => {
      const [unreadMessages, unreadNotifications] = await Promise.all([
        getUnreadMessagesCount(),
        getUnreadNotificationsCount(),
      ]);
      return { unreadMessages, unreadNotifications };
    },
    enabled: !!session?.user?.id,
    // Slow fallback poll (tab regain focus, reconnect) — the socket push
    // covers the common case, this just catches drift.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
