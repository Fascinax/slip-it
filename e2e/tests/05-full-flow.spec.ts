import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS } from '../helpers/game.helper';

/**
 * End-to-end happy-path test:
 * Home → Setup (3 players) → Card deal (3 players) → Gameplay → Game end
 *
 * This test is intentionally written as a single scenario to mirror what a
 * real user session looks like.  It covers the complete critical path.
 */
test.describe('Flux complet — partie de bout en bout', () => {
  test('home → setup → distribution → gameplay → fin', async ({ page }) => {
    // ── 1. Page d'accueil ───────────────────────────────────────────────────
    await page.goto('/home');
    await expect(page.locator('.home-hero__title')).toContainText('Slip It');
    await expect(page.locator('[data-testid="btn-new-game"]')).toBeVisible();

    await page.locator('[data-testid="btn-new-game"]').click();
    await expect(page).toHaveURL(/game-setup/, { timeout: 10_000 });

    // ── 2. Ajout des 3 joueurs ──────────────────────────────────────────────
    for (const player of DEFAULT_PLAYERS) {
      // Fill via host element so Angular CVA picks up the value
      const nameHost = page.locator('[data-testid="input-player-name"]');
      const pinHost  = page.locator('[data-testid="input-player-pin"]');

      await nameHost.locator('input').waitFor({ state: 'visible' });
      await nameHost.locator('input').fill(player.name);
      await nameHost.evaluate((el: any, v: string) => {
        el.value = v;
        el.dispatchEvent(new CustomEvent('ionInput', { detail: { value: v }, bubbles: true }));
      }, player.name);

      await pinHost.locator('input').fill(player.pin);
      await pinHost.evaluate((el: any, v: string) => {
        el.value = v;
        el.dispatchEvent(new CustomEvent('ionInput', { detail: { value: v }, bubbles: true }));
      }, player.pin);

      await page.waitForTimeout(200);
      await page.locator('[data-testid="btn-add-player"]').click();
      await page.waitForTimeout(600);
    }

    await expect(page.locator('[data-testid="player-count-badge"]')).toContainText('3');
    await expect(page.locator('[data-testid="btn-start-game"]')).not.toHaveAttribute('disabled');

    // dispatchEvent bypasses viewport check (ion-footer is fixed outside scrollable area)
    await page.locator('[data-testid="btn-start-game"]').dispatchEvent('click');
    await expect(page).toHaveURL(/card-deal/, { timeout: 10_000 });

    // ── 3. Distribution des cartes (un par un) ──────────────────────────────
    for (const _player of DEFAULT_PLAYERS) {
      // WAITING state — click "Voir ma carte" directly (no PIN)
      await page.locator('[data-testid="btn-im-ready"]').waitFor({ state: 'visible' });
      await page.locator('[data-testid="btn-im-ready"]').click();

      // SHOWING_CARD state — card flips automatically
      await page.locator('app-card-flip').waitFor({ state: 'visible', timeout: 8_000 });

      // Confirm the card
      const confirmBtn = page.locator('[data-testid="btn-confirm-card"]');
      await confirmBtn.waitFor({ state: 'visible', timeout: 5_000 });
      await confirmBtn.click();
      await page.waitForTimeout(300);
    }

    // ── 4. Phase de jeu ─────────────────────────────────────────────────────
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });

    await expect(page.getByText('Classement rapide')).toBeVisible();
    await expect(page.locator('[data-testid="btn-next-round"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-end-game"]')).toBeVisible();

    // Verify each player has action buttons
    for (const player of DEFAULT_PLAYERS) {
      const row = page.locator('ion-item').filter({ hasText: player.name });
      await expect(row.locator('[data-testid="btn-my-card"]')).toBeVisible();
      await expect(row.locator('[data-testid="btn-declare-trap"]')).toBeVisible();
    }

    // ── 5. Terminer la partie → page fin ────────────────────────────────────
    // btn-end-game uses dispatchEvent (ion-header button needs it in some cases)
    await page.locator('[data-testid="btn-end-game"]').dispatchEvent('click');
    // App shows ConfirmDialogComponent modal — click "Terminer" to confirm
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Terminer' }).dispatchEvent('click');
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });

    await expect(page.locator('.winner-name')).toBeVisible();
    await expect(page.locator('[data-testid="btn-new-game-end"]')).toBeVisible();

    // ── 6. Retour à l'accueil depuis la page fin ─────────────────────────────
    // btn-new-game-end is in ion-footer — use dispatchEvent to bypass viewport check
    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });
});
