import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/game-end` — final results and winner podium. */
export class GameEndPage extends BasePage {
  readonly winnerName: Locator;
  readonly winnerSubtitle: Locator;
  readonly btnNewGame: Locator;
  readonly statsCard: Locator;
  /** v1.2 — Rejouer avec la même équipe */
  readonly btnReplay: Locator;
  /** v1.2 — Partager le podium (Web Share) */
  readonly btnSharePodium: Locator;
  /** v1.2 — Section d’historique des pièges */
  readonly trapHistoryHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.winnerName       = page.locator('.winner-name');
    this.winnerSubtitle   = page.locator('.winner-subtitle');
    this.btnNewGame       = page.locator('[data-testid="btn-new-game-end"]');
    this.statsCard        = page.locator('.stats-card-premium');
    this.btnReplay        = page.locator('[data-testid="btn-replay"]');
    this.btnSharePodium   = page.locator('[data-testid="btn-share-podium"]');
    this.trapHistoryHeader = page.getByText(/Historique des pièges/);
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
    await this.btnNewGame.dispatchEvent('click');
    await this.waitForNavigation(/home/);
  }

  /** v1.2 — Click "Rejouer" to replay with the same team. */
  async clickReplay(): Promise<void> {
    await this.btnReplay.dispatchEvent('click');
    await this.waitForNavigation(/game-setup/);
  }

  /** Returns all player names from the final podium list. */
  async getPodiumNames(): Promise<string[]> {
    return this.page
      .locator('.podium-entry')
      .locator('.podium-entry__name')
      .allInnerTexts();
  }
}
