import { notFound } from 'next/navigation';

import { getListingById } from '@/actions/listing-actions';
import { LeafletMap } from '@/components/LeafletMapClient';
import { getUser } from '@/lib/auth/auth-session';

import { ListingGallery } from './ListingGallery';
import { ListingInfoCard } from './ListingInfoCard';
import { SellerCard } from './SellerCard';

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
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 lg:mt-6">
      {isOwner && listing.status === 'VERIFICATION' && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400"
        >
          Ton annonce est en cours de vérification, elle n&apos;est visible que par toi pour l&apos;instant.
        </div>
      )}
      {isOwner && listing.status === 'REJECTED' && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Ton annonce a été rejetée{listing.rejectionReason ? ` : ${listing.rejectionReason}` : ''}. Modifie les
          photos et enregistre pour relancer la vérification.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[6fr_2fr]">
        <div className="flex flex-col gap-6">
          <ListingGallery images={listing.images} title={listing.title} />

          <ListingInfoCard
            title={listing.title}
            price={listing.price}
            priceUnit={listing.priceUnit}
            createdAt={listing.createdAt}
            city={`${listing.location.city} (${listing.location.postalCode})`}
            lat={listing.location.lat}
            lng={listing.location.lng}
          />

          {listing.description && (
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">Détails :</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-foreground">{listing.description}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Localisation : {listing.location.city}</h2>
            <div className="overflow-hidden rounded-lg">
              <LeafletMap lat={listing.location.lat} lng={listing.location.lng} radiusKm={2} />
            </div>
          </section>

          <p className="text-sm text-muted-foreground">
            {listing.category.name}
            {listing.subCategory ? ` › ${listing.subCategory.name}` : ''}
            {listing.product ? ` › ${listing.product.name}` : ''}
          </p>

          {/* Seller card also renders here on mobile, below the details, since the sidebar column is desktop-only */}
          <div className="lg:hidden">
            <SellerCard owner={listing.owner} listingId={listing.id} isOwner={isOwner} isSignedIn={!!user} />
          </div>
        </div>

        <div className="hidden lg:block lg:h-fit lg:sticky lg:top-24">
          <SellerCard owner={listing.owner} listingId={listing.id} isOwner={isOwner} isSignedIn={!!user} />
        </div>
      </div>
    </main>
  );
}
