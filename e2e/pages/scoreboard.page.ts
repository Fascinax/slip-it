import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/scoreboard` — between-round ranking. */
export class ScoreboardPage extends BasePage {
  readonly entries: Locator;
  readonly title: Locator;
  readonly entryNames: Locator;
  readonly entryScores: Locator;
  readonly firstEntries: Locator;
  readonly btnDealNextRound: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.entries          = page.locator('.scoreboard-entry');
    this.title            = page.locator('app-scoreboard ion-title').first();
    this.entryNames       = page.locator('.scoreboard-entry__name');
    this.entryScores      = page.locator('app-score-badge.scoreboard-entry__score');
    this.firstEntries     = page.locator('.scoreboard-entry--first');
    this.btnDealNextRound = page.locator('[data-testid="btn-deal-next-round"]');
    this.backButton       = page.locator('app-scoreboard ion-back-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/scoreboard');
    await this.page.waitForLoadState('networkidle');
  }

  /** Returns all player names from the ranking list in order. */
  async getPlayerNames(): Promise<string[]> {
    return this.entryNames.allInnerTexts();
  }

  /** Returns the name of the first-place player. */
  async getTopPlayer(): Promise<string> {
    return this.page
      .locator('.scoreboard-entry--first .scoreboard-entry__name')
      .innerText();
  }

  /** Return the scoreboard entry row for a player. */
  entryFor(playerName: string): Locator {
    return this.entries.filter({ hasText: playerName });
  }

  /** Click "Distribuer les cartes" to start the next round deal. */
  async dealNextRound(): Promise<void> {
    await this.btnDealNextRound.dispatchEvent('click');
    await this.waitForNavigation(/card-deal/);
  }

  /** Tap the back button to return to gameplay. */
  async backToGameplay(): Promise<void> {
    await this.backButton.dispatchEvent('click');
    await this.waitForNavigation(/gameplay/);
  }
}
