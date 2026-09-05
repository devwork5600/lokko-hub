import { getUserConversations } from '@/actions/messages-actions';
import { ConversationCard } from '@/components/ConversationCard';
import { getUser } from '@/lib/auth/auth-session';

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) {
    return <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes messages.</p>;
  }

  const conversations = await getUserConversations();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Messages</h1>

      {conversations.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </div>
  );
}
