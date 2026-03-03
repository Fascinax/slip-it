import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, dealAllCards } from '../helpers/game.helper';
import { GameplayPage } from '../pages/gameplay.page';
import { CardDealPage } from '../pages/card-deal.page';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

async function proceedToNextRound(page: import('@playwright/test').Page): Promise<void> {
  const gp = new GameplayPage(page);
  await gp.nextRound();
  await page.locator('[data-testid="btn-deal-next-round"]').dispatchEvent('click');
  await page.waitForURL(/card-deal/, { timeout: 10_000 });
  const deal = new CardDealPage(page);
  for (const _ of DEFAULT_PLAYERS) {
    await deal.dealCardForPlayer();
  }
  await page.waitForURL(/gameplay/, { timeout: 10_000 });
}

// ─── Accumulation de scores multi-manche ────────────────────────────────────
test.describe('Accumulation de scores entre manches', () => {

  test('un piège en R1 + un piège en R2 = score cumulé de 2', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    // R1: Alice traps → score = 1
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    // Go to R2
    await proceedToNextRound(page);

    // R2: Alice traps again → score should be 2
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(aliceRow.locator('app-score-badge')).toContainText('2', { timeout: 5_000 });
  });

  test('deux joueurs différents piègent dans des manches différentes', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    // R1: Alice traps → 1 pt
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToNextRound(page);

    // R2: Bob traps → 1 pt
    await validateTrapFor(page, DEFAULT_PLAYERS[1].name);
    await page.waitForTimeout(300);

    // Both should have 1 pt each
    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(aliceRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
    const bobRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[1].name });
    await expect(bobRow.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('le score apparaît correctement sur le scoreboard inter-manche', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    // R1: Alice traps
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    // Go to scoreboard (not card deal yet)
    const gp = new GameplayPage(page);
    await gp.nextRound();
    await expect(page).toHaveURL(/scoreboard/, { timeout: 10_000 });

    // On scoreboard, Alice should be ranked with score 1
    const aliceEntry = page.locator('.scoreboard-entry').filter({ hasText: DEFAULT_PLAYERS[0].name });
    await expect(aliceEntry.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('un joueur qui piège en R1 et R2 a un score supérieur au classement', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    // R1: Alice traps
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToNextRound(page);

    // R2: Alice traps again → 2 pts, others have 0
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    // Alice should be rank 1 (first row in quick ranking)
    const firstRankRow = page.locator('.ranking-row').first();
    await expect(firstRankRow).toContainText(DEFAULT_PLAYERS[0].name, { timeout: 5_000 });
    await expect(firstRankRow.locator('app-score-badge')).toContainText('2', { timeout: 5_000 });
  });
});
