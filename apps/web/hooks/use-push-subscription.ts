'use client';

import { useEffect, useState } from 'react';

import { urlBase64ToUint8Array } from '@/lib/push-subscription';

type PushSubscriptionStatus = 'unsupported' | 'default' | 'denied' | 'subscribing' | 'subscribed';

// On mount: figure out where this device already stands (unsupported,
// already denied) without prompting anything — the permission prompt only
// ever fires from subscribe(), in response to the user's own click. This
// synchronous part lives in the useState initializer (not an effect) since
// it's a plain derivation, not a side effect; `typeof window === 'undefined'`
// guards the server-rendered pass, where none of these APIs exist yet.
export function usePushSubscription() {
  const [status, setStatus] = useState<PushSubscriptionStatus>(() => {
    if (typeof window === 'undefined') return 'default';
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return 'unsupported';
    }
    return Notification.permission === 'denied' ? 'denied' : 'default';
  });

  // The one genuinely async check (is there already a subscription for this
  // device?) stays in an effect, only running while we haven't already
  // resolved to unsupported/denied/subscribed.
  useEffect(() => {
    if (status !== 'default') return;

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      if (existing) setStatus('subscribed');
    });
  }, [status]);

  const subscribe = async () => {
    setStatus('subscribing');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set');
      setStatus('default');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // The browser subscription itself already succeeded at this point — a
    // failure here only means the server doesn't know about it yet (no
    // pushes will reach this device until a retry succeeds), so we still
    // report 'subscribed' rather than rolling the UI back to an error state.
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (err) {
      console.error('Failed to save push subscription:', err);
    }

    setStatus('subscribed');
  };

  return { status, subscribe };
}
