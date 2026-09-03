import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex-1 pt-14 lg:pt-16">{children}</div>
      <Footer />
    </>
  );
}
