import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/home` — the app entry screen. */
export class HomePage extends BasePage {
  readonly btnNewGame: Locator;
  readonly btnResumeGame: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly btnHistory: Locator;

  constructor(page: Page) {
    super(page);
    this.btnNewGame    = page.locator('[data-testid="btn-new-game"]');
    this.btnResumeGame = page.locator('[data-testid="btn-resume-game"]');
    this.heroTitle     = page.locator('.home-hero__title');
    this.heroSubtitle  = page.locator('.home-hero__subtitle');
    this.btnHistory    = page.locator('[data-testid="btn-history"]');
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

  async clickHistory(): Promise<void> {
    await this.btnHistory.click();
    await this.waitForNavigation(/history/);
  }
}
