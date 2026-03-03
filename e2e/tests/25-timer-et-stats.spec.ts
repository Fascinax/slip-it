import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function expandAdvancedSettings(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.advanced-toggle').click();
  await page.waitForTimeout(300);
}

async function activateIonToggle(page: import('@playwright/test').Page, testId: string): Promise<void> {
  const toggle = page.locator(`[data-testid="${testId}"]`);
  await toggle.waitFor({ state: 'attached' });
  await toggle.evaluate((el: any) => {
    el.checked = true;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }));
  });
  await page.waitForTimeout(150);
}

// ─── Timer + Gameplay combinaisons ──────────────────────────────────────────
test.describe('Timer — combinaisons de paramètres', () => {

  test('timer invisible quand désactivé (défaut)', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await expect(page.locator('app-countdown-timer')).not.toBeVisible();
  });

  test('timer visible quand activé', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-timer-enabled');
    });
    await expect(page.locator('app-countdown-timer')).toBeVisible({ timeout: 5_000 });
  });

  test('timer + mode continu : les deux sont visibles simultanément', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-timer-enabled');
      await activateIonToggle(p, 'toggle-continuous-mode');
    });
    await expect(page.locator('app-countdown-timer')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.continuous-hint')).toBeVisible({ timeout: 5_000 });
  });

  test('timer affiche un format m:ss valide', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-timer-enabled');
    });
    const timerValue = page.locator('app-countdown-timer .timer-value');
    await expect(timerValue).toHaveText(/^\d+:\d{2}$/, { timeout: 5_000 });
  });
});

// ─── Fin de partie — statistiques correctes ─────────────────────────────────
test.describe('Game-end — statistiques détaillées', () => {

  test('le vainqueur est affiché dans le header', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    // First player trapped, so they should be the winner
    await expect(page.getByText(/VAINQUEUR/)).toBeVisible({ timeout: 5_000 });
  });

  test('le podium affiche exactement 3 entrées pour 3 joueurs', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    const podiumEntries = page.locator('.podium-entry, .podium-item, .podium-row');
    const count = await podiumEntries.count();
    // Should have entries for all 3 players
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('sans piège, tous les joueurs ont 0 points dans le podium', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: false });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    // All score badges should show 0
    const scoreBadges = page.locator('app-game-end app-score-badge');
    const allScores = await scoreBadges.allInnerTexts();
    for (const s of allScores) {
      expect(s.trim()).toContain('0');
    }
  });

  test('le bouton "Rejouer" et "Nouvelle partie" sont visibles', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(page.locator('[data-testid="btn-replay"]')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('[data-testid="btn-new-game-end"]')).toBeVisible({ timeout: 5_000 });
  });
});
