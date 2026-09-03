import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';

import { sendMagicLinkEmail } from '@/lib/email';

import { prisma } from '@lokko-hub/db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Security: rate limiting is enabled in production to prevent brute-force attacks
  rateLimit: {
    enabled: process.env.NODE_ENV !== 'development',
    window: 60,
    max: 100,
  },

  advanced: {
    // Trust headers from common proxies (Vercel/Cloudflare) for accurate IP tracking
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'],
    },
  },

  plugins: [
    nextCookies(),

    // Magic Link Plugin: passwordless sign-in via email
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
});
