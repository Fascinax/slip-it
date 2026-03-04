import { test, expect } from '../fixtures/base.fixture';
import { runToGameplay, runToGameEnd } from '../helpers/game.helper';
import { GameSetupPage } from '../pages/game-setup.page';

test.describe('Cas limites — noms de joueurs', () => {

  test('un nom de 20 caractères (max) est accepté et affiché', async ({ page, gameplayPage }) => {
    const longName = 'AbcdefghijKlmnopqrst';
    const players = [
      { name: longName },
      { name: 'Bob' },
      { name: 'Charlie' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.rankingRowFor(longName)).toBeVisible({ timeout: 5_000 });
  });

  test('un nom de 21 caractères est refusé (bouton reste désactivé)', async ({ page }) => {
    const tooLong = 'A'.repeat(21);
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.fillIonInput('[data-testid="input-player-name"]', tooLong);
    await page.waitForTimeout(200);
    await expect(setup.btnAddPlayer).toHaveAttribute('aria-disabled', 'true');
  });

  test('un nom avec des accents est accepté et affiché', async ({ page, gameplayPage }) => {
    const accentName = 'Éloïse';
    const players = [
      { name: accentName },
      { name: 'André' },
      { name: 'Cécile' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.rankingRowFor(accentName)).toBeVisible({ timeout: 5_000 });
  });

  test('un nom avec un tiret est accepté', async ({ page, gameplayPage }) => {
    const hyphenName = 'Jean-Pierre';
    const players = [
      { name: hyphenName },
      { name: 'Marie' },
      { name: 'Louis' },
    ];
    await runToGameplay(page, players);
    await expect(page).toHaveURL(/gameplay/);
    await expect(gameplayPage.rankingRowFor(hyphenName)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Cas limites — minimum joueurs', () => {

  test('avec exactement 3 joueurs le bouton distribuer est activé', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Un');
    await setup.addPlayer('Deux');
    await expect(setup.btnStartGame).toHaveAttribute('aria-disabled', 'true');
    await setup.addPlayer('Trois');
    await expect(setup.btnStartGame).not.toHaveAttribute('aria-disabled', { timeout: 3_000 });
  });

  test('avec 2 joueurs on ne peut pas démarrer', async ({ page }) => {
    const setup = new GameSetupPage(page);
    await setup.goto();
    await setup.addPlayer('Joueur1');
    await setup.addPlayer('Joueur2');
    await expect(setup.btnStartGame).toHaveAttribute('aria-disabled', 'true');
    await expect(setup.warningText).toBeVisible();
  });
});

test.describe('Cas limites — noms dupliqués', () => {

  test('ajouter deux joueurs avec le même nom affiche un toast d\'erreur', async ({ page, gameSetupPage }) => {
    await gameSetupPage.goto();
    await gameSetupPage.addPlayer('Alice');
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.ionToast).toBeVisible({ timeout: 3_000 });
  });

  test('le compteur ne s\'incrémente pas pour un nom dupliqué', async ({ page, gameSetupPage }) => {
    await gameSetupPage.goto();
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
    await gameSetupPage.addPlayer('Alice');
    await expect(gameSetupPage.playerCountBadge).toContainText('1');
  });
});

test.describe('Cas limites — refus de piège', () => {

  test('rejeter un piège ne change pas le score', async ({ page, gameplayPage }) => {
    await runToGameplay(page);

    await expect(gameplayPage.scoreBadgeFor('Alice')).toContainText('0', { timeout: 5_000 });

    await gameplayPage.rejectTrapFor('Alice');

    await expect(gameplayPage.scoreBadgeFor('Alice')).toContainText('0', { timeout: 5_000 });
  });

  test('après un rejet le bouton Piégé reste actif', async ({ page, gameplayPage }) => {
    await runToGameplay(page);

    await gameplayPage.rejectTrapFor('Alice');

    await expect(
      gameplayPage.declareTrapButtonFor('Alice'),
    ).not.toHaveAttribute('aria-disabled', { timeout: 3_000 });
  });
});
