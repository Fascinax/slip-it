import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd } from '../helpers/game.helper';

test.describe('Historique des parties (/history)', () => {

  test('la page historique est accessible depuis l\'accueil', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.clickHistory();
    await expect(page).toHaveURL(/history/, { timeout: 10_000 });
  });

  test('l\'état vide affiche "Aucune partie enregistrée"', async ({ historyPage }) => {
    await historyPage.goto();
    await expect(historyPage.emptyStateText).toBeVisible({ timeout: 5_000 });
  });

  test('une partie terminée apparaît dans l\'historique', async ({ page, gameEndPage, homePage, historyPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickNewGame();
    await page.waitForURL(/home/, { timeout: 10_000 });
    await homePage.clickHistory();
    await page.waitForURL(/history/, { timeout: 10_000 });

    await expect(historyPage.emptyStateText).not.toBeVisible();
    await expect(historyPage.historyCards).toBeVisible({ timeout: 5_000 });
  });

  test('la carte d\'historique montre les noms des joueurs dans les chips', async ({ page, gameEndPage, homePage, historyPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickNewGame();
    await page.waitForURL(/home/, { timeout: 10_000 });
    await homePage.clickHistory();
    await page.waitForURL(/history/, { timeout: 10_000 });

    const card = historyPage.historyCards.first();
    const chipTexts = await card.locator('ion-chip').allInnerTexts();
    for (const p of DEFAULT_PLAYERS) {
      expect(chipTexts.some(t => t.includes(p.name))).toBeTruthy();
    }
  });

  test('supprimer une entrée retire la carte', async ({ page, gameEndPage, homePage, historyPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickNewGame();
    await page.waitForURL(/home/, { timeout: 10_000 });
    await homePage.clickHistory();
    await page.waitForURL(/history/, { timeout: 10_000 });

    await expect(historyPage.historyCards).toBeVisible({ timeout: 5_000 });

    await historyPage.deleteFirstEntry();

    await expect(historyPage.emptyStateText).toBeVisible({ timeout: 5_000 });
  });
});
