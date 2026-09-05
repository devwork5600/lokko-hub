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
  },
  listingImage: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
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
