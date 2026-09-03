import { prisma } from '@lokko-hub/db';

import { sendListingMatchEmail } from './email';
import { haversineDistanceKm } from './geo';
import { broadcastToUser } from './socket-broadcast';

export async function matchSavedSearches(listingId: string): Promise<void> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
      category: { select: { slug: true } },
      location: { select: { lat: true, lng: true } },
      images: { orderBy: { index: 'asc' }, take: 1, select: { url: true } },
    },
  });
  if (!listing) return;

  // Cheap DB-level pre-filter (active, not the listing's own owner, matching
  // category if one was set) — the remaining text/geo checks run in memory,
  // same shape as lokko-v4's matcher but with a real WHERE clause instead of
  // scanning every active saved search in the app.
  const candidates = await prisma.savedSearch.findMany({
    where: {
      isActive: true,
      userId: { not: listing.ownerId },
      OR: [{ category: null }, { category: listing.category.slug }],
    },
    select: {
      userId: true,
      query: true,
      geoLat: true,
      geoLng: true,
      geoRadiusKm: true,
    },
  });
  if (candidates.length === 0) return;

  const haystack = `${listing.title} ${listing.description}`.toLowerCase();

  const matchedUserIds = [
    ...new Set(
      candidates
        .filter((search) => {
          if (search.query) {
            const keywords = search.query.toLowerCase().split(/\s+/).filter(Boolean);
            if (!keywords.every((keyword) => haystack.includes(keyword))) return false;
          }

          // The bug this fixes: lokko-v4's matcher never checked geo radius at
          // all, so a saved search with a radius matched listings anywhere.
          if (search.geoLat != null && search.geoLng != null && search.geoRadiusKm != null) {
            const distanceKm = haversineDistanceKm(
              search.geoLat,
              search.geoLng,
              listing.location.lat,
              listing.location.lng,
            );
            if (distanceKm > search.geoRadiusKm) return false;
          }

          return true;
        })
        .map((search) => search.userId),
    ),
  ];
  if (matchedUserIds.length === 0) return;

  const payload = {
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0]?.url ?? null,
  };

  await prisma.notification.createMany({
    data: matchedUserIds.map((userId) => ({
      userId,
      type: 'NEW_LISTING_MATCH' as const,
      listingId: listing.id,
      payload,
    })),
    skipDuplicates: true,
  });

  for (const userId of matchedUserIds) {
    const broadcastResult = await broadcastToUser(userId, 'notification:new', payload).catch(
      () => ({ success: false, online: false }),
    );

    if (!broadcastResult.online) {
      const recipient = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (recipient?.email) {
        const listingUrl = `${process.env.WEB_APP_URL ?? 'http://localhost:3000'}/listings/${listing.id}`;
        sendListingMatchEmail({ to: recipient.email, listingTitle: listing.title, listingUrl }).catch(
          (err) => console.error('Failed to send listing-match email:', err),
        );
      }
    }
  }
}
