import { test, expect } from '../fixtures/base.fixture';
import { DEFAULT_PLAYERS, runToGameplay } from '../helpers/game.helper';

test.describe('Déclaration de piège — happy paths (piège validé)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('cliquer "Piégé !" ouvre la modale de confirmation', async ({ gameplayPage }) => {
    await gameplayPage.declareTrap();
    await expect(gameplayPage.ionModal).toBeVisible({ timeout: 5_000 });
  });

  test('la modale affiche le nom du piégeur et le mot secret', async ({ gameplayPage }) => {
    await gameplayPage.declareTrap();
    await gameplayPage.ionModal.waitFor({ state: 'visible', timeout: 5_000 });
    await expect(gameplayPage.ionModal).toContainText(DEFAULT_PLAYERS[0].name);
  });

  test('valider le piège met le score du joueur à 1 dans le classement rapide', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(600);
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
  });

  test('valider le piège fait apparaître l\'historique sur /game-end', async ({ page, gameplayPage, gameEndPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await page.waitForTimeout(400);
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(gameEndPage.trapHistoryHeader).toBeVisible({ timeout: 5_000 });
  });

  test('le bouton "Piégé !" est désactivé après validation', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);
    await expect(gameplayPage.declareTrapButtonFor(DEFAULT_PLAYERS[0].name)).toHaveClass(/button-disabled/, { timeout: 5_000 });
  });

  test('impossible de scorer deux fois avec le même mot — le score reste à 1', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);
    await expect(gameplayPage.declareTrapButtonFor(DEFAULT_PLAYERS[0].name)).toHaveClass(/button-disabled/, { timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1');
  });

  test('deux joueurs différents peuvent chacun piéger — scores cumulés', async ({ page, gameplayPage }) => {
    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(400);

    await gameplayPage.validateTrapFor(DEFAULT_PLAYERS[1].name);
    await page.waitForTimeout(500);

    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('1', { timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[1].name)).toContainText('1', { timeout: 5_000 });
  });
});

test.describe('Déclaration de piège — sad paths (piège rejeté / annulé)', () => {
  test.beforeEach(async ({ page }) => {
    await runToGameplay(page, DEFAULT_PLAYERS);
  });

  test('rejeter le piège ferme la modale', async ({ gameplayPage }) => {
    await gameplayPage.rejectTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await expect(gameplayPage.ionModal).not.toBeVisible();
  });

  test('rejeter le piège ne modifie pas le score (reste 0)', async ({ gameplayPage }) => {
    await gameplayPage.rejectTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await expect(gameplayPage.scoreBadgeFor(DEFAULT_PLAYERS[0].name)).toContainText('0');
  });

  test('rejeter le piège n\'ajoute rien dans l\'historique sur /game-end', async ({ page, gameplayPage, gameEndPage }) => {
    await gameplayPage.rejectTrapFor(DEFAULT_PLAYERS[0].name);
    await gameplayPage.ionModal.waitFor({ state: 'hidden', timeout: 5_000 });
    await gameplayPage.endGame();
    await expect(page).toHaveURL(/game-end/, { timeout: 10_000 });
    await expect(gameEndPage.trapHistoryHeader).not.toBeVisible();
  });
});
