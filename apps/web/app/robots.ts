import type { MetadataRoute } from 'next';

const SITE_URL = 'https://lokkohub.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/api/', '/sign-in'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
