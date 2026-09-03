import type { NextConfig } from 'next';

// No `output: 'standalone'` here: this app deploys to Vercel, which has its own
// serverless build/output pipeline and doesn't need (and conflicts with) standalone mode.
const nextConfig: NextConfig = {};

export default nextConfig;
