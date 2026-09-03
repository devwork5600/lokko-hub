'use server';

import { prisma } from '@lokko-hub/db';
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
}

export async function getUserSavedSearches() {
  const user = await getUser();
  if (!user) return [];

  return prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
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
