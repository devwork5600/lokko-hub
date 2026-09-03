'use client';

import { useEffect, useRef, useState } from 'react';

import { getConversationById, sendMessage } from '@/actions/messages-actions';
import { getSocket } from '@/lib/socket-client';

type Message = { id: string; content: string; senderId: string; createdAt: Date };

export function ConversationThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = async (data: { conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      const fresh = await getConversationById(conversationId);
      if (fresh) setMessages(fresh.messages);
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setSending(true);
    setDraft('');

    const result = await sendMessage(conversationId, content);
    if (result.success) {
      const fresh = await getConversationById(conversationId);
      if (fresh) setMessages(fresh.messages);
    }

    setSending(false);
  }

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.senderId === currentUserId ? 'Moi' : 'Eux'} :</strong> {message.content}
          </li>
        ))}
        <div ref={bottomRef} />
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écris un message..."
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
