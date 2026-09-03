import type { ReadonlyURLSearchParams } from 'next/navigation';

export type ParsedListingSearchParams = {
  query?: string;
  category?: string;
  subCategory?: string;
  product?: string;
  priceMin?: number;
  priceMax?: number;
  geoLat?: number;
  geoLng?: number;
  geoRadiusKm?: number;
};

export function parseSearchParams(searchParams: ReadonlyURLSearchParams): ParsedListingSearchParams {
  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const subCategory = searchParams.get('subCategory') || undefined;
  const product = searchParams.get('product') || undefined;

  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const geoLat = searchParams.get('geoLat');
  const geoLng = searchParams.get('geoLng');
  const geoRadiusKm = searchParams.get('geoRadiusKm');

  return {
    query,
    category,
    subCategory,
    product,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    geoLat: geoLat ? Number(geoLat) : undefined,
    geoLng: geoLng ? Number(geoLng) : undefined,
    geoRadiusKm: geoRadiusKm ? Number(geoRadiusKm) : undefined,
  };
}
