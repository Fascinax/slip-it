import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

// ─── 1. Configuration : nouveaux contrôles v1.2 ───────────────────────────────
test.describe('Configuration de partie — nouveaux paramètres v1.2', () => {
  test.beforeEach(async ({ gameSetupPage }) => {
    await gameSetupPage.goto();
    for (const p of DEFAULT_PLAYERS) { await gameSetupPage.addPlayer(p.name); }
  });

  test('le toggle "Mode continu" est visible dans les paramètres', async ({ gameSetupPage }) => {
    await gameSetupPage.expandAdvancedSettings();
    await expect(gameSetupPage.toggleContinuousMode).toBeVisible();
  });

  test('le toggle "Chronomètre" est visible dans les paramètres', async ({ gameSetupPage }) => {
    await gameSetupPage.expandAdvancedSettings();
    await expect(gameSetupPage.toggleTimerEnabled).toBeVisible();
  });

  test('le sélecteur "Catégories" est visible (mots chargés au bootstrap)', async ({ gameSetupPage }) => {
    await gameSetupPage.expandAdvancedSettings();
    await expect(gameSetupPage.categoriesItem).toBeVisible();
  });

  test('activer le mode continu masque le sélecteur "Nombre de manches"', async ({ gameSetupPage }) => {
    await gameSetupPage.expandAdvancedSettings();
    await gameSetupPage.activateIonToggle('toggle-continuous-mode');
    await expect(gameSetupPage.roundsItem).toHaveClass(/ion-hide/);
  });
});

// ─── 2. Gameplay — Chronomètre indicatif ─────────────────────────────────────
test.describe('Gameplay — chronomètre indicatif (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-timer-enabled');
    });
  });

  test('le composant countdown-timer est visible quand le chronomètre est activé', async ({ gameplayPage }) => {
    await expect(gameplayPage.countdownTimer).toBeVisible({ timeout: 5_000 });
  });

  test('le chronomètre affiche un temps au format m:ss', async ({ page, gameplayPage }) => {
    await page.waitForTimeout(300);
    await expect(gameplayPage.timerValue).toBeVisible({ timeout: 5_000 });
    await expect(gameplayPage.timerValue).toHaveText(/\d+:\d{2}/);
  });
});

// ─── 3. Gameplay — Mode continu ──────────────────────────────────────────────
test.describe('Gameplay — mode continu (v1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS, async (p) => {
      const setup = new GameSetupPage(p);
      await setup.expandAdvancedSettings();
      await setup.activateIonToggle('toggle-continuous-mode');
    });
  });

  test('le titre de la page contient "Mode continu"', async ({ gameplayPage }) => {
    await expect(gameplayPage.title).toContainText('Mode continu', { timeout: 8_000 });
  });

  test('le bouton "Manche suivante" est absent en mode continu', async ({ gameplayPage }) => {
    await expect(gameplayPage.btnNextRound).not.toBeVisible();
  });

  test('le pied de page affiche le message "Mode continu"', async ({ gameplayPage }) => {
    await expect(gameplayPage.continuousHint).toBeVisible({ timeout: 5_000 });
  });

  test('le chronomètre est absent si non activé', async ({ gameplayPage }) => {
    await expect(gameplayPage.countdownTimer).not.toBeVisible();
  });
});

// ─── 4. Page fin — Historique des pièges ─────────────────────────────────────
test.describe('Fin de partie — historique des pièges (v1.2)', () => {
  test('la section historique est visible après un piège validé', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.trapHistoryHeader).toBeVisible({ timeout: 5_000 });
  });

  test('la section historique est absente quand aucun piège n\'a été validé', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: false });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.trapHistoryHeader).not.toBeVisible();
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
  test('le bouton "Partager" est visible quand navigator.share est disponible', async ({ page, gameEndPage }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: () => Promise.resolve(),
      });
    });

    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.btnSharePodium).toBeVisible({ timeout: 5_000 });
  });
});
