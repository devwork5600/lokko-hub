import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import * as React from 'react';

import { prisma } from '@lokko-hub/db';
import { sendEmail, MagicLinkTemplate } from '@lokko-hub/email';

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
        const result = await sendEmail({
          to: email,
          subject: 'Your Magic Sign-In Link',
          react: React.createElement(MagicLinkTemplate, { url }),
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to send magic link');
        }
      },
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
