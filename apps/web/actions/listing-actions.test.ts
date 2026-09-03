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
});
