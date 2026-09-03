'use client';

import { useEffect } from 'react';

import { getSocketToken } from '@/actions/socket-actions';
import { authClient } from '@/lib/auth/auth-client';
import { getSocket } from '@/lib/socket-client';

// Mounted once at a high level (see SocketProvider) — connects the socket and
// auto-(re)joins the signed-in user's private room on every (re)connect.
export function useSocket() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    const joinRoom = async () => {
      try {
        const token = await getSocketToken();
        socket.emit('room:join', { userId, token });
      } catch (err) {
        console.error('Failed to join socket room:', err);
      }
    };

    if (socket.connected) joinRoom();
    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      socket.emit('room:leave', userId);
    };
  }, [userId]);
}
