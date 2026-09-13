'use server';

import { prisma } from '@lokko-hub/db';

import { getUser } from '@/lib/auth/auth-session';

export type NotificationPreferences = {
  pushMessagesEnabled: boolean;
  pushListingStatusEnabled: boolean;
  pushSavedSearchEnabled: boolean;
};

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const user = await getUser();
  if (!user) return null;

  return prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      pushMessagesEnabled: true,
      pushListingStatusEnabled: true,
      pushSavedSearchEnabled: true,
    },
  });
}

export async function updateNotificationPreference(
  field: keyof NotificationPreferences,
  value: boolean,
): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };

  await prisma.user.update({ where: { id: user.id }, data: { [field]: value } });
  return { success: true };
}
