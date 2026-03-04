import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

test.describe('Classement et égalités', () => {

  test('score 0 pour tous — tous les joueurs au rang 1 (gold) dans le podium', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });
    await expect(gameEndPage.goldRankIcons).toHaveCount(DEFAULT_PLAYERS.length, { timeout: 5_000 });
  });

  test('deux joueurs à égalité affichent le même rang', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[1].name);

    const aliceRow = gameplayPage.rankingRowFor(DEFAULT_PLAYERS[0].name);
    const bobRow = gameplayPage.rankingRowFor(DEFAULT_PLAYERS[1].name);
    const charlieRow = gameplayPage.rankingRowFor(DEFAULT_PLAYERS[2].name);

    await expect(aliceRow.locator('.rank')).toContainText('1');
    await expect(bobRow.locator('.rank')).toContainText('1');
    await expect(charlieRow.locator('.rank')).toContainText('3');
  });

  test('le classement rapide est trié par score décroissant', async ({ page, gameplayPage }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);

    const firstRankName = await gameplayPage.rankingRows.first().locator('.player-name').innerText();
    expect(firstRankName.trim()).toBe(DEFAULT_PLAYERS[0].name);
  });

  test('le nombre de manches affiché dans les stats est correct', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const statsValues = await gameEndPage.statsValues.allInnerTexts();
    expect(statsValues[0].trim()).toBe('1');
  });

  test('le nombre de joueurs affiché dans les stats est correct', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const statsValues = await gameEndPage.statsValues.allInnerTexts();
    expect(statsValues[2].trim()).toBe(String(DEFAULT_PLAYERS.length));
  });

  test('le nombre de pièges affiché dans les stats correspond', async ({ page, gameEndPage }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const trapCount = await gameEndPage.statsWarningValue.innerText();
    expect(trapCount.trim()).toBe('1');
  });
});
