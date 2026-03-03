import { test, expect } from '../fixtures/base.fixture';
import { runToGameplay, runToGameEnd } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

// ─── Cas limites — noms de joueurs edge cases ──────────────────────────────
test.describe('Cas limites — noms de joueurs', () => {

  test('un nom de 20 caractères (max) est accepté et affiché', async ({ page }) => {
    const longName = 'AbcdefghijKlmnopqrst'; // 20 chars
    const players = [
      { name: longName },
      { name: 'Bob' },
      { name: 'Charlie' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);

    // The long name should appear in the ranking card
    await expect(page.locator('.ranking-row').filter({ hasText: longName })).toBeVisible({ timeout: 5_000 });
  });

  test('un nom de 21 caractères est refusé (bouton reste désactivé)', async ({ page }) => {
    const tooLong = 'A'.repeat(21);
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.fillIonInput('[data-testid="input-player-name"]', tooLong);
    await page.waitForTimeout(200);
    // The add button should remain disabled
    await expect(setup.btnAddPlayer).toHaveAttribute('aria-disabled', 'true');
  });

  test('un nom avec des accents est accepté et affiché', async ({ page }) => {
    const accentName = 'Éloïse';
    const players = [
      { name: accentName },
      { name: 'André' },
      { name: 'Cécile' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);
    await expect(page.locator('.ranking-row').filter({ hasText: accentName })).toBeVisible({ timeout: 5_000 });
  });

  test('un nom avec un tiret est accepté', async ({ page }) => {
    const hyphenName = 'Jean-Pierre';
    const players = [
      { name: hyphenName },
      { name: 'Marie' },
      { name: 'Louis' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);
    await expect(page.locator('.ranking-row').filter({ hasText: hyphenName })).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Cas limites — exactement 3 joueurs (minimum) ──────────────────────────
test.describe('Cas limites — minimum joueurs', () => {

  test('avec exactement 3 joueurs le bouton distribuer est activé', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Un');
    await setup.addPlayer('Deux');
    // Avec 2 joueurs, le bouton doit être désactivé
    await expect(setup.btnStartGame).toHaveAttribute('aria-disabled', 'true');
    // Ajouter le 3e
    await setup.addPlayer('Trois');
    // Maintenant le bouton doit être actif
    await expect(setup.btnStartGame).not.toHaveAttribute('aria-disabled', { timeout: 3_000 });
  });

  test('avec 2 joueurs on ne peut pas démarrer', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Joueur1');
    await setup.addPlayer('Joueur2');
    await expect(setup.btnStartGame).toHaveAttribute('aria-disabled', 'true');
    // Warning text should be visible
    await expect(setup.warningText).toBeVisible();
  });
});

// ─── Cas limites — noms dupliqués ───────────────────────────────────────────
test.describe('Cas limites — noms dupliqués', () => {

  test('ajouter deux joueurs avec le même nom affiche un toast d\'erreur', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Alice');
    await setup.addPlayer('Alice');
    // A toast should appear for duplicate name
    const toast = page.locator('ion-toast');
    await expect(toast).toBeVisible({ timeout: 3_000 });
  });

  test('le compteur ne s\'incrémente pas pour un nom dupliqué', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Alice');
    await expect(setup.playerCountBadge).toContainText('1');
    await setup.addPlayer('Alice');
    // Count should still be 1
    await expect(setup.playerCountBadge).toContainText('1');
  });
});

// ─── Cas limites — refus de piège ───────────────────────────────────────────
test.describe('Cas limites — refus de piège', () => {

  test('rejeter un piège ne change pas le score', async ({ page }) => {
    await runToGameplay(page);

    // Get initial score (should be 0)
    const aliceRow = page.locator('.ranking-row').filter({ hasText: 'Alice' });
    await expect(aliceRow.locator('app-score-badge')).toContainText('0', { timeout: 5_000 });

    // Declare trap then reject
    await page.locator('ion-item').filter({ hasText: 'Alice' }).locator('[data-testid="btn-declare-trap"]').click();
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    // Score should still be 0
    await expect(aliceRow.locator('app-score-badge')).toContainText('0', { timeout: 5_000 });
  });

  test('après un rejet le bouton Piégé reste actif', async ({ page }) => {
    await runToGameplay(page);

    const aliceItem = page.locator('app-gameplay ion-item').filter({ hasText: 'Alice' });
    await aliceItem.locator('[data-testid="btn-declare-trap"]').click();
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    // Button should NOT be disabled
    await expect(
      aliceItem.locator('[data-testid="btn-declare-trap"]'),
    ).not.toHaveAttribute('aria-disabled', { timeout: 3_000 });
  });
});
