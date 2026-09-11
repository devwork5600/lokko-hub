import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  listing: { findUnique: vi.fn() },
  conversation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
  },
  message: { create: vi.fn() },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
};

vi.mock('@lokko-hub/db', () => ({
  prisma: prismaMock,
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getUser: vi.fn(),
}));

const broadcastMock = vi.fn();
vi.mock('@/lib/socket-broadcast', () => ({
  broadcastToUser: (...args: unknown[]) => broadcastMock(...args),
}));

vi.mock('@lokko-hub/email', () => ({
  sendEmail: vi.fn(),
  MessageNotificationTemplate: () => null,
}));

const USER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

describe('getOrCreateConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sorts the pair the same way regardless of who is the buyer', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');

    // Case 1: current user (A) < listing owner (B)
    vi.mocked(getUser).mockResolvedValue({ id: USER_A } as never);
    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: USER_B });
    prismaMock.conversation.findUnique.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue({ id: 'conv-1' });

    const { getOrCreateConversation } = await import('./messages-actions');
    await getOrCreateConversation('listing-1');

    expect(prismaMock.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { listingId: 'listing-1', user1Id: USER_A, user2Id: USER_B },
      }),
    );

    vi.clearAllMocks();

    // Case 2: current user (B) > listing owner (A) — same pair, still user1=A user2=B
    vi.mocked(getUser).mockResolvedValue({ id: USER_B } as never);
    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: USER_A });
    prismaMock.conversation.findUnique.mockResolvedValue(null);
    prismaMock.conversation.create.mockResolvedValue({ id: 'conv-1' });

    await getOrCreateConversation('listing-1');

    expect(prismaMock.conversation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { listingId: 'listing-1', user1Id: USER_A, user2Id: USER_B },
      }),
    );
  });

  it('refuses to let a user message themselves about their own listing', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: USER_A } as never);
    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: USER_A });

    const { getOrCreateConversation } = await import('./messages-actions');
    const result = await getOrCreateConversation('listing-1');

    expect(result.success).toBe(false);
    expect(prismaMock.conversation.create).not.toHaveBeenCalled();
  });

  it('un-deletes an existing conversation on the current user side if they had deleted it', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: USER_A } as never);
    prismaMock.listing.findUnique.mockResolvedValue({ ownerId: USER_B });
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      user1DeletedAt: new Date(),
      user2DeletedAt: null,
    });

    const { getOrCreateConversation } = await import('./messages-actions');
    const result = await getOrCreateConversation('listing-1');

    expect(result).toEqual({ success: true, conversationId: 'conv-1' });
    expect(prismaMock.conversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { user1DeletedAt: null },
    });
  });
});

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bumps the recipient unread count and clears their deleted flag, not the sender', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: USER_A } as never);
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      user1Id: USER_A,
      user2Id: USER_B,
    });
    prismaMock.message.create.mockResolvedValue({ id: 'msg-1' });
    broadcastMock.mockResolvedValue({ success: true, online: true });

    const { sendMessage } = await import('./messages-actions');
    await sendMessage('conv-1', 'Bonjour !');

    expect(prismaMock.conversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ user2UnreadCount: { increment: 1 }, user2DeletedAt: null }),
      }),
    );
    expect(broadcastMock).toHaveBeenCalledWith(USER_B, 'message:new', expect.any(Object));
  });

  it('rejects a message from someone not part of the conversation', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: 'someone-else' } as never);
    prismaMock.conversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      user1Id: USER_A,
      user2Id: USER_B,
    });

    const { sendMessage } = await import('./messages-actions');
    const result = await sendMessage('conv-1', 'Hello');

    expect(result).toEqual({ success: false, error: 'Forbidden' });
    expect(prismaMock.message.create).not.toHaveBeenCalled();
  });

  it('rejects an empty (whitespace-only) message', async () => {
    const { getUser } = await import('@/lib/auth/auth-session');
    vi.mocked(getUser).mockResolvedValue({ id: USER_A } as never);

    const { sendMessage } = await import('./messages-actions');
    const result = await sendMessage('conv-1', '   ');

    expect(result.success).toBe(false);
    expect(prismaMock.conversation.findUnique).not.toHaveBeenCalled();
  });
});
