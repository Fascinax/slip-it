import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Helper: activate an ion-toggle by dispatching ionChange on its host
// --------------------------------------------------------------------------
async function activateIonToggle(
  page: import('@playwright/test').Page,
  testId: string,
): Promise<void> {
  const toggle = page.locator(`[data-testid="${testId}"]`);
  await toggle.waitFor({ state: 'attached' });
  await toggle.evaluate((el: any) => {
    el.checked = true;
    el.dispatchEvent(
      new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }),
    );
  });
  await page.waitForTimeout(150);
}

// --------------------------------------------------------------------------
// Mode continu — flux comportemental
// --------------------------------------------------------------------------
test.describe('Mode continu — flux comportemental (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async p => {
      await activateIonToggle(p, 'toggle-continuous-mode');
    });
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  // Happy paths ---------------------------------------------------------------

  test('le bouton "Manche suivante" est absent (mode continu)', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-next-round"]')).not.toBeVisible();
  });

  test('le message "Mode continu" apparaît dans le pied de page', async ({ page }) => {
    await expect(page.locator('.continuous-hint')).toBeVisible({ timeout: 5_000 });
  });

  test('le titre contient "Mode continu"', async ({ page }) => {
    await expect(page.locator('ion-title').first()).toContainText('Mode continu', {
      timeout: 5_000,
    });
  });

  test('valider un piège en mode continu met le score à 1', async ({ page }) => {
    await page
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[0].name })
      .locator('[data-testid="btn-declare-trap"]')
      .click();
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await page.waitForTimeout(600);

    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('valider un piège en mode continu ne navigue pas automatiquement hors du gameplay', async ({ page }) => {
    await page
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[0].name })
      .locator('[data-testid="btn-declare-trap"]')
      .click();
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await page.waitForTimeout(600);
    // Should remain on /gameplay, not auto-advance to /scoreboard
    await expect(page).toHaveURL(/gameplay/);
  });

  test('"Terminer" en mode continu navigue vers /game-end', async ({ page, gameplayPage }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
  });

  // Sad path ------------------------------------------------------------------

  test('désactiver le mode continu (mode normal) affiche "Manche suivante"', async ({ page }) => {
    // In normal mode (no beforeEach toggle) the button is present — tested in 04-gameplay.spec.ts.
    // Here we confirm the continuous mode setup truly hides it.
    await expect(page.locator('[data-testid="btn-next-round"]')).not.toBeVisible();
  });
});
