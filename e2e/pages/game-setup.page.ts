import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/game-setup` — adding players and configuring the game. */
export class GameSetupPage extends BasePage {
  /** Footer "Distribuer les cartes" button */
  readonly btnStartGame: Locator;
  /** Badge showing the current player count */
  readonly playerCountBadge: Locator;
  /** In-line warning shown when fewer than 3 players are registered */
  readonly warningText: Locator;
  /** Input for the player name inside the add-player form */
  readonly inputPlayerName: Locator;
  /** Input for the player PIN inside the add-player form */
  readonly inputPlayerPin: Locator;
  /** "Ajouter" submit button in the add-player form */
  readonly btnAddPlayer: Locator;

  constructor(page: Page) {
    super(page);
    this.btnStartGame      = page.locator('[data-testid="btn-start-game"]');
    this.playerCountBadge  = page.locator('[data-testid="player-count-badge"]');
    this.warningText       = page.getByText('Minimum 3 joueurs requis');
    this.inputPlayerName   = page.locator('[data-testid="input-player-name"]');
    this.inputPlayerPin    = page.locator('[data-testid="input-player-pin"]');
    this.btnAddPlayer      = page.locator('[data-testid="btn-add-player"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/game-setup');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a player via the add-player form.
   * Handles shadow-DOM piercing for both ion-input elements.
   */
  async addPlayer(name: string, pin: string): Promise<void> {
    await this.fillIonInput('[data-testid="input-player-name"]', name);
    await this.fillIonInput('[data-testid="input-player-pin"]', pin);
    // Extra wait so Angular validates the form and removes [disabled] from the button
    await this.page.waitForTimeout(200);
    await this.btnAddPlayer.click();
    // Wait for the async addPlayer (hashPin) to resolve and the list to update
    await this.page.waitForTimeout(600);
  }

  /** Click the footer "Distribuer les cartes" button and navigate to card-deal.
   *  dispatchEvent bypasses actionability checks — ion-footer is a fixed element
   *  outside the scrollable viewport so scrollIntoView + force:true still fail.
   */
  async clickStartGame(): Promise<void> {
    await this.btnStartGame.dispatchEvent('click');
    await this.waitForNavigation(/card-deal/);
  }

  /** Read the player count badge as a number. */
  async getPlayerCount(): Promise<number> {
    const text = await this.playerCountBadge.innerText();
    return parseInt(text.trim(), 10);
  }
}
