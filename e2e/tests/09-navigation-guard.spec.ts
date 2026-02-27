import { test, expect } from '../fixtures/base.fixture';

/**
 * Sad-path tests for direct URL access to protected pages when no game is active.
 *
 * The app currently has no router guard, so pages are still reachable — but
 * they should render in a safe empty state (no crash, no error URL).
 */
test.describe('Accès direct aux pages sans partie active — sad paths (navigation guard)', () => {
  test('accès /gameplay sans partie — aucun bouton "Ma carte" affiché', async ({ page }) => {
    await page.goto('/gameplay');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="btn-my-card"]')).toHaveCount(0);
  });

  test('accès /gameplay sans partie — aucun bouton "Piégé !" affiché', async ({ page }) => {
    await page.goto('/gameplay');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="btn-declare-trap"]')).toHaveCount(0);
  });

  test('accès /gameplay sans partie — la page ne plante pas', async ({ page }) => {
    await page.goto('/gameplay');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /scoreboard sans partie — classement vide', async ({ page }) => {
    await page.goto('/scoreboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.scoreboard-entry')).toHaveCount(0);
  });

  test('accès /scoreboard sans partie — la page ne plante pas', async ({ page }) => {
    await page.goto('/scoreboard');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /game-end sans partie — la page ne plante pas', async ({ page }) => {
    await page.goto('/game-end');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });

  test('accès /game-end sans partie — aucun nom de vainqueur affiché', async ({ page }) => {
    await page.goto('/game-end');
    await page.waitForLoadState('networkidle');
    // Either the element is absent or its text is empty when no game exists
    const winnerEl = page.locator('.winner-name');
    const count = await winnerEl.count();
    if (count > 0) {
      const text = await winnerEl.innerText().catch(() => '');
      expect(text.trim()).toBe('');
    }
    // If count === 0 the assertion is implicitly satisfied
  });

  test('accès /card-deal sans partie — la page ne plante pas', async ({ page }) => {
    await page.goto('/card-deal');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });
});
