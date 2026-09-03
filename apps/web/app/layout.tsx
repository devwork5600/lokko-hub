import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SocketProvider } from '@/components/SocketProvider';

export const metadata: Metadata = {
  title: 'Lokko Hub',
  description: 'Local marketplace listings.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
