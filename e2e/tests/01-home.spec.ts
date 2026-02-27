import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

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

// --------------------------------------------------------------------------
// Happy paths — reprise de partie
// --------------------------------------------------------------------------
test.describe('Page d\'accueil — reprise de partie', () => {
  test('le bouton "Reprendre la partie" apparaît après avoir démarré une partie', async ({ page, homePage }) => {
    // Create an active game by going all the way to /gameplay
    await runToGameplay(page, DEFAULT_PLAYERS);
    // Navigate back to home without ending the game
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await expect(homePage.btnResumeGame).toBeVisible({ timeout: 5_000 });
  });

  test('"Reprendre la partie" navigue vers /gameplay', async ({ page, homePage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await homePage.clickResumeGame();
    await expect(page).toHaveURL(/gameplay/, { timeout: 10_000 });
  });
});

// --------------------------------------------------------------------------
// Sad paths — page d'accueil
// --------------------------------------------------------------------------
test.describe('Page d\'accueil — sad paths', () => {
  test('le bouton "Reprendre la partie" est absent sans partie active', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.btnResumeGame).not.toBeVisible();
  });
});
