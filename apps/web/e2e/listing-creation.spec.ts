import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_USER_EMAIL;
const TEST_SECRET = process.env.E2E_TEST_SECRET;

const TEST_IMAGE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures/test-image.jpg',
);

test('creating a listing through the 6-step wizard', async ({ page, context }) => {
  test.skip(
    !TEST_EMAIL || !TEST_SECRET,
    'E2E_TEST_USER_EMAIL / E2E_TEST_SECRET not configured — see app/api/test/login/route.ts',
  );

  // Logs in as the dedicated E2E test account via the test-only backdoor (see
  // app/api/test/login/route.ts) instead of clicking a real magic-link email — there is no
  // other way to reach an authenticated state without a browser-driven click on a real email.
  const loginResponse = await context.request.post('/api/test/login', {
    headers: { 'x-e2e-secret': TEST_SECRET! },
  });
  expect(loginResponse.ok(), await loginResponse.text()).toBe(true);
  const { cookies } = await loginResponse.json();
  await context.addCookies(cookies);

  // Timestamped and prefixed so it's unmistakably a test artifact if cleanup ever fails to
  // run (e.g. the test crashes before reaching it) — never a name a real listing would use.
  const listingTitle = `[E2E TEST] Tomates ${Date.now()}`;

  await page.goto('/listings/create');

  // ── Step 1: Title — <input id="title"> has a properly linked <label htmlFor="title">.
  await page.getByLabel('Titre').fill(listingTitle);
  await page.getByRole('button', { name: 'Continuer' }).click();

  // ── Step 2: Category — the <select>'s <label> has no htmlFor/id pairing in the markup,
  // so getByLabel won't find it; targeted as the page's one combobox instead. Picks
  // whichever option seed data actually has (index 1, skipping the "Choisir..." placeholder)
  // rather than a hardcoded name, so this doesn't break if categories are renamed.
  await page.getByRole('combobox').first().selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Continuer' }).click();

  // ── Step 3: Images — real upload to the real Cloudinary account; there's no way around
  // that for a true E2E test of this step. The dropzone's <input type="file"> stays in the
  // DOM (just visually hidden), which setInputFiles doesn't need visibility for anyway.
  await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE);
  await expect(page.getByRole('button', { name: 'Continuer' })).toBeEnabled({ timeout: 15000 });
  await page.getByRole('button', { name: 'Continuer' }).click();

  // ── Step 4: Location — real call to geo.api.gouv.fr (the French government's own free,
  // public geocoding API — no key, no mocking). The input has a placeholder, not a linked
  // label, matching CityAutocomplete.tsx's default; suggestions render as buttons reading
  // "City (postalCode)".
  await page.getByPlaceholder('Ville...').fill('Rennes');
  await page
    .getByRole('button', { name: /^Rennes \(35/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // ── Step 5: Price — same unlinked-label situation as Category; an <input type="number">
  // has the accessible role "spinbutton".
  await page.getByRole('spinbutton').fill('3.5');
  await page.getByRole('button', { name: 'Continuer' }).click();

  // ── Step 6: Description + submit — properly linked label/textarea again.
  await page.getByLabel('Description').fill('Tomates fraîches, publiées par un test automatisé.');
  await page.getByRole('button', { name: 'Publier' }).click();

  // createListing redirects to the new listing's own page on success.
  await expect(page).toHaveURL(/\/listings\/[0-9a-f-]{36}$/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: listingTitle })).toBeVisible();

  // Cleanup: soft-deletes the listing (see app/api/test/cleanup-listing/route.ts) so a
  // successful run never leaves real-looking content behind — even though new listings
  // default to ListingStatus.VERIFICATION (pending review, not publicly visible yet)
  // regardless, this also covers any that got manually approved before the next run.
  const listingId = new URL(page.url()).pathname.split('/').pop()!;
  const cleanupResponse = await context.request.post('/api/test/cleanup-listing', {
    headers: { 'x-e2e-secret': TEST_SECRET! },
    data: { listingId },
  });
  expect(cleanupResponse.ok(), await cleanupResponse.text()).toBe(true);
});
