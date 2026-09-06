import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookies',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Politique de cookies</h1>
      <p className="mb-8 text-sm text-muted-foreground">Dernière mise à jour : {new Date().getFullYear()}</p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Cookies essentiels</h2>
          <p className="leading-relaxed text-muted-foreground">
            Lokko Hub utilise un cookie de session pour te garder connecté après ta connexion (e-mail,
            Google ou GitHub). Ce cookie est strictement nécessaire au fonctionnement du site : sans
            lui, tu ne peux pas rester connecté ni accéder à ton compte.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Stockage local</h2>
          <p className="leading-relaxed text-muted-foreground">
            En plus des cookies, ton navigateur conserve localement (via le stockage local, pas un
            cookie envoyé au serveur) tes préférences d&apos;affichage — thème clair ou sombre — et tes
            recherches récentes, pour te faciliter la navigation. Ces informations restent sur ton
            appareil.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Aucun cookie publicitaire</h2>
          <p className="leading-relaxed text-muted-foreground">
            Lokko Hub n&apos;utilise aucun cookie publicitaire ni de traceur tiers à des fins de
            marketing ou de revente de données.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Gérer les cookies</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tu peux supprimer ou bloquer les cookies à tout moment depuis les réglages de ton
            navigateur. Bloquer le cookie de session t&apos;empêchera de rester connecté à ton compte.
          </p>
        </section>
      </div>
    </main>
  );
}
