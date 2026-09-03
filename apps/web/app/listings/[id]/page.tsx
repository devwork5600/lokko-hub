import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getListingById } from '@/actions/listing-actions';
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
      <p>
        {listing.category.name}
        {listing.subCategory ? ` › ${listing.subCategory.name}` : ''}
        {listing.product ? ` › ${listing.product.name}` : ''}
      </p>
      <p>{listing.description}</p>
      <p>Vendu par {listing.owner.name || 'un utilisateur'}</p>

      {isOwner && <Link href={`/listings/${listing.id}/edit`}>Modifier l&apos;annonce</Link>}
    </main>
  );
}
