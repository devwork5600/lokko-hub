import { preloadImage } from './preload-image';

// Small preview size for speculative preloading — routes through Next's own
// image optimizer so we fetch a bounded, downsized image instead of the
// full-resolution original. Width must match a bucket allowed by
// next.config.ts's images.imageSizes (256 is a default bucket).
const PRELOAD_WIDTH = 256;
const PRELOAD_QUALITY = 50;

function toOptimizedPreviewUrl(url: string) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${PRELOAD_WIDTH}&q=${PRELOAD_QUALITY}`;
}

// Preloads the listing's next photos (not the first, already shown in the card)
// so they're warm in the browser cache by the time the user opens the listing.
export function preloadListingImages(imageUrls: string[]) {
  imageUrls.slice(1, 3).forEach((url) => preloadImage(toOptimizedPreviewUrl(url)));
}
