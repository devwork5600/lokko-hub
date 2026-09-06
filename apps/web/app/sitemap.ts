import type { MetadataRoute } from 'next';

import { prisma } from '@lokko-hub/db';

const SITE_URL = 'https://lokkohub.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, changeFrequency: 'daily', priority: 0.9 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes];
}
