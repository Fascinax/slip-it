import { Page, Locator } from '@playwright/test';

/**
 * Base class shared by all Page Objects.
 * Provides Shadow-DOM–aware helpers for Ionic web components.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Fill an Ionic `<ion-input>` by piercing its Shadow DOM.
   * Playwright automatically pierces shadow roots when chaining locators.
   *
   * @param selector CSS/attribute selector targeting the `<ion-input>` host element
   * @param value    String to type into the native input
   */
  async fillIonInput(selector: string, value: string): Promise<void> {
    const ionInput: Locator = this.page.locator(selector);
    await ionInput.waitFor({ state: 'attached' });
    const nativeInput: Locator = ionInput.locator('input');
    await nativeInput.waitFor({ state: 'visible' });
    // Fill the native input (visual value)
    await nativeInput.fill(value);
    // Angular's CVA @HostListener('ionInput') lives on the HOST <ion-input> element.
    // Set el.value on the host and dispatch ionInput on the HOST so the reactive
    // form control is updated and Angular change detection runs.
    await ionInput.evaluate((el: any, v: string) => {
      el.value = v;
      el.dispatchEvent(new CustomEvent('ionInput', { detail: { value: v }, bubbles: true }));
    }, value);
    // Allow Angular to run change detection before the next action.
    await this.page.waitForTimeout(150);
  }

  /** Wait for the URL to match a pattern (string fragment or RegExp). */
  async waitForNavigation(urlPattern: string | RegExp, timeout = 12_000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }
}
