// userId -> set of socket ids currently registered for that user (a user can
// have multiple tabs/devices open at once).
export function createPresenceRegistry() {
  const onlineUsers = new Map<string, Set<string>>();

  function addUser(userId: string, socketId: string) {
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId)!.add(socketId);
  }

  function removeUser(userId: string, socketId: string) {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) onlineUsers.delete(userId);
  }

  function isOnline(userId: string): boolean {
    return (onlineUsers.get(userId)?.size ?? 0) > 0;
  }

  return { addUser, removeUser, isOnline };
}

export type PresenceRegistry = ReturnType<typeof createPresenceRegistry>;
