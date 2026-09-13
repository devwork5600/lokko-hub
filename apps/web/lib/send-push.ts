import { prisma } from '@lokko-hub/db';
import webpush from 'web-push';

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

// Sends to every device this user has subscribed (a user can have several:
// phone, laptop, ...). A 404/410 from the push service means that specific
// subscription is dead (uninstalled, permission revoked, browser data
// cleared) and will never succeed again, so we prune it; any other failure
// is transient/unexpected and just gets logged.
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
