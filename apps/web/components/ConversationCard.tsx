'use client';

import { MailIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteConversation, getUserConversations } from '@/actions/messages-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatRelativeTime } from '@/lib/format-relative-time';

type Conversation = Awaited<ReturnType<typeof getUserConversations>>[number];

export function ConversationCardSkeleton() {
  return <div className="h-24 animate-pulse rounded-lg border border-border bg-muted" />;
}

export function ConversationCard({ conversation }: { conversation: Conversation }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { otherUser } = conversation;
  const hasUnread = conversation.unreadCount > 0;

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteConversation(conversation.id);
    setDeleting(false);
    if (result.success) {
      setConfirmOpen(false);
      router.refresh();
    }
  }

  return (
    <div className="relative flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <Link href={`/account/messages/${conversation.id}`} className="flex flex-1 items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {otherUser.image ? (
            <Image src={otherUser.image} alt={otherUser.name ?? 'Avatar'} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-medium uppercase text-muted-foreground">
              {otherUser.name?.[0] ?? '?'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">{otherUser.name || 'Un utilisateur'}</span>
            {conversation.lastMessageAt && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(new Date(conversation.lastMessageAt))}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{conversation.listingTitle}</p>
          {conversation.lastMessagePreview && (
            <p className="truncate text-sm text-muted-foreground">{conversation.lastMessagePreview}</p>
          )}
        </div>

        {conversation.listingImage && (
          <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-md sm:block">
            <Image src={conversation.listingImage} alt="" fill className="object-cover" />
          </div>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        {hasUnread && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <MailIcon className="h-3 w-3" />
            {conversation.unreadCount}
          </span>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>

          <DialogContent>
            <DialogTitle>Supprimer cette conversation ?</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Elle disparaîtra de ta boîte de réception. Elle réapparaîtra si{' '}
              {otherUser.name || "l'autre personne"} t&apos;envoie un nouveau message.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
