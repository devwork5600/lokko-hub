import { Resend } from 'resend';

let resendClient: Resend | undefined;

// Lazily constructed: Resend's constructor validates the API key eagerly, which would
// otherwise crash `next build`'s route data collection (no real key is set at build time).
export function getResend() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
