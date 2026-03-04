import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';
import { GameplayPage } from '../pages/gameplay.page';

async function goToScoreboard(page: import('@playwright/test').Page): Promise<void> {
  await runToGameplay(page, DEFAULT_PLAYERS);
  const gp = new GameplayPage(page);
  await gp.nextRound();
}

test.describe('Classement inter-manche (/scoreboard) — happy paths', () => {
  test.beforeEach(async ({ page }) => {
    await goToScoreboard(page);
  });

  test('la page /scoreboard est chargée', async ({ page }) => {
    await expect(page).toHaveURL(/scoreboard/);
  });

  test('le titre contient "Classement"', async ({ scoreboardPage }) => {
    await expect(scoreboardPage.title).toContainText('Classement');
  });

  test('affiche autant de lignes que de joueurs', async ({ scoreboardPage }) => {
    await expect(scoreboardPage.entries).toHaveCount(DEFAULT_PLAYERS.length);
  });

  test('affiche le nom de chaque joueur', async ({ scoreboardPage }) => {
    for (const player of DEFAULT_PLAYERS) {
      await expect(
        scoreboardPage.entryNames.filter({ hasText: player.name }),
      ).toBeVisible();
    }
  });

  test('affiche un score pour chaque joueur', async ({ scoreboardPage }) => {
    await expect(scoreboardPage.entryScores).toHaveCount(DEFAULT_PLAYERS.length);
  });

  test('le premier joueur porte la classe scoreboard-entry--first', async ({ scoreboardPage }) => {
    const count = await scoreboardPage.firstEntries.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('le bouton "Distribuer les cartes" est visible', async ({ scoreboardPage }) => {
    await expect(scoreboardPage.btnDealNextRound).toBeVisible();
  });

  test('"Distribuer les cartes" navigue vers /card-deal', async ({ page, scoreboardPage }) => {
    await scoreboardPage.dealNextRound();
    await expect(page).toHaveURL(/card-deal/, { timeout: 10_000 });
  });

  test('le bouton retour (<) navigue vers /gameplay', async ({ page, scoreboardPage }) => {
    await scoreboardPage.backToGameplay();
    await expect(page).toHaveURL(/gameplay/, { timeout: 10_000 });
  });
});

test.describe('Classement inter-manche (/scoreboard) — sad paths', () => {
  test('accès direct sans partie active — aucune entrée dans le classement', async ({ scoreboardPage }) => {
    await scoreboardPage.goto();
    await expect(scoreboardPage.entries).toHaveCount(0);
  });

  test('accès direct sans partie active — la page ne plante pas (pas d\'URL /error)', async ({ page, scoreboardPage }) => {
    await scoreboardPage.goto();
    await expect(page).not.toHaveURL(/error/);
  });
});
