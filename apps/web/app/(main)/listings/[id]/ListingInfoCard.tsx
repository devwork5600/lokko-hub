import Link from 'next/link';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const UNIT_LABEL: Record<'UNIT' | 'KG' | 'L', string | null> = {
  UNIT: null,
  KG: 'kg',
  L: 'litre',
};

export function ListingInfoCard({
  title,
  price,
  priceUnit,
  createdAt,
  city,
  lat,
  lng,
}: {
  title: string;
  price: number;
  priceUnit: 'UNIT' | 'KG' | 'L';
  createdAt: Date;
  city: string;
  lat: number;
  lng: number;
}) {
  const unitLabel = UNIT_LABEL[priceUnit];

  return (
    <div className="relative z-10 mx-auto -mt-10 flex w-[95%] flex-col gap-3 rounded-xl border-2 border-border bg-card p-4 shadow-xl lg:w-[97%]">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-baseline gap-1 text-xl font-medium text-foreground">
        <span>{price} €</span>
        {unitLabel && <span className="text-base text-muted-foreground">/ {unitLabel}</span>}
      </div>

      <p className="text-sm text-muted-foreground">{dateFormatter.format(createdAt)}</p>

      <div>
        <Link
          href={`/listings?geoLat=${lat}&geoLng=${lng}&geoRadiusKm=5`}
          className="inline-block rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          {city}
        </Link>
      </div>
    </div>
  );
}
