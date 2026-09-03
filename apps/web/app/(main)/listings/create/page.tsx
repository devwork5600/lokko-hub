import { getCategories } from '@/actions/category-actions';
import { getUser } from '@/lib/auth/auth-session';

import { ListingWizardForm } from './wizard/ListingWizardForm';

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

  return <ListingWizardForm categories={categories} />;
}
