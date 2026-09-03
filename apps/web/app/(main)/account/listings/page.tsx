import Link from 'next/link';

import {
  archiveListing,
  deleteListing,
  getUserListings,
  unarchiveListing,
} from '@/actions/listing-actions';
import { getUser } from '@/lib/auth/auth-session';

export default async function MyListingsPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour voir tes annonces.</p>
      </main>
    );
  }

  const listings = await getUserListings();

  return (
    <main>
      <h1>Mes annonces</h1>
      <Link href="/listings/create">Publier une annonce</Link>

      {listings.length === 0 ? (
        <p>Tu n&apos;as encore aucune annonce.</p>
      ) : (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link href={`/listings/${listing.id}`}>{listing.title}</Link>
              {' — '}
              {listing.price}€ — {listing.status}
              {' — '}
              <Link href={`/listings/${listing.id}/edit`}>Modifier</Link>
              {listing.status === 'ARCHIVED' ? (
                <form
                  action={async () => {
                    'use server';
                    await unarchiveListing(listing.id);
                  }}
                  style={{ display: 'inline' }}
                >
                  <button type="submit">Réactiver</button>
                </form>
              ) : (
                <form
                  action={async () => {
                    'use server';
                    await archiveListing(listing.id);
                  }}
                  style={{ display: 'inline' }}
                >
                  <button type="submit">Archiver</button>
                </form>
              )}
              <form
                action={async () => {
                  'use server';
                  await deleteListing(listing.id);
                }}
                style={{ display: 'inline' }}
              >
                <button type="submit">Supprimer</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
