'use client';

import { ClipboardListIcon, LogOutIcon, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth/auth-client';

export function UserMenu() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Compte"
          title="Compte"
          className="flex cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary"
        >
          <UserRound className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <Link href="/account/listings">
          <DropdownMenuItem>
            <ClipboardListIcon className="h-4 w-4" />
            Mes annonces
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem onSelect={handleSignOut} disabled={signingOut}>
          <LogOutIcon className="h-4 w-4" />
          {signingOut ? 'Déconnexion...' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
