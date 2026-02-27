import { test, expect } from '../fixtures/base.fixture';

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('affiche le titre "Slip It"', async ({ page }) => {
    await expect(page.locator('.home-hero__title')).toContainText('Slip It');
  });

  test('affiche le sous-titre descriptif', async ({ page }) => {
    await expect(page.locator('.home-hero__subtitle')).toBeVisible();
  });

  test('affiche le bouton "Nouvelle partie"', async ({ homePage }) => {
    await expect(homePage.btnNewGame).toBeVisible();
  });

  test('le bouton "Reprendre la partie" est absent sans partie active', async ({ homePage }) => {
    // No active game stored → the resume button must not be rendered
    await expect(homePage.btnResumeGame).not.toBeVisible();
  });

  test('navigue vers /game-setup en cliquant "Nouvelle partie"', async ({ page, homePage }) => {
    await homePage.clickNewGame();
    await expect(page).toHaveURL(/game-setup/);
  });
});
