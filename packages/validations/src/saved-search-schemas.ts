import { z } from 'zod';

export const savedSearchSchema = z.object({
  title: z.string().min(1, 'Titre obligatoire').max(100, 'Titre trop long'),
  query: z.string().trim().max(200).optional(),
  category: z.string().optional(),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
  geoRadiusKm: z.number().positive().optional(),
});

export type SavedSearchInput = z.infer<typeof savedSearchSchema>;
