// Service Worker for Web Push notifications. Plain JS, served as a static
// file at the site root (not bundled by Next.js) — the browser runs it in
// its own worker context, independent of any page being open. It stays
// registered and can be woken up by the OS to handle a `push` event even
// when every tab/PWA window for this site is closed.

// Fires when the push service delivers a message (server sent it via
// web-push, signed with our VAPID private key). `event.data` is whatever
// payload our server included — we control its shape (see send-push.ts).
self.addEventListener('push', (event) => {
  let payload = { title: 'Lokko Hub', body: '' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON or missing payload — fall back to the defaults above rather
    // than dropping the notification entirely.
  }

  const { title, body, url, icon } = payload;

  // event.waitUntil keeps the service worker alive until showNotification's
  // promise settles — without it, the worker could be killed mid-call.
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: url || '/' },
    }),
  );
});

// Fires when the user taps the notification itself (not the OS's dismiss/X).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      // Reuse an already-open tab/window on the same origin instead of
      // always spawning a new one, focusing and navigating it if needed.
      for (const client of allClients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin) {
          await client.focus();
          if ('navigate' in client) await client.navigate(targetUrl);
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});
