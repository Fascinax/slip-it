import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for `/game-setup` — adding players and configuring the game. */
export class GameSetupPage extends BasePage {
  readonly btnStartGame: Locator;
  readonly playerCountBadge: Locator;
  readonly warningText: Locator;
  readonly inputPlayerName: Locator;
  readonly btnAddPlayer: Locator;
  readonly title: Locator;
  readonly ionToast: Locator;
  readonly addPlayerComponent: Locator;
  readonly playerList: Locator;
  readonly advancedToggle: Locator;
  readonly toggleContinuousMode: Locator;
  readonly toggleTimerEnabled: Locator;
  readonly toggleChainMode: Locator;
  readonly inputCustomWord: Locator;
  readonly btnAddCustomWord: Locator;
  readonly customWordChips: Locator;
  readonly customWordsHint: Locator;
  readonly categoriesItem: Locator;
  readonly roundsItem: Locator;

  constructor(page: Page) {
    super(page);
    this.btnStartGame         = page.locator('[data-testid="btn-start-game"]');
    this.playerCountBadge     = page.locator('[data-testid="player-count-badge"]');
    this.warningText          = page.getByText('Minimum 3 joueurs requis');
    this.inputPlayerName      = page.locator('[data-testid="input-player-name"]');
    this.btnAddPlayer         = page.locator('[data-testid="btn-add-player"]');
    this.title                = page.locator('ion-title').first();
    this.ionToast             = page.locator('ion-toast');
    this.addPlayerComponent   = page.locator('app-add-player');
    this.playerList           = page.locator('app-player-list');
    this.advancedToggle       = page.locator('.advanced-toggle');
    this.toggleContinuousMode = page.locator('[data-testid="toggle-continuous-mode"]');
    this.toggleTimerEnabled   = page.locator('[data-testid="toggle-timer-enabled"]');
    this.toggleChainMode      = page.locator('[data-testid="toggle-chain-mode"]');
    this.inputCustomWord      = page.locator('[data-testid="input-custom-word"]');
    this.btnAddCustomWord     = page.locator('[data-testid="btn-add-custom-word"]');
    this.customWordChips      = page.locator('[data-testid="chip-custom-word"]');
    this.customWordsHint      = page.locator('.cw-hint');
    this.categoriesItem       = page.locator('[data-testid="item-categories"]');
    this.roundsItem           = page.locator('ion-item').filter({ hasText: 'Nombre de manches' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/game-setup');
    await this.page.waitForLoadState('networkidle');
  }

  async addPlayer(name: string): Promise<void> {
    await this.fillIonInput('[data-testid="input-player-name"]', name);
    await this.page.waitForTimeout(150);
    await this.btnAddPlayer.click();
    await this.page.waitForTimeout(200);
  }

  async clickStartGame(): Promise<void> {
    await this.btnStartGame.dispatchEvent('click');
    await this.waitForNavigation(/card-deal/);
  }

  async getPlayerCount(): Promise<number> {
    const text = await this.playerCountBadge.innerText();
    return parseInt(text.trim(), 10);
  }

  /** Return the player list item row for the given name. */
  playerListItem(name: string): Locator {
    return this.playerList.locator('ion-item').filter({ hasText: name });
  }

  /** Click the danger button to remove a player by name. */
  async removePlayer(name: string): Promise<void> {
    await this.playerListItem(name)
      .locator('ion-button[color="danger"]')
      .dispatchEvent('click');
    await this.page.waitForTimeout(300);
  }

  /** Expand the "Paramètres avancés" section. */
  async expandAdvancedSettings(): Promise<void> {
    await this.advancedToggle.click();
    await this.page.waitForTimeout(300);
  }

  /** Activate an ion-toggle by dispatching ionChange on its host. */
  async activateIonToggle(testId: string): Promise<void> {
    const toggle = this.page.locator(`[data-testid="${testId}"]`);
    await toggle.waitFor({ state: 'attached' });
    await toggle.evaluate((el: any) => {
      el.checked = true;
      el.dispatchEvent(
        new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }),
      );
    });
    await this.page.waitForTimeout(150);
  }

  /** Set the value of an ion-select by dispatching ionChange. */
  async setIonSelectValue(filterText: string, value: string | number): Promise<void> {
    const select = this.page.locator('ion-item').filter({ hasText: filterText }).locator('ion-select');
    await select.waitFor({ state: 'attached' });
    await select.evaluate((el: any, v: string | number) => {
      el.value = v;
      el.dispatchEvent(new CustomEvent('ionChange', { detail: { value: v }, bubbles: true }));
    }, value);
    await this.page.waitForTimeout(150);
  }

  /** Fill the custom word input (without clicking add). */
  async fillCustomWordInput(word: string): Promise<void> {
    const ionInput = this.inputCustomWord;
    const nativeInput = ionInput.locator('input');
    await nativeInput.waitFor({ state: 'visible' });
    await nativeInput.fill(word);
    await ionInput.evaluate((el: any, v: string) => {
      el.value = v;
      el.dispatchEvent(new CustomEvent('ionInput', { detail: { value: v }, bubbles: true }));
    }, word);
    await this.page.waitForTimeout(150);
  }

  /** Add a custom word via the input + button. */
  async addCustomWord(word: string): Promise<void> {
    await this.fillCustomWordInput(word);
    await this.btnAddCustomWord.click();
    await this.page.waitForTimeout(200);
  }
}
