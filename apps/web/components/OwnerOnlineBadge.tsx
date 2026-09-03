'use client';

import { useUserStatus } from '@/hooks/use-user-status';

export function OwnerOnlineBadge({ ownerId }: { ownerId: string }) {
  const isOnline = useUserStatus(ownerId);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      {isOnline ? 'En ligne' : 'Hors ligne'}
    </span>
  );
}
