import { test, expect } from '@playwright/test';

test('sending a magic link shows the confirmation screen', async ({ page }) => {
  await page.goto('/sign-in');

  await page.getByLabel('Adresse email').fill('devwork5600@gmail.com');
  await page.getByRole('button', { name: 'Recevoir le lien de connexion' }).click();

  await expect(page.getByText('Vérifie ta boîte mail !')).toBeVisible();
});
