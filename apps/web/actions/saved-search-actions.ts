'use server';

import { Prisma, prisma } from '@lokko-hub/db';
import { savedSearchSchema, type SavedSearchInput } from '@lokko-hub/validations';

import { getUser } from '@/lib/auth/auth-session';

type ActionResult = { success: boolean; error?: string };

export async function createSavedSearch(
  input: SavedSearchInput,
): Promise<ActionResult & { savedSearchId?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = savedSearchSchema.safeParse(input);
  if (!validation.success) return { success: false, error: 'Invalid data.' };

  const { title, query, category, geoLat, geoLng, geoRadiusKm } = validation.data;

  const existing = await prisma.savedSearch.findFirst({
    where: { userId: user.id, title: { equals: title, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) {
    return { success: false, error: 'Tu as déjà une recherche sauvegardée avec ce nom.' };
  }

  try {
    const created = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        title,
        query: query || null,
        category: category || null,
        geoLat,
        geoLng,
        geoRadiusKm,
      },
      select: { id: true },
    });

    return { success: true, savedSearchId: created.id };
  } catch (error) {
    // Race: two concurrent saves with the same title slipped past the check above.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Tu as déjà une recherche sauvegardée avec ce nom.' };
    }
    throw error;
  }
}

export async function getUserSavedSearches() {
  const user = await getUser();
  if (!user) return [];

  return prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateSavedSearchTitle(savedSearchId: string, title: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const validation = savedSearchSchema.shape.title.safeParse(title);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message ?? 'Invalid data.' };
  }
  const nextTitle = validation.data;

  const existing = await prisma.savedSearch.findFirst({
    where: { id: savedSearchId, userId: user.id },
    select: { id: true },
  });
  if (!existing) return { success: false, error: 'Not found' };

  const duplicate = await prisma.savedSearch.findFirst({
    where: {
      userId: user.id,
      id: { not: savedSearchId },
      title: { equals: nextTitle, mode: 'insensitive' },
    },
    select: { id: true },
  });
  if (duplicate) {
    return { success: false, error: 'Tu as déjà une recherche sauvegardée avec ce nom.' };
  }

  try {
    await prisma.savedSearch.update({
      where: { id: savedSearchId },
      data: { title: nextTitle },
    });
    return { success: true };
  } catch (error) {
    // Race: two concurrent renames to the same title slipped past the check above.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'Tu as déjà une recherche sauvegardée avec ce nom.' };
    }
    throw error;
  }
}

export async function deleteSavedSearch(savedSearchId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const result = await prisma.savedSearch.deleteMany({
    where: { id: savedSearchId, userId: user.id },
  });
  if (result.count === 0) return { success: false, error: 'Not found' };

  return { success: true };
}
