'use client';

import { useEffect, useState } from 'react';

import { getSocket } from '@/lib/socket-client';

export function useUserStatus(targetUserId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;

    const socket = getSocket();

    socket.emit('user:status', targetUserId, (online: boolean) => setIsOnline(online));

    const handleOnline = ({ userId }: { userId: string }) => {
      if (userId === targetUserId) setIsOnline(true);
    };
    const handleOffline = ({ userId }: { userId: string }) => {
      if (userId === targetUserId) setIsOnline(false);
    };

    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);

    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
    };
  }, [targetUserId]);

  return isOnline;
}
