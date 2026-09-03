'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signOut } from '@/lib/auth/auth-client';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Déconnexion'}
    </button>
  );
}
