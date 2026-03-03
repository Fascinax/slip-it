import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay, runToGameEnd } from '../helpers/game.helper';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** Validate a trap for a given player name on the gameplay page. */
async function validateTrapFor(
  page: import('@playwright/test').Page,
  playerName: string,
): Promise<void> {
  await page
    .locator('ion-item')
    .filter({ hasText: playerName })
    .locator('[data-testid="btn-declare-trap"]')
    .click();
  const modal = page.locator('ion-modal');
  await modal.waitFor({ state: 'visible', timeout: 5_000 });
  await modal.getByRole('button', { name: 'Oui, valider' }).dispatchEvent('click');
  await modal.waitFor({ state: 'hidden', timeout: 5_000 });
  await page.waitForTimeout(400);
}

// --------------------------------------------------------------------------
// Classement et égalités — scoreboard et podium
// --------------------------------------------------------------------------
test.describe('Classement et égalités', () => {

  test('score 0 pour tous — tous les joueurs au rang 1 (gold) dans le podium', async ({ page }) => {
    // Partie sans piège → tous à 0
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // Tous les podium-entry ont le rang 1 (gold medal icon)
    const rankIcons = page.locator('.podium-entry .rank-icon--gold');
    await expect(rankIcons).toHaveCount(DEFAULT_PLAYERS.length, { timeout: 5_000 });
  });

  test('deux joueurs à égalité affichent le même rang', async ({ page }) => {
    // Alice et Bob piègent → score 1/1, Charlie 0
    await runToGameplay(page, DEFAULT_PLAYERS);
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);
    await validateTrapFor(page, DEFAULT_PLAYERS[1].name);

    // Vérifier sur le classement rapide : Alice et Bob rang 1, Charlie rang 3
    const aliceRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[0].name });
    const bobRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[1].name });
    const charlieRow = page.locator('.ranking-row').filter({ hasText: DEFAULT_PLAYERS[2].name });

    await expect(aliceRow.locator('.rank')).toContainText('1');
    await expect(bobRow.locator('.rank')).toContainText('1');
    await expect(charlieRow.locator('.rank')).toContainText('3');
  });

  test('le classement rapide est trié par score décroissant', async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
    // Alice piège (score 1), Bob et Charlie restent à 0
    await validateTrapFor(page, DEFAULT_PLAYERS[0].name);

    // Le premier dans le ranking devrait être Alice
    const firstRankName = await page.locator('.ranking-row').first().locator('.player-name').innerText();
    expect(firstRankName.trim()).toBe(DEFAULT_PLAYERS[0].name);
  });

  test('le nombre de manches affiché dans les stats est correct', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // La stats card affiche le nombre de manches réellement jouées (1 dans ce scénario)
    const statsValues = await page.locator('.stats-row__value').allInnerTexts();
    // Le premier stats-row__value est le nombre de manches
    expect(statsValues[0].trim()).toBe('1');
  });

  test('le nombre de joueurs affiché dans les stats est correct', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS);
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    const statsValues = await page.locator('.stats-row__value').allInnerTexts();
    // Le 3e stats-row__value est le nombre de joueurs
    expect(statsValues[2].trim()).toBe(String(DEFAULT_PLAYERS.length));
  });

  test('le nombre de pièges affiché dans les stats correspond', async ({ page }) => {
    await runToGameEnd(page, DEFAULT_PLAYERS, { validateTrap: true });
    await expect(page).toHaveURL(/game-end/, { timeout: 15_000 });

    // La stats montre 1 piège
    const trapCount = await page.locator('.stats-row__value--warning').innerText();
    expect(trapCount.trim()).toBe('1');
  });
});
