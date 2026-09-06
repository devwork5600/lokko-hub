'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FaGlobe, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { toast } from 'sonner';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.email('Adresse e-mail invalide.'),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export function Footer() {
  const { register, handleSubmit, reset, formState } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
  });

  function onNewsletterSubmit() {
    toast.success('Merci ! Tu es inscrit(e) à la newsletter.');
    reset();
  }

  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl border-t border-border px-4 py-10 text-muted-foreground">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <h2 className="font-poppins text-xl font-black text-primary">Lokko Hub</h2>
          <p className="mt-2 max-w-xs text-sm">Là où le local se rencontre</p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Navigation</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/listings" className="transition-colors hover:text-primary">
                Annonces
              </Link>
            </li>
            <li>
              <Link href="/account/listings" className="transition-colors hover:text-primary">
                Mes annonces
              </Link>
            </li>
            <li>
              <Link href="/account/messages" className="transition-colors hover:text-primary">
                Messages
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Suivre Lokko Hub</h3>
          <p className="mb-4 text-sm">Les nouveautés locales près de chez toi.</p>
          <form onSubmit={handleSubmit(onNewsletterSubmit)} noValidate className="flex flex-col gap-2">
            <input
              type="email"
              {...register('email')}
              placeholder="toi@exemple.com"
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            {formState.errors.email && (
              <p className="text-sm text-destructive">{formState.errors.email.message}</p>
            )}
            <button
              type="submit"
              className="h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Suis-nous</h3>
          <div className="flex gap-4">
            <Link href="#" aria-label="Twitter">
              <FaTwitter className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <FaYoutube className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <FaInstagram className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Site web">
              <FaGlobe className="h-5 w-5 transition-colors hover:text-primary" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center text-sm">
        <p>© {new Date().getFullYear()} Lokko Hub — Tous droits réservés.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="transition-colors hover:text-primary">
            Conditions
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-primary">
            Confidentialité
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-primary">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
