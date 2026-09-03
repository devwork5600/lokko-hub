'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { signIn } from '@/lib/auth/auth-client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const loading = sending || socialLoading !== null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);

    const { error: signInError } = await signIn.magicLink({
      email,
      callbackURL: `${window.location.origin}/`,
    });

    setSending(false);
    if (signInError) {
      setError("Impossible d'envoyer le lien de connexion. Réessaie.");
      return;
    }
    setSent(true);
  }

  async function handleSocial(provider: 'google' | 'github') {
    setSocialLoading(provider);
    setError(null);
    try {
      await signIn.social({ provider, callbackURL: `${window.location.origin}/` });
    } catch {
      setSocialLoading(null);
      setError('Impossible de se connecter.');
    }
  }

  return (
    <main className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-foreground/10" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>

          <div className="mt-16">
            <span className="font-poppins text-2xl font-black">Lokko Hub</span>
            <h1 className="mt-8 max-w-md text-4xl font-bold text-balance">
              Les bons produits de tes voisins, près de chez toi.
            </h1>
            <p className="mt-4 max-w-sm text-primary-foreground/80">
              Rejoins la communauté locale : trouve ou vends des produits directement entre
              particuliers.
            </p>
          </div>
        </div>

        <div className="relative flex gap-4 text-sm text-primary-foreground/70">
          <Link href="/privacy" className="hover:text-primary-foreground">
            Confidentialité
          </Link>
          <Link href="/terms" className="hover:text-primary-foreground">
            Conditions
          </Link>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-16 lg:w-1/2">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
          <h2 className="text-2xl font-bold text-foreground">Bienvenue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connecte-toi ou crée un compte pour continuer.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-border bg-background p-4">
              <p className="font-medium text-foreground">Vérifie ta boîte mail !</p>
              <p className="mt-1 text-sm text-muted-foreground">
                On a envoyé un lien de connexion à <span className="font-medium">{email}</span>.
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
                    disabled={loading}
                    className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="mt-1 h-10 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? 'Envoi...' : 'Recevoir le lien de connexion'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                ou
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => handleSocial('google')}
                  disabled={loading}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <FcGoogle size={18} />
                  Continuer avec Google
                </button>
                <button
                  onClick={() => handleSocial('github')}
                  disabled={loading}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <FaGithub size={18} />
                  Continuer avec GitHub
                </button>
              </div>
            </>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
