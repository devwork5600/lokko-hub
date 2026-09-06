'use client';

import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon, TrashIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { archiveListing, deleteListing, unarchiveListing, type UserListingCard as UserListingCardType } from '@/actions/listing-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'En ligne', className: 'bg-green-600' },
  ARCHIVED: { label: 'Archivée', className: 'bg-blue-500' },
  VERIFICATION: { label: 'En vérification', className: 'bg-yellow-600' },
  REJECTED: { label: 'Refusée', className: 'bg-destructive' },
};

export function UserListingCard({ listing }: { listing: UserListingCardType }) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const image = listing.images[0];
  const status = statusLabels[listing.status];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['user-listings'] });
  }

  async function handleArchiveToggle() {
    setPending(true);
    const result = listing.status === 'ARCHIVED' ? await unarchiveListing(listing.id) : await archiveListing(listing.id);
    setPending(false);
    if (result.success) {
      invalidate();
    } else {
      toast.error(result.error ?? 'Une erreur est survenue.');
    }
  }

  async function handleDelete() {
    setPending(true);
    const result = await deleteListing(listing.id);
    setPending(false);
    if (result.success) {
      setConfirmOpen(false);
      invalidate();
    } else {
      toast.error(result.error ?? 'Une erreur est survenue.');
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute top-2 right-2 z-10 flex gap-1.5">
        <Link
          href={`/account/listings/${listing.id}/edit`}
          className="rounded-lg bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:text-primary"
          aria-label="Modifier"
        >
          <PencilIcon className="h-4 w-4" />
        </Link>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="cursor-pointer rounded-lg bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:text-destructive"
            aria-label="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>

          <DialogContent>
            <DialogTitle>Supprimer cette annonce ?</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">Cette action est définitive.</p>
            <div className="mt-6 flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
                {pending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Link href={`/listings/${listing.id}`}>
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
          {status && (
            <span
              className={`absolute top-3 left-3 z-10 rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.className}`}
            >
              {status.label}
            </span>
          )}
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? listing.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Aucune image</div>
          )}
        </div>
        <div className="p-2">
          <h2 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
            {listing.title}
          </h2>
          <p className="text-sm font-semibold text-foreground">
            {listing.price} €{listing.priceUnit !== 'UNIT' ? `/${listing.priceUnit.toLowerCase()}` : ''}
          </p>
          <p className="text-xs text-muted-foreground">{listing.location.city}</p>
        </div>
      </Link>

      <div className="border-t border-border p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleArchiveToggle}
          disabled={pending}
        >
          {listing.status === 'ARCHIVED' ? 'Réactiver' : 'Archiver'}
        </Button>
      </div>
    </div>
  );
}

export function UserListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
      <div className="aspect-4/5 w-full">
        <Skeleton className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-foreground uppercase">
          lokko
        </Skeleton>
      </div>
      <div className="space-y-2 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
