import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

// ─── Helper: activate an ion-toggle by dispatching ionChange on its host ──────
async function activateIonToggle(page: import('@playwright/test').Page, testId: string): Promise<void> {
  const toggle = page.locator(`[data-testid="${testId}"]`);
  await toggle.waitFor({ state: 'attached' });
  await toggle.evaluate((el: any) => {
    el.checked = true;
    el.dispatchEvent(new CustomEvent('ionChange', { detail: { checked: true }, bubbles: true }));
  });
  await page.waitForTimeout(150);
}

async function expandAdvancedSettings(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.advanced-toggle').click();
  await page.waitForTimeout(300);
}

// ─── 1. Configuration : nouveaux contrôles v1.2 ───────────────────────────────
test.describe('Configuration de partie — nouveaux paramètres v1.2', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
    // Add 3 players so the settings section is always visible
    for (const p of DEFAULT_PLAYERS) { await gameSetupPage.addPlayer(p.name); }
  });

  test('le toggle "Mode continu" est visible dans les paramètres', async ({ page }) => {
    await expandAdvancedSettings(page);
    await expect(page.locator('[data-testid="toggle-continuous-mode"]')).toBeVisible();
  });

  test('le toggle "Chronomètre" est visible dans les paramètres', async ({ page }) => {
    await expandAdvancedSettings(page);
    await expect(page.locator('[data-testid="toggle-timer-enabled"]')).toBeVisible();
  });

  test('le sélecteur "Catégories" est visible (mots chargés au bootstrap)', async ({ page }) => {
    await expandAdvancedSettings(page);
    await expect(page.locator('[data-testid="item-categories"]')).toBeVisible();
  });

  test('activer le mode continu masque le sélecteur "Nombre de manches"', async ({ page }) => {
    await expandAdvancedSettings(page);
    await activateIonToggle(page, 'toggle-continuous-mode');
    // The rounds item has class ion-hide when continuousMode is true
    const roundsItem = page.locator('ion-item').filter({ hasText: 'Nombre de manches' });
    await expect(roundsItem).toHaveClass(/ion-hide/);
  });
});

// ─── 2. Gameplay — Chronomètre indicatif ─────────────────────────────────────
test.describe('Gameplay — chronomètre indicatif (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-timer-enabled');
    });
  });

  test('le composant countdown-timer est visible quand le chronomètre est activé', async ({ page }) => {
    await expect(page.locator('app-countdown-timer')).toBeVisible({ timeout: 5_000 });
  });

  test('le chronomètre affiche un temps au format m:ss', async ({ page }) => {
    // Wait for Angular to render the timer value (ChangeDetectionStrategy.OnPush)
    await page.waitForTimeout(300);
    const timerValue = page.locator('app-countdown-timer .timer-value');
    await expect(timerValue).toBeVisible({ timeout: 5_000 });
    await expect(timerValue).toHaveText(/\d+:\d{2}/);
  });
});

// ─── 3. Gameplay — Mode continu ──────────────────────────────────────────────
test.describe('Gameplay — mode continu (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      await expandAdvancedSettings(p);
      await activateIonToggle(p, 'toggle-continuous-mode');
    });
  });

  test('le titre de la page contient "Mode continu"', async ({ page }) => {
    // Use component-scoped selector — Ionic keeps all previous pages in the DOM with
    // .ion-page-hidden but ion-title text can still be matched incorrectly by first().
    await expect(page.locator('app-gameplay ion-title').first()).toContainText(
      'Mode continu',
      { timeout: 8_000 },
    );
  });

  test('le bouton "Manche suivante" est absent en mode continu', async ({ page }) => {
    await expect(page.locator('[data-testid="btn-next-round"]')).not.toBeVisible();
  });

  test('le pied de page affiche le message "Mode continu"', async ({ page }) => {
    await expect(page.locator('.continuous-hint')).toBeVisible({ timeout: 5_000 });
  });

  test('le chronomètre est absent si non activé', async ({ page }) => {
    await expect(page.locator('app-countdown-timer')).not.toBeVisible();
  });
});

// ─── 4. Page fin — Historique des pièges ─────────────────────────────────────
test.describe('Fin de partie — historique des pièges (v1.2)', () => {
  test('la section historique est visible après un piège validé', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(page.getByText(/Historique des pièges/)).toBeVisible({ timeout: 5_000 });
  });

  test('la section historique est absente quand aucun piège n\'a été validé', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: false });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(page.getByText(/Historique des pièges/)).not.toBeVisible();
  });
});

// ─── 5. Page fin — Bouton Rejouer ────────────────────────────────────────────
test.describe('Fin de partie — Rejouer avec la même équipe (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
  });

  test('le bouton "Rejouer" est visible sur /game-end', async ({ gameEndPage }) => {
    await expect(gameEndPage.btnReplay).toBeVisible({ timeout: 5_000 });
  });

  test('"Rejouer" navigue vers /game-setup', async ({ page, gameEndPage }) => {
    await gameEndPage.clickReplay();
    await expect(page).toHaveURL(/game-setup/, { timeout: 10_000 });
  });

  test('"Nouvelle partie" est toujours présent sur /game-end', async ({ gameEndPage }) => {
    await expect(gameEndPage.btnNewGame).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 6. Page fin — Bouton partage (Web Share API) ────────────────────────────
test.describe('Fin de partie — partage du podium (v1.2)', () => {
  test('le bouton "Partager" est visible quand navigator.share est disponible', async ({ page }) => {
    // Mock Web Share API so the app sees canShare = true
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: () => Promise.resolve(),
      });
    });

    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(page.locator('[data-testid="btn-share-podium"]')).toBeVisible({ timeout: 5_000 });
  });
});
