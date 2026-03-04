import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

test.describe('Mode continu — flux comportemental (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async p => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-continuous-mode');
    });
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  test('le bouton "Manche suivante" est absent (mode continu)', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnNextRound).not.toBeVisible();
  });

  test('le message "Mode continu" apparaît dans le pied de page', async ({ gameplayPage }) => {
    await expect(gameplayPage.continuousHint).toBeVisible({ timeout: 5_000 });
  });

  test('le titre contient "Mode continu"', async ({ gameplayPage }) => {
    await expect(gameplayPage.title).toContainText('Mode continu', { timeout: 8_000 });
  });

  test('valider un piège en mode continu met le score à 1', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(400);
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
  });

  test('valider un piège ne navigue pas automatiquement hors du gameplay', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/gameplay/);
  });

  test('après validation d\'un piège, l\'alerte "Nouvelle carte ?" apparaît', async ({ gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionAlert.waitFor({ state: 'visible', timeout: 6_000 });
    await expect(gameplayPage.ionAlert).toContainText('Nouvelle carte');
  });

  test('cliquer "Distribuer" dans l\'alerte affiche le toast de confirmation', async ({ gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.distributeNewCardViaAlert();
    await expect(gameplayPage.ionToast.filter({ hasText: 'Nouvelle carte' })).toContainText('Nouvelle carte', { timeout: 5_000 });
  });

  test('après "Distribuer", le bouton "Ma carte" est ré-activé pour le piégeur', async ({ page, gameplayPage }) => {
    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.revealCard();
    await gameplayPage.closeCard();
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).toHaveAttribute('aria-disabled', 'true', { timeout: 3_000 });

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.distributeNewCardViaAlert();

    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).not.toHaveAttribute('aria-disabled', { timeout: 5_000 });
  });

  test('après "Distribuer", la nouvelle carte affiche un mot secret', async ({ gameplayPage }) => {
    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.revealCard();
    await gameplayPage.closeCard();

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.distributeNewCardViaAlert();

    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.revealCard();

    await expect(gameplayPage.cardWord).toBeVisible({ timeout: 5_000 });
    await expect(gameplayPage.cardWord).not.toHaveText('');
  });

  test('cliquer "Plus tard" ferme l\'alerte sans afficher le toast de nouvelle carte', async ({ gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.dismissNewCardAlert();
    await expect(gameplayPage.ionToast.filter({ hasText: 'Nouvelle carte' })).not.toBeVisible();
  });

  test('"Plus tard" ne re-active pas le bouton Ma carte du piégeur', async ({ gameplayPage }) => {
    await gameplayPage.openPassPhoneFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.revealCard();
    await gameplayPage.closeCard();
    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).toHaveAttribute('aria-disabled', 'true');

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.dismissNewCardAlert();

    await expect(gameplayPage.myCardButtonFor(DEFAULT_PLAYERS[0].name)).toHaveAttribute('aria-disabled', 'true');
  });

  test('"Terminer" en mode continu navigue vers /game-end', async ({ page, gameplayPage }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
  });
});
