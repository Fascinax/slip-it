/**
 * Screenshot capture suite — generates docs/screenshots/*.png
 *
 * Usage:
 *   npx playwright test e2e/tests/00-screenshots.spec.ts
 *
 * Each test corresponds to one screen and runs serially to keep the dev
 * server load low. Tests are independent (isolated BrowserContext = fresh
 * localStorage per test).
 */

import path from 'path';
import { test } from '../fixtures/base.fixture';
import {
  setupGame,
  runToGameplay,
  runToGameEnd,
  DEFAULT_PLAYERS,
} from '../helpers/game.helper';

// ── Viewport ──────────────────────────────────────────────────────────────────
// iPhone 14 dimensions for a realistic mobile screenshot.
const MOBILE = { width: 390, height: 844 };

// ── Output directory ──────────────────────────────────────────────────────────
const DIR = path.join(__dirname, '..', '..', 'docs', 'screenshots');
const out = (name: string) => path.join(DIR, name);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Wait for fonts and Ionic animations to settle before capturing. */
async function settle(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400); // let Ionic entrance animations finish
}

// ── Suite ─────────────────────────────────────────────────────────────────────

test.describe('Screenshots', () => {
  // Run sequentially — one browser context at a time.
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: MOBILE });

  // ── 1. Home ────────────────────────────────────────────────────────────────
  test('home', async ({ page, homePage }) => {
    await homePage.goto();
    await homePage.btnNewGame.waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('home.png') });
  });

  // ── 2. Game setup (3 players added) ───────────────────────────────────────
  test('game-setup', async ({ page, gameSetupPage }) => {
    await gameSetupPage.goto();
    for (const p of DEFAULT_PLAYERS) {
      await gameSetupPage.addPlayer(p.name);
    }
    await gameSetupPage.btnStartGame.waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('game-setup.png') });
  });

  // ── 3. Card deal (waiting screen, before the first flip) ──────────────────
  test('card-deal', async ({ page, cardDealPage }) => {
    await setupGame(page, DEFAULT_PLAYERS);
    // setupGame ends on /card-deal — screenshot before any player interaction.
    await cardDealPage.btnImReady.waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('card-deal.png') });
  });

  // ── 4. Gameplay (quick-ranking + player list visible) ─────────────────────
  test('gameplay', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await gameplayPage.rankingCard.waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('gameplay.png') });
  });

  // ── 5. Scoreboard (after round 1) ─────────────────────────────────────────
  test('scoreboard', async ({ page, gameplayPage, scoreboardPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await gameplayPage.nextRound();
    await scoreboardPage.entries.first().waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('scoreboard.png') });
  });

  // ── 6. Game end (podium) ──────────────────────────────────────────────────
  test('game-end', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await gameEndPage.winnerName.waitFor({ state: 'visible' });
    await settle(page);
    await page.screenshot({ path: out('game-end.png') });
  });
});
