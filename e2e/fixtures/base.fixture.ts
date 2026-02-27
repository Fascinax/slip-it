import { test as base } from '@playwright/test';
import { HomePage }      from '../pages/home.page';
import { GameSetupPage } from '../pages/game-setup.page';
import { CardDealPage }  from '../pages/card-deal.page';
import { GameplayPage }  from '../pages/gameplay.page';
import { ScoreboardPage } from '../pages/scoreboard.page';
import { GameEndPage }   from '../pages/game-end.page';

/** Strongly-typed fixture map for all POM instances. */
type AppFixtures = {
  homePage:      HomePage;
  gameSetupPage: GameSetupPage;
  cardDealPage:  CardDealPage;
  gameplayPage:  GameplayPage;
  scoreboardPage: ScoreboardPage;
  gameEndPage:   GameEndPage;
};

/**
 * Extended `test` function that injects POM instances for all pages.
 *
 * @example
 * import { test, expect } from '../fixtures/base.fixture';
 *
 * test('navigates home', async ({ homePage }) => {
 *   await homePage.goto();
 *   await expect(homePage.btnNewGame).toBeVisible();
 * });
 */
export const test = base.extend<AppFixtures>({
  homePage:       async ({ page }, use) => { await use(new HomePage(page)); },
  gameSetupPage:  async ({ page }, use) => { await use(new GameSetupPage(page)); },
  cardDealPage:   async ({ page }, use) => { await use(new CardDealPage(page)); },
  gameplayPage:   async ({ page }, use) => { await use(new GameplayPage(page)); },
  scoreboardPage: async ({ page }, use) => { await use(new ScoreboardPage(page)); },
  gameEndPage:    async ({ page }, use) => { await use(new GameEndPage(page)); },
});

export { expect } from '@playwright/test';
