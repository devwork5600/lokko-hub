const preloadedImages = new Set<string>();

export function preloadImage(src: string) {
  if (!src || typeof window === 'undefined') return;
  if (preloadedImages.has(src)) return;

  const img = new Image();
  img.src = src;
  preloadedImages.add(src);
}
