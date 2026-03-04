import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/card-deal` — the card distribution screen. */
export class CardDealPage extends BasePage {
  /** "Voir ma carte" button shown in WAITING state */
  readonly btnImReady: Locator;
  /** "J'ai mémorisé, suivant" button shown after the card is flipped */
  readonly btnConfirmCard: Locator;
  /** Target player name shown on the card back */
  readonly cardTarget: Locator;
  /** Secret word shown on the card back */
  readonly cardWord: Locator;
  /** The app-card-flip custom element */
  readonly cardFlip: Locator;
  /** The inner .card-scene element that gains the .card--flipped class */
  readonly cardScene: Locator;
  /** Name of the player currently being invited to deal */
  readonly inviteName: Locator;
  /** Progress indicator (e.g. "1/3") */
  readonly dealProgress: Locator;

  constructor(page: Page) {
    super(page);
    this.btnImReady    = page.locator('[data-testid="btn-im-ready"]');
    this.btnConfirmCard = page.locator('[data-testid="btn-confirm-card"]');
    this.cardTarget    = page.locator('[data-testid="card-target"]');
    this.cardWord      = page.locator('[data-testid="card-word"]');
    this.cardFlip      = page.locator('app-card-flip');
    this.cardScene     = page.locator('.card-scene');
    this.inviteName    = page.locator('.deal-invite__name');
    this.dealProgress  = page.locator('.deal-invite__progress, .deal-progress');
  }

  async goto(): Promise<void> {
    await this.page.goto('/card-deal');
    await this.page.waitForLoadState('networkidle');
  }

  /** Click "Voir ma carte" to enter SHOWING_CARD state (card face-down). */
  async clickShowCard(): Promise<void> {
    await this.btnImReady.waitFor({ state: 'visible' });
    await this.btnImReady.click();
    await this.cardFlip.waitFor({ state: 'visible', timeout: 8_000 });
  }

  /** Click the card to flip it and reveal the secret word. */
  async flipCard(): Promise<void> {
    await this.cardFlip.click();
    await this.page.waitForTimeout(800);
  }

  /**
   * Complete the full card-deal flow for a single player:
   * 1. Click "Voir ma carte"
   * 2. Click the card to flip it
   * 3. Read card content
   * 4. Click "J'ai mémorisé, suivant"
   */
  async dealCardForPlayer(): Promise<{ target: string; word: string }> {
    await this.clickShowCard();
    await this.flipCard();

    const target = await this.cardTarget.innerText().catch(() => '');
    const word   = await this.cardWord.innerText().catch(() => '');

    await this.btnConfirmCard.waitFor({ state: 'visible', timeout: 3_000 });
    await this.btnConfirmCard.click();
    await this.page.waitForTimeout(300);

    return { target, word };
  }
}
