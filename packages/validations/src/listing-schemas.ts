import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().min(5, 'Titre trop court'),
  description: z.string().min(10, 'Description trop courte'),

  categoryId: z.string().uuid('Catégorie obligatoire'),
  subCategoryId: z.string().uuid('Sous-catégorie invalide').optional().or(z.literal('')),
  productId: z.string().uuid('Produit invalide').optional().or(z.literal('')),

  location: z.object({
    city: z.string().min(1, 'Ville obligatoire'),
    postalCode: z.string().min(1, 'Code postal obligatoire'),
    lat: z.number(),
    lng: z.number(),
  }),

  price: z.object({
    value: z.number().positive('Prix invalide'),
    unit: z.enum(['UNIT', 'KG', 'L']),
  }),

  images: z
    .array(
      z.object({
        url: z.string().url(),
        index: z.number(),
      }),
    )
    .min(1, 'Ajoutez au moins une image')
    .max(3, 'Maximum 3 images'),
});

export type ListingDraft = z.infer<typeof listingSchema>;
