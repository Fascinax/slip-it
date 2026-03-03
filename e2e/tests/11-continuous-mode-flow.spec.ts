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

async function expandAdvancedSettings(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.advanced-toggle').click();
  await page.waitForTimeout(300);
}

// --------------------------------------------------------------------------
// Helper: validate a trap for a given player name and wait for alert
// --------------------------------------------------------------------------
async function validateTrapFor(
  page: import('@playwright/test').Page,
  playerName: string,
): Promise<void> {
  await page
    .locator('ion-item')
    .filter({ hasText: playerName })
    .locator('[data-testid="btn-declare-trap"]')
    .click();
  const modal = page.locator('ion-modal');
  await modal.waitFor({ state: 'visible', timeout: 5_000 });
  await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
  await modal.waitFor({ state: 'hidden', timeout: 5_000 });
}

// --------------------------------------------------------------------------
// Mode continu — flux comportemental
// --------------------------------------------------------------------------
test.describe('Mode continu — flux comportemental (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async p => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-continuous-mode');
    });
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  // Happy paths — UI de base --------------------------------------------------

  test('le bouton "Manche suivante" est absent (mode continu)', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-next-round"]')).not.toBeVisible();
  });

  test('le message "Mode continu" apparaît dans le pied de page', async ({ page }) => {
    await expect(page.locator('.continuous-hint')).toBeVisible({ timeout: 5_000 });
  });

  test('le titre contient "Mode continu"', async ({ page }) => {
    await expect(
      page.locator('app-gameplay ion-title').first(),
    ).toContainText('Mode continu', { timeout: 8_000 });
  });

  // Happy paths — validation piège -------------------------------------------

  test('valider un piège en mode continu met le score à 1', async ({ page }) => {
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(400);

    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('valider un piège ne navigue pas automatiquement hors du gameplay', async ({ page }) => {
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/gameplay/);
  });

  // Happy paths — nouvelle carte (le flux principal testé ici) ----------------

  test('après validation d\'un piège, l\'alerte "Nouvelle carte ?" apparaît', async ({ page }) => {
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await expect(alert).toContainText('Nouvelle carte');
  });

  test('cliquer "Distribuer" dans l\'alerte affiche le toast de confirmation', async ({ page }) => {
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Distribuer' }).click();
    // Filter by tertiary color (nouvelle carte toast) to avoid strict mode violation
    // with the concurrent success toast (piège validé)
    await expect(page.locator('ion-toast[color="tertiary"]')).toContainText('Nouvelle carte', { timeout: 5_000 });
  });

  test('après "Distribuer", le bouton "Ma carte" est ré-activé pour le piégeur', async ({ page }) => {
    const gameplay = page.locator('app-gameplay');
    // Step 1 — player views and closes their card so btn-my-card becomes disabled
    const playerItem = gameplay.locator('ion-item').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    const closeBtn = gameplay.locator('[data-testid="btn-close-card"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await closeBtn.click();
    // Wait for OnPush re-render after closeCard()
    await closeBtn.waitFor({ state: 'hidden', timeout: 3_000 });
    // ion-button is a custom element: use aria-disabled instead of toBeDisabled()
    await expect(playerItem.locator('[data-testid="btn-my-card"]')).toHaveAttribute('aria-disabled', 'true', { timeout: 3_000 });

    // Step 2 — validate trap for that player
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Distribuer' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });

    // Step 3 — btn-my-card should be re-enabled (aria-disabled gone)
    await expect(playerItem.locator('[data-testid="btn-my-card"]')).not.toHaveAttribute('aria-disabled', { timeout: 5_000 });
  });

  test('après "Distribuer", la nouvelle carte affiche un mot secret', async ({ page }) => {
    const gameplay = page.locator('app-gameplay');
    // Step 1 — view and close card (disables btn-my-card)
    const playerItem = gameplay.locator('ion-item').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    const closeBtn = gameplay.locator('[data-testid="btn-close-card"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await closeBtn.click();
    // Wait for OnPush re-render
    await closeBtn.waitFor({ state: 'hidden', timeout: 3_000 });

    // Step 2 — declare trap + distribute new card
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Distribuer' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });

    // Step 3 — open the new card
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    const revealBtn = gameplay.locator('[data-testid="btn-reveal-card"]');
    await revealBtn.waitFor({ state: 'visible', timeout: 3_000 });
    await revealBtn.click();

    // Step 4 — assert the card word is visible and non-empty
    const cardWord = gameplay.locator('.card-word');
    await expect(cardWord).toBeVisible({ timeout: 5_000 });
    await expect(cardWord).not.toHaveText('');
  });

  // Sad path — refus de la nouvelle carte ------------------------------------

  test('cliquer "Plus tard" ferme l\'alerte sans afficher le toast de nouvelle carte', async ({ page }) => {
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Plus tard' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });
    // No "Nouvelle carte prête" toast should appear
    await expect(page.locator('ion-toast').filter({ hasText: 'Nouvelle carte' })).not.toBeVisible();
  });

  test('"Plus tard" ne re-active pas le bouton Ma carte du piégeur', async ({ page }) => {
    const gameplay = page.locator('app-gameplay');
    // View and close card so btn-my-card is disabled
    const playerItem = gameplay.locator('ion-item').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    const closeBtn = gameplay.locator('[data-testid="btn-close-card"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await closeBtn.click();
    // Wait for OnPush re-render
    await closeBtn.waitFor({ state: 'hidden', timeout: 3_000 });
    // ion-button custom element: aria-disabled instead of toBeDisabled()
    await expect(playerItem.locator('[data-testid="btn-my-card"]')).toHaveAttribute('aria-disabled', 'true');

    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Plus tard' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });

    // btn-my-card should remain disabled — no new card was distributed
    await expect(playerItem.locator('[data-testid="btn-my-card"]')).toHaveAttribute('aria-disabled', 'true');
  });

  test('"Terminer" en mode continu navigue vers /game-end', async ({ page, gameplayPage }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
  });
});
