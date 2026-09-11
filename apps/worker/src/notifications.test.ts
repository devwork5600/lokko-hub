import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  listing: { findUnique: vi.fn() },
  savedSearch: { findMany: vi.fn() },
  notification: { createMany: vi.fn() },
  user: { findUnique: vi.fn() },
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
}));

const broadcastMock = vi.fn();
vi.mock('./socket-broadcast', () => ({
  broadcastToUser: (...args: unknown[]) => broadcastMock(...args),
}));

const emailMock = vi.fn();
vi.mock('@lokko-hub/email', () => ({
  sendEmail: (...args: unknown[]) => emailMock(...args),
  ListingMatchTemplate: (props: unknown) => props,
}));

const NANTES = { lat: 47.2184, lng: -1.5536 };
const PARIS = { lat: 48.8566, lng: 2.3522 };

function mockListing(overrides: Partial<Record<string, unknown>> = {}) {
  prismaMock.listing.findUnique.mockResolvedValue({
    id: 'listing-1',
    title: 'Tomates bio',
    description: 'Fraiches du jardin',
    ownerId: 'owner-1',
    category: { slug: 'fruits-legumes' },
    location: { lat: NANTES.lat, lng: NANTES.lng },
    images: [{ url: 'https://cdn.test/tomates.jpg' }],
    ...overrides,
  });
}

describe('matchSavedSearches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.savedSearch.findMany.mockResolvedValue([]);
    broadcastMock.mockResolvedValue({ success: true, online: true });
    emailMock.mockResolvedValue(undefined);
  });

  it('does nothing when there are no candidate saved searches', async () => {
    mockListing();

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('notifies a user whose saved search has no filters at all', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: null, geoLat: null, geoLng: null, geoRadiusKm: null },
    ]);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            userId: 'user-a',
            type: 'NEW_LISTING_MATCH',
            listingId: 'listing-1',
          }),
        ],
        skipDuplicates: true,
      }),
    );
    expect(broadcastMock).toHaveBeenCalledWith('user-a', 'notification:new', expect.any(Object));
  });

  it('excludes a saved search whose text query does not match the title/description', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: 'courgettes', geoLat: null, geoLng: null, geoRadiusKm: null },
    ]);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('includes a saved search whose text query matches', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: 'tomates jardin', geoLat: null, geoLng: null, geoRadiusKm: null },
    ]);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).toHaveBeenCalled();
  });

  it('excludes a saved search whose geo radius does not reach the listing (the lokko-v4 bug, fixed)', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: null, geoLat: PARIS.lat, geoLng: PARIS.lng, geoRadiusKm: 10 },
    ]);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('includes a saved search whose geo radius reaches the listing', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: null, geoLat: NANTES.lat, geoLng: NANTES.lng, geoRadiusKm: 5 },
    ]);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.notification.createMany).toHaveBeenCalled();
  });

  it('pre-filters candidates at the DB level by active status, owner exclusion, and category', async () => {
    mockListing();

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(prismaMock.savedSearch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          userId: { not: 'owner-1' },
          OR: [{ category: null }, { category: 'fruits-legumes' }],
        },
      }),
    );
  });

  it('sends an email fallback only when the matched user is offline', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: null, geoLat: null, geoLng: null, geoRadiusKm: null },
    ]);
    broadcastMock.mockResolvedValue({ success: true, online: false });
    prismaMock.user.findUnique.mockResolvedValue({ email: 'buyer@test.com' });

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(emailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'buyer@test.com',
        react: expect.objectContaining({
          props: expect.objectContaining({ listingTitle: 'Tomates bio' }),
        }),
      }),
    );
  });

  it('does not send an email when the matched user is online', async () => {
    mockListing();
    prismaMock.savedSearch.findMany.mockResolvedValue([
      { userId: 'user-a', query: null, geoLat: null, geoLng: null, geoRadiusKm: null },
    ]);
    broadcastMock.mockResolvedValue({ success: true, online: true });

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('listing-1');

    expect(emailMock).not.toHaveBeenCalled();
  });

  it('does nothing when the listing no longer exists', async () => {
    prismaMock.listing.findUnique.mockResolvedValue(null);

    const { matchSavedSearches } = await import('./notifications');
    await matchSavedSearches('missing-listing');

    expect(prismaMock.savedSearch.findMany).not.toHaveBeenCalled();
  });
});
