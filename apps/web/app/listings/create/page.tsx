import { getCategories } from '@/actions/category-actions';
import { getUser } from '@/lib/auth/auth-session';

import { ListingForm } from '../ListingForm';

export default async function CreateListingPage() {
  const user = await getUser();
  if (!user) {
    return (
      <main>
        <p>Connecte-toi pour publier une annonce.</p>
      </main>
    );
  }

  const categories = await getCategories();

  return (
    <main>
      <h1>Publier une annonce</h1>
      <ListingForm categories={categories} />
    </main>
  );
}
