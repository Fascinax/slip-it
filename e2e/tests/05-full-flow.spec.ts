import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS } from '../helpers/game.helper';

/**
 * End-to-end happy-path test:
 * Home → Setup (3 players) → Card deal (3 players) → Gameplay → Game end
 */
test.describe('Flux complet — partie de bout en bout', () => {
  test('home → setup → distribution → gameplay → fin', async ({
    page, homePage, gameSetupPage, cardDealPage, gameplayPage, gameEndPage,
  }) => {
    // ── 1. Page d'accueil ───────────────────────────────────────────────────
    await homePage.goto();
    await expect(homePage.heroTitle).toContainText('Slip It');
    await expect(homePage.btnNewGame).toBeVisible();

    await homePage.clickNewGame();
    await expect(page).toHaveURL(/game-setup/, { timeout: 10_000 });

    // ── 2. Ajout des 3 joueurs ──────────────────────────────────────────────
    for (const player of DEFAULT_PLAYERS) {
      await gameSetupPage.addPlayer(player.name);
    }

    await expect(gameSetupPage.playerCountBadge).toContainText('3');
    await expect(gameSetupPage.btnStartGame).not.toHaveAttribute('disabled');

    await gameSetupPage.clickStartGame();
    await expect(page).toHaveURL(/card-deal/, { timeout: 10_000 });

    // ── 3. Distribution des cartes (un par un) ──────────────────────────────
    for (const _player of DEFAULT_PLAYERS) {
      await cardDealPage.dealCardForPlayer();
    }

    // ── 4. Phase de jeu ─────────────────────────────────────────────────────
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });

    await expect(gameplayPage.quickRankingTitle).toBeVisible();
    await expect(gameplayPage.btnNextRound).toBeVisible();
    await expect(gameplayPage.btnEndGame).toBeVisible();

    for (const player of DEFAULT_PLAYERS) {
      await expect(gameplayPage.myCardButtonFor(player.name)).toBeVisible();
      await expect(gameplayPage.declareTrapButtonFor(player.name)).toBeVisible();
    }

    // ── 5. Terminer la partie → page fin ────────────────────────────────────
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });

    await expect(gameEndPage.winnerName).toBeVisible();
    await expect(gameEndPage.btnNewGame).toBeVisible();

    // ── 6. Retour à l'accueil depuis la page fin ─────────────────────────────
    await gameEndPage.clickNewGame();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });
});
