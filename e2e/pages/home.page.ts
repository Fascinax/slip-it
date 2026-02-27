import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/home` — the app entry screen. */
export class HomePage extends BasePage {
  readonly btnNewGame: Locator;
  readonly btnResumeGame: Locator;
  readonly heroTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.btnNewGame    = page.locator('[data-testid="btn-new-game"]');
    this.btnResumeGame = page.locator('[data-testid="btn-resume-game"]');
    this.heroTitle     = page.locator('.home-hero__title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/home');
    await this.page.waitForLoadState('networkidle');
  }

  async clickNewGame(): Promise<void> {
    await this.btnNewGame.click();
    await this.waitForNavigation(/game-setup/);
  }

  async clickResumeGame(): Promise<void> {
    await this.btnResumeGame.click();
  }
}
