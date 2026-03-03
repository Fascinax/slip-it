import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Historique des parties (/history)
// --------------------------------------------------------------------------
test.describe('Historique des parties (/history)', () => {

  test('la page historique est accessible depuis l\'accueil', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="btn-history"]').click();
    await expect(page).toHaveURL(/history/, { timeout: 10_000 });
  });

  test('l\'état vide affiche "Aucune partie enregistrée"', async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Aucune partie enregistrée')).toBeVisible({ timeout: 5_000 });
  });

  test('une partie terminée apparaît dans l\'historique', async ({ page }) => {
    // Jouer et terminer une partie
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // Retourner à l'accueil et aller dans l'historique
    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await page.waitForURL(/home/, { timeout: 10_000 });
    await page.locator('[data-testid="btn-history"]').click();
    await page.waitForURL(/history/, { timeout: 10_000 });

    // L'état vide ne doit plus être visible
    await expect(page.getByText('Aucune partie enregistrée')).not.toBeVisible();
    // Au moins une carte d'historique doit être visible
    await expect(page.locator('[data-testid="history-card"]')).toBeVisible({ timeout: 5_000 });
  });

  test('la carte d\'historique montre les noms des joueurs dans les chips', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await page.waitForURL(/home/, { timeout: 10_000 });
    await page.locator('[data-testid="btn-history"]').click();
    await page.waitForURL(/history/, { timeout: 10_000 });

    const card = page.locator('[data-testid="history-card"]').first();
    // Les noms de joueurs apparaissent dans les chips
    const chipTexts = await card.locator('ion-chip').allInnerTexts();
    for (const p of DEFAULT_PLAYERS) {
      expect(chipTexts.some(t => t.includes(p.name))).toBeTruthy();
    }
  });

  test('supprimer une entrée retire la carte', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await page.waitForURL(/home/, { timeout: 10_000 });
    await page.locator('[data-testid="btn-history"]').click();
    await page.waitForURL(/history/, { timeout: 10_000 });

    await expect(page.locator('[data-testid="history-card"]')).toBeVisible({ timeout: 5_000 });

    // Supprimer l'entrée
    await page.locator('[data-testid="btn-delete-history-entry"]').first().click();
    await page.waitForTimeout(500);

    // L'état vide réapparaît
    await expect(page.getByText('Aucune partie enregistrée')).toBeVisible({ timeout: 5_000 });
  });
});
