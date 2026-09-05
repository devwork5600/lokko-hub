import { beforeEach, describe, expect, it, vi } from 'vitest';

class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(code: string) {
    super('mock prisma error');
    this.code = code;
  }
}

const prismaMock = {
  savedSearch: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
  Prisma: { PrismaClientKnownRequestError },
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getUser: vi.fn(),
}));

describe('createSavedSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { createSavedSearch } = await import('./saved-search-actions');
    const result = await createSavedSearch({ title: 'Tomates près de Nantes' });

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(prismaMock.savedSearch.create).not.toHaveBeenCalled();
  });

  it('rejects a title-less input', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    const { createSavedSearch } = await import('./saved-search-actions');
    const result = await createSavedSearch({ title: '' });

    expect(result.success).toBe(false);
    expect(prismaMock.savedSearch.create).not.toHaveBeenCalled();
  });

  it('stores geo filters alongside category and text query', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst.mockResolvedValue(null);
    prismaMock.savedSearch.create.mockResolvedValue({ id: 'search-1' });

    const { createSavedSearch } = await import('./saved-search-actions');
    await createSavedSearch({
      title: 'Tomates près de Nantes',
      query: 'tomates',
      category: 'fruits-legumes',
      geoLat: 47.2184,
      geoLng: -1.5536,
      geoRadiusKm: 10,
    });

    expect(prismaMock.savedSearch.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', title: { equals: 'Tomates près de Nantes', mode: 'insensitive' } },
      select: { id: true },
    });
    expect(prismaMock.savedSearch.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: 'Tomates près de Nantes',
        query: 'tomates',
        category: 'fruits-legumes',
        geoLat: 47.2184,
        geoLng: -1.5536,
        geoRadiusKm: 10,
      },
      select: { id: true },
    });
  });

  it('rejects a title that already exists for this user (case-insensitive)', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst.mockResolvedValue({ id: 'existing-search' });

    const { createSavedSearch } = await import('./saved-search-actions');
    const result = await createSavedSearch({ title: 'tomates près de nantes' });

    expect(result).toEqual({
      success: false,
      error: 'Tu as déjà une recherche sauvegardée avec ce nom.',
    });
    expect(prismaMock.savedSearch.create).not.toHaveBeenCalled();
  });

  it('reports a friendly error if a concurrent save races past the duplicate check', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst.mockResolvedValue(null);
    prismaMock.savedSearch.create.mockRejectedValue(new PrismaClientKnownRequestError('P2002'));

    const { createSavedSearch } = await import('./saved-search-actions');
    const result = await createSavedSearch({ title: 'Tomates près de Nantes' });

    expect(result).toEqual({
      success: false,
      error: 'Tu as déjà une recherche sauvegardée avec ce nom.',
    });
  });
});

describe('updateSavedSearchTitle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects when not authenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { updateSavedSearchTitle } = await import('./saved-search-actions');
    const result = await updateSavedSearchTitle('search-1', 'Nouveau nom');

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(prismaMock.savedSearch.update).not.toHaveBeenCalled();
  });

  it('rejects a search not owned by the current user', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst.mockResolvedValueOnce(null);

    const { updateSavedSearchTitle } = await import('./saved-search-actions');
    const result = await updateSavedSearchTitle('search-1', 'Nouveau nom');

    expect(result).toEqual({ success: false, error: 'Not found' });
    expect(prismaMock.savedSearch.update).not.toHaveBeenCalled();
  });

  it('rejects renaming to a title that already exists for this user (case-insensitive)', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst
      .mockResolvedValueOnce({ id: 'search-1' }) // ownership check
      .mockResolvedValueOnce({ id: 'search-2' }); // duplicate check

    const { updateSavedSearchTitle } = await import('./saved-search-actions');
    const result = await updateSavedSearchTitle('search-1', 'tomates près de nantes');

    expect(result).toEqual({
      success: false,
      error: 'Tu as déjà une recherche sauvegardée avec ce nom.',
    });
    expect(prismaMock.savedSearch.update).not.toHaveBeenCalled();
  });

  it('does not treat the search itself as a duplicate of its own title', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst
      .mockResolvedValueOnce({ id: 'search-1' }) // ownership check
      .mockResolvedValueOnce(null); // duplicate check excludes search-1
    prismaMock.savedSearch.update.mockResolvedValue({});

    const { updateSavedSearchTitle } = await import('./saved-search-actions');
    const result = await updateSavedSearchTitle('search-1', 'Tomates près de Nantes');

    expect(result).toEqual({ success: true });
    expect(prismaMock.savedSearch.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        userId: 'user-1',
        id: { not: 'search-1' },
        title: { equals: 'Tomates près de Nantes', mode: 'insensitive' },
      },
      select: { id: true },
    });
    expect(prismaMock.savedSearch.update).toHaveBeenCalledWith({
      where: { id: 'search-1' },
      data: { title: 'Tomates près de Nantes' },
    });
  });

  it('reports a friendly error if a concurrent rename races past the duplicate check', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.findFirst.mockResolvedValueOnce({ id: 'search-1' }).mockResolvedValueOnce(null);
    prismaMock.savedSearch.update.mockRejectedValue(new PrismaClientKnownRequestError('P2002'));

    const { updateSavedSearchTitle } = await import('./saved-search-actions');
    const result = await updateSavedSearchTitle('search-1', 'Tomates près de Nantes');

    expect(result).toEqual({
      success: false,
      error: 'Tu as déjà une recherche sauvegardée avec ce nom.',
    });
  });
});

describe('deleteSavedSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only deletes a saved search owned by the current user', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.deleteMany.mockResolvedValue({ count: 1 });

    const { deleteSavedSearch } = await import('./saved-search-actions');
    const result = await deleteSavedSearch('search-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.savedSearch.deleteMany).toHaveBeenCalledWith({
      where: { id: 'search-1', userId: 'user-1' },
    });
  });

  it('reports failure when nothing was deleted (not owned or does not exist)', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.savedSearch.deleteMany.mockResolvedValue({ count: 0 });

    const { deleteSavedSearch } = await import('./saved-search-actions');
    const result = await deleteSavedSearch('search-1');

    expect(result).toEqual({ success: false, error: 'Not found' });
  });
});
