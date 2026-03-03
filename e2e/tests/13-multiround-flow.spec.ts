import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameplayPage } from '../pages/gameplay.page';
import { CardDealPage } from '../pages/card-deal.page';

// --------------------------------------------------------------------------
// Helper : set totalRounds to 1 via the ion-select in game-settings
// Dispatches ionChange on the host element (same pattern as activateIonToggle)
// --------------------------------------------------------------------------
async function setTotalRoundsTo1(page: import('@playwright/test').Page): Promise<void> {
  const roundsSelect = page
    .locator('ion-item')
    .filter({ hasText: 'Nombre de manches' })
    .locator('ion-select');
  await roundsSelect.waitFor({ state: 'attached' });
  await roundsSelect.evaluate((el: any) => {
    el.value = 1;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 1 }, bubbles: true }));
  });
  await page.waitForTimeout(150);
}

// --------------------------------------------------------------------------
// Helper : activate an ion-toggle by dispatching ionChange on its host
// --------------------------------------------------------------------------
async function activateIonToggle(
  page: import('@playwright/test').Page,
  testId: string,
): Promise<void> {
  const toggle = page.locator(`[data-testid="${testId}"]`);
  await toggle.waitFor({ state: 'attached' });
  await toggle.evaluate((el: any) => {
    el.checked = true;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }));
  });
  await page.waitForTimeout(150);
}

// --------------------------------------------------------------------------
// Helper : from /gameplay, go all the way to /gameplay round 2
//   R1 gameplay → "Manche suivante" → /scoreboard → "Distribuer les cartes"
//   → /card-deal → deal all → /gameplay (R2)
// --------------------------------------------------------------------------
async function proceedToRound2(page: import('@playwright/test').Page): Promise<void> {
  const gp = new GameplayPage(page);
  // nextRound() handles: btn click + alert confirm + wait for /scoreboard
  await gp.nextRound();

  // On /scoreboard — click "Distribuer les cartes" to start dealing round 2
  await page.locator('[data-testid="btn-deal-next-round"]').dispatchEvent('click');
  await page.waitForURL(/card-deal/, { timeout: 10_000 });

  // Deal cards for all players in round 2
  const deal = new CardDealPage(page);
  for (const _ of DEFAULT_PLAYERS) {
    await deal.dealCardForPlayer();
  }
  await page.waitForURL(/gameplay/, { timeout: 10_000 });
}

// --------------------------------------------------------------------------
// Helper : validate a trap for a given player name (opens modal + confirms)
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

// ==========================================================================
// Flux multi-manche — mode normal
// ==========================================================================
test.describe('Flux multi-manche — mode normal (R1 → R2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('après card-deal R2 on atterrit sur /gameplay', async ({ page }) => {
    await proceedToRound2(page);
    await expect(page).toHaveURL(/gameplay/);
  });

  test('le titre de la page indique "Manche 2" en round 2', async ({ page }) => {
    await proceedToRound2(page);
    await expect(
      page.locator('app-gameplay ion-title').first(),
    ).toContainText('Manche 2', { timeout: 5_000 });
  });

  test('btn-my-card est ré-activé en manche 2 après avoir été consulté en manche 1', async ({ page }) => {
    // R1 — Alice opens and closes her card → btn becomes disabled
    const gameplay = page.locator('app-gameplay');
    const aliceItem = gameplay.locator('ion-item').filter({ hasText: DEFAULT_PLAYERS[0].name });

    await aliceItem.locator('[data-testid="btn-my-card"]').click();
    await gameplay.locator('[data-testid="btn-reveal-card"]').click();
    const closeBtn = gameplay.locator('[data-testid="btn-close-card"]');
    await closeBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await closeBtn.click();
    // Wait for OnPush re-render before asserting disabled state
    await closeBtn.waitFor({ state: 'hidden', timeout: 3_000 });
    await expect(aliceItem.locator('[data-testid="btn-my-card"]')).toHaveAttribute('aria-disabled', 'true');

    // Move to R2 — GameplayPage component is recreated → viewedPlayerIds is reset
    await proceedToRound2(page);

    // R2 — btn-my-card must be re-enabled (no aria-disabled)
    const aliceItemR2 = page.locator('app-gameplay')
      .locator('ion-item')
      .filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(
      aliceItemR2.locator('[data-testid="btn-my-card"]'),
    ).not.toHaveAttribute('aria-disabled', { timeout: 5_000 });
  });

  test('le score d\'un joueur est préservé entre les manches', async ({ page }) => {
    // Alice gets 1 point in R1
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    // Navigate to R2
    await proceedToRound2(page);

    // Alice's ranking row in R2 should still show score = 1
    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(aliceRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });
});

// ==========================================================================
// Dernière manche — navigation directe vers /game-end
// ==========================================================================
test.describe('Dernière manche (totalRounds = 1) → /game-end direct', () => {
  test('"Manche suivante" sur la dernière manche navigue vers /game-end, pas /scoreboard', async ({ page }) => {
    // Set up a 1-round game and play to gameplay
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await setTotalRoundsTo1(p);
    });

    // Click "Manche suivante" and confirm
    await page.locator('[data-testid="btn-next-round"]').dispatchEvent('click');
    const alert = page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 5_000 });
    await alert.getByRole('button', { name: 'Suivant' }).click();

    // Must land on /game-end, never on /scoreboard
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(page).not.toHaveURL(/scoreboard/);
  });
});

// ==========================================================================
// Mode continu — invariant : la cible d'une nouvelle carte ≠ le piégeur
// ==========================================================================
test.describe('Mode continu — invariant cible nouvelle carte', () => {
  test('la cible de la nouvelle carte distribuée n\'est jamais le piégeur lui-même', async ({ page }) => {
    // Set up a continuous-mode game
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      // Expand "Paramètres avancés" so the toggle is visible
      await p.locator('.advanced-toggle').click();
      await p.waitForTimeout(300);
      await activateIonToggle(p, 'toggle-continuous-mode');
    });

    const trapperName = DEFAULT_PLAYERS[0].name; // Alice

    // Declare and validate a trap for Alice
    await validateTrapFor(page, trapperName);

    // The "Nouvelle carte ?" alert should appear
    const offerAlert = page.locator('ion-alert');
    await offerAlert.waitFor({ state: 'visible', timeout: 6_000 });
    await offerAlert.getByRole('button', { name: 'Distribuer' }).click();
    await offerAlert.waitFor({ state: 'hidden', timeout: 5_000 });

    // Open Alice's new card
    const gameplay = page.locator('app-gameplay');
    const aliceItem = gameplay.locator('ion-item').filter({ hasText: trapperName });
    await aliceItem.locator('[data-testid="btn-my-card"]').click();
    const revealBtn = gameplay.locator('[data-testid="btn-reveal-card"]');
    await revealBtn.waitFor({ state: 'visible', timeout: 3_000 });
    await revealBtn.click();

    // The new card's target must NOT be Alice herself
    // (distributeNewCard filters: possibleTargets = players where id ≠ trapper.id)
    const cardTarget = gameplay.locator('.card-target');
    await cardTarget.waitFor({ state: 'visible', timeout: 5_000 });
    const targetName = await cardTarget.innerText();
    expect(targetName.trim()).not.toBe(trapperName);
  });
});
