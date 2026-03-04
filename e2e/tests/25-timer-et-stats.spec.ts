import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

test.describe('Timer — combinaisons de paramètres', () => {

  test('timer invisible quand désactivé (défaut)', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await expect(gameplayPage.countdownTimer).not.toBeVisible();
  });

  test('timer visible quand activé', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-timer-enabled');
    });
    await expect(gameplayPage.countdownTimer).toBeVisible({ timeout: 5_000 });
  });

  test('timer + mode continu : les deux sont visibles simultanément', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-timer-enabled');
      await setup.activateIonToggle('toggle-continuous-mode');
    });
    await expect(gameplayPage.countdownTimer).toBeVisible({ timeout: 5_000 });
    await expect(gameplayPage.continuousHint).toBeVisible({ timeout: 5_000 });
  });

  test('timer affiche un format m:ss valide', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-timer-enabled');
    });
    await expect(gameplayPage.timerValue).toHaveText(/^\d+:\d{2}$/, { timeout: 5_000 });
  });
});

test.describe('Game-end — statistiques détaillées', () => {

  test('le vainqueur est affiché dans le header', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.winnerHeader).toBeVisible({ timeout: 5_000 });
  });

  test('le podium affiche exactement 3 entrées pour 3 joueurs', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    const count = await gameEndPage.podiumEntries.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('sans piège, tous les joueurs ont 0 points dans le podium', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: false });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    const allScores = await gameEndPage.allScoreBadges.allInnerTexts();
    for (const s of allScores) {
      expect(s.trim()).toContain('0');
    }
  });

  test('le bouton "Rejouer" et "Nouvelle partie" sont visibles', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.btnReplay).toBeVisible({ timeout: 5_000 });
    await expect(gameEndPage.btnNewGame).toBeVisible({ timeout: 5_000 });
  });
});
