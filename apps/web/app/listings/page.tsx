import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { getListings } from '@/actions/listing-actions';
import { LeafletMap } from '@/components/LeafletMapClient';

import { GeoSearch } from './GeoSearch';

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    geoLat?: string;
    geoLng?: string;
    geoRadiusKm?: string;
  }>;
}) {
  const { category, q, geoLat, geoLng, geoRadiusKm } = await searchParams;

  const geo =
    geoLat && geoLng && geoRadiusKm
      ? { geoLat: Number(geoLat), geoLng: Number(geoLng), geoRadiusKm: Number(geoRadiusKm) }
      : {};

  const { listings } = await getListings({ category, query: q, ...geo });

  return (
    <main>
      <h1>Annonces</h1>
      <Link href="/listings/create">Publier une annonce</Link>

      <Suspense fallback={null}>
        <GeoSearch />
      </Suspense>

      {geo.geoLat != null && geo.geoLng != null && (
        <LeafletMap lat={geo.geoLat} lng={geo.geoLng} radiusKm={geo.geoRadiusKm!} />
      )}

      {listings.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link href={`/listings/${listing.id}`}>
                {listing.images[0] && (
                  <Image
                    src={listing.images[0].url}
                    alt={listing.images[0].altText ?? listing.title}
                    width={120}
                    height={120}
                  />
                )}
                {listing.title} — {listing.price}€
                {listing.priceUnit !== 'UNIT' ? `/${listing.priceUnit.toLowerCase()}` : ''} (
                {listing.location.city})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
