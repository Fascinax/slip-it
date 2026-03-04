import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

test.describe('Guards de navigation — redirection sans partie', () => {

  test('accès /gameplay sans partie redirige vers /home', async ({ page, gameplayPage }) => {
    await gameplayPage.goto();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /card-deal sans partie redirige vers /home', async ({ page, cardDealPage }) => {
    await cardDealPage.goto();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /scoreboard sans partie redirige vers /home', async ({ page, scoreboardPage }) => {
    await scoreboardPage.goto();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /game-end sans partie redirige vers /home', async ({ page, gameEndPage }) => {
    await gameEndPage.goto();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });
});

test.describe('Annulation des dialogues de confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('annuler la modale "Terminer" reste sur /gameplay', async ({ page, gameplayPage }) => {
    await gameplayPage.btnEndGame.dispatchEvent('click');
    const modal = gameplayPage.ionModal.last();
    await modal.waitFor({ state: 'visible', timeout: 5_000 });

    await modal.getByRole('button', { name: 'Annuler' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.allMyCardButtons.first()).toBeVisible();
  });

  test('annuler l\'alerte "Manche suivante" reste sur /gameplay', async ({ page, gameplayPage }) => {
    await gameplayPage.cancelNextRound();
    await expect(page).toHaveURL(/gameplay/);
  });
});
