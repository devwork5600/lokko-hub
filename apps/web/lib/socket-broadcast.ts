// Server-side only: pushes a Socket.IO event to a specific user's private
// room via apps/socket's internal /broadcast endpoint (shared-secret auth,
// not user auth). Called from server actions/workers, never from the browser.

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
    // Non-fatal: the socket server may be down, whatever triggered this
    // broadcast (e.g. a DB notification row) still happened.
    console.error('Broadcast failed:', err);
    return { success: false };
  }
}
