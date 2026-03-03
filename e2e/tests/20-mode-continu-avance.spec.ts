import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Helpers
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

async function distributeNewCardViaAlert(page: import('@playwright/test').Page): Promise<void> {
  const alert = page.locator('ion-alert');
  await alert.waitFor({ state: 'visible', timeout: 6_000 });
  await alert.getByRole('button', { name: 'Distribuer' }).click();
  await alert.waitFor({ state: 'hidden', timeout: 5_000 });
  // Attendre que le toast "Nouvelle carte" disparaisse
  await page.waitForTimeout(500);
}

// --------------------------------------------------------------------------
// Mode continu avancé — cycles multiples et edge cases
// --------------------------------------------------------------------------
test.describe('Mode continu avancé — cycles multiples', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async p => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-continuous-mode');
    });
    await expect(page).toHaveURL(/gameplay/, { timeout: 15_000 });
  });

  test('piège → nouvelle carte → second piège → score à 2', async ({ page }) => {
    const playerName = DEFAULT_PLAYERS[0].name;

    // Premier piège
    await validateTrapFor(page, playerName);
    await distributeNewCardViaAlert(page);

    // Second piège (le bouton "Piégé !" doit être re-activé car nouvelle assignation)
    const trapBtn = page
      .locator('ion-item')
      .filter({ hasText: playerName })
      .locator('[data-testid="btn-declare-trap"]');
    // Attendre que le bouton ne soit plus disabled (nouvelle assignation = nouveau mot)
    await expect(trapBtn).not.toHaveClass(/button-disabled/, { timeout: 5_000 });

    await validateTrapFor(page, playerName);
    await page.waitForTimeout(400);

    // Score doit être 2
    const rankingRow = page
      .locator('.ranking-row')
      .filter({ hasText: playerName });
    await expect(rankingRow.locator('app-score-badge')).toContainText('2', { timeout: 5_000 });
  });

  test('deux joueurs piègent en alternance — scores incrémentés correctement', async ({ page }) => {
    // Alice piège → distribuer → score 1
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await distributeNewCardViaAlert(page);

    // Bob piège → distribuer → score 1
    await validateTrapFor(page, DEFAULT_PLAYERS[1].name);
    await distributeNewCardViaAlert(page);

    // Vérifier les scores
    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    const bobRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[1].name });
    await expect(aliceRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
    await expect(bobRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('terminer immédiatement sans piège affiche un podium à scores nuls', async ({ page, gameplayPage }) => {
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });

    // Tous les scores sont à 0
    const badges = await page.locator('.podium-entry app-score-badge').allInnerTexts();
    for (const badge of badges) {
      expect(badge).toMatch(/0/);
    }
  });

  test('la cible de chaque nouvelle carte n\'est jamais le piégeur', async ({ page }) => {
    const playerName = DEFAULT_PLAYERS[0].name;

    // Premier piège + nouvelle carte
    await validateTrapFor(page, playerName);
    await distributeNewCardViaAlert(page);

    // Ouvrir la nouvelle carte pour vérifier la cible
    const gameplay = page.locator('app-gameplay');
    const playerItem = gameplay.locator('ion-item').filter({ hasText: playerName });
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();

    const cardTarget = await gameplay.locator('.card-target').last().innerText();
    expect(cardTarget.trim()).not.toBe(playerName);

    await gameplay.locator('[data-testid="btn-close-card"]').click();
  });

  test('la nouvelle carte a un mot secret différent de l\'ancien', async ({ page }) => {
    const playerName = DEFAULT_PLAYERS[0].name;
    const gameplay = page.locator('app-gameplay');
    const playerItem = gameplay.locator('ion-item').filter({ hasText: playerName });

    // Voir la première carte
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    await gameplay.locator('.card-word').last().waitFor({ state: 'visible', timeout: 5_000 });
    const firstWord = (await gameplay.locator('.card-word').last().innerText()).trim();
    await gameplay.locator('[data-testid="btn-close-card"]').click();
    await gameplay.locator('[data-testid="btn-close-card"]').waitFor({ state: 'hidden', timeout: 3_000 });

    // Piège + nouvelle carte
    await validateTrapFor(page, playerName);
    await distributeNewCardViaAlert(page);

    // Voir la nouvelle carte
    await playerItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    await gameplay.locator('.card-word').last().waitFor({ state: 'visible', timeout: 5_000 });
    const secondWord = (await gameplay.locator('.card-word').last().innerText()).trim();

    // Les deux mots doivent être différents (word dedup)
    expect(secondWord).not.toBe(firstWord);
  });
});
