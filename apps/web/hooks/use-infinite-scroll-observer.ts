import { useEffect, useRef, type RefObject } from 'react';

export function useInfiniteScrollObserver({
  targetRef,
  enabled,
  onIntersect,
  rootMargin = '300px',
}: {
  targetRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onIntersect: () => void;
  rootMargin?: string;
}) {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) {
          hasTriggeredRef.current = false;
          return;
        }
        if (hasTriggeredRef.current) return;
        hasTriggeredRef.current = true;
        onIntersect();
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      hasTriggeredRef.current = false;
    };
  }, [enabled, onIntersect, rootMargin, targetRef]);
}
