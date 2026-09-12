'use client';

import { useEffect } from 'react';

// Mounted once at a high level (see ServiceWorkerProvider) — registers
// public/sw.js so it's ready before the user ever opts into notifications.
// Registration alone doesn't subscribe to push or request any permission;
// it just gets the worker installed and idle in the background.
export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  }, []);
}
