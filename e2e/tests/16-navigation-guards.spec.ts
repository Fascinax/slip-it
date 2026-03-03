import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Guards — redirection sans partie active
// --------------------------------------------------------------------------
test.describe('Guards de navigation — redirection sans partie', () => {

  test('accès /gameplay sans partie redirige vers /home', async ({ page }) => {
    await page.goto('/gameplay');
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /card-deal sans partie redirige vers /home', async ({ page }) => {
    await page.goto('/card-deal');
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /scoreboard sans partie redirige vers /home', async ({ page }) => {
    await page.goto('/scoreboard');
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('accès /game-end sans partie redirige vers /home', async ({ page }) => {
    await page.goto('/game-end');
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });
});

// --------------------------------------------------------------------------
// Dialogs — annulation de "Terminer" et "Manche suivante"
// --------------------------------------------------------------------------
test.describe('Annulation des dialogues de confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('annuler la modale "Terminer" reste sur /gameplay', async ({ page }) => {
    // Ouvrir le dialog "Terminer"
    await page.locator('[data-testid="btn-end-game"]').dispatchEvent('click');
    const modal = page.locator('ion-modal').last();
    await modal.waitFor({ state: 'visible', timeout: 5_000 });

    // Cliquer "Annuler" (bouton secondaire du confirm-dialog)
    const cancelBtn = modal.getByRole('button', { name: 'Annuler' });
    await cancelBtn.dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    // Toujours sur /gameplay
    await expect(page).toHaveURL(/gameplay/);
    // Les boutons joueurs sont encore visibles
    await expect(page.locator('[data-testid="btn-my-card"]').first()).toBeVisible();
  });

  test('annuler l\'alerte "Manche suivante" reste sur /gameplay', async ({ page }) => {
    // Cliquer "Manche suivante"
    await page.locator('[data-testid="btn-next-round"]').dispatchEvent('click');
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 5_000 });

    // Cliquer "Annuler"
    await alert.getByRole('button', { name: 'Annuler' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });

    // Toujours sur /gameplay
    await expect(page).toHaveURL(/gameplay/);
  });
});
