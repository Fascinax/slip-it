import { Page } from '@playwright/test';
import { GameSetupPage } from '../pages/game-setup.page';
import { CardDealPage }  from '../pages/card-deal.page';
import { GameplayPage }  from '../pages/gameplay.page';

/** Shape of player test data. */
export interface PlayerData {
  name: string;
}

/** Default set of 3 players for most tests. */
export const DEFAULT_PLAYERS: PlayerData[] = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
];

/**
 * Navigate to `/game-setup`, add all `players`, then click "Distribuer les cartes"
 * so the test lands on the `/card-deal` page ready to distribute.
 *
 * @param beforeStart Optional async callback executed after adding players but
 *                    BEFORE clicking start, useful for toggling game settings.
 */
export async function setupGame(
  page: Page,
  players: PlayerData[] = DEFAULT_PLAYERS,
  beforeStart?: (page: Page) => Promise<void>,
): Promise<void> {
  const setup = new GameSetupPage(page);
  await setup.goto();
  for (const player of players) {
    await setup.addPlayer(player.name);
  }
  if (beforeStart) {
    await beforeStart(page);
  }
  await setup.clickStartGame();
}

/**
 * On the `/card-deal` page, run the full card-flip + confirm flow
 * for every player in `players` (in order).
 * After the last player confirms, the app navigates to `/gameplay`.
 */
export async function dealAllCards(
  page: Page,
  players: PlayerData[] = DEFAULT_PLAYERS,
): Promise<void> {
  const deal = new CardDealPage(page);
  for (const _player of players) {
    await deal.dealCardForPlayer();
  }
}

/**
 * Convenience helper that calls `setupGame` then `dealAllCards`,
 * leaving the browser on `/gameplay`.
 */
export async function runToGameplay(
  page: Page,
  players: PlayerData[] = DEFAULT_PLAYERS,
  beforeStart?: (page: Page) => Promise<void>,
): Promise<void> {
  await setupGame(page, players, beforeStart);
  await dealAllCards(page, players);
}

/**
 * v1.2 — Convenience helper that runs a full game and lands on `/game-end`.
 * Optionally declares + validates a trap for the first player before ending.
 */
export async function runToGameEnd(
  page: Page,
  players: PlayerData[] = DEFAULT_PLAYERS,
  opts: { validateTrap?: boolean; beforeStart?: (page: Page) => Promise<void> } = {},
): Promise<void> {
  await runToGameplay(page, players, opts.beforeStart);

  if (opts.validateTrap) {
    // Click "Piege !" for first player
    await page
      .locator('ion-item')
      .filter({ hasText: players[0].name })
      .locator('[data-testid="btn-declare-trap"]')
      .click();
    // Confirm modal
    const modal = page.locator('ion-modal');
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    // Wait for the trap modal to fully dismiss before endGame opens another modal
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  const gp = new GameplayPage(page);
  await gp.endGame();
}
