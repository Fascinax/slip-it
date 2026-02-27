import { Page } from '@playwright/test';
import { GameSetupPage } from '../pages/game-setup.page';
import { CardDealPage }  from '../pages/card-deal.page';

/** Shape of player test data. */
export interface PlayerData {
  name: string;
  /** 4-6 digit PIN used during registration and card-deal verification */
  pin: string;
}

/** Default set of 3 players for most tests. */
export const DEFAULT_PLAYERS: PlayerData[] = [
  { name: 'Alice',   pin: '1234' },
  { name: 'Bob',     pin: '5678' },
  { name: 'Charlie', pin: '9012' },
];

/**
 * Navigate to `/game-setup`, add all `players`, then click "Distribuer les cartes"
 * so the test lands on the `/card-deal` page ready to distribute.
 */
export async function setupGame(
  page: Page,
  players: PlayerData[] = DEFAULT_PLAYERS,
): Promise<void> {
  const setup = new GameSetupPage(page);
  await setup.goto();
  for (const player of players) {
    await setup.addPlayer(player.name, player.pin);
  }
  await setup.clickStartGame();
}

/**
 * On the `/card-deal` page, run the full PIN + card-flip + confirm flow
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
): Promise<void> {
  await setupGame(page, players);
  await dealAllCards(page, players);
}
