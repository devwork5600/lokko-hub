import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Link href="/" className="font-poppins text-2xl font-black text-primary">
        Lokko Hub
      </Link>

      <p className="font-poppins text-7xl font-black text-primary/20 sm:text-8xl">404</p>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Cette page n&apos;existe pas</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          L&apos;annonce ou la page que tu cherches a peut-être été supprimée, ou l&apos;adresse est
          incorrecte.
        </p>
      </div>

      <Link
        href="/"
        className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Home className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
