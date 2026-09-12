'use client';

import type { ReactNode } from 'react';

import { useServiceWorker } from '@/hooks/use-service-worker';

export function ServiceWorkerProvider({ children }: { children: ReactNode }) {
  useServiceWorker();
  return children;
}
