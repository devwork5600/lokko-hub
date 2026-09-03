// Mirrors apps/web/lib/socket-broadcast.ts: pushes a Socket.IO event to a
// user's private room via apps/socket's internal /broadcast endpoint
// (shared-secret auth). Duplicated rather than shared because apps/worker and
// apps/web are independently deployed services with their own env vars, same
// pattern as this worker's own Upstash TLS-upgrade logic in moderation.ts.

export async function broadcastToUser(
  userId: string,
  event: string,
  payload: unknown,
): Promise<{ success: boolean; online?: boolean }> {
  const url = process.env.SOCKET_INTERNAL_URL;
  const secret = process.env.SOCKET_BROADCAST_SECRET;
  if (!url || !secret) {
    console.error('SOCKET_INTERNAL_URL / SOCKET_BROADCAST_SECRET environment variables are not set');
    return { success: false };
  }

  try {
    const response = await fetch(`${url}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-broadcast-secret': secret },
      body: JSON.stringify({ userId, event, payload }),
    });

    if (!response.ok) return { success: false };

    const data = await response.json();
    return { success: true, online: data.online };
  } catch (err) {
    console.error('Broadcast failed:', err);
    return { success: false };
  }
}
