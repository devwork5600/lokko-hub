import { getResend } from './resend';

export async function sendListingMatchEmail({
  to,
  listingTitle,
  listingUrl,
}: {
  to: string;
  listingTitle: string;
  listingUrl: string;
}) {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM environment variable is not set');
  }

  await getResend().emails.send({
    from: process.env.EMAIL_FROM,
    to: [to.toLowerCase().trim()],
    subject: `Nouvelle annonce : ${listingTitle}`,
    html: `<p>Une nouvelle annonce correspond à une de tes recherches sauvegardées :</p><p><a href="${listingUrl}">${listingTitle}</a></p>`,
  });
}
