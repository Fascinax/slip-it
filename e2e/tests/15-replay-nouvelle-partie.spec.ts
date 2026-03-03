import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd, dealAllCards } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Rejouer — même équipe
// --------------------------------------------------------------------------
test.describe('Rejouer et nouvelle partie (/game-end)', () => {

  test('"Rejouer" conserve les mêmes joueurs sur /game-setup', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // Cliquer "Rejouer (même équipe)"
    await page.locator('[data-testid="btn-replay"]').dispatchEvent('click');
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    // Les 3 joueurs sont toujours présents
    await expect(page.locator('[data-testid="player-count-badge"]')).toContainText(
      String(DEFAULT_PLAYERS.length),
    );
    for (const p of DEFAULT_PLAYERS) {
      await expect(page.locator('app-player-list').getByText(p.name)).toBeVisible();
    }
  });

  test('"Rejouer" remet tous les scores à zéro', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // Vérifier qu'au moins un score > 0 sur le podium
    const badges = page.locator('app-score-badge');
    const texts = await badges.allInnerTexts();
    const hasNonZero = texts.some(t => /[1-9]/.test(t));
    expect(hasNonZero).toBeTruthy();

    // Cliquer "Rejouer"
    await page.locator('[data-testid="btn-replay"]').dispatchEvent('click');
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    // Attendre la disparition de toasts résiduels
    await page.locator('ion-toast').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});

    // Démarrer la nouvelle partie
    await page.locator('[data-testid="btn-start-game"]').dispatchEvent('click');
    await page.waitForURL(/card-deal/, { timeout: 10_000 });

    // Attendre que la page de distribution soit prête
    await page.waitForTimeout(500);
    await dealAllCards(page, DEFAULT_PLAYERS);
    await page.waitForURL(/gameplay/, { timeout: 10_000 });

    // Tous les scores à 0 dans le classement rapide
    const scoreTexts = await page.locator('.ranking-row app-score-badge').allInnerTexts();
    for (const txt of scoreTexts) {
      expect(txt).toMatch(/0/);
    }
  });

  test('"Nouvelle partie" vide la liste de joueurs sur /home puis /game-setup', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // Cliquer "Nouvelle partie"
    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await page.waitForURL(/home/, { timeout: 10_000 });

    // Aller sur /game-setup
    await page.locator('[data-testid="btn-new-game"]').click();
    await page.waitForURL(/game-setup/, { timeout: 10_000 });

    // La liste de joueurs est vide
    await expect(page.locator('[data-testid="player-count-badge"]')).toContainText('0');
  });

  test('"Nouvelle partie" depuis /game-end → le bouton reprendre est absent', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    await page.locator('[data-testid="btn-new-game-end"]').dispatchEvent('click');
    await page.waitForURL(/home/, { timeout: 10_000 });

    // Le bouton "Reprendre la partie" ne doit pas être visible
    await expect(page.locator('[data-testid="btn-resume-game"]')).not.toBeVisible();
  });
});
