import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Conditions d&apos;utilisation</h1>
      <p className="mb-8 text-sm text-muted-foreground">Dernière mise à jour : {new Date().getFullYear()}</p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Objet</h2>
          <p className="leading-relaxed text-muted-foreground">
            Lokko Hub est une plateforme de petites annonces qui met en relation des particuliers et
            des producteurs locaux souhaitant vendre ou acheter des produits (alimentaires, artisanaux,
            etc.) près de chez eux. Lokko Hub n&apos;est pas partie aux transactions conclues entre
            utilisateurs : nous fournissons l&apos;espace de mise en relation, pas la vente elle-même.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Création de compte</h2>
          <p className="leading-relaxed text-muted-foreground">
            L&apos;accès à certaines fonctionnalités (publier une annonce, envoyer un message, sauvegarder
            une recherche) nécessite un compte, créé par e-mail ou via un compte Google ou GitHub. Tu es
            responsable de la confidentialité de tes identifiants et de l&apos;exactitude des informations
            fournies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Contenu des annonces</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tu es seul responsable du contenu que tu publies (titre, description, prix, photos). Les
            annonces sont soumises à une vérification automatique avant publication et peuvent être
            rejetées ou archivées si elles ne respectent pas ces conditions, notamment si elles
            contiennent du contenu illégal, trompeur, ou inapproprié.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Comportement entre utilisateurs</h2>
          <p className="leading-relaxed text-muted-foreground">
            La messagerie intégrée sert à échanger sur les annonces publiées. Tout usage abusif,
            harcelant ou frauduleux peut entraîner la suspension du compte concerné.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Propriété intellectuelle</h2>
          <p className="leading-relaxed text-muted-foreground">
            Le nom, le logo et l&apos;interface de Lokko Hub sont la propriété de Lokko Hub. Le contenu
            que tu publies (photos, descriptions) reste ta propriété ; tu nous accordes le droit de
            l&apos;afficher sur la plateforme dans le cadre du fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Suppression de compte</h2>
          <p className="leading-relaxed text-muted-foreground">
            Tu peux demander la suppression de ton compte et de tes données à tout moment. Nous nous
            réservons le droit de suspendre ou supprimer un compte en cas de non-respect de ces
            conditions.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Responsabilité</h2>
          <p className="leading-relaxed text-muted-foreground">
            Lokko Hub met à disposition un outil de mise en relation et ne garantit pas la qualité, la
            sécurité ou la légalité des produits annoncés, ni la véracité des annonces. Les transactions
            se font sous la seule responsabilité des utilisateurs concernés.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">8. Modification des conditions</h2>
          <p className="leading-relaxed text-muted-foreground">
            Ces conditions peuvent être mises à jour. La poursuite de l&apos;utilisation du site après
            une modification vaut acceptation des nouvelles conditions.
          </p>
        </section>
      </div>
    </main>
  );
}
