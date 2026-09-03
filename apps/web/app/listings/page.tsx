import Link from 'next/link';

import { getListings } from '@/actions/listing-actions';

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const { listings } = await getListings({ category, query: q });

  return (
    <main>
      <h1>Annonces</h1>
      <Link href="/listings/create">Publier une annonce</Link>

      {listings.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link href={`/listings/${listing.id}`}>
                {listing.title} — {listing.price}€{listing.priceUnit !== 'UNIT' ? `/${listing.priceUnit.toLowerCase()}` : ''}
                {' '}({listing.location.city})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
