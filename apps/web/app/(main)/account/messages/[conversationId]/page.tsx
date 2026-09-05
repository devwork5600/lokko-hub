import { ArrowLeftIcon } from 'lucide-react';
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
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir cette conversation.</p>;
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation) notFound();

  await markConversationAsRead(conversationId);

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[500px] flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Link
          href="/account/messages"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>

        <div>
          <p className="flex items-center gap-2 font-medium text-foreground">
            {conversation.otherUser.name || 'Un utilisateur'}
            <OwnerOnlineBadge ownerId={conversation.otherUser.id} />
          </p>
          <p className="text-xs text-muted-foreground">À propos de : {conversation.listing.title}</p>
        </div>
      </div>

      <ConversationThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
