'use client';

import { CopyIcon, Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  EmailIcon,
  EmailShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  ThreadsIcon,
  ThreadsShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterIcon,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Pocket isn't listed: the service shut down in 2025, the button no longer works.
const socials = [
  { Component: WhatsappShareButton, Icon: WhatsappIcon, name: 'WhatsApp' },
  { Component: TwitterShareButton, Icon: TwitterIcon, name: 'Twitter' },
  { Component: LinkedinShareButton, Icon: LinkedinIcon, name: 'LinkedIn' },
  { Component: TelegramShareButton, Icon: TelegramIcon, name: 'Telegram' },
  { Component: RedditShareButton, Icon: RedditIcon, name: 'Reddit' },
  { Component: EmailShareButton, Icon: EmailIcon, name: 'E-mail' },
  { Component: ThreadsShareButton, Icon: ThreadsIcon, name: 'Threads' },
  { Component: TumblrShareButton, Icon: TumblrIcon, name: 'Tumblr' },
  { Component: ViberShareButton, Icon: ViberIcon, name: 'Viber' },
];

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    } catch {
      toast.error('Impossible de copier le lien.');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Partager cette annonce"
        title="Partager"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-colors hover:bg-white"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogTitle>Partager cette annonce</DialogTitle>

          <Carousel opts={{ align: 'start', dragFree: true }} className="mt-4 w-full">
            <CarouselContent>
              {socials.map(({ Component, Icon, name }) => (
                <CarouselItem key={name} className="basis-auto pl-3">
                  <Component url={url} title={title} className="flex flex-col items-center gap-1">
                    <Icon size={44} round />
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </Component>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-4 flex items-center justify-between gap-2 overflow-hidden rounded-md bg-muted px-3 py-2">
            <span className="flex-1 truncate text-sm">{url}</span>
            <Button variant="secondary" size="icon" onClick={handleCopy}>
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
