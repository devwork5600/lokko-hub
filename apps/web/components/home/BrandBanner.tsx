import Link from 'next/link';

export function BrandBanner({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <Link
      href={isSignedIn ? '/listings/create' : '/sign-in'}
      className="mx-auto my-12 flex h-80 w-full max-w-6xl flex-col items-center justify-center gap-2 rounded-xl bg-primary text-center text-primary-foreground transition-opacity hover:opacity-95"
    >
      <span className="font-poppins text-4xl font-black">Lokko Hub</span>
      <p className="text-lg">Vends tes produits locaux en quelques minutes.</p>
    </Link>
  );
}
