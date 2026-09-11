function baseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_URL || 'https://lokkohub.com';

  return rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
}

export function logoUrl(): string {
  return `${baseUrl()}/logo-email.png`;
}
