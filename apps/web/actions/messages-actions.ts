'use server';

import * as React from 'react';

import { prisma } from '@lokko-hub/db';
import { sendEmail, MessageNotificationTemplate } from '@lokko-hub/email';

import { getUser } from '@/lib/auth/auth-session';
import { broadcastToUser } from '@/lib/socket-broadcast';

type ActionResult = { success: boolean; error?: string };

// Two users only ever have one conversation per listing, regardless of who
// messaged first — the pair (user1Id, user2Id) is always sorted so the same
// two people always resolve to the same row.
function sortUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function getOrCreateConversation(
  listingId: string,
): Promise<ActionResult & { conversationId?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  });
  if (!listing) return { success: false, error: 'Listing not found' };
  if (listing.ownerId === user.id) {
    return { success: false, error: "Tu ne peux pas te contacter toi-même." };
  }

  const [user1Id, user2Id] = sortUserPair(user.id, listing.ownerId);

  const existing = await prisma.conversation.findUnique({
    where: { listingId_user1Id_user2Id: { listingId, user1Id, user2Id } },
  });

  if (existing) {
    // Re-surface it if the current user had previously deleted it — they're
    // the one re-initiating contact, so it should reappear in their inbox.
    const isUser1 = user1Id === user.id;
    const alreadyDeleted = isUser1 ? existing.user1DeletedAt : existing.user2DeletedAt;
    if (alreadyDeleted) {
      await prisma.conversation.update({
        where: { id: existing.id },
        data: isUser1 ? { user1DeletedAt: null } : { user2DeletedAt: null },
      });
    }
    return { success: true, conversationId: existing.id };
  }

  const created = await prisma.conversation.create({
    data: { listingId, user1Id, user2Id },
    select: { id: true },
  });

  return { success: true, conversationId: created.id };
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ActionResult & { messageId?: string }> {
  const user = await getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: 'Message vide.' };

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return { success: false, error: 'Conversation not found' };
  if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) {
    return { success: false, error: 'Forbidden' };
  }

  const isUser1Sender = conversation.user1Id === user.id;
  const recipientId = isUser1Sender ? conversation.user2Id : conversation.user1Id;
  const preview = trimmed.slice(0, 200);

  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { content: trimmed, senderId: user.id, conversationId } }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: preview,
        lastMessageSenderId: user.id,
        // Bump the recipient's unread count, and un-delete on their side — a
        // new message should reappear in their inbox even if they'd deleted
        // this conversation before.
        ...(isUser1Sender
          ? { user2UnreadCount: { increment: 1 }, user2DeletedAt: null }
          : { user1UnreadCount: { increment: 1 }, user1DeletedAt: null }),
      },
    }),
  ]);

  const broadcastResult = await broadcastToUser(recipientId, 'message:new', {
    conversationId,
    preview,
  }).catch(() => ({ success: false, online: false }));

  if (!broadcastResult.online) {
    const [recipient, sender] = await Promise.all([
      prisma.user.findUnique({ where: { id: recipientId }, select: { email: true } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { name: true } }),
    ]);

    if (recipient?.email) {
      const conversationUrl = `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/account/messages/${conversationId}`;
      const senderName = sender?.name || 'Un utilisateur';
      sendEmail({
        to: recipient.email,
        subject: `Nouveau message de ${senderName}`,
        react: React.createElement(MessageNotificationTemplate, {
          senderName,
          messagePreview: preview,
          conversationUrl,
        }),
      }).catch((err) => console.error('Failed to send message email:', err));
    }
  }

  return { success: true, messageId: message.id };
}

export async function getUserConversations() {
  const user = await getUser();
  if (!user) return [];

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: user.id, user1DeletedAt: null },
        { user2Id: user.id, user2DeletedAt: null },
      ],
    },
    orderBy: { lastMessageAt: 'desc' },
    select: {
      id: true,
      listingId: true,
      user1Id: true,
      user1UnreadCount: true,
      user2UnreadCount: true,
      lastMessageAt: true,
      lastMessagePreview: true,
      listing: {
        select: { title: true, images: { take: 1, orderBy: { index: 'asc' }, select: { url: true } } },
      },
      user1: { select: { id: true, name: true, image: true } },
      user2: { select: { id: true, name: true, image: true } },
    },
  });

  return conversations.map((c) => {
    const isUser1 = c.user1Id === user.id;
    const otherUser = isUser1 ? c.user2 : c.user1;
    const unreadCount = isUser1 ? c.user1UnreadCount : c.user2UnreadCount;

    return {
      id: c.id,
      listingId: c.listingId,
      listingTitle: c.listing.title,
      listingImage: c.listing.images[0]?.url ?? null,
      otherUser,
      lastMessageAt: c.lastMessageAt,
      lastMessagePreview: c.lastMessagePreview,
      unreadCount,
    };
  });
}

export async function getConversationById(conversationId: string) {
  const user = await getUser();
  if (!user) return null;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      listingId: true,
      user1Id: true,
      user2Id: true,
      listing: { select: { title: true } },
      user1: { select: { id: true, name: true, image: true } },
      user2: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, content: true, senderId: true, createdAt: true },
      },
    },
  });

  if (!conversation) return null;
  if (conversation.user1Id !== user.id && conversation.user2Id !== user.id) return null;

  const otherUser = conversation.user1Id === user.id ? conversation.user2 : conversation.user1;
  return { ...conversation, otherUser };
}

export type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversationById>>>;

export async function markConversationAsRead(conversationId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { success: false };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!conversation) return { success: false };

  const isUser1 = conversation.user1Id === user.id;
  const isUser2 = conversation.user2Id === user.id;
  if (!isUser1 && !isUser2) return { success: false };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: isUser1
      ? { user1UnreadCount: 0, user1LastReadAt: new Date() }
      : { user2UnreadCount: 0, user2LastReadAt: new Date() },
  });

  return { success: true };
}

export async function getUnreadMessagesCount(): Promise<number> {
  const user = await getUser();
  if (!user) return 0;

  const [asUser1, asUser2] = await Promise.all([
    prisma.conversation.aggregate({
      where: { user1Id: user.id },
      _sum: { user1UnreadCount: true },
    }),
    prisma.conversation.aggregate({
      where: { user2Id: user.id },
      _sum: { user2UnreadCount: true },
    }),
  ]);

  return (asUser1._sum.user1UnreadCount ?? 0) + (asUser2._sum.user2UnreadCount ?? 0);
}

export async function deleteConversation(conversationId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { success: false };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!conversation) return { success: false };

  const isUser1 = conversation.user1Id === user.id;
  const isUser2 = conversation.user2Id === user.id;
  if (!isUser1 && !isUser2) return { success: false };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: isUser1 ? { user1DeletedAt: new Date() } : { user2DeletedAt: new Date() },
  });

  return { success: true };
}
