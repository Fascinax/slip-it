import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function expandAdvancedSettings(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.advanced-toggle').click();
  await page.waitForTimeout(300);
}

async function activateIonToggle(page: import('@playwright/test').Page, testId: string): Promise<void> {
  const toggle = page.locator(`[data-testid="${testId}"]`);
  await toggle.waitFor({ state: 'attached' });
  await toggle.evaluate((el: any) => {
    el.checked = true;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }));
  });
  await page.waitForTimeout(150);
}

async function setIonSelectValue(
  page: import('@playwright/test').Page,
  filterText: string,
  value: string | number,
): Promise<void> {
  const select = page.locator('ion-item').filter({ hasText: filterText }).locator('ion-select');
  await select.waitFor({ state: 'attached' });
  await select.evaluate((el: any, v: string | number) => {
    el.value = v;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { value: v }, bubbles: true }));
  }, value);
  await page.waitForTimeout(150);
}

// ─── Paramètres de jeu — impact sur le gameplay ─────────────────────────────
test.describe('Paramètres de jeu — impact gameplay', () => {

  test('changer la difficulté en EASY lance une partie valide', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await setIonSelectValue(p, 'Difficulté des mots', 'EASY');
    });
    await expect(page).toHaveURL(/gameplay/);
    // Ranking card visible → gameplay loaded correctly
    await expect(page.locator('.ranking-card')).toBeVisible({ timeout: 5_000 });
  });

  test('changer la difficulté en HARD lance une partie valide', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await setIonSelectValue(p, 'Difficulté des mots', 'HARD');
    });
    await expect(page).toHaveURL(/gameplay/);
    await expect(page.locator('.ranking-card')).toBeVisible({ timeout: 5_000 });
  });

  test('configurer 5 manches affiche "Manche 1/5" dans le titre', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await setIonSelectValue(p, 'Nombre de manches', 5);
    });
    await expect(
      page.locator('app-gameplay ion-title').first(),
    ).toContainText('Manche 1/5', { timeout: 5_000 });
  });

  test('configurer 1 manche affiche "Manche 1/1" dans le titre', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await setIonSelectValue(p, 'Nombre de manches', 1);
    });
    await expect(
      page.locator('app-gameplay ion-title').first(),
    ).toContainText('Manche 1/1', { timeout: 5_000 });
  });

  test('le mode de jeu DRINK ne bloque pas le déroulement complet', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, {
      beforeStart: async (p) => {
        await setIonSelectValue(p, 'Mode de jeu', 'DRINK');
      },
    });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    // Game-end podium visible — the game completed with DRINK mode
    await expect(page.getByText(/Podium/)).toBeVisible({ timeout: 5_000 });
  });
});

// ─── Mode chaîne — ordre fixe des cibles ────────────────────────────────────
test.describe('Mode chaîne — cibles en ordre fixe', () => {

  test('en mode chaîne, chaque joueur piège le suivant dans l\'ordre d\'inscription', async ({ page }) => {
    // Players: Alice, Bob, Charlie → Alice→Bob, Bob→Charlie, Charlie→Alice
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-chain-mode');
    });

    const gameplay = page.locator('app-gameplay');

    // Read each player's card target
    const targets: string[] = [];
    for (const player of DEFAULT_PLAYERS) {
      const item = gameplay.locator('ion-item').filter({ hasText: player.name });
      await item.locator('[data-testid="btn-my-card"]').click();
      await gameplay.locator('[data-testid="btn-reveal-card"]').waitFor({ state: 'visible', timeout: 5_000 });
      await gameplay.locator('[data-testid="btn-reveal-card"]').click();
      const targetText = await gameplay.locator('.card-target').innerText();
      targets.push(targetText.trim());
      await gameplay.locator('[data-testid="btn-close-card"]').click();
      await gameplay.locator('[data-testid="btn-close-card"]').waitFor({ state: 'hidden', timeout: 3_000 });
    }

    // In chain mode the order is: Alice→Bob, Bob→Charlie, Charlie→Alice
    expect(targets[0]).toBe('Bob');
    expect(targets[1]).toBe('Charlie');
    expect(targets[2]).toBe('Alice');
  });
});
