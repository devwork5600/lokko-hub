'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { getConversationById, markConversationAsRead, sendMessage } from '@/actions/messages-actions';
import { Button } from '@/components/ui/button';
import { setActiveConversationId } from '@/lib/active-conversation';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { getSocket } from '@/lib/socket-client';

type Message = { id: string; content: string; senderId: string; createdAt: Date };

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
        {formatRelativeTime(date)}
      </span>
    </div>
  );
}

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
  const queryClient = useQueryClient();

  // The server already marked this conversation as read on load — sync the
  // navbar badge, which was fetched before that happened.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
  }, [queryClient]);

  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = async (data: { conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      const fresh = await getConversationById(conversationId);
      if (fresh) setMessages(fresh.messages);

      // We're actively viewing this conversation — re-mark as read so the
      // sender's unread bump doesn't stick, then sync the badge.
      await markConversationAsRead(conversationId);
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [conversationId, queryClient]);

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
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-1 overflow-y-auto p-4">
        {messages.map((message, index) => {
          const prev = messages[index - 1] as Message | undefined;
          const isMine = message.senderId === currentUserId;

          const showDateSeparator =
            !prev || new Date(prev.createdAt).toDateString() !== new Date(message.createdAt).toDateString();

          const grouped =
            prev &&
            prev.senderId === message.senderId &&
            new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;

          return (
            <div key={message.id}>
              {showDateSeparator && <DateSeparator date={new Date(message.createdAt)} />}

              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-1' : 'mt-3'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-1 text-[10px] opacity-60">{formatRelativeTime(new Date(message.createdAt))}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          placeholder="Écrire un message..."
          disabled={sending}
          className="h-10 max-h-32 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />

        <Button type="submit" disabled={sending || !draft.trim()}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}
