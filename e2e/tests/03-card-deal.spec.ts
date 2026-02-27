import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, setupGame } from '../helpers/game.helper';

test.describe('Distribution des cartes (/card-deal)', () => {
  test.beforeEach(async ({ page }) => {
    // Arrive on card-deal with 3 players already configured
    await setupGame(page, DEFAULT_PLAYERS);
  });

  test('affiche le bouton "Voir ma carte" pour le premier joueur', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-im-ready"]')).toBeVisible();
  });

  test('affiche le nom du premier joueur (Alice)', async ({ page }) => {
    await expect(page.locator('.deal-invite__name')).toContainText('Alice');
  });

  test('la carte est directement visible après avoir cliqué "Voir ma carte"', async ({ cardDealPage }) => {
    await cardDealPage.btnImReady.click();
    await expect(cardDealPage.cardFlip).toBeVisible({ timeout: 8_000 });
  });

  test('distribue les cartes aux 3 joueurs puis navigue vers /gameplay', async ({ page, cardDealPage }) => {
    for (const _player of DEFAULT_PLAYERS) {
      await cardDealPage.dealCardForPlayer();
    }
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });
});
