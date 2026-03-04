import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd, dealAllCards } from '../helpers/game.helper';

test.describe('Rejouer et nouvelle partie (/game-end)', () => {

  test('"Rejouer" conserve les mêmes joueurs sur /game-setup', async ({ page, gameEndPage, gameSetupPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickReplay();
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    await expect(gameSetupPage.playerCountBadge).toContainText(
      String(DEFAULT_PLAYERS.length),
    );
    for (const p of DEFAULT_PLAYERS) {
      await expect(gameSetupPage.playerListItem(p.name)).toBeVisible();
    }
  });

  test('"Rejouer" remet tous les scores à zéro', async ({ page, gameEndPage, gameSetupPage, gameplayPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const badges = gameEndPage.allScoreBadges;
    const texts = await badges.allInnerTexts();
    const hasNonZero = texts.some(t => /[1-9]/.test(t));
    expect(hasNonZero).toBeTruthy();

    await gameEndPage.clickReplay();
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    await gameSetupPage.ionToast.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});

    await gameSetupPage.clickStartGame();
    await page.waitForURL(/card-deal/, { timeout: 10_000 });

    await page.waitForTimeout(500);
    await dealAllCards(page, DEFAULT_PLAYERS);
    await page.waitForURL(/gameplay/, { timeout: 10_000 });

    const scoreTexts = await gameplayPage.rankingRows.locator('app-score-badge').allInnerTexts();
    for (const txt of scoreTexts) {
      expect(txt).toMatch(/0/);
    }
  });

  test('"Nouvelle partie" vide la liste de joueurs sur /home puis /game-setup', async ({ page, gameEndPage, homePage, gameSetupPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickNewGame();
    await page.waitForURL(/home/, { timeout: 10_000 });

    await homePage.clickNewGame();
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    await expect(gameSetupPage.playerCountBadge).toContainText('0');
  });

  test('"Nouvelle partie" depuis /game-end → le bouton reprendre est absent', async ({ page, gameEndPage, homePage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await gameEndPage.clickNewGame();
    await page.waitForURL(/home/, { timeout: 10_000 });

    await expect(homePage.btnResumeGame).not.toBeVisible();
  });
});
