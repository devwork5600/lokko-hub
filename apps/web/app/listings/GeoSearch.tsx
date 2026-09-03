'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { CitySuggestion } from '@/app/api/city/route';
import { CityAutocomplete } from '@/components/CityAutocomplete';

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

    if (next.clear) {
      params.delete('geoLat');
      params.delete('geoLng');
      params.delete('geoRadiusKm');
    } else {
      if (next.lat != null) params.set('geoLat', String(next.lat));
      if (next.lng != null) params.set('geoLng', String(next.lng));
      params.set('geoRadiusKm', String(next.radiusKm ?? radius));
    }

    router.replace(`${pathname}?${params.toString()}`);
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
    <div>
      <CityAutocomplete value="" onSelect={handleCitySelect} placeholder="Chercher autour de..." />
      <button type="button" onClick={handleLocateMe} disabled={locating}>
        {locating ? 'Localisation...' : 'Me localiser'}
      </button>

      {hasCenter && (
        <>
          <label htmlFor="radius">Rayon : {radius} km</label>
          <input
            id="radius"
            type="range"
            min={0}
            max={100}
            step={5}
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
          />
          <button type="button" onClick={() => updateParams({ clear: true })}>
            Retirer le filtre géo
          </button>
        </>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
