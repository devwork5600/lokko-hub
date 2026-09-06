import type { NextConfig } from 'next';

// No `output: 'standalone'` here: this app deploys to Vercel, which has its own
// serverless build/output pipeline and doesn't need (and conflicts with) standalone mode.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    // 75 is the default quality used everywhere; 50 is only for the low-priority
    // hover/touch preload requests (lib/preload-listing-images.ts) — Next.js 16
    // rejects any `q` value not explicitly allow-listed here.
    qualities: [50, 75],
  },
};

export default nextConfig;
