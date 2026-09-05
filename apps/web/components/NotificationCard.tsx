'use client';

import { ArchiveIcon, CheckCircleIcon, SearchIcon, TrashIcon, XCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteNotification, getUserNotifications } from '@/actions/notification-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatRelativeTime } from '@/lib/format-relative-time';

type Notification = Awaited<ReturnType<typeof getUserNotifications>>[number];

type NotificationPayload = {
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  rejectionReason?: string | null;
};

const notificationCopy: Record<
  string,
  { icon: typeof SearchIcon; message: (payload: NotificationPayload) => string; href: (id: string) => string }
> = {
  NEW_LISTING_MATCH: {
    icon: SearchIcon,
    message: (p) => `Nouvelle annonce correspondant à une recherche : ${p.listingTitle}`,
    href: (id) => `/listings/${id}`,
  },
  LISTING_VALIDATED: {
    icon: CheckCircleIcon,
    message: (p) => `Ton annonce est en ligne : ${p.listingTitle}`,
    href: (id) => `/listings/${id}`,
  },
  LISTING_REJECTED: {
    icon: XCircleIcon,
    message: (p) =>
      `Ton annonce a été refusée : ${p.listingTitle}${p.rejectionReason ? ` — ${p.rejectionReason}` : ''}`,
    href: (id) => `/account/listings/${id}/edit`,
  },
  LISTING_ARCHIVED: {
    icon: ArchiveIcon,
    message: (p) => `Ton annonce a été archivée : ${p.listingTitle}`,
    href: () => `/account/listings`,
  },
};

export function NotificationCard({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const payload = notification.payload as NotificationPayload;
  const copy = notificationCopy[notification.type] ?? notificationCopy.NEW_LISTING_MATCH;
  const Icon = copy.icon;

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteNotification(notification.id);
    setDeleting(false);
    if (result.success) {
      setConfirmOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? 'Une erreur est survenue.');
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <Link href={copy.href(payload.listingId)} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {payload.listingImage ? (
            <Image src={payload.listingImage} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{copy.message(payload)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(notification.createdAt))}</p>
        </div>

        {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
      </Link>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setConfirmOpen(true)}
          aria-label="Supprimer"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>

        <DialogContent>
          <DialogTitle>Supprimer cette notification ?</DialogTitle>
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
  );
}
