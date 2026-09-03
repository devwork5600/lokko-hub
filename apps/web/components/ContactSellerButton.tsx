'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { getOrCreateConversation } from '@/actions/messages-actions';
import { Button } from '@/components/ui/button';

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
      <Button type="button" onClick={handleClick} disabled={loading} className="h-10 w-full">
        {loading ? 'Ouverture...' : 'Contacter le vendeur'}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
