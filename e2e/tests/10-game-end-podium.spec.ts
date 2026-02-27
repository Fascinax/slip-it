import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Happy paths — contenu du podium
// --------------------------------------------------------------------------
test.describe('Page fin de partie (/game-end) — podium — happy paths', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
  });

  test('le nom du vainqueur est affiché', async ({ page }) => {
    await expect(page.locator('.winner-name')).toBeVisible({ timeout: 5_000 });
    const name = await page.locator('.winner-name').innerText();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('le nom du vainqueur est l\'un des joueurs enregistrés', async ({ page }) => {
    const winnerName = (await page.locator('.winner-name').innerText()).trim();
    const playerNames = DEFAULT_PLAYERS.map(p => p.name);
    expect(playerNames).toContain(winnerName);
  });

  test('le sous-titre du vainqueur est visible', async ({ gameEndPage }) => {
    await expect(gameEndPage.winnerSubtitle).toBeVisible({ timeout: 5_000 });
  });

  test('tous les joueurs apparaissent dans le podium', async ({ page }) => {
    const names = await page
      .locator('ion-item')
      .filter({ has: page.locator('app-score-badge') })
      .locator('ion-label')
      .allInnerTexts();
    for (const player of DEFAULT_PLAYERS) {
      expect(names.some(n => n.includes(player.name))).toBeTruthy();
    }
  });

  test('le bouton "Nouvelle partie" est visible', async ({ gameEndPage }) => {
    await expect(gameEndPage.btnNewGame).toBeVisible({ timeout: 5_000 });
  });

  test('"Nouvelle partie" navigue vers /home', async ({ page, gameEndPage }) => {
    await gameEndPage.clickNewGame();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });

  test('la carte de statistiques est visible', async ({ gameEndPage }) => {
    await expect(gameEndPage.statsCard).toBeVisible({ timeout: 5_000 });
  });
});

// --------------------------------------------------------------------------
// Happy paths — après un piège validé
// --------------------------------------------------------------------------
test.describe('Page fin de partie (/game-end) — avec piège — happy paths', () => {
  test('le score du piégeur est 1 dans le podium', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // The podium should show at least one score-badge with value 1
    const badges = page.locator('app-score-badge');
    const count = await badges.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).innerText().catch(() => '');
      if (text.trim() === '1') { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});

// --------------------------------------------------------------------------
// Sad paths — page fin sans partie
// --------------------------------------------------------------------------
test.describe('Page fin de partie (/game-end) — sad paths', () => {
  test('accès direct sans partie — le bouton "Nouvelle partie" est quand même visible', async ({ page, gameEndPage }) => {
    await gameEndPage.goto();
    // App must not crash; btn-new-game-end should still be rendered
    await expect(gameEndPage.btnNewGame).toBeVisible({ timeout: 5_000 });
  });

  test('accès direct sans partie — aucun joueur dans le podium', async ({ page }) => {
    await page.goto('/game-end');
    await page.waitForLoadState('networkidle');
    const podiumItems = page.locator('ion-item').filter({ has: page.locator('app-score-badge') });
    await expect(podiumItems).toHaveCount(0);
  });
});
