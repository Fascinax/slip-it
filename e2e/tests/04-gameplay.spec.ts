import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

test.describe('Phase de jeu (/gameplay)', () => {
  test.beforeEach(async ({ page }) => {
    // Full setup + distribution so we land on /gameplay
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('la page /gameplay est chargée', async ({ page }) => {
    await expect(page).toHaveURL(/gameplay/);
  });

  test('affiche la section "Classement rapide"', async ({ page }) => {
    await expect(page.getByText('Classement rapide')).toBeVisible();
  });

  test('affiche un bouton "Ma carte" pour chaque joueur', async ({ page }) => {
    for (const player of DEFAULT_PLAYERS) {
      const row = page.locator('ion-item').filter({ hasText: player.name });
      await expect(row.locator('[data-testid="btn-my-card"]')).toBeVisible();
    }
  });

  test('affiche un bouton "Piégé !" pour chaque joueur', async ({ page }) => {
    for (const player of DEFAULT_PLAYERS) {
      const row = page.locator('ion-item').filter({ hasText: player.name });
      await expect(row.locator('[data-testid="btn-declare-trap"]')).toBeVisible();
    }
  });

  test('affiche le bouton "Manche suivante"', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnNextRound).toBeVisible();
  });

  test('affiche le bouton "Terminer" dans l\'en-tête', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnEndGame).toBeVisible();
  });

  test('peut consulter sa carte (passer le téléphone)', async ({ page, gameplayPage }) => {
    const alice = DEFAULT_PLAYERS[0];
    // Click "Ma carte" for Alice
    await page
      .locator('ion-item')
      .filter({ hasText: alice.name })
      .locator('[data-testid="btn-my-card"]')
      .click();

    // Intermediate screen: prompt to pass the phone
    await expect(page.locator('[data-testid="btn-reveal-card"]')).toBeVisible({ timeout: 5_000 });

    // Click "Voir ma carte"
    await page.locator('[data-testid="btn-reveal-card"]').click();

    // The secret word card should be revealed
    await expect(page.locator('.card-word').last()).toBeVisible({ timeout: 5_000 });
  });

  test('"Manche suivante" navigue vers /scoreboard', async ({ gameplayPage, page }) => {
    await gameplayPage.nextRound();
    await expect(page).toHaveURL(/scoreboard/);
  });

  test('"Terminer" navigue vers /game-end', async ({ gameplayPage, page }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/);
  });
});
