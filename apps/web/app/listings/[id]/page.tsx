import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getListingById } from '@/actions/listing-actions';
import { LeafletMap } from '@/components/LeafletMapClient';
import { ContactSellerButton } from '@/components/ContactSellerButton';
import { OwnerOnlineBadge } from '@/components/OwnerOnlineBadge';
import { getUser } from '@/lib/auth/auth-session';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const user = await getUser();
  const isOwner = user?.id === listing.ownerId;

  return (
    <main>
      <h1>{listing.title}</h1>

      {isOwner && listing.status === 'VERIFICATION' && (
        <p role="status">Ton annonce est en cours de vérification, elle n&apos;est visible que par toi pour l&apos;instant.</p>
      )}
      {isOwner && listing.status === 'REJECTED' && (
        <p role="alert">
          Ton annonce a été rejetée{listing.rejectionReason ? ` : ${listing.rejectionReason}` : ''}. Modifie les
          photos et enregistre pour relancer la vérification.
        </p>
      )}

      {listing.images.length > 0 && (
        <div>
          {listing.images.map((image) => (
            <Image
              key={image.url}
              src={image.url}
              alt={image.altText ?? listing.title}
              width={300}
              height={300}
            />
          ))}
        </div>
      )}

      <p>
        {listing.price}€{listing.priceUnit !== 'UNIT' ? `/${listing.priceUnit.toLowerCase()}` : ''}
      </p>
      <p>
        {listing.location.city} ({listing.location.postalCode})
      </p>
      <LeafletMap lat={listing.location.lat} lng={listing.location.lng} radiusKm={2} />
      <p>
        {listing.category.name}
        {listing.subCategory ? ` › ${listing.subCategory.name}` : ''}
        {listing.product ? ` › ${listing.product.name}` : ''}
      </p>
      <p>{listing.description}</p>
      <p>
        Vendu par {listing.owner.name || 'un utilisateur'}
        <OwnerOnlineBadge ownerId={listing.ownerId} />
      </p>

      {isOwner && <Link href={`/listings/${listing.id}/edit`}>Modifier l&apos;annonce</Link>}
      {!isOwner && user && <ContactSellerButton listingId={listing.id} />}
    </main>
  );
}
