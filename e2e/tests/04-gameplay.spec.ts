import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

test.describe('Phase de jeu (/gameplay)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('la page /gameplay est chargée', async ({ page }) => {
    await expect(page).toHaveURL(/gameplay/);
  });

  test('affiche la section "Classement rapide"', async ({ gameplayPage }) => {
    await expect(gameplayPage.quickRankingTitle).toBeVisible();
  });

  test('affiche un bouton "Ma carte" pour chaque joueur', async ({ gameplayPage }) => {
    for (const player of DEFAULT_PLAYERS) {
      await expect(gameplayPage.myCardButtonFor(player.name)).toBeVisible();
    }
  });

  test('affiche un bouton "Piégé !" pour chaque joueur', async ({ gameplayPage }) => {
    for (const player of DEFAULT_PLAYERS) {
      await expect(gameplayPage.declareTrapButtonFor(player.name)).toBeVisible();
    }
  });

  test('affiche le bouton "Manche suivante"', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnNextRound).toBeVisible();
  });

  test('affiche le bouton "Terminer" dans l\'en-tête', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnEndGame).toBeVisible();
  });

  test('peut consulter sa carte (passer le téléphone)', async ({ gameplayPage }) => {
    const alice = DEFAULT_PLAYERS[0];
    await gameplayPage.openPassPhoneFor(alice.name);
    await expect(gameplayPage.btnRevealCard).toBeVisible({ timeout: 5_000 });
    await gameplayPage.revealCard();
    await expect(gameplayPage.cardWord.last()).toBeVisible({ timeout: 5_000 });
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
