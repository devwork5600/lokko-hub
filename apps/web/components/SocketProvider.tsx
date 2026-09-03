'use client';

import type { ReactNode } from 'react';

import { useSocket } from '@/hooks/use-socket';

export function SocketProvider({ children }: { children: ReactNode }) {
  useSocket();
  return children;
}
