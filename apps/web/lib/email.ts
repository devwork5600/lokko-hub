import { getResend } from '@/lib/resend';

export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM environment variable is not set');
  }

  await getResend().emails.send({
    from: process.env.EMAIL_FROM,
    to: [to.toLowerCase().trim()],
    subject: 'Your Magic Sign-In Link',
    html: `<p>Click the link below to sign in to Lokko Hub.</p><p><a href="${url}">Sign in</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}
