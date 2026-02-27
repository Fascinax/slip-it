import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/game-end` — final results and winner podium. */
export class GameEndPage extends BasePage {
  readonly winnerName: Locator;
  readonly winnerSubtitle: Locator;
  readonly btnNewGame: Locator;
  readonly statsCard: Locator;

  constructor(page: Page) {
    super(page);
    this.winnerName     = page.locator('.winner-name');
    this.winnerSubtitle = page.locator('.winner-subtitle');
    this.btnNewGame     = page.locator('[data-testid="btn-new-game-end"]');
    this.statsCard      = page.locator('.stats-card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/game-end');
    await this.page.waitForLoadState('networkidle');
  }

  /** Returns the winner's displayed name. */
  async getWinnerName(): Promise<string> {
    return this.winnerName.innerText();
  }

  /** Click "Nouvelle partie" to restart. */
  async clickNewGame(): Promise<void> {
    await this.btnNewGame.click();
    await this.waitForNavigation(/home/);
  }

  /** Returns all player names from the final podium list. */
  async getPodiumNames(): Promise<string[]> {
    return this.page
      .locator('ion-item')
      .filter({ has: this.page.locator('app-score-badge') })
      .locator('ion-label')
      .allInnerTexts();
  }
}
