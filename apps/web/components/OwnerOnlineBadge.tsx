'use client';

import { useUserStatus } from '@/hooks/use-user-status';

export function OwnerOnlineBadge({ ownerId }: { ownerId: string }) {
  const isOnline = useUserStatus(ownerId);
  return <span> {isOnline ? '(en ligne)' : '(hors ligne)'}</span>;
}
