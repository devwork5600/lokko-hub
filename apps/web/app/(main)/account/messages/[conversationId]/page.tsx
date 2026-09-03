import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getConversationById, markConversationAsRead } from '@/actions/messages-actions';
import { ConversationThread } from '@/components/ConversationThread';
import { OwnerOnlineBadge } from '@/components/OwnerOnlineBadge';
import { getUser } from '@/lib/auth/auth-session';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour voir cette conversation.</p>
      </main>
    );
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation) notFound();

  await markConversationAsRead(conversationId);

  return (
    <main>
      <Link href="/account/messages">&larr; Retour aux messages</Link>
      <h1>
        {conversation.otherUser.name || 'Un utilisateur'}
        <OwnerOnlineBadge ownerId={conversation.otherUser.id} />
      </h1>
      <p>À propos de : {conversation.listing.title}</p>

      <ConversationThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={conversation.messages}
      />
    </main>
  );
}
