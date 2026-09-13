import { prisma } from '@lokko-hub/db';
import webpush from 'web-push';

// Same variable names as apps/web (the NEXT_PUBLIC_ prefix has no special
// meaning here — this isn't Next.js — but keeping it identical means the
// same three lines can be copy-pasted into this app's env config too).
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Mirrors apps/web/lib/send-push.ts — this worker is a separate deployable
// process (BullMQ, no Next.js runtime), so it can't import that file
// directly and carries its own copy, same as socket-broadcast.ts already does.
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error('VAPID environment variables are not set — cannot send push');
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
        } else {
          console.error('Failed to send push notification:', err);
        }
      }
    }),
  );
}
