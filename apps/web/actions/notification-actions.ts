'use server';

import { prisma } from '@lokko-hub/db';

import { getUser } from '@/lib/auth/auth-session';

export async function getUserNotifications() {
  const user = await getUser();
  if (!user) return [];

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  return prisma.notification.count({ where: { userId: user.id, read: false } });
}

export async function markNotificationsAsRead(): Promise<{ success: boolean }> {
  const user = await getUser();
  if (!user) return { success: false };

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });

  return { success: true };
}
