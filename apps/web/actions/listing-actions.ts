'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma, Prisma } from '@lokko-hub/db';
import { listingSchema, type ListingDraft } from '@lokko-hub/validations';

import { getUser } from '@/lib/auth/auth-session';

const listingCardSelect = {
  id: true,
  title: true,
  price: true,
  priceUnit: true,
  createdAt: true,
  location: { select: { city: true, postalCode: true, lat: true, lng: true } },
  category: { select: { name: true, slug: true } },
  subCategory: { select: { name: true, slug: true } },
  product: { select: { name: true, slug: true } },
  owner: { select: { id: true, name: true, image: true } },
  images: { orderBy: { index: 'asc' }, take: 1, select: { url: true, altText: true } },
} satisfies Prisma.ListingSelect;

export type ListingCard = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export type GetListingsParams = {
  query?: string;
  page?: number;
  pageSize?: number;
  category?: string;
  subCategory?: string;
  product?: string;
  priceMin?: number;
  priceMax?: number;
  orderBy?: 'newest' | 'priceAsc' | 'priceDesc';
  geoLat?: number;
  geoLng?: number;
  geoRadiusKm?: number;
};

export async function getListings({
  query,
  page = 1,
  pageSize = 12,
  category,
  subCategory,
  product,
  priceMin,
  priceMax,
  orderBy = 'newest',
  geoLat,
  geoLng,
  geoRadiusKm,
}: GetListingsParams = {}) {
  const skip = (page - 1) * pageSize;

  const where: Prisma.ListingWhereInput = {
    status: 'ACTIVE',
    deletedAt: null,
    ...(category && { category: { is: { slug: category } } }),
    ...(subCategory && { subCategory: { is: { slug: subCategory } } }),
    ...(product && { product: { is: { slug: product } } }),
    ...(query && {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...((priceMin != null || priceMax != null) && {
      price: {
        ...(priceMin != null ? { gte: priceMin } : {}),
        ...(priceMax != null ? { lte: priceMax } : {}),
      },
    }),
  };

  // GEO MODE: filter by metadata first via Prisma to get candidate ids, then apply
  // the radius filter + distance ordering via raw SQL (PostGIS GiST index).
  if (geoLat != null && geoLng != null && geoRadiusKm != null) {
    const candidates = await prisma.listing.findMany({ where, select: { id: true } });
    const ids = candidates.map((c) => c.id);
    if (ids.length === 0) return { listings: [], hasMore: false, total: 0 };

    const radiusMeters = geoRadiusKm * 1000;

    const withinIds = (await prisma.$queryRaw`
      SELECT l.id,
        ST_Distance(loc.coords, ST_SetSRID(ST_MakePoint(${geoLng}, ${geoLat}), 4326)::geography) AS distance
      FROM listing l
      JOIN location loc ON l."locationId" = loc.id
      WHERE l.id IN (${Prisma.join(ids)})
        AND ST_DWithin(loc.coords, ST_SetSRID(ST_MakePoint(${geoLng}, ${geoLat}), 4326)::geography, ${radiusMeters})
      ORDER BY distance ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `) as { id: string; distance: number }[];

    const totalRows = (await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM listing l
      JOIN location loc ON l."locationId" = loc.id
      WHERE l.id IN (${Prisma.join(ids)})
        AND ST_DWithin(loc.coords, ST_SetSRID(ST_MakePoint(${geoLng}, ${geoLat}), 4326)::geography, ${radiusMeters})
    `) as { count: number }[];

    const enriched = await prisma.listing.findMany({
      where: { id: { in: withinIds.map((r) => r.id) } },
      select: listingCardSelect,
    });
    const byId = new Map(enriched.map((l) => [l.id, l]));

    const listings = withinIds
      .map((r) => byId.get(r.id))
      .filter((l): l is NonNullable<typeof l> => l != null);

    const total = totalRows[0]?.count ?? 0;
    return { listings, hasMore: skip + listings.length < total, total };
  }

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      skip,
      take: pageSize,
      orderBy:
        orderBy === 'priceAsc'
          ? { price: 'asc' }
          : orderBy === 'priceDesc'
            ? { price: 'desc' }
            : { createdAt: 'desc' },
      select: listingCardSelect,
    }),
  ]);

  return { listings, hasMore: skip + listings.length < total, total };
}

export async function getListingById(id: string) {
  const validation = z.uuid().safeParse(id);
  if (!validation.success) return null;

  return prisma.listing.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      priceUnit: true,
      status: true,
      createdAt: true,
      ownerId: true,
      category: { select: { id: true, name: true, slug: true } },
      subCategory: { select: { id: true, name: true, slug: true } },
      product: { select: { id: true, name: true, slug: true } },
      location: { select: { city: true, postalCode: true, lat: true, lng: true } },
      owner: { select: { id: true, name: true, image: true } },
      images: { orderBy: { index: 'asc' }, select: { url: true, altText: true } },
    },
  });
}

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingById>>>;

export async function getUserListings() {
  const user = await getUser();
  if (!user) return [];

  return prisma.listing.findMany({
    where: { ownerId: user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      price: true,
      priceUnit: true,
      status: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      images: { orderBy: { index: 'asc' }, take: 1, select: { url: true, altText: true } },
    },
  });
}

// Never mutates an existing Location row: two listings can end up pointing at
// the same address, and mutating it in place would silently change every
// other listing that happens to share it. Always resolve to a row (existing
// or freshly created) and repoint the listing's locationId instead.
async function findOrCreateLocation(city: string, postalCode: string, lat: number, lng: number) {
  const existing = await prisma.location.findFirst({ where: { city, postalCode } });
  if (existing) return existing;

  // Two-step create: Prisma can't write the Unsupported("geography") coords
  // column directly, so create the row first, then set coords via raw SQL.
  const created = await prisma.location.create({ data: { city, postalCode, lat, lng } });
  await prisma.$executeRaw`
    UPDATE location
    SET coords = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
    WHERE id = ${created.id}
  `;
  return created;
}

type ListingActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: z.core.$ZodIssue['path'][];
  listingId?: string;
};

export async function createListing(data: ListingDraft): Promise<ListingActionResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = listingSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid data.',
      fieldErrors: validation.error.issues.map((issue) => issue.path),
    };
  }

  const { title, description, categoryId, subCategoryId, productId, location, price, images } =
    validation.data;

  const locationRow = await findOrCreateLocation(location.city, location.postalCode, location.lat, location.lng);

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: price.value,
      priceUnit: price.unit,
      ownerId: user.id,
      categoryId,
      subCategoryId: subCategoryId || null,
      productId: productId || null,
      locationId: locationRow.id,
      images: { create: images.map((img) => ({ url: img.url, index: img.index })) },
    },
    select: { id: true },
  });

  return { success: true, listingId: listing.id };
}

export async function updateListing(
  listingId: string,
  data: ListingDraft,
): Promise<ListingActionResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  });
  if (!existing) return { success: false, error: 'Listing not found' };
  if (existing.ownerId !== user.id) return { success: false, error: 'Forbidden' };

  const validation = listingSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid data.',
      fieldErrors: validation.error.issues.map((issue) => issue.path),
    };
  }

  const { title, description, categoryId, subCategoryId, productId, location, price, images } =
    validation.data;

  const locationRow = await findOrCreateLocation(location.city, location.postalCode, location.lat, location.lng);

  // Replace images wholesale rather than upserting by index: a reorder moves a url
  // to a new index, and upserting-by-index would overwrite whatever row already held
  // that index instead of the row that actually owns the url — leaving stale
  // duplicate rows behind (a real bug found in lokko-v4). Delete-then-recreate has
  // no such ambiguity.
  await prisma.$transaction([
    prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price: price.value,
        priceUnit: price.unit,
        categoryId,
        subCategoryId: subCategoryId || null,
        productId: productId || null,
        locationId: locationRow.id,
      },
    }),
    prisma.listingImage.deleteMany({ where: { listingId } }),
    prisma.listingImage.createMany({
      data: images.map((img) => ({ listingId, url: img.url, index: img.index })),
    }),
  ]);

  return { success: true, listingId };
}

async function assertOwner(listingId: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: 'Unauthorized' };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  });
  if (!listing) return { ok: false as const, error: 'Listing not found' };
  if (listing.ownerId !== user.id) return { ok: false as const, error: 'Forbidden' };

  return { ok: true as const };
}

export async function archiveListing(listingId: string) {
  const check = await assertOwner(listingId);
  if (!check.ok) return { success: false, error: check.error };

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ARCHIVED', archivedAt: new Date() },
  });
  revalidatePath('/account/listings');
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function unarchiveListing(listingId: string) {
  const check = await assertOwner(listingId);
  if (!check.ok) return { success: false, error: check.error };

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE', archivedAt: null },
  });
  revalidatePath('/account/listings');
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const check = await assertOwner(listingId);
  if (!check.ok) return { success: false, error: check.error };

  await prisma.listing.update({
    where: { id: listingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath('/account/listings');
  return { success: true };
}
