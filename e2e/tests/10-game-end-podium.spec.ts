import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameEnd } from '../helpers/game.helper';

test.describe('Page fin de partie (/game-end) — podium — happy paths', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
  });

  test('le nom du vainqueur est affiché', async ({ gameEndPage }) => {
    await expect(gameEndPage.winnerName).toBeVisible({ timeout: 5_000 });
    const name = await gameEndPage.winnerName.innerText();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('le nom du vainqueur est l\'un des joueurs enregistrés', async ({ gameEndPage }) => {
    const rawText = (await gameEndPage.winnerName.innerText()).trim();
    const playerNames = DEFAULT_PLAYERS.map(p => p.name);
    expect(playerNames.some(name => rawText.startsWith(name))).toBeTruthy();
  });

  test('le sous-titre du vainqueur est visible', async ({ gameEndPage }) => {
    await expect(gameEndPage.winnerSubtitle).toBeVisible({ timeout: 5_000 });
  });

  test('tous les joueurs apparaissent dans le podium', async ({ gameEndPage }) => {
    const names = await gameEndPage.podiumNames.allInnerTexts();
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

test.describe('Page fin de partie (/game-end) — avec piège — happy paths', () => {
  test('le score du piégeur est 1 dans le podium', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const badges = gameEndPage.allScoreBadges;
    const count = await badges.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).innerText().catch(() => '');
      if (/^\s*1\s+pts?\s*$/i.test(text)) { found = true; break; }
    }
    expect(found).toBeTruthy();
  });
});

test.describe('Page fin de partie (/game-end) — sad paths', () => {
  test('accès direct sans partie — redirige vers /home', async ({ page, gameEndPage }) => {
    await gameEndPage.goto();
    await expect(page).toHaveURL(/home/, { timeout: 10_000 });
  });
});
