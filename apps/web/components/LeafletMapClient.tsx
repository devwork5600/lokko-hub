'use client';

import dynamic from 'next/dynamic';

// `next/dynamic` with `ssr: false` can only be called from a Client Component —
// this thin wrapper exists so server component pages can still lazy-load the map
// (Leaflet needs `window`, which doesn't exist during server rendering).
export const LeafletMap = dynamic(() => import('./LeafletMap').then((m) => m.LeafletMap), {
  ssr: false,
});
