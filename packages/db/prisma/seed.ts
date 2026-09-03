import 'dotenv/config';

import { prisma } from '../index';

// Taxonomy mirrors lokko-v4's live category tree (read-only lookup against its
// reference DB) so listings created here map onto realistic categories/products.
const TAXONOMY: Record<string, Record<string, string[]>> = {
  'Fruits & Légumes': {
    'Fruits frais': ['Banane', 'Orange', 'Poire', 'Pomme'],
    'Fruits transformés': ['Compote', 'Fruits secs', 'Fruits surgelés'],
    'Légumes frais': ['Carotte', 'Courgette', 'Salade', 'Tomate'],
    'Légumes transformés': ['Légumes prêts à cuire', 'Légumes surgelés', 'Purée de légumes'],
  },
  'Boulangerie & Céréales': {
    'Farines & céréales': ['Farine de blé', "Flocons d'avoine"],
    'Pain & viennoiseries': ['Baguette', 'Croissant', 'Pain complet'],
  },
  'Jardin & plants': {
    Fleurs: ['Rose', 'Tulipe'],
    'Plants & semis': ['Laitues à planter', 'Tomates à planter'],
    'Terre & compost': ['Compost', 'Terreau'],
  },
  'Produits animaux': {
    Poisson: ['Cabillaud', 'Maquereau', 'Saumon'],
    'Produits laitiers': ['Crème fraîche', 'Fromage frais', 'Lait', 'Yaourt'],
    Viande: ['Agneau', 'Bœuf', 'Porc'],
    Volaille: ['Dinde', 'Poulet'],
    Œufs: ['Œufs de poule'],
  },
  'Produits artisanaux': {
    Charcuterie: ['Jambon cru', 'Saucisson'],
    Fromages: ['Brie', 'Camembert', 'Comté'],
    'Plats préparés': ['Lasagnes', 'Quiches'],
  },
  Épicerie: {
    'Huiles & vinaigres': ["Huile d'olive", 'Vinaigre balsamique'],
    'Miel & confitures': ['Confiture fraise', "Miel d'acacia"],
    'Épices & condiments': ['Paprika', 'Poivre', 'Sel de mer'],
  },
  Boissons: {
    'Boissons sans alcool': ['Soda'],
    'Jus & sirops': ["Jus d'orange", 'Jus de pomme'],
    'Vins & bières': ['Bière blonde', 'Vin blanc', 'Vin rouge'],
  },
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Prisma's compound-unique `where` input rejects a literal `null` for a nullable
// field (a known limitation), so top-level categories (parentId: null) can't use
// `upsert` directly — findFirst-then-create instead, which works for both cases.
async function findOrCreateCategory(name: string, slug: string, parentId: string | null) {
  const existing = await prisma.category.findFirst({ where: { slug, parentId } });
  if (existing) return existing;
  return prisma.category.create({ data: { name, slug, parentId } });
}

async function main() {
  for (const [categoryName, subCategories] of Object.entries(TAXONOMY)) {
    const category = await findOrCreateCategory(categoryName, slugify(categoryName), null);
    console.log(`Category: ${category.name}`);

    for (const [subCategoryName, products] of Object.entries(subCategories)) {
      const subCategory = await findOrCreateCategory(
        subCategoryName,
        slugify(subCategoryName),
        category.id,
      );
      console.log(`  Subcategory: ${subCategory.name}`);

      for (const productName of products) {
        const slug = slugify(productName);
        const existingProduct = await prisma.product.findFirst({
          where: { slug, categoryId: subCategory.id },
        });
        if (!existingProduct) {
          await prisma.product.create({
            data: { name: productName, slug, categoryId: subCategory.id },
          });
        }
      }
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
