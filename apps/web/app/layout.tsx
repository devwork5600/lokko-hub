import type { Metadata, Viewport } from 'next';
import { Geist, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/components/QueryProvider';
import { SocketProvider } from '@/components/SocketProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const poppins = Poppins({ subsets: ['latin'], weight: ['900'], variable: '--font-poppins' });

const SITE_URL = 'https://lokkohub.com';
const SITE_DESCRIPTION = 'Vends et trouve des produits locaux près de chez toi : fruits, légumes, artisanat et plus.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Lokko Hub',
    template: '%s · Lokko Hub',
  },

  description: SITE_DESCRIPTION,

  applicationName: 'Lokko Hub',

  keywords: ['produits locaux', 'circuit court', 'petites annonces', 'artisanat', 'Lokko Hub'],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Lokko Hub',
    title: 'Lokko Hub',
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Lokko Hub',
    description: SITE_DESCRIPTION,
  },

  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },

  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#d97757',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className="scrollbar-none">
      <body
        className={`${geist.variable} ${poppins.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SocketProvider>{children}</SocketProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
