import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  location: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  listing: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  listingImage: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  bookmark: {
    findUnique: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  $executeRaw: vi.fn(),
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
  Prisma: {},
}));

const addJobMock = vi.fn();
vi.mock('@/lib/queue', () => ({
  getListingQueue: () => ({ add: addJobMock }),
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getUser: vi.fn(),
}));

const validDraft = {
  title: 'Belles tomates',
  description: 'Tomates du jardin, cueillies ce matin.',
  categoryId: '123e4567-e89b-12d3-a456-426614174000',
  subCategoryId: '',
  productId: '',
  location: { city: 'Rennes', postalCode: '35000', lat: 48.1147, lng: -1.6794 },
  price: { value: 3.5, unit: 'KG' as const },
  images: [{ url: 'https://res.cloudinary.com/demo/image/upload/tomatoes.jpg', index: 0 }],
};

describe('updateListing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Same images as validDraft by default, so imagesChanged is false unless a
    // test overrides this — these tests are about Location, not moderation.
    prismaMock.listingImage.findMany.mockResolvedValue(
      validDraft.images.map((img) => ({ url: img.url })),
    );
  });

  it('never mutates an existing Location row, even when it is shared with another listing', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: 'user-1' });
    // A different city already resolves to an existing (possibly shared) row.
    prismaMock.location.findFirst.mockResolvedValue({ id: 'location-shared', city: 'Rennes' });
    prismaMock.listing.update.mockResolvedValue({});

    const { updateListing } = await import('./listing-actions');
    const result = await updateListing('listing-1', validDraft);

    expect(result.success).toBe(true);
    expect(prismaMock.location.update).not.toHaveBeenCalled();
    expect(prismaMock.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'listing-1' },
        data: expect.objectContaining({ locationId: 'location-shared' }),
      }),
    );
  });

  it('creates a fresh Location row when the address has no existing match', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: 'user-1' });
    prismaMock.location.findFirst.mockResolvedValue(null);
    prismaMock.location.create.mockResolvedValue({ id: 'location-new' });
    prismaMock.listing.update.mockResolvedValue({});

    const { updateListing } = await import('./listing-actions');
    await updateListing('listing-1', validDraft);

    expect(prismaMock.location.create).toHaveBeenCalledWith({
      data: { city: 'Rennes', postalCode: '35000', lat: 48.1147, lng: -1.6794 },
    });
    expect(prismaMock.$executeRaw).toHaveBeenCalled();
    expect(prismaMock.location.update).not.toHaveBeenCalled();
  });

  it('rejects edits from a non-owner', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'someone-else' } as never);

    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: 'user-1' });

    const { updateListing } = await import('./listing-actions');
    const result = await updateListing('listing-1', validDraft);

    expect(result).toEqual({ success: false, error: 'Forbidden' });
    expect(prismaMock.listing.update).not.toHaveBeenCalled();
  });

  it('does not reset status or enqueue moderation when the images are unchanged', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: 'user-1' });
    prismaMock.location.findFirst.mockResolvedValue({ id: 'location-1' });
    prismaMock.listing.update.mockResolvedValue({});
    // beforeEach already makes listingImage.findMany return validDraft's own images.

    const { updateListing } = await import('./listing-actions');
    await updateListing('listing-1', validDraft);

    expect(prismaMock.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ status: expect.anything() }),
      }),
    );
    expect(addJobMock).not.toHaveBeenCalled();
    // Recreating unchanged image rows would reset their moderation status
    // (SAFE/NSFW) back to PENDING with no job left to ever re-classify them.
    expect(prismaMock.listingImage.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.listingImage.createMany).not.toHaveBeenCalled();
  });

  it('resets status to VERIFICATION and enqueues moderation when the images change', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: 'user-1' });
    prismaMock.location.findFirst.mockResolvedValue({ id: 'location-1' });
    prismaMock.listing.update.mockResolvedValue({});
    prismaMock.listingImage.findMany.mockResolvedValue([
      { url: 'https://res.cloudinary.com/demo/image/upload/old-photo.jpg' },
    ]);

    const { updateListing } = await import('./listing-actions');
    await updateListing('listing-1', validDraft);

    expect(prismaMock.listing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'VERIFICATION', rejectionReason: null }),
      }),
    );
    expect(addJobMock).toHaveBeenCalledWith(
      'listing-job',
      expect.objectContaining({ listingId: 'listing-1', isNew: false }),
    );
    expect(prismaMock.listingImage.deleteMany).toHaveBeenCalledWith({ where: { listingId: 'listing-1' } });
    expect(prismaMock.listingImage.createMany).toHaveBeenCalled();
  });
});

describe('toggleBookmark', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { toggleBookmark } = await import('./listing-actions');

    await expect(toggleBookmark('listing-1')).rejects.toThrow(
      'Vous devez être connecté pour ajouter un favori.',
    );
    expect(prismaMock.bookmark.create).not.toHaveBeenCalled();
  });

  it('creates a bookmark when none exists yet', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.bookmark.findUnique.mockResolvedValue(null);
    prismaMock.bookmark.create.mockResolvedValue({});

    const { toggleBookmark } = await import('./listing-actions');
    const result = await toggleBookmark('listing-1');

    expect(result).toEqual({ bookmarked: true });
    expect(prismaMock.bookmark.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', listingId: 'listing-1' },
    });
    expect(prismaMock.bookmark.delete).not.toHaveBeenCalled();
  });

  it('removes an existing bookmark', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.bookmark.findUnique.mockResolvedValue({ userId: 'user-1', listingId: 'listing-1' });
    prismaMock.bookmark.delete.mockResolvedValue({});

    const { toggleBookmark } = await import('./listing-actions');
    const result = await toggleBookmark('listing-1');

    expect(result).toEqual({ bookmarked: false });
    expect(prismaMock.bookmark.delete).toHaveBeenCalledWith({
      where: { userId_listingId: { userId: 'user-1', listingId: 'listing-1' } },
    });
    expect(prismaMock.bookmark.create).not.toHaveBeenCalled();
  });
});

describe('isBookmarked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false without querying when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { isBookmarked } = await import('./listing-actions');
    const result = await isBookmarked('listing-1');

    expect(result).toBe(false);
    expect(prismaMock.bookmark.findUnique).not.toHaveBeenCalled();
  });

  it('returns true when a bookmark exists for this user and listing', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.bookmark.findUnique.mockResolvedValue({ userId: 'user-1', listingId: 'listing-1' });

    const { isBookmarked } = await import('./listing-actions');
    const result = await isBookmarked('listing-1');

    expect(result).toBe(true);
  });

  it('returns false when no bookmark exists', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.bookmark.findUnique.mockResolvedValue(null);

    const { isBookmarked } = await import('./listing-actions');
    const result = await isBookmarked('listing-1');

    expect(result).toBe(false);
  });
});

describe('getBookmarkedListings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty page without querying when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { getBookmarkedListings } = await import('./listing-actions');
    const result = await getBookmarkedListings();

    expect(result).toEqual({ listings: [], hasMore: false, total: 0 });
    expect(prismaMock.listing.findMany).not.toHaveBeenCalled();
  });

  it('filters by the current user bookmarks and reports hasMore correctly', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.listing.count.mockResolvedValue(10);
    prismaMock.listing.findMany.mockResolvedValue([{ id: 'listing-1' }, { id: 'listing-2' }]);

    const { getBookmarkedListings } = await import('./listing-actions');
    const result = await getBookmarkedListings({ page: 1, pageSize: 2 });

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, bookmarks: { some: { userId: 'user-1' } } },
        skip: 0,
        take: 2,
      }),
    );
    expect(result).toEqual({
      listings: [{ id: 'listing-1' }, { id: 'listing-2' }],
      hasMore: true,
      total: 10,
    });
  });
});
