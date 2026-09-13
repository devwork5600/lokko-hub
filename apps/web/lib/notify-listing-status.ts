import { prisma } from '@lokko-hub/db';

import { sendPushToUser } from './send-push';
import { broadcastToUser } from './socket-broadcast';

const PUSH_TITLE: Record<'LISTING_ARCHIVED' | 'LISTING_VALIDATED', string> = {
  LISTING_ARCHIVED: 'Ton annonce a été archivée',
  LISTING_VALIDATED: 'Ton annonce est en ligne',
};

const PUSH_URL: Record<'LISTING_ARCHIVED' | 'LISTING_VALIDATED', (listingId: string) => string> = {
  LISTING_ARCHIVED: () => '/account/listings',
  LISTING_VALIDATED: (listingId) => `/listings/${listingId}`,
};

// Notifies a listing's owner about a self-triggered status change (archive /
// unarchive). Upserts on (userId, listingId, type) so archiving the same
// listing again later refreshes the notification to unread instead of
// piling up duplicates.
export async function notifyListingStatusChange(
  listingId: string,
  type: 'LISTING_ARCHIVED' | 'LISTING_VALIDATED',
): Promise<void> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      ownerId: true,
      images: { orderBy: { index: 'asc' }, take: 1, select: { url: true } },
    },
  });
  if (!listing) return;

  const payload = {
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0]?.url ?? null,
  };

  await prisma.notification.upsert({
    where: { userId_listingId_type: { userId: listing.ownerId, listingId: listing.id, type } },
    create: { userId: listing.ownerId, listingId: listing.id, type, payload },
    update: { payload, read: false, createdAt: new Date() },
  });

  const broadcastResult = await broadcastToUser(listing.ownerId, 'notification:new', payload).catch(() => ({
    success: false,
    online: false,
  }));

  if (!broadcastResult.online) {
    const webAppUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
    sendPushToUser(listing.ownerId, {
      title: PUSH_TITLE[type],
      body: listing.title,
      url: `${webAppUrl}${PUSH_URL[type](listing.id)}`,
    }).catch((err) => console.error('Failed to send listing-status push:', err));
  }
}
