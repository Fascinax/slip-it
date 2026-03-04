import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/history` — game history list. */
export class HistoryPage extends BasePage {
  readonly historyCards: Locator;
  readonly deleteButtons: Locator;
  readonly emptyStateText: Locator;

  constructor(page: Page) {
    super(page);
    this.historyCards   = page.locator('[data-testid="history-card"]');
    this.deleteButtons  = page.locator('[data-testid="btn-delete-history-entry"]');
    this.emptyStateText = page.getByText('Aucune partie enregistrée');
  }

  async goto(): Promise<void> {
    await this.page.goto('/history');
    await this.page.waitForLoadState('networkidle');
  }

  /** Delete the first history entry. */
  async deleteFirstEntry(): Promise<void> {
    await this.deleteButtons.first().click();
    await this.page.waitForTimeout(500);
  }
}
