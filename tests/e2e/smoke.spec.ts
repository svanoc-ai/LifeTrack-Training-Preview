import { test, expect } from '@playwright/test';

// Each Playwright test starts in a new browser context with a fresh IndexedDB.
// No request is made to the user's deployed GitHub Pages application.
test('navigation principale et chargement local', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Séance', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Séance', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Exécution', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Séances types' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Historique' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Historique', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Historique', exact: true, level: 1 })).toBeVisible();
});

test('création et persistance d’une séance type isolée', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Prog', exact: true }).click();
  const templates = page.locator('.panel').filter({ has: page.getByRole('heading', { name: 'Séances types', exact: true }) });
  await templates.getByRole('button', { name: '+ Créer', exact: true }).click();
  await templates.getByLabel('Nom', { exact: true }).fill('TEST AUTO - séance isolée');
  await templates.getByRole('button', { name: 'Enregistrer la séance' }).click();
  await expect(templates.getByText('TEST AUTO - séance isolée')).toBeVisible();
  await page.reload();
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Prog', exact: true }).click();
  await expect(page.getByText('TEST AUTO - séance isolée')).toBeVisible();
});

test('un modèle vide de nom est refusé', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('button', { name: 'Prog', exact: true }).click();
  const templates = page.locator('.panel').filter({ has: page.getByRole('heading', { name: 'Séances types', exact: true }) });
  await templates.getByRole('button', { name: '+ Créer', exact: true }).click();
  await templates.getByRole('button', { name: 'Enregistrer la séance' }).click();
  await expect(templates.getByRole('alert')).toContainText('Le nom de la séance est obligatoire');
});
