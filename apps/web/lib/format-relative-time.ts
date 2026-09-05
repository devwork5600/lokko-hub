const UNITS: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limit: 60, divisor: 1, unit: 'second' },
  { limit: 3600, divisor: 60, unit: 'minute' },
  { limit: 86400, divisor: 3600, unit: 'hour' },
  { limit: 2592000, divisor: 86400, unit: 'day' },
  { limit: 31536000, divisor: 2592000, unit: 'month' },
  { limit: Infinity, divisor: 31536000, unit: 'year' },
];

const formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

export function formatRelativeTime(date: Date): string {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);

  const { divisor, unit } = UNITS.find((u) => abs < u.limit) ?? UNITS[UNITS.length - 1];
  return formatter.format(Math.round(seconds / divisor), unit);
}
