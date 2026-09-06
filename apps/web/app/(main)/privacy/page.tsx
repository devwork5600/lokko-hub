import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confidentialité',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Politique de confidentialité</h1>
      <p className="mb-8 text-sm text-muted-foreground">Dernière mise à jour : {new Date().getFullYear()}</p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Données que nous collectons</h2>
          <ul className="list-disc space-y-1 pl-5 leading-relaxed text-muted-foreground">
            <li>Informations de compte : nom, e-mail, photo de profil (fournis par toi ou par Google/GitHub lors de la connexion).</li>
            <li>Contenu que tu publies : annonces, photos, messages, recherches sauvegardées, favoris.</li>
            <li>Localisation des annonces (ville, code postal) pour la recherche géographique.</li>
            <li>Données techniques : adresse IP et informations de session, à des fins de sécurité.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Pourquoi nous les utilisons</h2>
          <p className="leading-relaxed text-muted-foreground">
            Ces données servent à faire fonctionner le service : afficher et modérer tes annonces, te
            mettre en relation avec d&apos;autres utilisateurs, t&apos;envoyer des notifications
            (nouveau message, statut d&apos;une annonce, alerte de recherche) et sécuriser ton compte.
            Nous ne vendons pas tes données et ne les utilisons pas à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Partage avec des tiers</h2>
          <p className="leading-relaxed text-muted-foreground">
            Certaines données transitent par des prestataires nécessaires au fonctionnement du site :
            hébergement (Vercel, Railway), base de données (Neon), stockage des photos (Cloudinary), et
            fournisseurs de connexion (Google, GitHub) si tu choisis de les utiliser. Ces prestataires
            n&apos;utilisent tes données que pour le compte de Lokko Hub.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Durée de conservation</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tes données sont conservées tant que ton compte est actif. En cas de suppression de compte,
            tes données personnelles et annonces sont supprimées, à l&apos;exception des informations
            que nous devons conserver pour des raisons légales.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Tes droits</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tu peux à tout moment accéder à tes données, les corriger, les faire supprimer, ou demander
            leur portabilité, directement depuis ton compte ou en nous contactant.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Sécurité</h2>
          <p className="leading-relaxed text-muted-foreground">
            Les mots de passe sont chiffrés et ne sont jamais stockés en clair. Les images que tu
            publies passent par une vérification automatique avant d&apos;être visibles publiquement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            Pour toute question sur tes données personnelles, contacte-nous via la messagerie du site ou
            à l&apos;adresse indiquée dans ton espace compte.
          </p>
        </section>
      </div>
    </main>
  );
}
