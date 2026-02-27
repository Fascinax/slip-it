import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameplayPage } from '../pages/gameplay.page';

// --------------------------------------------------------------------------
// Helper: navigate to the scoreboard from a fresh game
// --------------------------------------------------------------------------
async function goToScoreboard(page: import('@playwright/test').Page): Promise<void> {
  await runToGameplay(page, DEFAULT_PLAYERS);
  const gp = new GameplayPage(page);
  await gp.nextRound();
  await expect(page).toHaveURL(/scoreboard/, { timeout: 10_000 });
}

// --------------------------------------------------------------------------
// Happy paths
// --------------------------------------------------------------------------
test.describe('Classement inter-manche (/scoreboard) — happy paths', () => {
  test.beforeEach(async ({ page }) => {
    await goToScoreboard(page);
  });

  test('la page /scoreboard est chargée', async ({ page }) => {
    await expect(page).toHaveURL(/scoreboard/);
  });

  test('le titre contient "Classement"', async ({ page }) => {
    // Use component-scoped selector — Ionic keeps all previous pages in the DOM.
    await expect(page.locator('app-scoreboard ion-title').first()).toContainText('Classement');
  });

  test('affiche autant de lignes que de joueurs', async ({ page }) => {
    await expect(page.locator('.scoreboard-entry')).toHaveCount(DEFAULT_PLAYERS.length);
  });

  test('affiche le nom de chaque joueur', async ({ page }) => {
    for (const player of DEFAULT_PLAYERS) {
      await expect(
        page.locator('.scoreboard-entry__name').filter({ hasText: player.name }),
      ).toBeVisible();
    }
  });

  test('affiche un score pour chaque joueur', async ({ page }) => {
    const scores = page.locator('app-score-badge.scoreboard-entry__score');
    await expect(scores).toHaveCount(DEFAULT_PLAYERS.length);
  });

  test('le premier joueur porte la classe scoreboard-entry--first', async ({ page }) => {
    // At start of game all scores are 0 so rank 1 goes to the first entry
    const firstEntry = page.locator('.scoreboard-entry--first');
    await expect(firstEntry).toHaveCount(1);
  });

  test('le bouton "Distribuer les cartes" est visible', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-deal-next-round"]')).toBeVisible();
  });

  test('"Distribuer les cartes" navigue vers /card-deal', async ({ page }) => {
    await page.locator('[data-testid="btn-deal-next-round"]').dispatchEvent('click');
    await expect(page).toHaveURL(/card-deal/, { timeout: 10_000 });
  });

  test('le bouton retour (<) navigue vers /gameplay', async ({ page }) => {
    // Ionic keeps all pages in DOM — scope to the scoreboard component to avoid strict mode violation
    await page.locator('app-scoreboard ion-back-button').dispatchEvent('click');
    await expect(page).toHaveURL(/gameplay/, { timeout: 10_000 });
  });
});

// --------------------------------------------------------------------------
// Sad paths
// --------------------------------------------------------------------------
test.describe('Classement inter-manche (/scoreboard) — sad paths', () => {
  test('accès direct sans partie active — aucune entrée dans le classement', async ({ page }) => {
    await page.goto('/scoreboard');
    await page.waitForLoadState('networkidle');
    // Without an active game the ranking list is empty
    await expect(page.locator('.scoreboard-entry')).toHaveCount(0);
  });

  test('accès direct sans partie active — la page ne plante pas (pas d\'URL /error)', async ({ page }) => {
    await page.goto('/scoreboard');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });
});
