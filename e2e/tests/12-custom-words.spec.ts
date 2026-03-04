import { test, expect } from '../fixtures/base.fixture';

test.describe('Mots personnalisés — composant chip (/game-setup)', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
  });

  test('l\'indice "Ces mots seront ajoutés" est visible quand la liste est vide', async ({ gameSetupPage }) => {
    await expect(gameSetupPage.customWordsHint).toBeVisible();
  });

  test('ajouter un mot fait apparaître un chip avec ce mot', async ({ gameSetupPage }) => {
    await gameSetupPage.addCustomWord('Sorcière');
    await expect(
      gameSetupPage.customWordChips.filter({ hasText: 'Sorcière' }),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('ajouter deux mots distincts affiche deux chips', async ({ gameSetupPage }) => {
    await gameSetupPage.addCustomWord('Dragon');
    await gameSetupPage.addCustomWord('Vampire');
    await expect(gameSetupPage.customWordChips).toHaveCount(2, { timeout: 3_000 });
  });

  test('l\'indice disparaît dès qu\'un mot est ajouté', async ({ gameSetupPage }) => {
    await gameSetupPage.addCustomWord('Zombie');
    await expect(gameSetupPage.customWordsHint).not.toBeVisible({ timeout: 3_000 });
  });

  test('le mot est normalisé : première lettre majuscule, reste minuscule ("testMOT" → "Testmot")', async ({ gameSetupPage }) => {
    await gameSetupPage.addCustomWord('testMOT');
    await expect(
      gameSetupPage.customWordChips,
    ).toContainText('Testmot', { timeout: 3_000 });
  });

  test('cliquer × sur un chip retire ce mot de la liste', async ({ page, gameSetupPage }) => {
    await gameSetupPage.addCustomWord('Loup-garou');
    const chip = gameSetupPage.customWordChips.filter({ hasText: 'Loup-garou' });
    await chip.waitFor({ state: 'visible', timeout: 3_000 });
    await chip.locator('ion-icon[name="close-circle"]').click();
    await page.waitForTimeout(300);
    await expect(gameSetupPage.customWordChips).toHaveCount(0);
  });

  test('ajouter un doublon ne crée pas un second chip', async ({ gameSetupPage }) => {
    await gameSetupPage.addCustomWord('Fantôme');
    await gameSetupPage.addCustomWord('Fantôme');
    await expect(gameSetupPage.customWordChips).toHaveCount(1);
  });
});
