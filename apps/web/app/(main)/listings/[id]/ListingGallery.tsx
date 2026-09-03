'use client';

import { Check, ChevronLeft, ChevronRight, Images, Share2, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';

type ImageItem = { url: string; altText: string | null };

export function ListingGallery({ images, title }: { images: ImageItem[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground lg:h-[420px]">
        Aucune image
      </div>
    );
  }

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const desktopImages = images.slice(0, 3);
  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="relative">
      {/* Desktop: up to 3 images side by side */}
      <div className="relative hidden h-[420px] gap-2 overflow-hidden rounded-xl lg:flex">
        {desktopImages.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative h-full flex-1 cursor-pointer overflow-hidden"
          >
            <Image
              src={image.url}
              alt={image.altText ?? title}
              fill
              sizes="33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="absolute right-4 bottom-4 z-10 hidden items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/80 lg:flex"
        >
          <Images className="h-4 w-4" />
          Voir les {images.length} photos
        </button>
      )}

      {/* Mobile: single image, tap to open the lightbox */}
      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="relative block h-64 w-full overflow-hidden rounded-xl lg:hidden"
      >
        <Image src={images[0].url} alt={images[0].altText ?? title} fill sizes="100vw" className="object-cover" />
        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white">
            <Images className="h-3.5 w-3.5" />
            1/{images.length}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={handleShare}
        aria-label="Copier le lien de l'annonce"
        title="Copier le lien"
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-colors hover:bg-white"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      </button>

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && setLightboxIndex(null)}>
        <DialogContent fullscreen showCloseButton={false} className="flex items-center justify-center">
          <DialogTitle className="sr-only">Photos de l&apos;annonce {title}</DialogTitle>
          <DialogClose className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30">
            <X className="h-6 w-6" />
          </DialogClose>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Image précédente"
                className="absolute left-4 z-10 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Image suivante"
                className="absolute right-4 z-10 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {activeImage && (
            <div className="relative h-full max-h-[85vh] w-full max-w-4xl p-4">
              <Image src={activeImage.url} alt={activeImage.altText ?? title} fill sizes="90vw" className="object-contain" />
            </div>
          )}

          {images.length > 1 && lightboxIndex !== null && (
            <span className="absolute bottom-6 rounded-full bg-white/20 px-3 py-1 text-sm text-white">
              {lightboxIndex + 1} / {images.length}
            </span>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
