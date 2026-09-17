import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Mentions légales</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Dernière mise à jour : {new Date().getFullYear()}
      </p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Éditeur du site</h2>
          <p className="leading-relaxed text-muted-foreground">
            Lokko Hub est édité à titre personnel et non professionnel par Adrien Delagneau. En tant
            qu&apos;éditeur non professionnel, conformément à l&apos;article 6-III-1 de la loi n°
            2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique,
            l&apos;adresse postale n&apos;est pas rendue publique.
          </p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Contact : devwork5600@gmail.com
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Directeur de la publication</h2>
          <p className="leading-relaxed text-muted-foreground">Adrien Delagneau.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Hébergement</h2>
          <p className="leading-relaxed text-muted-foreground">
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            (
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              vercel.com
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Propriété intellectuelle</h2>
          <p className="leading-relaxed text-muted-foreground">
            La structure, le design et le code de Lokko Hub sont la propriété de leur éditeur. Le
            contenu des annonces (titres, descriptions, photos) est publié sous la responsabilité de
            chaque utilisateur, conformément aux{' '}
            <a href="/terms" className="text-primary hover:underline">
              conditions d&apos;utilisation
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
