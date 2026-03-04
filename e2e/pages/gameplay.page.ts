import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/gameplay` — the main in-round action screen. */
export class GameplayPage extends BasePage {
  readonly btnNextRound: Locator;
  readonly btnEndGame: Locator;
  readonly countdownTimer: Locator;
  readonly continuousHint: Locator;
  readonly title: Locator;
  readonly rankingCard: Locator;
  readonly rankingRows: Locator;
  readonly quickRankingTitle: Locator;
  readonly ionModal: Locator;
  readonly ionAlert: Locator;
  readonly ionToast: Locator;
  readonly passPhoneCard: Locator;
  readonly btnRevealCard: Locator;
  readonly btnCloseCard: Locator;
  readonly cardWord: Locator;
  readonly cardTarget: Locator;
  readonly timerValue: Locator;
  readonly allMyCardButtons: Locator;
  readonly allDeclareTrapButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.btnNextRound      = page.locator('[data-testid="btn-next-round"]');
    this.btnEndGame        = page.locator('[data-testid="btn-end-game"]');
    this.countdownTimer    = page.locator('app-countdown-timer');
    this.continuousHint    = page.locator('.continuous-hint');
    this.title             = page.locator('app-gameplay ion-title').first();
    this.rankingCard       = page.locator('.ranking-card');
    this.rankingRows       = page.locator('.ranking-row');
    this.quickRankingTitle = page.getByText('Classement rapide');
    this.ionModal          = page.locator('ion-modal');
    this.ionAlert          = page.locator('ion-alert');
    this.ionToast          = page.locator('ion-toast');
    this.passPhoneCard     = page.locator('.pass-phone-card');
    this.btnRevealCard     = page.locator('[data-testid="btn-reveal-card"]');
    this.btnCloseCard      = page.locator('[data-testid="btn-close-card"]');
    this.cardWord          = page.locator('.card-word');
    this.cardTarget        = page.locator('.card-target');
    this.timerValue        = page.locator('app-countdown-timer .timer-value');
    this.allMyCardButtons      = page.locator('[data-testid="btn-my-card"]');
    this.allDeclareTrapButtons = page.locator('[data-testid="btn-declare-trap"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/gameplay');
    await this.page.waitForLoadState('networkidle');
  }

  /** Return the "Ma carte" button for a player row. */
  myCardButtonFor(playerName: string): Locator {
    return this.page
      .locator('ion-item')
      .filter({ hasText: playerName })
      .locator('[data-testid="btn-my-card"]');
  }

  /** Return the "Piégé !" button for a player row. */
  declareTrapButtonFor(playerName: string): Locator {
    return this.page
      .locator('ion-item')
      .filter({ hasText: playerName })
      .locator('[data-testid="btn-declare-trap"]');
  }

  /** Return the ranking row for a player. */
  rankingRowFor(playerName: string): Locator {
    return this.rankingRows.filter({ hasText: playerName });
  }

  /** Return the score badge inside the ranking row of a player. */
  scoreBadgeFor(playerName: string): Locator {
    return this.rankingRowFor(playerName).locator('app-score-badge');
  }

  /** Return the player item row scoped to app-gameplay. */
  playerItemFor(playerName: string): Locator {
    return this.page
      .locator('app-gameplay ion-item')
      .filter({ hasText: playerName });
  }

  /**
   * Full card-view flow: click "Ma carte", reveal, read, close.
   */
  async viewMyCard(playerName: string): Promise<{ target: string; word: string }> {
    await this.myCardButtonFor(playerName).click();
    await this.btnRevealCard.click();
    await this.cardWord.last().waitFor({ state: 'visible', timeout: 5_000 });

    const target = await this.cardTarget.last().innerText().catch(() => '');
    const word   = await this.cardWord.last().innerText().catch(() => '');

    await this.btnCloseCard.click();
    return { target, word };
  }

  /** Click "Ma carte" and wait for the pass-phone card to appear. */
  async openPassPhoneFor(playerName: string): Promise<void> {
    await this.myCardButtonFor(playerName).click();
    await this.passPhoneCard.waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** Click "Voir ma carte" (reveal) and wait for card-word visible. */
  async revealCard(): Promise<void> {
    await this.btnRevealCard.click();
    await this.cardWord.last().waitFor({ state: 'visible', timeout: 5_000 });
  }

  /** Close the revealed card and wait for the close button to disappear. */
  async closeCard(): Promise<void> {
    await this.btnCloseCard.click();
    await this.btnCloseCard.waitFor({ state: 'hidden', timeout: 3_000 });
  }

  /** Cancel the pass-phone flow. */
  async cancelPassPhone(): Promise<void> {
    await this.passPhoneCard.getByText('Annuler').click();
    await this.page.waitForTimeout(300);
  }

  /** Click "Piégé !" for a player (opens the trap modal). If no name given, clicks the first button. */
  async declareTrap(playerName?: string): Promise<void> {
    if (playerName) {
      await this.declareTrapButtonFor(playerName).click();
    } else {
      await this.allDeclareTrapButtons.first().click();
    }
  }

  /** Confirm the open trap modal ("Oui, valider"). */
  async confirmTrapModal(): Promise<void> {
    const modal = this.ionModal;
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  /** Reject the open trap modal ("Non, rejeter"). */
  async rejectTrapModal(): Promise<void> {
    const modal = this.ionModal;
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Non, rejeter' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  /** Declare + validate a trap for a player (full flow). */
  async validateTrapFor(playerName: string): Promise<void> {
    await this.declareTrap(playerName);
    await this.confirmTrapModal();
    await this.page.waitForTimeout(400);
  }

  /** Declare + reject a trap for a player (full flow). */
  async rejectTrapFor(playerName: string): Promise<void> {
    await this.declareTrap(playerName);
    await this.rejectTrapModal();
  }

  /** Click "Distribuer" in the new-card alert (continuous mode). */
  async distributeNewCardViaAlert(): Promise<void> {
    const alert = this.ionAlert;
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Distribuer' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });
    await this.page.waitForTimeout(500);
  }

  /** Click "Plus tard" in the new-card alert (continuous mode). */
  async dismissNewCardAlert(): Promise<void> {
    const alert = this.ionAlert;
    await alert.waitFor({ state: 'visible', timeout: 6_000 });
    await alert.getByRole('button', { name: 'Plus tard' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  /** Navigate to the scoreboard (next round). */
  async nextRound(): Promise<void> {
    await this.btnNextRound.dispatchEvent('click');
    const alert = this.ionAlert;
    await alert.waitFor({ state: 'visible', timeout: 5_000 });
    await alert.getByRole('button', { name: 'Suivant' }).click();
    await this.waitForNavigation(/scoreboard/);
  }

  /** Cancel the "Manche suivante" alert. */
  async cancelNextRound(): Promise<void> {
    await this.btnNextRound.dispatchEvent('click');
    const alert = this.ionAlert;
    await alert.waitFor({ state: 'visible', timeout: 5_000 });
    await alert.getByRole('button', { name: 'Annuler' }).click();
    await alert.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  /** Navigate to the game-end page. */
  async endGame(): Promise<void> {
    await this.btnEndGame.dispatchEvent('click');
    const modal = this.ionModal.last();
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    const confirmBtn = modal.getByRole('button', { name: 'Terminer' });
    await confirmBtn.dispatchEvent('click');
    await this.waitForNavigation(/game-end/);
  }

  /** Open the end-game confirm dialog then cancel it. */
  async cancelEndGameDialog(): Promise<void> {
    await this.btnEndGame.dispatchEvent('click');
    const modal = this.ionModal.last();
    await modal.waitFor({ state: 'visible', timeout: 5_000 });
    await modal.getByRole('button', { name: 'Annuler' }).dispatchEvent('click');
    await modal.waitFor({ state: 'hidden', timeout: 5_000 });
  }

  /** Returns all player names visible in the quick-ranking card. */
  async getRankingNames(): Promise<string[]> {
    return this.page.locator('.player-name').allInnerTexts();
  }
}
