import { notFound } from 'next/navigation';

import { getCategories } from '@/actions/category-actions';
import { getListingById } from '@/actions/listing-actions';
import { getUser } from '@/lib/auth/auth-session';

import { ListingForm } from '../../ListingForm';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListingById(id), getUser()]);

  if (!listing) notFound();

  if (!user || user.id !== listing.ownerId) {
    return (
      <main>
        <p>Tu n&apos;as pas accès à cette annonce.</p>
      </main>
    );
  }

  const categories = await getCategories();

  return (
    <main>
      <h1>Modifier l&apos;annonce</h1>
      <ListingForm
        categories={categories}
        listingId={listing.id}
        initialValues={{
          title: listing.title,
          description: listing.description,
          categoryId: listing.category.id,
          subCategoryId: listing.subCategory?.id ?? '',
          productId: listing.product?.id ?? '',
          city: listing.location.city,
          postalCode: listing.location.postalCode,
          lat: listing.location.lat,
          lng: listing.location.lng,
          priceValue: String(listing.price),
          priceUnit: listing.priceUnit,
          images: listing.images.map((img, index) => ({ url: img.url, index })),
        }}
      />
    </main>
  );
}
