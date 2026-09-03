import Image from 'next/image';
import Link from 'next/link';

import { getUserConversations } from '@/actions/messages-actions';
import { getUser } from '@/lib/auth/auth-session';

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour voir tes messages.</p>
      </main>
    );
  }

  const conversations = await getUserConversations();

  return (
    <main>
      <h1>Messages</h1>

      {conversations.length === 0 ? (
        <p>Aucune conversation pour le moment.</p>
      ) : (
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link href={`/account/messages/${conversation.id}`}>
                {conversation.listingImage && (
                  <Image src={conversation.listingImage} alt="" width={60} height={60} />
                )}
                <strong>{conversation.otherUser.name || 'Un utilisateur'}</strong>
                {' — '}
                {conversation.listingTitle}
                {' — '}
                {conversation.lastMessagePreview ?? 'Nouvelle conversation'}
                {conversation.unreadCount > 0 && <span> ({conversation.unreadCount} non lu)</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
