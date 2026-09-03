import Image from 'next/image';
import Link from 'next/link';

import { ContactSellerButton } from '@/components/ContactSellerButton';
import { OwnerOnlineBadge } from '@/components/OwnerOnlineBadge';

export function SellerCard({
  owner,
  listingId,
  isOwner,
  isSignedIn,
}: {
  owner: { id: string; name: string | null; image: string | null };
  listingId: string;
  isOwner: boolean;
  isSignedIn: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {owner.image ? (
            <Image src={owner.image} alt="" fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
              {owner.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{owner.name || 'Un utilisateur'}</span>
          <OwnerOnlineBadge ownerId={owner.id} />
        </div>
      </div>

      {isOwner ? (
        <Link
          href={`/listings/${listingId}/edit`}
          className="flex h-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Modifier l&apos;annonce
        </Link>
      ) : (
        isSignedIn && <ContactSellerButton listingId={listingId} />
      )}
    </div>
  );
}
