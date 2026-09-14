'use client';

import { useLayoutEffect, useRef, useState } from 'react';

// Flex/grid items (and anything sized off an aspect-ratio) commonly end up
// with a fractional pixel width or height — a 3-column row dividing an
// arbitrary container width rarely lands on a whole number, and neither does
// height derived from an aspect-ratio applied to a fractional width. Scaling
// such an element on hover (transform/scale transitions) is where browsers
// visibly snap it to the nearest device pixel once the transition settles —
// a 2-5px jump at the end of the animation, in both Chrome and Firefox,
// because a live transition and the settled/static layout box round
// sub-pixel values slightly differently. Locking the element to its own
// last-measured, rounded integer size removes the sub-pixel remainder that
// causes the snap.
export function useIntegerSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
