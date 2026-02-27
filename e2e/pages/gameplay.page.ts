import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/gameplay` — the main in-round action screen. */
export class GameplayPage extends BasePage {
  /** Footer "Manche suivante" button */
  readonly btnNextRound: Locator;
  /** Header "Terminer" stop icon button */
  readonly btnEndGame: Locator;
  /** v1.2 — Countdown timer component */
  readonly countdownTimer: Locator;
  /** v1.2 — Hint shown in continuous mode footer */
  readonly continuousHint: Locator;

  constructor(page: Page) {
    super(page);
    this.btnNextRound   = page.locator('[data-testid="btn-next-round"]');
    this.btnEndGame     = page.locator('[data-testid="btn-end-game"]');
    this.countdownTimer = page.locator('app-countdown-timer');
    this.continuousHint = page.locator('.continuous-hint');
  }

  async goto(): Promise<void> {
    await this.page.goto('/gameplay');
    await this.page.waitForLoadState('networkidle');
  }

  /** Return the "Ma carte" button for the player row containing `playerName`. */
  myCardButtonFor(playerName: string): Locator {
    return this.page
      .locator('ion-item')
      .filter({ hasText: playerName })
      .locator('[data-testid="btn-my-card"]');
  }

  /** Return the "Piégé !" button for the player row containing `playerName`. */
  declareTrapButtonFor(playerName: string): Locator {
    return this.page
      .locator('ion-item')
      .filter({ hasText: playerName })
      .locator('[data-testid="btn-declare-trap"]');
  }

  /**
   * Click "Ma carte" for `playerName`, then "Voir ma carte",
   * read the revealed card content, and close.
   */
  async viewMyCard(playerName: string): Promise<{ target: string; word: string }> {
    await this.myCardButtonFor(playerName).click();
    // Intermediate screen: pass phone
    await this.page.locator('[data-testid="btn-reveal-card"]').click();
    await this.page.waitForTimeout(400);

    const target = await this.page.locator('.card-target').last().innerText().catch(() => '');
    const word   = await this.page.locator('.card-word').last().innerText().catch(() => '');

    // Close the card (marks it as viewed)
    await this.page.locator('[data-testid="btn-close-card"]').click();
    return { target, word };
  }

  /** Declare a trap for `playerName` (click "Piégé !"). */
  async declareTrap(playerName: string): Promise<void> {
    await this.declareTrapButtonFor(playerName).click();
  }

  /** Navigate to the scoreboard (next round). */
  async nextRound(): Promise<void> {
    // btn-next-round is in ion-footer (fixed, outside viewport) — use dispatchEvent
    await this.btnNextRound.dispatchEvent('click');
    // App shows an Ionic Alert — click "Suivant" to confirm
    const alert = this.page.locator('ion-alert');
    await alert.waitFor({ state: 'visible', timeout: 5_000 });
    await alert.getByRole('button', { name: 'Suivant' }).click();
    await this.waitForNavigation(/scoreboard/);
  }

  /** Navigate to the game-end page. */
  async endGame(): Promise<void> {
    await this.btnEndGame.dispatchEvent('click');
    // App shows a ConfirmDialogComponent modal — click "Terminer" to confirm.
    // Use .last() in case a previous modal (e.g. trap confirmation) lingers in DOM.
    const modal = this.page.locator('ion-modal').last();
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    const confirmBtn = modal.getByRole('button', { name: 'Terminer' });
    await confirmBtn.dispatchEvent('click');
    await this.waitForNavigation(/game-end/);
  }

  /** Returns all player names visible in the quick-ranking card. */
  async getRankingNames(): Promise<string[]> {
    return this.page.locator('.player-name').allInnerTexts();
  }
}
