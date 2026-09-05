import { notFound } from 'next/navigation';

import { getCategories } from '@/actions/category-actions';
import { getListingById } from '@/actions/listing-actions';
import { getUser } from '@/lib/auth/auth-session';

import { EditListingForm } from './EditListingForm';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListingById(id), getUser()]);

  if (!listing) notFound();

  if (!user || user.id !== listing.ownerId) {
    return <p className="text-sm text-muted-foreground">Tu n&apos;as pas accès à cette annonce.</p>;
  }

  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-foreground">Modifier l&apos;annonce</h1>
      <EditListingForm
        listingId={listing.id}
        categories={categories}
        initialStatus={listing.status}
        rejectionReason={listing.status === 'REJECTED' ? listing.rejectionReason : null}
        defaultValues={{
          title: listing.title,
          description: listing.description,
          categoryId: listing.category.id,
          subCategoryId: listing.subCategory?.id ?? '',
          productId: listing.product?.id ?? '',
          location: {
            city: listing.location.city,
            postalCode: listing.location.postalCode,
            lat: listing.location.lat,
            lng: listing.location.lng,
          },
          price: { value: listing.price, unit: listing.priceUnit },
          images: listing.images.map((img, index) => ({ url: img.url, index })),
        }}
      />
    </div>
  );
}
