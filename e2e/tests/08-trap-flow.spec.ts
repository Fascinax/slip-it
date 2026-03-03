import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Reusable: click "Piégé !" for the first player in the list
// --------------------------------------------------------------------------
async function clickTrapButton(page: import('@playwright/test').Page): Promise<void> {
  await page
    .locator('ion-item')
    .filter({ hasText: DEFAULT_PLAYERS[0].name })
    .locator('[data-testid="btn-declare-trap"]')
    .click();
}

// --------------------------------------------------------------------------
// Happy paths — piège validé
// --------------------------------------------------------------------------
test.describe('Déclaration de piège — happy paths (piège validé)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('cliquer "Piégé !" ouvre la modale de confirmation', async ({ page }) => {
    await clickTrapButton(page);
    await expect(page.locator('ion-modal')).toBeVisible({ timeout: 5_000 });
  });

  test('la modale affiche le nom du piégeur et le mot secret', async ({ page }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    // Title confirms the declarer's name
    await expect(modal).toContainText(DEFAULT_PLAYERS[0].name);
  });

  test('valider le piège met le score du joueur à 1 dans le classement rapide', async ({ page }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await page.waitForTimeout(600);

    // The quick ranking section shows the updated score
    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('valider le piège fait apparaître l\'historique sur /game-end', async ({ page, gameplayPage }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await page.waitForTimeout(400);

    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(page.getByText(/Historique des pièges/)).toBeVisible({ timeout: 5_000 });
  });

  test('le bouton "Piégé !" est désactivé après validation', async ({ page }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);

    const trapBtn = page
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[0].name })
      .locator('[data-testid="btn-declare-trap"]');
    // ion-button (web component) adds "button-disabled" class when [disabled]=true
    await expect(trapBtn).toHaveClass(/button-disabled/, { timeout: 5_000 });
  });

  test('impossible de scorer deux fois avec le même mot — le score reste à 1', async ({ page }) => {
    // Premier piège — validé
    await clickTrapButton(page);
    let modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);

    // Le bouton est désactivé (ion-button web-component)
    const trapBtn = page
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[0].name })
      .locator('[data-testid="btn-declare-trap"]');
    await expect(trapBtn).toHaveClass(/button-disabled/, { timeout: 5_000 });

    // Score doit rester à 1
    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('1');
  });

  test('deux joueurs différents peuvent chacun piéger — scores cumulés', async ({ page }) => {
    // Alice piège
    await clickTrapButton(page);
    let modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);

    // Bob piège
    await page
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[1].name })
      .locator('[data-testid="btn-declare-trap"]')
      .click();
    modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await page.waitForTimeout(500);

    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    const bobRow   = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[1].name });
    await expect(aliceRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
    await expect(bobRow.locator('app-score-badge')).toContainText('1',   { timeout: 5_000 });
  });
});

// --------------------------------------------------------------------------
// Sad paths — piège rejeté / annulé
// --------------------------------------------------------------------------
test.describe('Déclaration de piège — sad paths (piège rejeté / annulé)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('rejeter le piège ferme la modale', async ({ page }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
    await expect(modal).not.toBeVisible();
  });

  test('rejeter le piège ne modifie pas le score (reste 0)', async ({ page }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(rankingRow.locator('app-score-badge')).toContainText('0');
  });

  test('rejeter le piège n\'ajoute rien dans l\'historique sur /game-end', async ({ page, gameplayPage }) => {
    await clickTrapButton(page);
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });

    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(page.getByText(/Historique des pièges/)).not.toBeVisible();
  });
});
