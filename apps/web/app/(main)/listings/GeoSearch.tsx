'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { CitySuggestion } from '@/app/api/city/route';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { LeafletMap } from '@/components/LeafletMapClient';
import { Button } from '@/components/ui/button';

const DEFAULT_RADIUS_KM = 20;

export function GeoSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLat = searchParams.get('geoLat');
  const currentLng = searchParams.get('geoLng');
  const currentRadius = searchParams.get('geoRadiusKm');
  const hasCenter = currentLat != null && currentLng != null;

  const [radius, setRadius] = useState(currentRadius ? Number(currentRadius) : DEFAULT_RADIUS_KM);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateParams(next: { lat?: number; lng?: number; radiusKm?: number; clear?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (next.clear) {
      params.delete('geoLat');
      params.delete('geoLng');
      params.delete('geoRadiusKm');
    } else {
      if (next.lat != null) params.set('geoLat', String(next.lat));
      if (next.lng != null) params.set('geoLng', String(next.lng));
      params.set('geoRadiusKm', String(next.radiusKm ?? radius));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleCitySelect(suggestion: CitySuggestion) {
    setError(null);
    updateParams({ lat: suggestion.lat, lng: suggestion.lng, radiusKm: radius });
  }

  function handleLocateMe() {
    setError(null);
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        updateParams({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radiusKm: radius,
        });
      },
      () => {
        setLocating(false);
        setError('Impossible de récupérer ta position.');
      },
    );
  }

  function handleRadiusChange(next: number) {
    setRadius(next);
    if (hasCenter) updateParams({ radiusKm: next });
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Où ?</label>
      <CityAutocomplete value="" onSelect={handleCitySelect} placeholder="Chercher autour de..." />
      <Button type="button" variant="outline" onClick={handleLocateMe} disabled={locating} className="w-full">
        {locating ? 'Localisation...' : 'Me localiser'}
      </Button>

      {hasCenter && (
        <Button type="button" variant="ghost" onClick={() => updateParams({ clear: true })} className="w-full">
          Changer de zone
        </Button>
      )}

      {hasCenter && (
        <div className="space-y-2 pt-1">
          <label htmlFor="radius" className="text-sm text-muted-foreground">
            Rayon : {radius} km
          </label>
          <input
            id="radius"
            type="range"
            min={0}
            max={100}
            step={5}
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      )}

      {hasCenter && (
        <div className="h-64 w-full overflow-hidden rounded-lg">
          <LeafletMap lat={Number(currentLat)} lng={Number(currentLng)} radiusKm={radius} />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
