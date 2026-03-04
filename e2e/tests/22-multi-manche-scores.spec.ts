import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameplayPage } from '../pages/gameplay.page';
import { CardDealPage } from '../pages/card-deal.page';
import { ScoreboardPage } from '../pages/scoreboard.page';

async function proceedToNextRound(page: import('@playwright/test').Page): Promise<void> {
  const gameplay = new GameplayPage(page);
  await gameplay.nextRound();
  const sb = new ScoreboardPage(page);
  await sb.dealNextRound();
  await page.waitForURL(/card-deal/, { timeout: 10_000 });
  const deal = new CardDealPage(page);
  for (const _ of DEFAULT_PLAYERS) {
    await deal.dealCardForPlayer();
  }
  await page.waitForURL(/gameplay/, { timeout: 10_000 });
}

test.describe('Accumulation de scores entre manches', () => {

  test('un piège en R1 + un piège en R2 = score cumulé de 2', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToNextRound(page);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('2', { timeout: 5_000 });
  });

  test('deux joueurs différents piègent dans des manches différentes', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToNextRound(page);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[1].name);
    await page.waitForTimeout(300);

    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[1].name)).toContainText('1', { timeout: 5_000 });
  });

  test('le score apparaît correctement sur le scoreboard inter-manche', async ({ page, gameplayPage, scoreboardPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await gameplayPage.nextRound();
    await expect(page).toHaveURL(/scoreboard/, { timeout: 10_000 });

    const aliceEntry = scoreboardPage.entryFor(DEFAULT_PLAYERS[0].name);
    await expect(aliceEntry.locator('app-score-badge')).toContainText('1', { timeout: 5_000 });
  });

  test('un joueur qui piège en R1 et R2 a un score supérieur au classement', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    await proceedToNextRound(page);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(300);

    const firstRankRow = gameplayPage.rankingRows.first();
    await expect(firstRankRow).toContainText(DEFAULT_PLAYERS[0].name, { timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('2', { timeout: 5_000 });
  });
});
