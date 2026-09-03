'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getOrCreateConversation } from '@/actions/messages-actions';

export function ContactSellerButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result = await getOrCreateConversation(listingId);

    if (!result.success || !result.conversationId) {
      setError(result.error ?? 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    router.push(`/account/messages/${result.conversationId}`);
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Ouverture...' : 'Contacter le vendeur'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
