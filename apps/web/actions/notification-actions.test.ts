import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  notification: {
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getUser: vi.fn(),
}));

describe('notification-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserNotifications returns nothing when unauthenticated', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue(undefined);

    const { getUserNotifications } = await import('./notification-actions');
    const result = await getUserNotifications();

    expect(result).toEqual([]);
    expect(prismaMock.notification.findMany).not.toHaveBeenCalled();
  });

  it('getUnreadNotificationsCount scopes the count to the current user and unread rows', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);
    prismaMock.notification.count.mockResolvedValue(3);

    const { getUnreadNotificationsCount } = await import('./notification-actions');
    const count = await getUnreadNotificationsCount();

    expect(count).toBe(3);
    expect(prismaMock.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
    });
  });

  it('markNotificationsAsRead only touches the current user unread rows', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'user-1' } as never);

    const { markNotificationsAsRead } = await import('./notification-actions');
    const result = await markNotificationsAsRead();

    expect(result).toEqual({ success: true });
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
      data: { read: true },
    });
  });
});
