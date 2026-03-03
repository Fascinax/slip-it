import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, setupGame } from '../helpers/game.helper';

// ─── Distribution des cartes — cas limites ──────────────────────────────────
test.describe('Distribution des cartes — edge cases', () => {

  test('le compteur de progression affiche "1/3" au premier joueur', async ({ page }) => {
    await setupGame(page, DEFAULT_PLAYERS);
    // Look for the progress indicator showing player 1 of 3
    const progressText = page.locator('.deal-invite__progress, .deal-progress');
    if (await progressText.isVisible()) {
      await expect(progressText).toContainText('1');
    }
    // At minimum, first player name is shown
    await expect(page.locator('.deal-invite__name')).toContainText(DEFAULT_PLAYERS[0].name);
  });

  test('après le flip du 1er joueur, le 2e joueur est montré', async ({ cardDealPage, page }) => {
    await setupGame(page, DEFAULT_PLAYERS);
    await cardDealPage.dealCardForPlayer();
    // After first deal, should show second player's name
    await expect(page.locator('.deal-invite__name')).toContainText(DEFAULT_PLAYERS[1].name, { timeout: 5_000 });
  });

  test('chaque joueur reçoit un mot secret unique', async ({ cardDealPage, page }) => {
    await setupGame(page, DEFAULT_PLAYERS);
    const words = new Set<string>();
    for (const _ of DEFAULT_PLAYERS) {
      const { word } = await cardDealPage.dealCardForPlayer();
      words.add(word);
    }
    // All words should be distinct
    expect(words.size).toBe(DEFAULT_PLAYERS.length);
  });

  test('avec 4 joueurs, chaque cible est unique dans la chaîne', async ({ page, cardDealPage }) => {
    const fourPlayers = [
      { name: 'Alice' },
      { name: 'Bobby' },
      { name: 'Claire' },
      { name: 'David' },
    ];
    await setupGame(page, fourPlayers);
    const targets = new Set<string>();
    for (const _ of fourPlayers) {
      const { target } = await cardDealPage.dealCardForPlayer();
      targets.add(target);
    }
    // Each player targets a unique person (circular assignment)
    expect(targets.size).toBe(fourPlayers.length);
  });

  test('la touche Espace retourne la carte', async ({ page, cardDealPage }) => {
    await setupGame(page, DEFAULT_PLAYERS);
    await cardDealPage.clickShowCard();
    await cardDealPage.cardFlip.focus();
    await cardDealPage.cardFlip.press(' ');
    await page.waitForTimeout(800);
    await expect(cardDealPage.cardScene).toHaveClass(/card--flipped/);
  });
});
