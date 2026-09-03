'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { Circle, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Leaflet's default marker icon references relative image paths that don't
// resolve once bundled. Importing the PNGs from node_modules directly is
// bundler-dependent and broke under Turbopack — pointing at the same files
// via CDN sidesteps that entirely (this whole file only ever runs
// client-side, loaded via next/dynamic with ssr:false).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Display-only: shows the chosen search center + radius, doesn't let the user
// click/drag to set it (matches lokko-v4's map — a visual confirmation, not a picker).
function FitBoundsCircle({ lat, lng, radiusMeters }: { lat: number; lng: number; radiusMeters: number }) {
  const map = useMap();

  useEffect(() => {
    const circle = circleBounds(lat, lng, radiusMeters);
    map.fitBounds(circle);
  }, [map, lat, lng, radiusMeters]);

  return null;
}

// Rough bounding box for a lat/lng/radius (good enough for fitBounds framing).
function circleBounds(lat: number, lng: number, radiusMeters: number): [[number, number], [number, number]] {
  const latDelta = radiusMeters / 111_000;
  const lngDelta = radiusMeters / (111_000 * Math.cos((lat * Math.PI) / 180));
  return [
    [lat - latDelta, lng - lngDelta],
    [lat + latDelta, lng + lngDelta],
  ];
}

export function LeafletMap({
  lat,
  lng,
  radiusKm,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
}) {
  const radiusMeters = radiusKm * 1000;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={10}
      style={{ height: 300, width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} />
      <Circle center={[lat, lng]} radius={radiusMeters} />
      <FitBoundsCircle lat={lat} lng={lng} radiusMeters={radiusMeters} />
    </MapContainer>
  );
}
