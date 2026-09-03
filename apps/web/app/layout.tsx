import type { Metadata } from 'next';
import { Geist, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/components/QueryProvider';
import { SocketProvider } from '@/components/SocketProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const poppins = Poppins({ subsets: ['latin'], weight: ['900'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Lokko Hub',
  description: 'Local marketplace listings.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${poppins.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SocketProvider>{children}</SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
