import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  listingImage: { updateMany: vi.fn() },
  listing: { update: vi.fn() },
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
}));

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: async () => body } as Response;
}

describe('processListingJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NSFW_API_URL = 'https://api.nsfw-protect.test';
    process.env.NSFW_API_KEY = 'test-key';
  });

  it('marks the listing ACTIVE when every image is classified sfw', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url === 'https://cdn.test/photo.jpg') {
          return { ok: true, blob: async () => new Blob(['fake']) } as Response;
        }
        return jsonResponse({
          status: 'done',
          result: [
            { label: 'sfw', score: 0.95 },
            { label: 'nsfw', score: 0.05 },
          ],
        });
      }),
    );

    const { processListingJob } = await import('./moderation');
    await processListingJob({ listingId: 'listing-1', images: ['https://cdn.test/photo.jpg'] });

    expect(prismaMock.listingImage.updateMany).toHaveBeenCalledWith({
      where: { listingId: 'listing-1', url: 'https://cdn.test/photo.jpg' },
      data: { status: 'SAFE' },
    });
    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: 'listing-1' },
      data: {
        status: 'ACTIVE',
        rejectionReason: null,
        nsfwResults: [{ image: 'https://cdn.test/photo.jpg', label: 'sfw' }],
      },
    });

    vi.unstubAllGlobals();
  });

  it('rejects the listing when any image is classified nsfw', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (url.startsWith('https://cdn.test/')) {
          return { ok: true, blob: async () => new Blob(['fake']) } as Response;
        }
        return jsonResponse({
          status: 'done',
          result: [{ label: 'nsfw', score: 0.9 }],
        });
      }),
    );

    const { processListingJob } = await import('./moderation');
    await processListingJob({ listingId: 'listing-2', images: ['https://cdn.test/bad.jpg'] });

    expect(prismaMock.listingImage.updateMany).toHaveBeenCalledWith({
      where: { listingId: 'listing-2', url: 'https://cdn.test/bad.jpg' },
      data: { status: 'NSFW' },
    });
    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: 'listing-2' },
      data: {
        status: 'REJECTED',
        rejectionReason: 'Image flagged as inappropriate content',
        nsfwResults: [{ image: 'https://cdn.test/bad.jpg', label: 'nsfw' }],
      },
    });

    vi.unstubAllGlobals();
  });

  it('does not reject the listing just because one image failed to classify', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => ({ ok: false, status: 500 }) as Response),
    );

    const { processListingJob } = await import('./moderation');
    await processListingJob({ listingId: 'listing-3', images: ['https://cdn.test/broken.jpg'] });

    expect(prismaMock.listingImage.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: 'listing-3' },
      data: {
        status: 'ACTIVE',
        rejectionReason: null,
        nsfwResults: [{ image: 'https://cdn.test/broken.jpg', label: 'error' }],
      },
    });

    vi.unstubAllGlobals();
  });
});
