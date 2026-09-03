import { NextRequest, NextResponse } from 'next/server';

type CommuneResult = {
  nom: string;
  codesPostaux: string[];
  centre: { coordinates: [number, number] };
};

export type CitySuggestion = {
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
};

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = new URL('https://geo.api.gouv.fr/communes');
  url.searchParams.set('nom', query);
  url.searchParams.set('fields', 'nom,codesPostaux,centre');
  url.searchParams.set('boost', 'population');
  url.searchParams.set('limit', '10');

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const communes = (await res.json()) as CommuneResult[];

    // A commune can span multiple postal codes (e.g. Lyon's 9 arrondissements) —
    // surface one suggestion per (city, postal code) pair.
    const suggestions: CitySuggestion[] = communes.flatMap((commune) =>
      commune.codesPostaux.map((postalCode) => ({
        city: commune.nom,
        postalCode,
        lng: commune.centre.coordinates[0],
        lat: commune.centre.coordinates[1],
      })),
    );

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('City lookup failed:', err);
    return NextResponse.json({ suggestions: [] });
  }
}
