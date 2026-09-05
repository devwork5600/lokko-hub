import { prisma } from '@lokko-hub/db';

import { broadcastToUser } from './socket-broadcast';

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

  await broadcastToUser(listing.ownerId, 'notification:new', payload).catch(() => ({
    success: false,
    online: false,
  }));
}
