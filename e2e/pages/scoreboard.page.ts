import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/scoreboard` — between-round ranking. */
export class ScoreboardPage extends BasePage {
  readonly entries: Locator;

  constructor(page: Page) {
    super(page);
    this.entries = page.locator('.scoreboard-entry');
  }

  async goto(): Promise<void> {
    await this.page.goto('/scoreboard');
    await this.page.waitForLoadState('networkidle');
  }

  /** Returns all player names from the ranking list in order. */
  async getPlayerNames(): Promise<string[]> {
    return this.page.locator('.scoreboard-entry__name').allInnerTexts();
  }

  /** Returns the name of the first-place player. */
  async getTopPlayer(): Promise<string> {
    return this.page
      .locator('.scoreboard-entry--first .scoreboard-entry__name')
      .innerText();
  }

  /** Tap the back button to return to gameplay. */
  async backToGameplay(): Promise<void> {
    await this.page.locator('ion-back-button').click();
    await this.waitForNavigation(/gameplay/);
  }
}
