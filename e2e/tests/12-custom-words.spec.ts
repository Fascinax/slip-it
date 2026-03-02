import { test, expect } from '../fixtures/base.fixture';

// --------------------------------------------------------------------------
// Helpers : saisie dans ion-input (shadow DOM) + clic "Ajouter"
// --------------------------------------------------------------------------
async function fillCustomWordInput(
  page: import('@playwright/test').Page,
  word: string,
): Promise<void> {
  const ionInput = page.locator('[data-testid="input-custom-word"]');
  const nativeInput = ionInput.locator('input');
  await nativeInput.waitFor({ state: 'visible' });
  await nativeInput.fill(word);
  // Dispatch ionInput on the host so Angular's CVA reactive form control updates
  await ionInput.evaluate((el: any, v: string) => {
    el.value = v;
    el.dispatchEvent(new CustomEvent('ionInput', { detail: { value: v }, bubbles: true }));
  }, word);
  await page.waitForTimeout(150);
}

async function addCustomWord(
  page: import('@playwright/test').Page,
  word: string,
): Promise<void> {
  await fillCustomWordInput(page, word);
  await page.locator('[data-testid="btn-add-custom-word"]').click();
  await page.waitForTimeout(200);
}

// --------------------------------------------------------------------------
// Suite — composant mots personnalisés (game-setup)
// --------------------------------------------------------------------------
test.describe('Mots personnalisés — composant chip (/game-setup)', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  // Happy path : ajout

  test('l\'indice "Ces mots seront ajoutés" est visible quand la liste est vide', async ({ page }) => {
    await expect(page.locator('.cw-hint')).toBeVisible();
  });

  test('ajouter un mot fait apparaître un chip avec ce mot', async ({ page }) => {
    await addCustomWord(page, 'Sorcière');
    await expect(
      page.locator('[data-testid="chip-custom-word"]').filter({ hasText: 'Sorcière' }),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('ajouter deux mots distincts affiche deux chips', async ({ page }) => {
    await addCustomWord(page, 'Dragon');
    await addCustomWord(page, 'Vampire');
    await expect(page.locator('[data-testid="chip-custom-word"]')).toHaveCount(2, { timeout: 3_000 });
  });

  test('l\'indice disparaît dès qu\'un mot est ajouté', async ({ page }) => {
    await addCustomWord(page, 'Zombie');
    await expect(page.locator('.cw-hint')).not.toBeVisible({ timeout: 3_000 });
  });

  // Happy path : normalisation du mot

  test('le mot est normalisé : première lettre majuscule, reste minuscule ("testMOT" → "Testmot")', async ({ page }) => {
    // CustomWordsComponent.addWord() normalizes:
    // raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
    await addCustomWord(page, 'testMOT');
    await expect(
      page.locator('[data-testid="chip-custom-word"]'),
    ).toContainText('Testmot', { timeout: 3_000 });
  });

  // Sad path : suppression

  test('cliquer × sur un chip retire ce mot de la liste', async ({ page }) => {
    await addCustomWord(page, 'Loup-garou');
    const chip = page.locator('[data-testid="chip-custom-word"]').filter({ hasText: 'Loup-garou' });
    await chip.waitFor({ state: 'visible', timeout: 3_000 });
    // The close icon inside the chip
    await chip.locator('ion-icon[name="close-circle"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="chip-custom-word"]')).toHaveCount(0);
  });

  // Sad path : doublon dans les mots personnalisés (même mot normalisé)

  test('ajouter un doublon ne crée pas un second chip', async ({ page }) => {
    await addCustomWord(page, 'Fantôme');
    // Add the exact same normalized word again
    await addCustomWord(page, 'Fantôme');
    await expect(page.locator('[data-testid="chip-custom-word"]')).toHaveCount(1);
  });
});
